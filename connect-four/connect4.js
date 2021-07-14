/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const settings = {
gridWidth: 7,
gridHeight: 6,
connectNum: 4,
p1Color: "rgb(10,124,230)",
p2Color: "rgb(149,35,35)"
};

if (localStorage.getItem('connect4')) {
  //retrieve previous settings from local storage, if any, and replace game board settings.
  const savedSettings = JSON.parse(localStorage.connect4);
  settings.gridWidth = savedSettings.gridWidth;
  settings.gridHeight = savedSettings.gridHeight;
  settings.connectNum = savedSettings.connectNum;
  settings.p1Color = savedSettings.p1Color;
  settings.p2Color= savedSettings.p2Color;
}

let board = []; // array of rows, each row is array of cells  (board[y][x])
let winner = false;

document.getElementById('p1Color').value = settings.p1Color;
document.getElementById('p2Color').value = settings.p2Color;

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  // makeBoard() creates and populates JS board to height and width of the matrix array
  board = [];
  for (let h = 0; h < settings.gridHeight; h++) {
    board.push([]);
    for (let w = 0; w < settings.gridWidth; w++)
      board[h].push(0);
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // TODO: get "htmlBoard" variable from the item in HTML w/ID of "board"
  const htmlBoard = document.getElementById('gameboard') // selects gameboard from the HTML Document
  htmlBoard.innerHTML = ''; //clears board

  // add "click event listener with callback handleClick()"
  // the top element w/in gameboard is where you select where to drop your player piece, you cannot actually place a piece here.
  const top = document.createElement("tr");   // create top row of game board in HTML as a "tr" element,
  top.setAttribute("id", "column-top");   // add id of "column-top"
  top.addEventListener("click", handleClick);   // add "click event listener with callback handleClick()"
  // loop through the width of the gameboard to determine how how wide the top element will be
  for (let w = 0; w < settings.gridWidth; w++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", w);
    headCell.classList.add("topcell");
    headCell.addEventListener("click", e => {
      if (winner === true) {
        e.target.style.backgroundColor = "whitesmoke";
      } else {
        if (currPlayer === 1) e.target.style.backgroundColor = settings.p2Color;
        if (currPlayer === 2) e.target.style.backgroundColor = settings.p1Color;
      }
    });
    // set background color back to white after you leave the cell with your mouse
    headCell.addEventListener('mouseleave', e => (e.target.style.backgroundColor = 'whitesmoke'));
    top.append(headCell);
  }
  htmlBoard.append(top); // append top to HMTLBoard

  for (let h = 0; h < settings.gridHeight; h++) {
    const row = document.createElement("tr");  // create a "tr" element for all rows 
    row.classList.add('gameRow');
    for (var w = 0; w < settings.gridWidth; w++) {
      const cell = document.createElement("td");  // creates a "td" in each new "tr" for each column of the gameboard.
      cell.setAttribute("id", `${h}-${w}`);  // adds ID to each "td" representing the row and column location
      row.append(cell);
    }
    htmlBoard.append(row);   // appends new rows to gameBoard as silblings of top.
  }
  //reset variables and elements for new game
  currPlayer = 1;
  colorChanger();
  winner = false;
}

/** placeInTable: update DOM to place piece into HTML table of board */
// h = y, w = x
function placeInTable(h, w) {
  const tdAddDiv = document.getElementById(`${h}-${w}`);

  const newDiv = document.createElement('div'); // creates a new div that adds a player piece in the right spot
  newDiv.classList.add('piece');
  newDiv.classList.add(`p${currPlayer}`);
  if (currPlayer === 1) newDiv.style.backgroundColor = settings.p1Color;
  if (currPlayer === 2) newDiv.style.backgroundColor = settings.p2Color;
  tdAddDiv.append(newDiv);
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  if (winner) return;
  const w = +evt.target.id; //get w from ID of clicked cell


  //get next spot in column (if none, ignore click)
  const h = findSpotForCol(w); 
  if (h === null) {
    return;
  }

  placeInTable(h, w);  //place piece in board and add to HTML table

  board[h][w] = currPlayer; //update board

  // check for win
  if (checkForWin()) 
    setTimeout(() => endGame(`Player ${currPlayer} won!`), 999);
    
  // check for tie
  if (board.every(row => row.every(cell => cell))) { //check if all spaces on the board are filled w/o a winner, if so iniate tie
      setTimeout(() => endGame("You TIED!"), 500);
      winner = true;
  }
  // switch players
  if (currPlayer === 1) {
    currPlayer = 2;
  } else {
    currPlayer = 1;
  }
}

//given column w, return top empty h (null if filled)
function findSpotForCol(w) {
  for (let h = settings.gridHeight - 1; h >= 0; h--) {
    if (board[h][w] === 0) return h;
  }
  return null;
}

