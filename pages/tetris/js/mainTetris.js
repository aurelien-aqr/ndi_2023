const canvas = document.getElementById("tetrisCanvas");
const canvasNextPiece = document.getElementById("nextPieceCanvas");
const context = canvas.getContext("2d");

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;

let currentPiece;
let currentPieceColor;

let nextPiece;
let nextPieceColor;

let nbScore = 0;
let vitesse = 450;
let phase = 0;

let isGamePaused = false;

let depart;
let termine;
let viteseInterval = setInterval(update, vitesse);
const pieces = [
    [[1, 1, 1, 1]],

    [[1,1],
     [1,1]],

    [[1, 1, 1],
     [0, 1, 0]],

    [[1, 1, 1],
     [1, 0, 0]],

    [[1, 1, 1],
     [0, 0, 1]],

    [[1, 1, 0],
     [0, 1, 1]],

    [[0, 1, 1],
     [1, 1, 0]]
];
let couleurs = [
    "#00F0F0",
    "#f0f000",
    "#a000f0",
    "#f0a100",
    "#0000F0",
    "#00f000",
    "#f00000",
];


const board = [];
for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLUMNS; col++) {
        board[row][col] = 0;
    }
}


function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = "#000";
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}
function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            if (board[row][col] !== 0) {
                drawSquare(col, row, board[row][col]);
            }
        }
    }
}
function drawNextPiece() {
    const nextPieceCanvasContext = canvasNextPiece.getContext("2d");
    nextPieceCanvasContext.clearRect(0, 0, canvasNextPiece.width, canvasNextPiece.height);

    const blockSize = Math.min(
        canvasNextPiece.width / nextPiece[0].length,
        canvasNextPiece.height / nextPiece.length
    );

    const pieceWidth = nextPiece[0].length * blockSize;
    const pieceHeight = nextPiece.length * blockSize;

    const x = (canvasNextPiece.width - pieceWidth) / 2;
    const y = (canvasNextPiece.height - pieceHeight) / 2;

    for (let row = 0; row < nextPiece.length; row++) {
        for (let col = 0; col < nextPiece[row].length; col++) {
            if (nextPiece[row][col] !== 0) {
                const drawX = x + col * blockSize;
                const drawY = y + row * blockSize;
                nextPieceCanvasContext.fillStyle = nextPieceColor;
                nextPieceCanvasContext.fillRect(drawX, drawY, blockSize, blockSize);
                nextPieceCanvasContext.strokeStyle = "#000";
                nextPieceCanvasContext.strokeRect(drawX, drawY, blockSize, blockSize);
            }
        }
    }
}

function generatePiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    currentPiece = pieces[randomIndex];
    currentPieceColor = couleurs[randomIndex];
}
function generateNextPiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    nextPiece = pieces[randomIndex];
    nextPieceColor = couleurs[randomIndex];
}
function spawnPiece() {
    if(!nextPiece) {
        const randomIndex = Math.floor(Math.random() * pieces.length);
        currentPiece = pieces[randomIndex];
        currentPieceColor = couleurs[randomIndex];
        // Initial position of the piece
        currentPiece.x = Math.floor((COLUMNS - currentPiece[0].length) / 2);
        currentPiece.y = 0;
    }else {
        currentPiece = nextPiece;
        currentPieceColor = nextPieceColor;
        // Initial position of the piece
        currentPiece.x = Math.floor((COLUMNS - currentPiece[0].length) / 2);
        currentPiece.y = 0;
    }
    generateNextPiece();
}
function canMove(piece, offsetX, offsetY) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col] !== 0) {
                const newX = currentPiece.x + col + offsetX;
                const newY = currentPiece.y + row + offsetY;

                if (newX < 0 || newX >= COLUMNS || newY >= ROWS || board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}
function mergePiece() {
    for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
            if (currentPiece[row][col] !== 0) {
                const boardX = currentPiece.x + col;
                const boardY = currentPiece.y + row;
                board[boardY][boardX] = currentPieceColor;
            }
        }
    }
    // Check if the merged piece has reached the top of the board
    if (currentPiece.y <= 0) {
        clearInterval(update);

        displayMessage("Défaite... mais félicitations, vous avez perdu votre temps !");
        isGamePaused = true;
        termine = new Date();
    }
    spawnPiece();
}
function resetGame() {
    window.location.reload();
    // Reset the board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            board[row][col] = 0;
        }
    }
    spawnPiece();
}

