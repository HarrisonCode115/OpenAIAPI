async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = ''; // Clear the input field
    //Show the user their message so they know something is happening
    
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
    //Disable text field until response
    document.getElementById('user-input').disabled = true
    const response = await fetch('http://127.0.0.1:5900/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
    });

    const data = await response.json();

    chatBox.innerHTML += `<p><strong>GPT:</strong> ${data.message}</p>`;
    document.getElementById('user-input').disabled = false

}

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        sendMessage(); // Call the sendMessage function
    }
});