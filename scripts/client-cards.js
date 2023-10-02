
// get room from url 
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');

// send damage ochevidno, da bliat?
socket.emit('send-damage', damage, enemy_card_ID, login, roomId);

socket.on('get-damage', (damage, cardId) => {

});

