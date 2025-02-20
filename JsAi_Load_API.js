  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const status = document.getElementById('status');
  const messageCountDisplay = document.getElementById('message-count');
  const userNote = document.getElementById('user-note');
  let deletedMessages = [];
  let selectedMessages = new Set();
  let messageTimer = [];

  // Load messages from local storage
  function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messageCountDisplay.textContent = messages.length;
    messages.forEach(({ sender, text, time, seen }) => {
      addMessage(sender, text, time, sender === 'You', seen);
    });
  }

  // Store message in local storage
  function saveMessage(sender, text, time, seen = false) {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push({ sender, text, time, seen });
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    messageCountDisplay.textContent = messages.length;
  }

  // Clear all messages
  function clearChat() {
    localStorage.removeItem('chatMessages');
    chatBox.innerHTML = '';
    messageCountDisplay.textContent = '0';
    deletedMessages = [];
    closeInfoPanel();
  }

  // Save the user's note to localStorage
  function saveNote() {
    const note = userNote.value;
    localStorage.setItem('userNote', note);
    alert('Note saved!');
  }

  // Save and load user note
  function loadNote() {
    const savedNote = localStorage.getItem('userNote') || '';
    userNote.value = savedNote;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = input.value;
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addMessage('You', userMessage, userTime, true, false);
    saveMessage('You', userMessage, userTime, false);
    input.value = '';

    status.textContent = "Typing...";
    const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let loadingMessage = addMessage('ChatGPT', 'Typing...', aiTime, false, false);

    try {
      const response = await fetch(`https://free-unoficial-gpt4o-mini-api-g70n.onrender.com/chat/?query=${userMessage}`, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      loadingMessage.innerHTML = formatMessage('ChatGPT', data.results || 'No response from API', aiTime, true);
      saveMessage('ChatGPT', data.results || 'No response from API', aiTime, true);
      status.textContent = "Online";
    } catch (error) {
      loadingMessage.innerHTML = formatMessage('ChatGPT', 'Failed to fetch API', aiTime, false);
      status.textContent = "Online";
    }
  });

  function addMessage(sender, message, time, isUser, seen) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', 'mb-2', isUser ? 'justify-end' : 'justify-start');
    messageElement.innerHTML = formatMessage(sender, message, time, seen);
    messageElement.addEventListener('mouseenter', () => {
      messageElement.classList.add('marked');
      const options = messageElement.querySelector('.message-options');
      options.style.display = 'block';
    });
    messageElement.addEventListener('mouseleave', () => {
      messageElement.classList.remove('marked');
      const options = messageElement.querySelector('.message-options');
      options.style.display = 'none';
    });

    messageElement.addEventListener('click', (e) => {
      if (selectedMessages.has(messageElement)) {
        selectedMessages.delete(messageElement);
        messageElement.classList.remove('selected');
      } else {
        selectedMessages.add(messageElement);
        messageElement.classList.add('selected');
      }
    });

    const options = messageElement.querySelector('.message-options');
    options.querySelector('.delete').addEventListener('click', () => deleteMessage(messageElement));
    options.querySelector('.edit').addEventListener('click', () => editMessage(messageElement));

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }

  function formatMessage(sender, message, time, seen) {
    return `
        <div class="p-3 max-w-xs shadow ${sender === 'You' ? 'user-message' : 'ai-message'}">
          <p>${message}</p>
          <span class="text-xs text-gray-500 block text-right">${time} ${seen ? '<span style="color:pink;">seen</span>' : ''}</span>
          <div class="message-options">
            <button class="edit text-blue-500">Edit</button>
            <button class="delete text-red-500">Delete</button>
            <button class="copy text-green-500">Copy</button>
          </div>
        </div>
      `;
  }

  function editMessage(messageElement) {
    const newText = prompt('Edit message:', messageElement.querySelector('p').innerText);
    if (newText) {
      messageElement.querySelector('p').innerText = newText;
    }
  }

  function deleteMessage(messageElement) {
    messageElement.style.display = 'none';
    deletedMessages.push(messageElement);
    setTimeout(() => permanentlyDeleteMessage(messageElement), 6000);
  }

  function permanentlyDeleteMessage(messageElement) {
    messageElement.remove();
    // Also remove from localStorage if necessary
  }

  function closeInfoPanel() {
    document.getElementById('ai-panel').classList.add('hidden');
  }

  function showInfoPanel() {
    loadNote();
    document.getElementById('ai-panel').classList.remove('hidden');
  }

  loadMessages();
  let body = document.getElementsByTagName("body")[0];
  let toggler = document.getElementById("input-toggler");
  toggler.addEventListener('click', () => {
    if (toggler.checked) {
      body.style.backgroundColor = "#080912E8";
    }


    else {
      body.style.backgroundColor = "#DCDDE8";
    }
  })