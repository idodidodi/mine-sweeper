'use strict'
// CONSTS

const FLOOR = '▨'
const MINE = '💣'
const FLAG = '🚩'
const HINT = '&#128161'
const COVER = ' '

// Global variables : 
var gTimerInterval;
var gBoard;  // Contains all the cells objects
var gGame = {
    minesRevealed: 0,
    flagsCounter: 0,  //  markedCount
    boardLength: 4, // Setting the default to beginner mode
    minesCount: 2,  // Setting the default to beginner mode
    shownCount: 0,
    isOn: false,
    isTimerOn: false,
    isWin: false,
    secsPassed: 0,
    score: 0,
    isLost: false,
    isHintOn: false,
    hintsAvail: 3,
    cellClickOnHintMode: false
};

function init() {
    disableContextMenu();
    // Reset Level to begginer by default (if restart was clicked)
    unHideLevelBox();
    var emptyBoard = buildEmptyBoard(gGame.boardLength)
    printMat(emptyBoard, '.board-container')
}


function restart() {
    resetGameVariables();
    reHideHints()
    init();
    // gameOver();
    zeroTimer();
    changeSmiley('default')
    // resetting game variables


}
function reHideHints() {
    var elHints = document.querySelector('.hints')
    elHints.classList.add('hide')
}

function setMinesNegsCount(board, iIdx, jIdx) {

    var count = 0;

    for (let i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (let j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > board.length - 1) continue;
            if (i === iIdx && j === jIdx) continue;
            if (board[i][j].isMine) count++
        }
    }
    return count;
}

function resetGameVariables() {
    gGame.boardLength = 4 // Setting the default to beginner mode
    gGame.minesCount = 2

    gGame.minesRevealed = 0
    gGame.flagsCounter = 0  //  markedCount
    changeFlagsCountModal();
    // gGame.boardLength = 4 // Setting the default to beginner mode
    // gGame.minesCount = 2  // Setting the default to beginner mode
    gGame.shownCount = 0
    gGame.isOn = false
    gGame.isTimerOn = false
    gGame.isWin = false
    gGame.secsPassed = 0
    gGame.score = 0
    updateDomCounter(0, '.score')
    gGame.isLost = false
    gBoard = [];
    clearInterval(gTimerInterval);
    gTimerInterval = 0;
    gGame.isHintOn = false;
    updateDomCounter(gGame.hintsAvail, '.hints-count span');
    unHideHintIcons();
    gGame.hintsAvail = 3;

}

function buildEmptyBoard() {
    var board = [];
    var size = gGame.boardLength;
    for (let i = 0; i < size; i++) {
        board.push([]);
        for (let j = 0; j < size; j++) {

            board[i][j] = ' ';
        }
    }
    return board;
}

function createCell(iIdx, jIdx, isMine) {
    var cell = {
        i: iIdx,
        j: jIdx,
        isMine: isMine,
        value: 0,
        isCovered: true,
        minesAroundCount: 0,
        isMarked: false
    }
    return cell
}


function buildBoard(iIdx, jIdx) {

    var size = gGame.boardLength; // Predeterminned by user
    var mines = generateMines(size, gGame.minesCount, iIdx, jIdx) // Create one long array Size * Size in length, with mines and floors, the objects are shuffled

    // Removing First clicked cell from the board and checking if it's a mine
    var board = [];
    for (let i = 0; i < size; i++) {
        board.push([]);
        for (let j = 0; j < size; j++) {
            var isMine = mines.shift(); // Takes out boolean item from the array
            board[i][j] = createCell(i, j, isMine);
        }
    }
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {

            var num = setMinesNegsCount(board, i, j)
            board[i][j].value = (board[i][j].isMine) ? null : num; //  Sets mine's count to mine's neighbors 
        }
    }

    return board;
}

function openChooseLevelBox(button) {  // Being called on click by choose level button, sending "this"
    if (gGame.isOn) return;
    var strHTML = `<button onclick="chooseLevel(this)">Beginner</button>
                    <button onclick="chooseLevel(this)">Intermediate</button>
                    <button onclick="chooseLevel(this)">Expert</button>` // create strHTML with 3 buttons
    button.innerHTML = strHTML

    // Beginner (4*4 with 2 MINES) 
    // Medium (6 * 6 with 5 MINES)  
    // Expert (8 * 8 with 15 MINES) 

}

function chooseLevel(button) {
    var level = button.innerText
    // if (!gGame.shownCount) {
    switch (level) {
        case 'Beginner':
            gGame.boardLength = 4;
            gGame.minesCount = 2;
            break;
        case 'Intermediate':
            gGame.boardLength = 6;
            gGame.minesCount = 5;
            break;
        case 'Expert':
            gGame.boardLength = 8;
            gGame.minesCount = 15;
            gGame.hintsAvail = 6;
    }
    changeLevelModal(level);
    changeMinesModal();
    init();
}

