const hand = document.querySelector(".hand");
const enemyHead = document.querySelector(".enemy-head");
const myHead = document.querySelector(".my-head");
const enemyField = document.querySelector(".enemy-field");
const tableField = document.querySelector(".my-field");
const manaValue = document.querySelector(".value");
const enemyName = document.querySelector(".enemy-name");
const myName = document.querySelector(".my-name");
const timerDisplay = document.getElementById("timer");
const enemyImg = document.querySelector('.enemy-head');
const myImg = document.querySelector('.my-head');
const Move = document.querySelector('.currentMove');

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const currentLogin = urlParams.get("playerName");

let countCardsInHand = 0;
let isGameEnded = false;
let isPlayerAllowedToInteract = false;
let currentMana = null;
let maxMana = null;
let currentEnemy = null;
let currentSocketId = null;
let sendDamage = {
  damage: null,
  attackingCardId: null,
  enemyCard: null,
};

const socket = io();

function loadCurrentMana() {
  manaValue.textContent = currentMana;
}

function loadCurrentPlayer(player) {
  Move.textContent = player;
}

function reloadCardsUsed() {
  let myCardElements = document.querySelectorAll(".my-card");

  for (let i = 0; i < myCardElements.length; i++) {
    let myCardElement = myCardElements[i];
    let tempElement = myCardElement.querySelector(".card");

    if (tempElement) {
      tempElement.setAttribute("data-is-used", false);
    }
  }
}

function getCardPrice(card) {
  const statsElementText = card.firstElementChild.textContent;
  const priceIndexStart =
    statsElementText.indexOf("price: ") + "price: ".length;
  const priceIndexEnd = statsElementText.indexOf(",", priceIndexStart);
  const priceValue = statsElementText.slice(priceIndexStart, priceIndexEnd);
  return priceValue;
}

function createEnemyCard(card) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.draggable = true;
  cardElement.textContent = card.name;
  cardElement.style.backgroundImage = `url("images/${card.image_path}")`;

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
  if (countCardsInHand >= 6) {
    return;
  } else {
    countCardsInHand++;
  }

  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.draggable = true;
  cardElement.textContent = card.name;
  cardElement.style.backgroundImage = `url("images/${card.image_path}")`;

  // Create a stats container
  const statsElement = document.createElement("div");
  statsElement.className = "card-stats";
  statsElement.textContent = `Cost: ${card.cost}, Attack: ${card.damage}, Health: ${card.hp}`;

  // Set the data-text attribute with the card's stats
  cardElement.setAttribute("data-text", card.description);

  // Append stats to the card
  cardElement.appendChild(statsElement);

  cardElement.dataset.id = card.id;
  cardElement.setAttribute("data-is-used", false);
  // return cardElement;
  hand.appendChild(cardElement);

  // Add drag event listeners to the card
  cardElement.addEventListener("dragstart", handleDragStart);
}

// Function to handle drag start event
function handleDragStart(event) {
  if (!isPlayerAllowedToInteract) {
    alert("Not your turn yet!");
    return;
  }
  if (currentMana < getCardPrice(event.target)) {
    alert("It's too expensive for you know :(");
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
    clonedCard.setAttribute("data-is-used", true);

    event.target.appendChild(clonedCard);

    // Apply the hover effect to the cloned card
    clonedCard.addEventListener("mouseover", function () {
      this.style.transform = "translateY(-10px) scale(1.5)";
    });

    clonedCard.addEventListener("mouseout", function () {
      this.style.transform = "scale(1)";
    });

    currentMana -= Number.parseInt(
      getCardPrice(event.target.firstElementChild)
    );

    loadCurrentMana();

    // Remove the card from the hand
    cardElement.remove();
    countCardsInHand--;

    socket.emit("put-card", cardId, currentLogin);
  }
}