function rotatePiece() {
    const originalPiece = currentPiece;
    let x = currentPiece.x;
    let y = currentPiece.y;
    currentPiece = currentPiece[0].map((_, i) => currentPiece.map(row => row[i]));
    currentPiece.reverse();
    currentPiece.x = x;
    currentPiece.y = y;
    if (!canMove(currentPiece, 0, 0)) {
        currentPiece = originalPiece; // Revert the rotation if it's not valid
    }
}
function movePiece(dirX, dirY) {
    if (canMove(currentPiece, dirX, dirY)) {
        currentPiece.x += dirX;
        currentPiece.y += dirY;
    } else if (dirY !== 0) {
        mergePiece();
    }
}
function clearRows() {
    let rowsToClear = [];

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            rowsToClear.push(row);
        }
    }

    if (rowsToClear.length > 0) {
        rowsToClear.forEach(row => {
            board.splice(row, 1);
            board.unshift(Array(COLUMNS).fill(0));
        });

        const points = Math.pow(2, rowsToClear.length - 1) * 10;
        nbScore += points;

        if (nbScore > 404) {
            nbScore = 404;
            document.getElementById("score").innerText = "Score: " + nbScore;
            clearInterval(update);
            displayMessage("Félicitations, vous avez perdu votre temps !");
            isGamePaused = true;
            termine = new Date();
        }

        document.getElementById("level").innerText = "Level: " + phase;
        document.getElementById("score").innerText = "Score: " + nbScore;

        if (nbScore / 16 > phase) {
            phase = Math.floor(nbScore / 16);
            vitesse = 450 + phase * 15;
            clearInterval(viteseInterval);
            viteseInterval = setInterval(update, vitesse);
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece();
    drawNextPiece();
}
function drawPiece() {
    for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
            if (currentPiece[row][col] !== 0) {
                drawSquare(currentPiece.x + col, currentPiece.y + row, currentPieceColor);
            }
        }
    }
}
function update() {
    clearRows();
    if (isGamePaused) {
        return;
    }
    console.log(vitesse);
    movePiece(0, 1);
    gameLoop();

}
function gameLoop() {
    if (isGamePaused) {
        return;
    }
    draw();
}

document.addEventListener("keydown", function(event) {
    if (event.key === "a" || event.key === "A") {
        rotatePiece();
        gameLoop();
    } else if (event.key === "ArrowLeft") {
        movePiece(-1, 0);
        gameLoop();
    } else if (event.key === "ArrowRight") {
        movePiece(1, 0);
        gameLoop();
    } else if (event.key === "ArrowDown") {
        movePiece(0, 1);
        gameLoop();
    }
});

function displayMessage(message) {
    const gameMessage = document.getElementById("gameMessage");
    const gameMessageText = document.getElementById("gameMessageText");
    gameMessageText.innerText = message;
    gameMessage.classList.remove("hidden");
    console.log(message);
}

function startGame() {
    depart = new Date();
    const gameMessage = document.getElementById("startMessage");
    gameMessage.classList.add("hidden");
    isGamePaused = false;
    generatePiece();
    spawnPiece();
}