function placeInTable(h,w) {//updates DOM to place piece in HTML gameboard
  const tdAddDiv = document.getElementById(`${h}-${w}`);
  const newDiv = document.createElement('div'); //create a new div that adds player piece in correct spot
  newDiv.classList.add('piece');
  newDiv.classList.add(`p${currPlayer}`);
  if (currPlayer === 1) newDiv.style.backgroundColor = settings.p1Color;
  if (currPlayer === 2) newDiv.style.backgroundColor = settings.p2Color;
  tdAddDiv.append(newDiv);
}
/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([h, w]) =>
        h >= 0 &&
        h < settings.gridHeight &&
        w >= 0 &&
        w < settings.gridWidth &&
        board[h][w] === currPlayer
    );
  }

  // TODO: read and understand this code. Add comments to help you.

  for (let h = 0; h < settings.gridHeight; h++) {
    for (let w = 0; w < settings.gridWidth; w++) {
      const horiz = [];
      for (let i = 0; i <settings.connectNum; i++) horiz.push([h, w + i]);
      // var horiz = [[h, w], [h, w + 1], [h, w + 2], [h, w + 3]]; //checks to see if there is a horizontal line of four or morematching pieces
      const vert = [];
      for (let i = 0; i < settings.connectNum; i++) vert.push([h + i, w]);
      // var vert = [[h, w], [h + 1, w], [h + 2, w], [h + 3, w]]; //checks to see if there is a verticle line of four or more matiching pieces
      const diagDR = [];
      for (let i = 0; i < settings.connectNum; i++) diagDR.push([h + i, w + i]);
      // var diagDR = [[h, w], [h + 1, w + 1], [h + 2, w + 2], [h + 3, w + 3]]; //checks to see if there is a diagonal line going from bottom left up to top right of four or more matching pieces
      const diagDL = [];
      for (let i = 0; i < settings.connectNum; i++) diagDL.push([h + i, w - i]);
      // var diagDL = [[h, w], [h + 1, w - 1], [h + 2, w - 2], [h + 3, w - 3]]; //checks to see if there is a diagonal line going from bottom right to top left of four or more matching pieces

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        winner = true;
        return true;
      }
    }
  }
}

/** endGame: announce game end */

function endGame(msg) {
  // TODO: pop up alert message
  alert(msg);
  // showResetButton;
}

colorChanger = () => {
  const p1Color = document.getElementById('p1Color');
  const p2Color = document.getElementById('p2Color');
  const heading = document.getElementById('gameheading');
  const body = document.querySelector('body');
  const buttons = document.querySelectorAll('button');
  const topRowSquares = document.querySelectorAll('.topcell');
  const p1Pieces = document.querySelectorAll('.p1');
  const p2Pieces = document.querySelectorAll('.p2');

  settings.p1Color = p1Color.value,
  settings.p2Color = p2Color.value,
  updateLocalStorage(settings);

  heading.style.backgroundColor = settings.p1color// makes h1 color the color of p1
  heading.style.color = settings.p1Color
  body.style.backgroundColor = settings.p2Color

  for (let button of buttons) {
    button.style.color = settings.p1Color //update button colors
  }

  for (let i = 0; i < topRowSquares.length; i++) {
    topRowSquares[i].addEventListener('mouseenter', e => {
      if (winner === true) {
        e.target.style.backgroundColor = 'white'; //prevents background from changing after endgame is initated
      } else {
          if (currPlayer === 1) e.target.style.backgroundColor = settings.p1Color;
          if (currPlayer === 2) e.target.style.backgroundColor = settings.p2Color;
      }
    });
  }
  for (let i = 0; i < p1Pieces.length; i++) {
    p1Pieces[i].style.backgroundColor = settings.p1Color //updates color of p1 pieces if player changes midgame
  }
  for (let i = 0; i < p2Pieces.length; i++) {
    p2Pieces[i].style.backgroundColor = settings.p2Color //updates color of p2 pieces if player changes midgame
  }
}

convertHexToRgb=(hex,trans)=>{
	const hexRgb = hex.slice(-6).match(/.{1,2}/g);
	const Rgb = [
			parseInt(hexRgb[0], 16),
			parseInt(hexRgb[1], 16),
			parseInt(hexRgb[2], 16)
	];
	if (trans=== undefined){
		return `rgb(${Rgb[0]},${Rgb[1]},${Rgb[2]})`
	}else{
		return `rgba(${Rgb[0]},${Rgb[1]},${Rgb[2]},${trans})`
	}
}

updateGameHeading = () => {
  document.getElementById('gameheading').innerHTML = `Connect ${settings.connectNum}`;
}

increaseGridHeight = () => {
  settings.gridHeight++;
  resetFunctions();
}

decreaseGridHeight = () => {
  if (settings.gridHeight > 3) {
  //cannot have a height less than 3!
    settings.gridHeight--;
    resetFunctions();
  }
}

increaseGridWidth = () => {
  settings.gridWidth++;
  resetFunctions();
}

decreaseGridWidth = () => {
  if (settings.gridWidth > 3) {
  //cannot have a width less than 3!
    settings.gridWidth--;
    resetFunctions();
  }
}

winNumIncrease = () => {
  settings.connectNum++;
  resetFunctions();
}

winNumDecrease = () => {
  settings.connectNum--;
  resetFunctions();
}

updateLocalStorage = (localStorageItem) => {
  localStorage.setItem('connect4',JSON.stringify(localStorageItem));
}

resetFunctions = () => {
	makeBoard();
	makeHtmlBoard();
	updateGameHeading();
	updateLocalStorage(settings);
};

makeBoard();
makeHtmlBoard();
updateGameHeading();

document.getElementById('heightincrease').addEventListener('click', increaseGridHeight);
document.getElementById('heightdecrease').addEventListener('click', decreaseGridHeight);
document.getElementById('widthincrease').addEventListener('click', increaseGridWidth);
document.getElementById('widthdecrease').addEventListener('click', decreaseGridWidth);
document.getElementById('connectmore').addEventListener('click', connectmore);
document.getElementById('connectless').addEventListener('click', connectless);
document.getElementById('p1Color').addEventListener('change', colorChanger);
document.getElementById('p2Color').addEventListener('change', colorChanger);
document.getElementById('resetbtn').addEventListener('click', resetFunctions);