const hand = document.querySelector(".hand");
const enemyField = document.querySelector(".enemy-field");
const tableField = document.querySelector(".my-field");

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

const socket = io();

let currentLogin = null;
let clickedCards = {
  my: null,
  enemy: null,
};

function createEnemyCard(card) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.draggable = true;
  cardElement.textContent = card.name;

  // Create a stats container
  const statsElement = document.createElement("div");
  statsElement.className = "card-stats";
  statsElement.textContent = `Cost: ${card.cost}, Attack: ${card.damage}, Health: ${card.hp}`;

  // Set the data-text attribute with the card's stats
  cardElement.setAttribute("data-text", card.description);

  // Append stats to the card
  cardElement.appendChild(statsElement);

  cardElement.dataset.id = card.id;
  // return cardElement;
  for (const child of enemyField.children) {
    if (child.childElementCount == 0) {
      child.appendChild(cardElement);
      break;
    }
  }
}

// Function to create a card element with stats
function createCard(card) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.draggable = true;
  cardElement.textContent = card.name;

  // Create a stats container
  const statsElement = document.createElement("div");
  statsElement.className = "card-stats";
  statsElement.textContent = `Cost: ${card.cost}, Attack: ${card.damage}, Health: ${card.hp}`;

  // Set the data-text attribute with the card's stats
  cardElement.setAttribute("data-text", card.description);

  // Append stats to the card
  cardElement.appendChild(statsElement);

  cardElement.dataset.id = card.id;
  // return cardElement;
  hand.appendChild(cardElement);

  // Add drag event listeners to the card
  cardElement.addEventListener("dragstart", handleDragStart);
}

// Function to handle drag start event
function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

// Function to handle drag over event
function handleDragOver(event) {
  event.preventDefault();
}

// Function to handle drop event
function handleDrop(event) {
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text/plain");
  const cardElement = document.querySelector(`[data-id="${cardId}"]`);

  // Check if the card is dropped onto a card placeholder
  if (event.target.classList.contains("my-card")) {
    // Clone the card and append it to the table field
    const clonedCard = cardElement.cloneNode(true);
    event.target.appendChild(clonedCard);

    // Apply the hover effect to the cloned card
    clonedCard.addEventListener("mouseover", function () {
      this.style.transform = "translateY(-10px) scale(1.5)";
    });

    clonedCard.addEventListener("mouseout", function () {
      this.style.transform = "scale(1)";
    });

    // Remove the card from the hand
    cardElement.remove();
  }
}

// Start battle
for (let index = 0; index < 3; index++) {
  socket.emit("get-card");
}
socket.on("randomCard", (randomCard) => {
  createCard(randomCard);
  createEnemyCard(randomCard);
});

socket.emit("send-login");
socket.on("get-login", login => {
  currentLogin = login;
  console.log("123");
});

console.log()
// Add drop event listener to the table field
tableField.addEventListener("dragover", handleDragOver);
tableField.addEventListener("drop", handleDrop);

// Function to handle card click event
function handleCardClick(event) {
  const card = event.target;

  if (
    card.classList.contains("card") &&
    card.parentElement.classList.contains("my-card")
  ) {
    // Remove the "glow" class from all cards in the "my-card" container
    const myCards = document.querySelectorAll(".my-card .card");
    myCards.forEach((myCard) => {
      myCard.classList.remove("glow");
    });

    // Toggle the "glow" class on the clicked card
    card.classList.toggle("glow");
  }

  const id = event.target.dataset.id;

  if (event.target.parentElement.className == "my-card") {
    clickedCards.my = id;
  } else {
    clickedCards.enemy = id;
  }

  if (clickedCards.my != null && clickedCards.enemy != null) {
    socket.emit(
      "send-damage",
      clickedCards.my,
      clickedCards.enemy,
      currentLogin,
      roomId
    );
  }
}

socket.on("get-damage", (damage, cardId, damaged) => {
  console.log("asd");
  console.log(currentLogin);
  if (damaged == currentLogin) {
    console.log("получил по ебалу");
  }
});

// Add a click event listener to the document
document.addEventListener("click", handleCardClick);
