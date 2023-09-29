const socket = io();

// Функция для обновления информации о созданной комнате
function updateRoomInfo(room) {
    const roomNameElement = document.getElementById('room-name');
    const roomHostElement = document.getElementById('room-host');
    roomNameElement.textContent = room.name;
    roomHostElement.textContent = room.creator;
}

const urlParams = new URLSearchParams(window.location.search);
const roomid = urlParams.get('roomId');

socket.emit('get-room', roomid);

socket.on('get-room-response', (room) => {
  updateRoomInfo(room);
});

socket.emit('get-players', roomid);

socket.on('send-players', (players) => {
  const playerListContainer = document.getElementById('player-list-container');
  playerListContainer.innerHTML = '';
  console.log(players);

  players.forEach((player) => {
  const playerElement = document.createElement('div');
  playerElement.textContent = player;
  playerListContainer.appendChild(playerElement);
});
});