function changeMinesModal() {
    var elMsg = document.querySelector('.mines-count')
    elMsg.innerText = gGame.minesCount;
}

function changeLevelModal(level) {
    var elLevel = document.querySelector('.level')
    elLevel.innerText = `${level} Mode`;

}

function changeFlagsCountModal() {
    var elMsg = document.querySelector('.flags-count')
    elMsg.innerText = gGame.flagsCounter
}

function closeLevelBox() {
    var elButton = document.querySelector('.level-box')
    elButton.classList.add('hide')
    var elHints = document.querySelector('.hints')
    elHints.classList.remove('hide')
}

function unHideLevelBox() {
    var elButton = document.querySelector('.level-box')
    elButton.classList.remove('hide')
}

function unHideHintIcons() {
    for (let i = 3; i > gGame.hintsAvail; i--) { // Max Hints Avail: 3
        var elHint = document.querySelector(`.hint${i}`)
        elHint.classList.remove('hidden')

    }
}


function startGame() {
    // TO DO start timer by right click
    // First click turns isgame to true and turns on the timer  //   left click on clicked cell 
    gGame.isOn = true;
    runTimer()
    setTimeout(closeLevelBox, 500)
}

function cellClicked(elCell, ev) {  // Trigerred by Left Click  // (elCell, i, j  // (elCell, iIdx, jIdx)

    // If Game over - return
    if (gGame.isLost) return

    // First click turns isgame to true and turns on the timer
    if (!gGame.isOn) startGame()

    var classStr = elCell.classList.item(1);
    var iIdx = +(classStr.substring(4, 5))
    var jIdx = +(classStr.substring(6))

    if (gGame.isHintOn && !gGame.cellClickOnHintMode) {
        gGame.cellClickOnHintMode = true;
        for (let i = iIdx - 1; i <= iIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (let j = jIdx - 1; j <= jIdx + 1; j++) {
                if (j < 0 || j > gBoard.length - 1) continue;
                if (gBoard[i][j].isCovered && !gBoard[i][j].isMarked) {
                    renderCell(i, j, getCellStr(gBoard, i, j))
                    setTimeout(renderCell, 1000, i, j, COVER)
                }
                if (gBoard[i][j].isCovered && gBoard[i][j].isMarked) {
                    renderCell(i, j, getCellStr(gBoard, i, j))
                    setTimeout(renderCell, 1000, i, j, FLAG)
                }
            }
        }
    }

    if (ev.button === 2 && !gGame.isHintOn) {  // If right button clicked, call flag cell function and return. MAKE SURE not to change the order of this line. 
        markCell(iIdx, jIdx)
        return
    }

    if (gGame.shownCount === 0) {
        gBoard = buildBoard(iIdx, jIdx)
    }

    var cell = gBoard[iIdx][jIdx]
    if (!cell.isCovered) return // if clicked on a non covered cell return
    if (cell.isMarked) return // if cell is flagged nothing happens
    if (cell.isMine && !gGame.isHintOn) {
        printMat(gBoard, '.board-container');
        gameOver() // if clicking on mine : GAME OVER 
        return
    } else if (!gGame.isHintOn) { // Not a bomb

        // When cliked cell  is not a bomb and being shown - increase gGame.shownCount by the number of cell shown/expanded
        // left click reveals a cell
        expandShown(gBoard, iIdx, jIdx)
        if (checkWin()) { // Checks win every click
            gGame.isWin = true;
            gameOver();
        }

    }
}

function changeSmiley(status) {
    var imgSrc = ''
    switch (status) {
        case 'default':
            imgSrc = "img/playing-smiley.png";
            break;
        case 'won': imgSrc = "img/sun-glasses-smiley.png"
            break;
        case 'lost': imgSrc = "img/dead.png"
    }
    var elImg = document.querySelector('.smiley')
    elImg.src = imgSrc;
}
function markCell(iIdx, jIdx) { // triggered by right click   === Mark Cell as in PDF

    if (gGame.shownCount === 0) {
        alert('Click the left mouse button to begin')
        return
    }
    if (!gBoard[iIdx][jIdx].isCovered) return;

    // Flag and unflag on Model
    var item = gBoard[iIdx][jIdx]
    if (!item.isMarked) {
        item.isMarked = true
        gGame.flagsCounter++
        //Flag and unflag in DOM
        changeFlagsCountModal();
        renderCell(iIdx, jIdx, FLAG)
    } else {
        item.isMarked = false
        gGame.flagsCounter--
        //Flag and unflag in DOM
        changeFlagsCountModal();
        renderCell(iIdx, jIdx, COVER)
    }
    if (checkWin()) { // Checks win every click
        gGame.isWin = true;
        gameOver();
    }
}

