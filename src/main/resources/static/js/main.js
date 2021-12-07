const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#message");
const messageArea = document.querySelector("#connecting");
const connectingElement = document.querySelector("#connecting");

let stompClient = null;
let username = null;

const onMessageReceived = (payload) => {
    console.log(payload);
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');
        var usernameElement = document.createElement('strong');
        usernameElement.classList.add('nickname');
        var usernameText = document.createTextNode(message.sender);
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('span');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.insertAdjacentElement("beforebegin", messageElement)
}

const sendMessage = (event) => {
    event.preventDefault();
    let messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        let chatMessage = {
            sender: username,
            content: messageInput.value,
            type: "CHAT"
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage))
        messageInput.value = "";
    }

}


const onError = () => {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}
const onConnected = () => {
    // Subscribe to the public topic
    stompClient.subscribe("/topic/publicChatRoom", onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: "JOIN"}));

    connectingElement.classList.add("hidden")
}

const connect = () => {
    username = document.querySelector("#username").innerText.trim();

    let socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}
connect();

messageForm.addEventListener("submit", sendMessage)