// Function to handle card click event
function handleCardClick(event) {
  if (!isPlayerAllowedToInteract) {
    alert("Not your turn yet!");
    return;
  }

  const card = event.target;

  if (card.getAttribute("data-is-used") == "true") {
    alert("This card is used already");
    return;
  }

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

  if (card.parentElement.className == "my-card") {
    if (sendDamage.attackingCardId) {
      let myCardElements = document.querySelectorAll(".my-card");
      let cardElement = null;

      for (let i = 0; i < myCardElements.length; i++) {
        let myCardElement = myCardElements[i];
        let tempElement = myCardElement.querySelector(".card");

        if (tempElement) {
          let searchedCardId = tempElement.getAttribute("data-id");
          if (searchedCardId == sendDamage.attackingCardId) {
            cardElement = tempElement;
            break;
          }
        }
      }

      cardElement.setAttribute("data-is-used", false);
    }

    const statsElementText = card.firstElementChild.textContent;
    const attackIndexStart =
      statsElementText.indexOf("Attack: ") + "Attack: ".length;
    const attackIndexEnd = statsElementText.indexOf(",", attackIndexStart);
    const attackValue = statsElementText.slice(
      attackIndexStart,
      attackIndexEnd
    );
    sendDamage.damage = attackValue;
    sendDamage.attackingCardId = card.dataset.id;
    card.setAttribute("data-is-used", true);
  } else {
    sendDamage.enemyCard = card.dataset.id;
  }

  if (sendDamage.damage != null && sendDamage.enemyCard != null) {
    socket.emit("send-damage", sendDamage, currentLogin, roomId);

    sendDamage.damage = null;
    sendDamage.attackingCardId = null;
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
socket.on("timer-duration-ready", (time) => {
  const countdownElement = document.querySelector('.countdown');

  // Set the initial countdown value
  let countdownValue = time;

  // Function to update the countdown
  function updateCountdown() {
    countdownElement.textContent = countdownValue;
    countdownValue--;

    // Check if the countdown has reached 0
    if (countdownValue < 0) {
      countdownElement.style.display = 'none'; // Hide the countdown text
      clearInterval(interval); // Stop the countdown
    }
  }

  // Call the updateCountdown function every second (1000 milliseconds)
  const interval = setInterval(updateCountdown, 1000);
});

socket.on("players-ready", () => {
  // Start battle
  // Load enemy
  socket.emit("send-enemy", currentLogin, roomId);

  socket.on("get-enemy", (enemy, sender) => {
    if (sender == currentLogin) {
      currentEnemy = enemy;
      socket.emit('get_path_by_name_enemy', currentEnemy);
    }
  });

  socket.emit('get_path_by_name_my', currentLogin);
  socket.on('send-path_my', (path) => {
    if (path != null) {
    myImg.style.backgroundImage = `url("avatars/${path}")`;
    }
  });

  socket.on('send-path_enemy', (path) => {
    if (path != null) {
    enemyImg.style.backgroundImage = `url("avatars/${path}")`;
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
      loadCurrentPlayer(currentLogin);
    } else {
      loadCurrentPlayer(currentEnemy);
    }
  });

  socket.emit("start-game");

  socket.on("game-started", (mana) => {
    maxMana = mana;
    currentMana = maxMana;
    loadCurrentMana();
    myName.textContent = currentLogin;
    enemyName.textContent = currentEnemy;
    if (isPlayerAllowedToInteract) {
      console.log(`${currentLogin}'s move now`);

      socket.emit("start-turn-timer", 10, roomId);
    } else {
      console.log("Not your move");
    }
  });

  socket.on("turn-timeout", (receiver) => {
    if (receiver != currentLogin) {
      return;
    }
    console.log("Time is over.");
    if (isPlayerAllowedToInteract && !isGameEnded) {
      isPlayerAllowedToInteract = false;
    } else if (!isGameEnded) {
      isPlayerAllowedToInteract = true;
    }

    if (maxMana <= 9) {
      maxMana++;
    }
    currentMana = maxMana;
    loadCurrentMana();
    if (isPlayerAllowedToInteract && !isGameEnded) {
      socket.emit("start-turn-timer", 30, roomId);
      socket.emit("get-card", currentLogin);
      loadCurrentPlayer(currentLogin);
      reloadCardsUsed();
    } else {
      loadCurrentPlayer(currentEnemy);
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

  socket.on("get-player-damage", (sender, damage) => {
    if (sender == currentLogin) {
      return;
    }

    const head = myHead.parentElement;
    const myHp = head.children[1].textContent;
    const remainingHp = myHp - damage;
    if (remainingHp <= 0) {
      head.children[1].textContent = `0`;
      socket.emit("send-remainig-hp", `0`, currentLogin);
      socket.emit("end-game", currentLogin);
    } else {
      head.children[1].textContent = remainingHp;
      socket.emit("send-remainig-hp", remainingHp, currentLogin);
    }
  });

  socket.on("get-remainig-hp", (remainingHp, sender) => {
    if (sender == currentLogin) {
      return;
    }

    const head = enemyHead.parentElement;
    head.children[1].textContent = remainingHp;
  });

  // Add drop event listener to the table field
  tableField.addEventListener("dragover", handleDragOver);
  tableField.addEventListener("drop", handleDrop);

  // Add a click event listener to the document
  enemyField.addEventListener("click", handleCardClick);
  tableField.addEventListener("click", handleCardClick);
  enemyHead.addEventListener("click", (event) => {
    if (sendDamage.damage) {
      socket.emit("send-player-damage", currentLogin, sendDamage.damage);
      sendDamage.damage = null;
      sendDamage.attackingCardId = null;
    }
  });

  socket.on("timer-duration", (duration) => {
    let currentTime = duration / 1000;

    timerInterval = setInterval(() => {
      currentTime--;
      timerDisplay.textContent = `${currentTime}`;

      if (currentTime <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  });

  socket.on("game-ended", (loser) => {
    isGameEnded = true;
    const gameEndMessage = document.getElementById("game-end-message");
    gameEndMessage.innerHTML = `<p style="font-size: 24px; color: red; font-family: fantasy;">Игра завершена! ${loser} проиграл!</p>`;
  });
});
