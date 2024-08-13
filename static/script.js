let currentConversationId = null;
let conversationCounter = 0;
let isLoading = false
let aiModel = 'gpt'



// Store multiple conversations
let conversations = {
    gpt: [],
    claude: []
};


function addNewConversation() {
    conversationCounter++;
    const conversationId = `conversation-${conversationCounter}-${aiModel}`;
    const conversationList = document.getElementById('conversation-list');
    
    const listItem = document.createElement('li');
    listItem.textContent = "Conversation "+conversationCounter+" with "+aiModel.toUpperCase();
    listItem.onclick = () => selectConversation(conversationId);
    conversationList.appendChild(listItem);

    conversations[aiModel].push(conversationId)
    // Automatically select the new conversation
    selectConversation(conversationId);
}

async function selectConversation(conversationId) {
    //If the chat is already loading, dont allow conversation change.
    if(isLoading){return}

    currentConversationId = conversationId;
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // Clear the chat box
    const [convId, model] = conversationId.split('-').slice(1);
    try {
        const response = await fetch(`http://127.0.0.1:5900/conversations/${convId}?model=${model}`);
        const conversation = await response.json();

        conversation.forEach(message => {
            let role = ""
            if(message.role == "assistant"){
                role = model.toUpperCase()
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
        hyphenLocation = conversationNumber.indexOf('-')
        conversationNumber = conversationNumber.substring(0,hyphenLocation)
        
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
        body: JSON.stringify({ 
            message: userInput,
             conversation_id:currentConversationId,
             ai_model:aiModel}),
    });

    const data = await response.json();
    const modelAsString = aiModel.toUpperCase()
    chatBox.innerHTML += `<p><strong>${modelAsString}</strong> ${data.message}</p>`;
    document.getElementById('user-input').disabled = false
    isLoading = false

}

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        sendMessage(); // Call the sendMessage function
    }
});




function toggleAI() {
    const aiToggle = document.getElementById('ai-toggle');
    const aiLabel = document.getElementById('ai-label');

    if (aiToggle.checked) {
        aiModel = 'claude'; // Switch to Claude AI
        aiLabel.textContent = 'Claude AI';
    } else {
        aiModel = 'gpt'; // Switch to GPT
        aiLabel.textContent = 'GPT';
    }

    updateConversationList()
}


function updateConversationList() {
    const conversationList = document.getElementById('conversation-list');
    conversationList.innerHTML = ''; // Clear the current list

    const modelConversations = conversations[aiModel];
    
    for (let i = 0; i < modelConversations.length; i++) {
        let currentId = modelConversations[i]
        const listItem = document.createElement('li');

        hyphenLocation = currentId.indexOf('-')
        conversationNumber = currentId.substring(hyphenLocation+1)
        hyphenLocation = conversationNumber.indexOf('-')
        conversationNumber = conversationNumber.substring(0,hyphenLocation)
        
        listItem.textContent = "Conversation "+conversationNumber+" with "+aiModel.toUpperCase();
        listItem.onclick = () => selectConversation(currentId);
        conversationList.appendChild(listItem);
    }
}

// Add initial conversation
addNewConversation();