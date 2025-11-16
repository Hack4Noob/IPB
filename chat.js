const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    // Send message to Firestore
    db.collection('turmas').doc('turma-id').collection('chats').add({
      message,
      userId: 'user-id',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    messageInput.value = '';
  }
});

// Retrieve and display chat messages in real-time
db.collection('turmas').doc('turma-id').collection('chats').orderBy('timestamp').onSnapshot((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    const message = doc.data();
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.userId}: ${message.message}`;
    chatMessages.appendChild(messageElement);
  });
});
