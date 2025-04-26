const socket = io();

// Room ve Username yakala
const params = new URLSearchParams(window.location.search);
const room = params.get('room');
let username = localStorage.getItem('username') || prompt("İsmini yaz:");
localStorage.setItem('username', username);

// Eğer room varsa katıl
if (room) {
    socket.emit('joinRoom', { username, room });
}

// Mesaj gönder
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() !== '') {
        socket.emit('chatMessage', { room, message: input.value.trim(), username });
        input.value = '';
    }
});

// Mesaj al
socket.on('message', msg => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
    messages.appendChild(div);
});

// Odalar güncellenince
socket.on('roomsUpdate', (rooms) => {
    if (document.getElementById('room-list')) {
        updateRooms(rooms);
    }
});