const hand = document.querySelector('.hand');
const tableField = document.querySelector('.table-field');

// Sample card data (you can have your own card objects with stats)
const cards = [
    { id: 1, name: 'Card 1', cost: 3, attack: 2, health: 4 },
    { id: 2, name: 'Card 2', cost: 2, attack: 3, health: 2 },
    { id: 3, name: 'Card 3', cost: 4, attack: 1, health: 5 },
    { id: 4, name: 'Card 4', cost: 1, attack: 4, health: 1 },
    { id: 5, name: 'Card 5', cost: 5, attack: 5, health: 5 }
];

// Function to create a card element with stats
function createCard(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.draggable = true;
    cardElement.textContent = card.name;

    // Create a stats container
    const statsElement = document.createElement('div');
    statsElement.className = 'card-stats';
    statsElement.textContent = `Cost: ${card.cost}, Attack: ${card.attack}, Health: ${card.health}`;
    
    // Set the data-text attribute with the card's stats
    cardElement.setAttribute('data-text', `what this card do and do and do and do and do and do`);
    
    // Append stats to the card
    cardElement.appendChild(statsElement);

    cardElement.dataset.id = card.id;
    return cardElement;
}


// Function to handle drag start event
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
}

// Function to handle drag over event
function handleDragOver(event) {
    event.preventDefault();
}

// Function to handle drop event
function handleDrop(event) {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('text/plain');
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);

    // Check if the card is dropped onto a card placeholder
    if (event.target.classList.contains('card-placeholder')) {
        // Clone the card and append it to the table field
        const clonedCard = cardElement.cloneNode(true);
        event.target.appendChild(clonedCard);

        // Apply the hover effect to the cloned card
        clonedCard.addEventListener('mouseover', function () {
            this.style.transform = 'translateY(-10px) scale(1.5)';
        });

        clonedCard.addEventListener('mouseout', function () {
            this.style.transform = 'scale(1)';
        });

        // Remove the card from the hand
        cardElement.remove();
    }
}

// Add cards to the hand
cards.forEach(card => {
    const cardElement = createCard(card);
    hand.appendChild(cardElement);

    // Add drag event listeners to the card
    cardElement.addEventListener('dragstart', handleDragStart);
});

// Add drop event listener to the table field
tableField.addEventListener('dragover', handleDragOver);
tableField.addEventListener('drop', handleDrop);
