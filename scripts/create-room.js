const gamePanel = document.getElementById('game-panel');
const overlay = document.getElementById('overlay');
const playButton = document.getElementById('play-button');

const socket = io();

playButton.addEventListener('click', () => {
    overlay.style.display = 'block';
    gamePanel.style.display = 'block';
});

document.getElementById('create-room-button').addEventListener('click', () => {
});

document.getElementById('find-room-button').addEventListener('click', () => {
    socket.emit('find-room');
});

overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    gamePanel.style.display = 'none';
});

document.getElementById('create-room-button').addEventListener('click', () => {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
});

socket.on('send-rooms', (rooms) => {
    const roomListContainer = document.getElementById('room-list-container');
    roomListContainer.innerHTML = '';
    const ul = document.createElement('ul');
    rooms.forEach((room) => {
        const li = document.createElement('li');
        li.textContent = `Room:${room.name}, Created by: ${room.creator}`;
        li.addEventListener('click', () => {
            socket.emit('join-room', room.name);
        });
        ul.appendChild(li);
    });
    roomListContainer.appendChild(ul);
});

socket.on('room-created', (room) => {
    window.location.href = `/lobby.html?roomId=${room.name}`;
});
