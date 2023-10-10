var container = document.createElement("div");
container.className = "container";

var sidebar = document.createElement("div");
sidebar.className = "sidebar";

var stats = document.createElement("div");
stats.className = "stats";

var flagImg = document.createElement("img");
flagImg.src = "./src/flag_ok.png";
flagImg.alt = "";
flagImg.style.height = "auto";
flagImg.style.maxWidth = "40%";
stats.appendChild(flagImg);

var minesCount = document.createElement("p");
minesCount.id = "minesCount";
stats.appendChild(minesCount);

var timer = document.createElement("div");
timer.className = "timer";

var stopwatchImg = document.createElement("img");
stopwatchImg.src = "./src/stopwatch.png";
stopwatchImg.style.height = "auto";
stopwatchImg.style.maxWidth = "40%";
timer.appendChild(stopwatchImg);

var timerText = document.createElement("p");
var hoursSpan = document.createElement("span");
hoursSpan.id = "hours";
hoursSpan.textContent = "00";
timerText.appendChild(hoursSpan);
timerText.appendChild(document.createTextNode(":"));
var minutesSpan = document.createElement("span");
minutesSpan.id = "minutes";
minutesSpan.textContent = "00";
timerText.appendChild(minutesSpan);
timerText.appendChild(document.createTextNode(":"));
var secondsSpan = document.createElement("span");
secondsSpan.id = "seconds";
secondsSpan.textContent = "00";
timerText.appendChild(secondsSpan);
timer.appendChild(timerText);

var buttons = document.createElement("div");
buttons.className = "buttons";

var newGameElem = document.createElement("div");
newGameElem.className = "newGame";

var sizeGridSelect = document.createElement("select");
sizeGridSelect.id = "sizeGrid";

var smallOption = document.createElement("option");
smallOption.value = "small";
smallOption.textContent = "easy";
smallOption.selected = true;
sizeGridSelect.appendChild(smallOption);

var mediumOption = document.createElement("option");
mediumOption.value = "medium";
mediumOption.textContent = "medium";
sizeGridSelect.appendChild(mediumOption);

var largeOption = document.createElement("option");
largeOption.value = "large";
largeOption.textContent = "hard";
sizeGridSelect.appendChild(largeOption);

newGameElem.appendChild(sizeGridSelect);

var newGameBtn = document.createElement("button");
newGameBtn.textContent = "New Game";
newGameElem.appendChild(newGameBtn);

buttons.appendChild(newGameElem);

sidebar.appendChild(stats);
sidebar.appendChild(timer);
sidebar.appendChild(buttons);

var main = document.createElement("div");
main.className = "main";
main.id = "main";

var gridBoard = document.createElement("div");
gridBoard.className = "grid";
gridBoard.id = "grid";

var audioElement = document.createElement("audio");
audioElement.id = "clickSound";
audioElement.src = "./src/click.mp3";
audioElement.type = "audio/mp3";
gridBoard.appendChild(audioElement);

main.appendChild(gridBoard);

var audioElementBlow = document.createElement("audio");
audioElementBlow.id = "blowSound";
audioElementBlow.src = "./src/boom.mp3";
audioElementBlow.type = "audio/mp3";
gridBoard.appendChild(audioElementBlow);

main.appendChild(gridBoard);

container.appendChild(sidebar);
container.appendChild(main);

document.body.innerHTML = "";
document.body.appendChild(container);

//11111
const mainDiv = document.getElementById("main");
const grid = document.getElementById("grid");

const minesCountText = document.getElementById("minesCount");

document.addEventListener("contextmenu", (event) => event.preventDefault());

let gridWidth = 10;
let gridHeight = 10;

let nMines;
let totalMines;
let nMinesDiscovered;

let stopped;
let paused;
let firstClick;

let squares;
let mines;

const MOUSE_BUTTONS = {
  LEFT: 0,
  RIGHT: 2,
};

const FLAG_TYPES = {
  OK: 1,
  DOUBT: 2,
};

class Square {
  constructor({}) {
    this.mine = false;
    this.discovered = false;
    this.adjacentMines = 0;
    this.flagType = undefined;
  }
}

let seconds;
let minutes;
let hours;

let interval;

const appendSeconds = document.getElementById("seconds");
const appendMinutes = document.getElementById("minutes");
const appendHours = document.getElementById("hours");

