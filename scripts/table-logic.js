const hand = document.querySelector(".hand");
const enemyField = document.querySelector(".enemy-field");
const tableField = document.querySelector(".my-field");

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const currentLogin = urlParams.get("playerName");

let isPlayerAllowedToInteract = false;
let currentMana = null;
let maxMana = null;

let currentEnemy = null;
let currentSocketId = null;
let sendDamage = {
  damage: null,
  enemyCard: null,
};

const socket = io();

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
  if (!isPlayerAllowedToInteract) {
    return;
  }
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

// Function to handle drag over event
function handleDragOver(event) {
  if (!isPlayerAllowedToInteract) {
    return;
  }
  event.preventDefault();
}

// Function to handle drop event
function handleDrop(event) {
  if (!isPlayerAllowedToInteract) {
    return;
  }
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text/plain");
  const cardElement = hand.querySelector(`[data-id="${cardId}"]`);

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

    socket.emit("put-card", cardId, currentLogin);
  }
}

// Function to handle card click event
function handleCardClick(event) {
  if (!isPlayerAllowedToInteract) {
    return;
  }

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

  if (event.target.parentElement.className == "my-card") {
    const statsElementText = event.target.firstElementChild.textContent;
    const attackIndexStart =
      statsElementText.indexOf("Attack: ") + "Attack: ".length;
    const attackIndexEnd = statsElementText.indexOf(",", attackIndexStart);
    const attackValue = statsElementText.slice(
      attackIndexStart,
      attackIndexEnd
    );
    sendDamage.damage = attackValue;
  } else {
    sendDamage.enemyCard = event.target.dataset.id;
  }

  if (sendDamage.damage != null && sendDamage.enemyCard != null) {
    socket.emit(
      "send-damage",
      sendDamage,
      // sendDamage.enemyCard,
      currentLogin,
      roomId
    );
    sendDamage.damage = null;
    sendDamage.enemyCard = null;
  }
}

function getfirstplayer(socket, roomId) {
  try {
    // Отправляем событие "first-step" на сервер с указанием roomId
    socket.emit("first-step", roomId);

    // Ожидаем ответа от сервера через событие "first-step-result"
    const firstMove = new Promise((resolve, reject) => {
      socket.on("first-step-result", (player) => {
        resolve(player);
      });
    });

    // Возвращаем игрока, который будет первым ходить
    return firstMove;
  } catch (error) {
    console.error("Произошла ошибка при получении первого игрока:", error);
    throw error;
  }
}

// Waitng for enemy
socket.on("players-ready", () => {
  // Start battle
  // Load enemy
  socket.emit("send-enemy", currentLogin, roomId);

  socket.on("get-enemy", (enemy, sender) => {
    if (sender == currentLogin) {
      currentEnemy = enemy;
    }
  });

  // Generate your cards
  for (let index = 0; index < 3; index++) {
    socket.emit("get-card", currentLogin);
  }

  getfirstplayer(socket, roomId).then((firstMove) => {
    console.log("Первый ходит игрок:", firstMove);
    if (currentLogin == firstMove) {
      isPlayerAllowedToInteract = true;
    }
  });

  socket.emit("start-game");

  socket.on("game-started", (mana) => {
    if (isPlayerAllowedToInteract) {
      maxMana = mana;
      currentMana = maxMana;
      console.log(`${currentLogin}'s move now`);
      console.log(`Mana:${mana}`);

      socket.emit("start-turn-timer", 30);
    } else {
      console.log("Not your move");
    }
  });

  socket.on("turn-timeout", () => {
    console.log("Time is over.");
    if (isPlayerAllowedToInteract) {
      isPlayerAllowedToInteract = false;
    } else {
      isPlayerAllowedToInteract = true;
    }
    maxMana++;
    currentMana = maxMana;
    if (isPlayerAllowedToInteract) {
      socket.emit("start-turn-timer", 30);
    }
  });

  // Load yuor card
  socket.on("randomCard", (randomCard, login) => {
    if (login == currentLogin) {
      createCard(randomCard);
    }
  });

  // Load enemy card
  socket.on("load-enemy-card", (enemyCard, sender) => {
    if (currentLogin != sender) {
      createEnemyCard(enemyCard);
    }
  });

  // Take damage
  socket.on("get-damage", (damage, damagedCardId, damagedPlayer) => {
    if (damagedPlayer == currentLogin) {
      let myCardElements = document.querySelectorAll(".my-card");
      let cardElement = null;

      for (let i = 0; i < myCardElements.length; i++) {
        let myCardElement = myCardElements[i];
        // Внутри каждого элемента .enemy-card находим .card
        let tempElement = myCardElement.querySelector(".card");

        // Проверяем, есть ли .card внутри .enemy-card и получаем data-id
        if (tempElement) {
          var searchedCardId = tempElement.getAttribute("data-id");
          // Сравниваем значение data-id с целевым значением
          if (searchedCardId == damagedCardId) {
            cardElement = tempElement;
            break; // Выход из цикла, так как элемент найден
          }
        }
      }

      let statsElementText = cardElement.firstElementChild.textContent;
      const healthIndexStart =
        statsElementText.indexOf("Health: ") + "Health: ".length;
      const healthValue = statsElementText.slice(healthIndexStart);

      const remainingHealth = healthValue - damage;

      if (remainingHealth <= 0) {
        cardElement.remove();
      } else {
        statsElementText = statsElementText.replace(
          /Health: \d+/,
          `Health: ${remainingHealth}`
        );
        cardElement.firstElementChild.textContent = statsElementText;
      }

      console.log("отримав прочухана");
      socket.emit(
        "send-enemy-card-damaged",
        damage,
        damagedCardId,
        damagedPlayer
      );
    }
  });

  socket.on(
    "get-enemy-card-damaged",
    (damage, damagedCardId, damagedPlayer) => {
      if (damagedPlayer != currentLogin) {
        let enemyCardElements = document.querySelectorAll(".enemy-card");
        let cardElement = null;

        for (let i = 0; i < enemyCardElements.length; i++) {
          let enemyCardElement = enemyCardElements[i];
          // Внутри каждого элемента .enemy-card находим .card
          let tempElement = enemyCardElement.querySelector(".card");

          // Проверяем, есть ли .card внутри .enemy-card и получаем data-id
          if (tempElement) {
            var searchedCardId = tempElement.getAttribute("data-id");
            // Сравниваем значение data-id с целевым значением
            if (searchedCardId == damagedCardId) {
              cardElement = tempElement;
              break; // Выход из цикла, так как элемент найден
            }
          }
        }

        let statsElementText = cardElement.firstElementChild.textContent;
        const healthIndexStart =
          statsElementText.indexOf("Health: ") + "Health: ".length;
        const healthValue = statsElementText.slice(healthIndexStart);

        const remainingHealth = healthValue - damage;

        if (remainingHealth <= 0) {
          cardElement.remove();
        } else {
          statsElementText = statsElementText.replace(
            /Health: \d+/,
            `Health: ${remainingHealth}`
          );
          cardElement.firstElementChild.textContent = statsElementText;
        }
      }
    }
  );

  // Add drop event listener to the table field
  tableField.addEventListener("dragover", handleDragOver);
  tableField.addEventListener("drop", handleDrop);

  // Add a click event listener to the document
  enemyField.addEventListener("click", handleCardClick);
  tableField.addEventListener("click", handleCardClick);
});
