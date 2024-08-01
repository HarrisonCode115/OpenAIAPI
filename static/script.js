let currentConversationId = null;
let conversationCounter = 0;
let isLoading = false

function addNewConversation() {
    conversationCounter++;
    const conversationId = `conversation-${conversationCounter}`;
    const conversationList = document.getElementById('conversation-list');
    
    const listItem = document.createElement('li');
    listItem.textContent = "Conversation "+conversationCounter;
    listItem.onclick = () => selectConversation(conversationId);
    conversationList.appendChild(listItem);

    // Automatically select the new conversation
    selectConversation(conversationId);
}

async function selectConversation(conversationId) {
    //If the chat is already loading, dont allow conversation change.
    if(isLoading){return}

    currentConversationId = conversationId;
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // Clear the chat box

    try {
        const response = await fetch(`http://127.0.0.1:5900/conversations/${conversationId}`);
        const conversation = await response.json();

        conversation.forEach(message => {
            let role = ""
            if(message.role == "assistant"){
                role = "GPT"
            }
            if(message.role == "user"){
                role = "You"
            }
            if(message.role != "system"){
                chatBox.innerHTML += `<p><strong>${role}:</strong> ${message.content}</p>`;
            }
        });
        hyphenLocation = conversationId.indexOf('-')
        conversationNumber = conversationId.substring(hyphenLocation+1)
        document.getElementById('current-conversation').textContent = "Conversation "+conversationNumber
    } catch (error) {
        console.error('Error loading conversation:', error);
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = ''; // Clear the input field
    
    
    const chatBox = document.getElementById('chat-box');
    //Show the user their message so they know something is happening
    chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

    //Disable text field until response
    document.getElementById('user-input').disabled = true
    isLoading = true

    if (userInput.trim() === '' || !currentConversationId) return;

    const response = await fetch('http://127.0.0.1:5900/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput, conversation_id:currentConversationId }),
    });

    const data = await response.json();

    chatBox.innerHTML += `<p><strong>GPT:</strong> ${data.message}</p>`;
    document.getElementById('user-input').disabled = false
    isLoading = false

}

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        sendMessage(); // Call the sendMessage function
    }
});


// Add initial conversation
addNewConversation();