const setInitialVariables = () => {
  stopped = false;
  paused = false;
  firstClick = true;

  seconds = 0;
  minutes = 0;
  hours = 0;

  nMines = 0;
  nMinesDiscovered = 0;

  grid.style.visibility = "visible";

  squares = [];
  mines = [[]];

  totalMines = Math.floor(Math.sqrt(gridHeight * gridWidth));
  grid.innerHTML = "";
  grid.style["grid-template-columns"] = "auto ".repeat(gridWidth);
};

var buttonw = document.getElementById("clickSound");
var buttonBlow = document.getElementById("blowSound");

const colors = [
  "#52b69a",
  "#d9ed92",
  "#99d98c",
  "#76c893",
  "#34a0a4",
  "#1a759f",
  "#1e6091",
  "#184e77",
  "#ff4d6d",
  "#ffb3c1",
  "#ffd166",
];

const populateGrid = () => {
  for (let i = 0; i < gridHeight; i++) {
    mines[i] = [];
    for (let j = 0; j < gridWidth; j++) {
      mines[i].push(new Square({}));
      const square = document.createElement("div");
      square.className = "square";
      setColor(square);

      //square.addEventListener("mouseleave", () => removeColor(square));

      square.addEventListener("mousedown", (event) => {
        switch (event.button) {
          case MOUSE_BUTTONS.LEFT:
            buttonw.play();
            checkMine(i, j);
            break;
          case MOUSE_BUTTONS.RIGHT:
            buttonw.play();
            putFlag(i, j);

          default:
            break;
        }
      });
      squares.push(square);
      grid.appendChild(square);
    }
  }
};

function setColor(element) {
  const color = getRandomColor();
  element.style.backgroundColor = color;
  element.style.boxShadow = `0 0 2px ${color}, 0 0 10px ${color}`;
}

// function removeColor(element) {
//   element.style.backgroundColor = "#1d1d1d";
//   element.style.boxShadow = `0 0 2px #000`;
// }

function getRandomColor() {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

const setMines = () => {
  let minesToPopulate = totalMines;
  while (minesToPopulate > 0) {
    let i = Math.floor(Math.random() * gridHeight);
    let j = Math.floor(Math.random() * gridWidth);

    if (!mines[i][j].mine) {
      mines[i][j].mine = true;
      minesToPopulate--;
    }
  }
};

const setAdjancentMines = () => {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      if (!mines[i][j].mine) {
        let n = 0;
        if (i - 1 >= 0 && j - 1 >= 0 && mines[i - 1][j - 1].mine) {
          n++;
        }
        if (i - 1 >= 0 && mines[i - 1][j].mine) {
          n++;
        }
        if (i - 1 >= 0 && j + 1 < mines[i].length && mines[i - 1][j + 1].mine) {
          n++;
        }
        if (j - 1 >= 0 && mines[i][j - 1].mine) {
          n++;
        }
        if (j + 1 < mines[i].length && mines[i][j + 1].mine) {
          n++;
        }
        if (i + 1 < mines.length && j - 1 >= 0 && mines[i + 1][j - 1].mine) {
          n++;
        }
        if (i + 1 < mines.length && mines[i + 1][j].mine) {
          n++;
        }
        if (
          i + 1 < mines.length &&
          j + 1 < mines[i].length &&
          mines[i + 1][j + 1].mine
        ) {
          n++;
        }
        mines[i][j].adjacentMines = n;
      }
    }
  }
};
var buttonBlow = document.getElementById("blowSound");

const checkMine = (i, j) => {
  if (stopped) return;
  if (firstClick) {
    firstClick = false;
    startTimer();
  }
  if (mines[i][j].flagType === FLAG_TYPES.OK) {
    return;
  }
  if (mines[i][j].mine) {
    buttonBlow.play();
    blow();
    stopped = true;
    alert("Game over. Try again");
  } else {
    floodFill(i, j);
  }
};

const playBlowSound = () => {
  return new Promise((resolve) => {
    buttonBlow.play();
    buttonBlow.onended = resolve;
  });
};