////////////////////
function apparaitreDim() {
    var dimElement = document.getElementById("dim");

    if (dimElement) {
        dimElement.style.visibility = "visible";
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const field = document.querySelector(".field");
    const characters = document.querySelectorAll(".character");

    function makeEaseOut(timing) {
        return function (timeFraction) {
            return 1 - timing(1 - timeFraction);
        }
    }

    function bounce(timeFraction) {
        for (let a = 0, b = 1; 1; a += b, b /= 2) {
            if (timeFraction >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
            }
        }
    }

    function animateCharacter(element) {
        let to = field.clientHeight - element.clientHeight;

        animate({
            duration: 2000,
            timing: makeEaseOut(bounce),
            draw(progress) {
                element.style.top = to * progress + 'px';
            }
        });
    }

    function handleCharacterClick() {
        animateCharacter(this);
    }

    characters.forEach(char => {
        char.addEventListener("click", handleCharacterClick);
    });

    // Function to start the animation after a delay of 3 seconds
    function startAnimation() {
        characters.forEach((char, index) => {
            setTimeout(function () {
                char.click();
            }, 175 * index);
        });
    }



    const tetrisPiecesContainer = document.getElementById("tetrisPiecesContainer");

    const couleurs = [
        "#00F0F0",
        "#0000F0",
        "#f0a100",
        "#f0f000",
        "#00f000",
        "#a000f0",
        "#f00000"
    ];

    const pieces = [
        [[1, 1, 1, 1]],

        [[1, 1],
            [1, 1]],

        [[1, 1, 1],
            [0, 1, 0]],

        [[1, 1, 1],
            [1, 0, 0]],

        [[1, 1, 1],
            [0, 0, 1]],

        [[1, 1, 0],
            [0, 1, 1]],

        [[0, 1, 1],
            [1, 1, 0]]
    ];
    function generateRandomPiece() {
        const randomIndex = Math.floor(Math.random() * pieces.length);
        return pieces[randomIndex];
    }
    function generateRandomColor() {
        const randomIndex = Math.floor(Math.random() * couleurs.length);
        return couleurs[randomIndex];
    }

    function generateRandomPosition() {
        const containerWidth = tetrisPiecesContainer.clientWidth;
        const containerHeight = tetrisPiecesContainer.clientHeight;

        const pieceWidth = 30; // Taille d'une pièce Tetris
        const pieceHeight = 30;

        const x = Math.floor(Math.random() * (containerWidth - pieceWidth));
        const y = Math.floor(Math.random() * (containerHeight - pieceHeight));

        return { x, y };
    }

    function drawPiece(piece, position, color,dispawn) {
        for (let col = 0; col < piece[0].length; col++) {
            const pieceDiv = document.createElement("div");
            pieceDiv.style.position = "absolute";
            const x = position.x + (col * 31); // Largeur d'un carré de la pièce Tetris
            const y = position.y;
            pieceDiv.style.left = x + "px";
            pieceDiv.style.top = y + "px";
            pieceDiv.style.width =  30 + "px"; // Largeur de la pièce Tetris
            pieceDiv.style.height = 30 + "px"; // Hauteur de la pièce Tetris
            pieceDiv.style.backgroundColor = "transparent";

            for (let row = 0; row < piece.length; row++) {

                if (piece[row][col] !== 0) {
                    const square = document.createElement("div");
                    square.style.width = "30px"; // Taille d'un carré de la pièce Tetris
                    square.style.height = "30px";
                    square.style.backgroundColor = color;
                    square.style.border = "1px solid #000"; // Ajout du contour noir
                    pieceDiv.appendChild(square);
                } else {
                    const square = document.createElement("div");
                    square.style.width = "30px"; // Taille d'un carré de la pièce Tetris
                    square.style.height = "30px";
                    square.style.backgroundColor = "transparent";
                    square.style.border = "1px solid transparent";
                    pieceDiv.appendChild(square);
                }

                setTimeout(() => {
                    tetrisPiecesContainer.removeChild(square);
                }, dispawn);
            }
            tetrisPiecesContainer.appendChild(pieceDiv);
            setTimeout(() => {
                tetrisPiecesContainer.removeChild(pieceDiv);
            }, dispawn);
        }


    }
    let i = 1250;
    function generateAndDrawPiece() {
        if (i > 0) {
            setInterval(generateAndDrawPiece, Math.floor(Math.random() * i*0.6));
            i--;
            const randomPiece = generateRandomPiece()
            const randomPosition = generateRandomPosition();
            const randomColor = generateRandomColor();
            if (i < 400){
                drawPiece(randomPiece, randomPosition, randomColor,1200);
            } else {
                drawPiece(randomPiece, randomPosition, randomColor,2000);
            }

        } else {
            setTimeout(supprimerConteneur, 2000);
            setTimeout(apparaitreDim, 8);
        }

    }

    function supprimerConteneur() {
        var tetrisContainer = document.getElementById("tetrisPiecesContainer");

        // Supprimer complètement l'élément
        if (tetrisContainer && tetrisContainer.parentNode) {
            tetrisContainer.parentNode.removeChild(tetrisContainer);
        }
    }



    generateAndDrawPiece()


});
function endGame() {
    var username = document.getElementById("usernameInput").value;

    // Envoyer le nom d'utilisateur et d'autres données au serveur via AJAX
    if (username.trim() !== "") {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Gérer la réponse du serveur si nécessaire
                console.log(xhr.responseText);
            }
        };

        xhr.open("POST", "insererTuple.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("nomJoueur=" + encodeURIComponent(username) + "&score=" + encodeURIComponent(nbScore) + "&temps=" + encodeURIComponent((termine-depart)/1000));
    }
}