function showHint() {
    if (gGame.isLost) return
    // remove one hint - onModel
    gGame.hintsAvail--
    updateDomCounter(gGame.hintsAvail, '.hints-count span')
    // On DOM  remove nth child
    var elHint = document.querySelector(`.hint${gGame.hintsAvail + 1}`)
    elHint.classList.add('hidden')

    // Indicating Hint Mode with different color
    var elContainer = document.querySelector('.board-container')
    elContainer.style.background = '#c6a7a3'

    // Enter Hint Mode
    gGame.isHintOn = true; // User can reveal cells for limited time
    setTimeout(disableSafeMode, 1000)

}
function disableSafeMode() {
    gGame.isHintOn = false;
    var elContainer = document.querySelector('.board-container')
    elContainer.style.background = 'antiquewhite'
    gGame.cellClickOnHintMode = false
}

function updateDomCounter(num, selector) {

    var elCount = document.querySelector(selector)
    elCount.innerText = num
}

function gameOver() {
    gGame.isOn = false;

    //  Clear timer interval 
    clearInterval(gTimerInterval);
    gTimerInterval = 0;
    // All mines revealed bomb left clicked 
    if (gGame.isWin) {
        changeSmiley('won')
        updateDomCounter(gGame.secsPassed, '.score')
        // show smiley sun glasses
    } else {
        //T show smiley Sad & Dead – stepped on a mine 
        changeSmiley('lost')
        // on model : 
        gGame.isLost = true;
        // ON DOM -  reveal board
    }
}

function expandShown(board, i, j) {
    // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
    var cell = board[i][j]
    if (cell.isMine) return
    if (cell.value > 0 && cell.isCovered) {
        gGame.shownCount++
        cell.isCovered = false;
        renderCell(i, j, getCellStr(board, i, j))
    }

    var size = gGame.boardLength
    if (cell.value === 0) {
        if (cell.isCovered) {
            gGame.shownCount++
            cell.isCovered = false;
            renderCell(i, j, getCellStr(board, i, j))
            if (j - 1 >= 0) expandShown(board, i, j - 1)
            if (i - 1 >= 0) expandShown(board, i - 1, j)
            if (j + 1 <= size - 1) expandShown(board, i, j + 1)
            if (i + 1 <= size - 1) expandShown(board, i + 1, j)
        }
    }
}


function renderCell(iIdx, jIdx, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${iIdx}-${jIdx}`);
    elCell.innerHTML = value;
}

function getCellStr(mat, i, j) {
    var str = '';
    if (mat[i][j].isMine) str = MINE
    else str = (mat[i][j].value > 0) ? mat[i][j].value : FLOOR
    return str
}

function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = (gGame.shownCount === 0) ? ' ' : getCellStr(mat, i, j)
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td  onmousedown="cellClicked(this, event)" class="${className}">${cell} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function checkWin() {

    var isAllCellsShown = false;
    if (gGame.minesCount === gGame.flagsCounter) {
        isAllCellsShown = ((gGame.shownCount === ((gGame.boardLength ** 2) - gGame.minesCount)))
    }

    // if the number of flags that hit mines equals to the number of flagged cells and equals to number of mines it's a win
    // Game ends when all mines are marked and all the other cells are shown 
    return isAllCellsShown
}


function generateMines(size, minesCount, iIdx, jIdx) {
    // This function will create an array true/false values. Length: size * size 
    // cell containing TRUE will be MINES 
    // The function will skip cell in [iIdx][jIdx] - (The first cell clicked)
    var mines = []
    mines = Array(size * size).fill(false);
    var firstCellClickedPos = iIdx * size + jIdx

    for (let i = 0; i < minesCount; i++) {
        var pos = getRandomIntInclusive(0, mines.length - 1)
        if ((pos === firstCellClickedPos) || (mines[pos] === true)) {
            i-- // If the mine randomely set to "first click" position, go another round
            continue;
        }

        mines[pos] = true // Place Mines in array in random place

    }
    return mines
}

function toggleIntsr(){
    const elInstructionsBox = document.querySelector('.instructions-text');
     elInstructionsBox.classList.toggle('hide');
    
     let btnTxt = (elInstructionsBox.classList.contains('hide')) ? 'Show' : 'Hide';
     const elBtn = document.querySelector('.game-instructions Button');
     elBtn.innerText = btnTxt;
     

}