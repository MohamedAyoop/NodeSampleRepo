const socket = io('/');
const roomId = window.location.pathname.split('/')[1];
const videoGrid = document.getElementById('video-grid');
const myVideo = document.getElementById('localVideo');
const peer = new Peer();
let myStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myStream = stream;
    myVideo.srcObject = stream;
    myVideo.play();

    peer.on('call', call => {
        call.answer(stream);
        call.on('stream', userVideoStream => {
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = userVideoStream;
            remoteVideo.play();
        });
    });

    socket.on('user-connected', userId => {
        const call = peer.call(userId, stream);
        call.on('stream', userVideoStream => {
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = userVideoStream;
            remoteVideo.play();
        });
    });
});

peer.on('open', id => {
    socket.emit('join-room', roomId, id);
});

// Messaging
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

function sendMessage() {
    const message = input.value;
    socket.emit('message', message);
    input.value = '';
}

socket.on('createMessage', message => {
    const li = document.createElement('li');
    li.innerText = message;
    messages.appendChild(li);
});