const floodFill = (i, j) => {
  if (mines[i][j].discovered || mines[i][j].mine) {
    return;
  } else {
    mines[i][j].discovered = true;
    squares[i * gridWidth + j].style.background = "#c8def1";
    nMinesDiscovered++;
    if (nMinesDiscovered === gridWidth * gridHeight - totalMines) {
      alert("You won the game!! Press New Game to play again!");
      stopped = true;
    }
    if (mines[i][j].adjacentMines != 0) {
      squares[i * gridWidth + j].innerText = mines[i][j].adjacentMines;
      return;
    }
  }
  if (i - 1 >= 0 && j - 1 >= 0) {
    floodFill(i - 1, j - 1);
  }
  if (i - 1 >= 0) {
    floodFill(i - 1, j);
  }
  if (i - 1 >= 0 && j + 1 < mines[i].length) {
    floodFill(i - 1, j + 1);
  }
  if (j - 1 >= 0) {
    floodFill(i, j - 1);
  }
  if (j + 1 < mines[i].length) {
    floodFill(i, j + 1);
  }
  if (i + 1 < mines.length && j - 1 >= 0) {
    floodFill(i + 1, j - 1);
  }
  if (i + 1 < mines.length) {
    floodFill(i + 1, j);
  }
  if (i + 1 < mines.length && j + 1 < mines[i].length) {
    floodFill(i + 1, j + 1);
  }
  return;
};

const blow = () => {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      if (mines[i][j].mine) {
        const bombImg = document.createElement("img");
        bombImg.src = "./src/bomb.png";
        squares[i * gridWidth + j].innerHTML = "";
        squares[i * gridWidth + j].appendChild(bombImg);
      }
    }
  }
};

const putFlag = (i, j) => {
  if (!mines[i][j].flagType) {
    const flagImg = document.createElement("img");
    flagImg.src = "./src/flag_ok.png";
    squares[i * gridWidth + j].appendChild(flagImg);
    nMines++;
    minesCountText.innerText = `${nMines}/${totalMines}`;
    mines[i][j].flagType = FLAG_TYPES.OK;
  } else if (mines[i][j].flagType === FLAG_TYPES.OK) {
    const flagDoubtImg = document.createElement("img");
    flagDoubtImg.src = "./src/flag_doubt.png";
    squares[i * gridWidth + j].innerHTML = "";
    squares[i * gridWidth + j].appendChild(flagDoubtImg);
    nMines--;
    minesCountText.innerText = `${nMines}/${totalMines}`;
    mines[i][j].flagType = FLAG_TYPES.DOUBT;
  } else if (mines[i][j].flagType === FLAG_TYPES.DOUBT) {
    squares[i * gridWidth + j].innerHTML = "";
    mines[i][j].flagType = undefined;
  }
};

const stopwatch = () => {
  if (!paused && !stopped) {
    seconds++;
  }

  if (seconds <= 9) {
    appendSeconds.innerHTML = "0" + seconds;
  }
  if (seconds > 9 && seconds < 60) {
    appendSeconds.innerHTML = seconds;
  }
  if (seconds > 59) {
    seconds = 0;
    appendSeconds.innerHTML = seconds;
    minutes++;
  }

  if (minutes <= 9) {
    appendMinutes.innerHTML = "0" + minutes;
  }
  if (minutes > 9 && minutes < 60) {
    appendMinutes.innerHTML = minutes;
  }
  if (minutes > 59) {
    minutes = 0;
    appendMinutes.innerHTML = minutes;
    minutes++;
  }

  if (hours <= 9) {
    appendHours.innerHTML = "0" + hours;
  }
  if (hours > 9 && hours < 60) {
    appendHours.innerHTML = hours;
  }
  if (hours > 59) {
    hours = 0;
    appendHours.innerHTML = hours;
    hours++;
  }
};

const clearStopwatch = () => {
  appendSeconds.innerHTML = "00";
  appendMinutes.innerHTML = "00";
  appendHours.innerHTML = "00";
};

const startTimer = () => {
  clearInterval(interval);
  interval = setInterval(stopwatch, 1000);
};

const newGame = () => {
  const size = document.getElementById("sizeGrid");
  switch (size.value) {
    case "small":
      gridWidth = 10;
      gridHeight = 10;
      break;
    case "medium":
      gridWidth = 15;
      gridHeight = 15;
      break;
    case "large":
      gridWidth = 25;
      gridHeight = 25;
      break;

    default:
      break;
  }
  startGame();
};

newGameBtn.addEventListener("click", newGame);

const startGame = () => {
  setInitialVariables();
  clearInterval(interval);
  clearStopwatch();
  populateGrid();
  setMines();
  setAdjancentMines();
};

startGame();
