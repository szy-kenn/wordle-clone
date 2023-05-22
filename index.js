const mainContainer = document.getElementById("mainContainer")
const keyContainer = document.getElementById("keyContainer")
let wordle = "GLASS"
let tempWordle = wordle.split("");

function generateLetterBox() {
    let letterbox = document.createElement('div');
    letterbox.className = "letter-box";   
    return letterbox;
}

function generateLine(wordLength) {

    let horizontalContainer = document.createElement('div');

    horizontalContainer.style.display = 'flex';

    for (let i = 0; i < wordLength; i++) {
        horizontalContainer.appendChild(generateLetterBox());
    }

    return horizontalContainer;
}

function initialize(wordLength, tries) {

    for (let i = 0; i < tries; i++) {
        mainContainer.appendChild(generateLine(wordLength));
    }

}

let wordLength = 5;
let tries = 6;

initialize(wordLength, tries);

let currentRow = 0;
let currentCol = 0;
let currentBox = mainContainer.children[currentRow].children[currentCol];


function updateCurrentBox() {
    currentBox = mainContainer.children[currentRow].children[currentCol];
}

async function validateWord(word) {

    console.log(word)

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
            throw new Error('Word not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

function checkWord() {

    tempWordle = wordle.split("");
    currentCol = -1;

    for (let i = 0; i < wordLength; i++) {
        currentCol++;
        updateCurrentBox();
        console.log("In checkWord():" + currentCol, currentRow)
        let currentLetter = currentBox.children[0].textContent;
        colorBlock(currentBox, currentLetter, i);

        currentBox.classList.add('animated');
        currentBox.style.animationDelay = `${(i * 500) / 2}ms`;
    }

    if (currentRow < tries - 1) {
        currentCol = 0;
        currentRow++;
        updateCurrentBox();
    }
}

let animating = false

function getWord() {
    let word = ""
    for (let i = 0; i < wordLength; i++) {
        word += mainContainer.children[currentRow].children[i].textContent
    }
    
    validateWord(word)
        .then(data => {
            console.log('success');
            checkWord();
        })
        .catch(error => {
            wordNotFound();
            console.error(error)
        });
}

function wordNotFound() {
    if (!animating) {
        animating = true;
        mainContainer.children[currentRow].classList.add('shake-animation');
        setTimeout(() => {
            mainContainer.children[currentRow].classList.remove('shake-animation');
            animating = false;
        }, 300);
    } 
}

function colorBlock(box, letter, i) {
    let result = ""
    setTimeout(() => {
        if (letter === tempWordle[i]) {  
            result = 'correct';
            tempWordle[i] = '0';
        }  else if (tempWordle.includes(letter)) {
            result = 'misplaced';
            tempWordle[tempWordle.indexOf(letter)] = '0';
        } else {
            result = 'wrong';
        }        
        box.classList.add(`letter-box-${result}`)
        updateKeyPad(letter, result)
        console.log(tempWordle)
    }, ((i + 1) * 500) / 2);
}

document.addEventListener("keydown", (event) => {

    if (isLetter(event.key) && currentCol != wordLength) {    
        let letter = document.createElement('h3');
        letter.className = 'letter';
        letter.textContent = event.key.toUpperCase();    
        currentBox.appendChild(letter);
        currentCol++;
        console.log(currentBox.children[0].textContent);
        updateCurrentBox();
    }
    
    else if (event.key == 'Backspace' && currentCol > 0) {
        currentCol--;
        updateCurrentBox();
        currentBox.removeChild(currentBox.firstChild);
    } else if (event.key == 'Enter' && currentCol == wordLength) {
        getWord();
    }
});

function keypadEvent(event) {

    if (isLetter(event) && currentCol != wordLength && currentRow != tries) {    
        let letter = document.createElement('h3');
        letter.className = 'letter';
        letter.textContent = event.toUpperCase();    
        currentBox.appendChild(letter);
        currentCol++;
        console.log(currentBox.children[0].textContent);
        updateCurrentBox();
    }
    
    else if ((event == 'Backspace' || event == '⌫') && currentCol != 0) {
        currentCol--;
        updateCurrentBox();
        currentBox.removeChild(currentBox.firstChild);
    } else if ((event == 'Enter' || event == '↵' || event == 'ENTER') && currentCol == wordLength) {
        getWord();
    }
}

function isLetter(string) {
    let letterRegex = /^[a-zA-Z]$/;
    return letterRegex.test(string) && string.length == 1;
}

function generateKeyPad() {
    const keypad = [['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']]
    
    let tempCounter = 0;

    for (let row of keypad) {
        let keyRow = document.createElement('div');
        for (let letter of row) {
            let key = document.createElement('div');
            key.classList.add(letter)
            key.classList.add('key')
            // console.log(key.classList)
            key.textContent = letter;
            keyRow.appendChild(key);
            tempCounter++;
            key.addEventListener('click', () => keypadEvent(key.textContent));
        }
        keyContainer.appendChild(keyRow)
    }
}

function updateKeyPad(letter, state) {
    let key = document.querySelector(`.${letter}`)
    console.log(key)
    key.classList.add(`letter-box-${state}`)
}

generateKeyPad()


// let dataset = {}

// fetch('words_dictionary.json')
//     .then(response => response.json())
//     .then(data => {
//         const filteredData = Object.keys(data).filter(key => key.length == 5);
//         dataset.data = filteredData;
//     })
//     .catch(error => console.error(error));

// setTimeout(() => {
//     console.log(dataset);
//     wordle = dataset.data[1000];
//     console.log(wordle)
// }, 500);


