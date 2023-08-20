export default class Wordle {

    // storing current column and row where the game will input the letter
    #currentColVal = 0;
    #currentRowVal = 0;
    #isFetching = false;
    #isAnimating = false;
    #isOver = false;
    #grid = {}

    get #currentRow() {
        return this.mainGrid.children[this.#currentRowVal];
    }

    get #currentSquare() {
        // returns the current square where the rows and cols are pointing to
        return this.#currentRow.children[this.#currentColVal];
    }

    get #word() {
        
        // getting the word inputted by the player in the current row

        let word = ""

        for (const value of Object.values(this.#currentRow)) {
            word += value.textContent;
        }
        return word
    }

    get isBusy() {
        return this.#isFetching || this.#isAnimating
    }

    #createSquare() {
        /*
            Private class method for creating squares for letters in the game
        */
        let letterbox = document.createElement('div');
        letterbox.className = "letter-box";   
        return letterbox;
    }

    async #checkWord() {
        /* fetches response from a free dictionary API
            if it receives [Status 200], the given word is a valid word,
            else if [Error 404], the given word is not found, and therefore invalid.
        */
        try {
            this.#isFetching = true;
            const response = await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/${this.#word.toLowerCase()}`);
            // const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.#word}`);
            if (!response.ok) {
                throw new Error('Word not found');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        } finally {
            this.#isFetching = false;
        }
    }

    #compareWord() {
        /*
            compare the validated word with the word to guess
    
            creates temporary array of characters from the word to guess so 
            it and take out guessed letters to avoid repetitive results.
            this avoids getting the same results in multiple same letters even if
            the word to guess only has lesser number of that certain letter
        */
        this.#isAnimating = true;
        let tempWord = this.wordToGuess.split("");
        let correctLetters = 0;

        for (let i = 0; i < this.length; i++) {
            
            let square = this.#currentRow.children[i];
            let result = ""

            setTimeout(() => {
                if (square.textContent === tempWord[i]) {  
                    result = 'correct';
                    square.classList.remove('pop-animation')
                    tempWord[i] = null;
                    correctLetters++;
                }  else if (tempWord.includes(square.textContent)) {
                    square.classList.remove('pop-animation')
                    result = 'misplaced';
                    tempWord[tempWord.indexOf(square.textContent)] = null;
                } else {
                    square.classList.remove('pop-animation')
                    result = 'wrong';
                }        

                square.classList.add(`letter-box-${result}`)
                this.updateKeyPad(square.textContent, result);

            }, ((i + 1) * 500) / 2);

            square.classList.add('animated');
            square.style.animationDelay = `${(i * 500) / 2}ms`;
        }

        setTimeout(() => {
            this.#isAnimating = false;
            //  check if the word is correct after animation
            if (correctLetters === this.length) {
                this.#isOver = true;
                this.showGameOver(1);
            }

            // update row col values
            if (this.#currentRowVal < this.tries - 1) {
                this.#currentColVal = 0;
                this.#currentRowVal++;
            } else {
                this.#isOver = true;
                this.showGameOver(2);
            }

        }, (this.length * 500) / 2 + 500);
    }

    static isLetter(string) {
        let letterRegex = /^[a-zA-Z]$/;
        return letterRegex.test(string) && string.length == 1;
    }

    constructor(wordToGuess, length, tries, mainGrid, keyContainer) {
        if (wordToGuess === undefined || length === undefined || tries === undefined ||
            mainGrid === undefined || keyContainer === undefined) {
                throw new Error('All parameters are required');
            }
        this.wordToGuess = wordToGuess;
        this.length = length;
        this.tries = tries;
        this.mainGrid = mainGrid;               // where the boxes will be inserted
        this.keyContainer = keyContainer;       // where the letter keys will be inserted
    }

    initialize() {
        // initialize the game, renders all the necessary elements before the game starts
        for (let row = 0; row < this.tries; row++) {

            let horizontalContainer = document.createElement('div');
            horizontalContainer.classList.add('horizontal-container');
            this.#grid[row] = horizontalContainer;

            for (let col = 0; col < this.length; col++) {

                let newSquare = this.#createSquare();
                this.#grid[row][col] = newSquare
                horizontalContainer.appendChild(newSquare);
            }

            mainContainer.appendChild(horizontalContainer);
        }

        this.createKeyPad();
    }

    respond(event) {
        // event responder
        if (!this.#isOver) {
            // if the game is not over yet (no tries left or won)
            if(Wordle.isLetter(event.key) && this.#word.length < 5) {
                this.#currentSquare.textContent = event.key.toUpperCase();
                console.log(this.#currentSquare.classList)
                this.#currentSquare.classList.add('pop-animation')
                if (this.#currentColVal < this.length - 1) {
                    this.#currentColVal++;
                }
            } else if(event.key === 'Backspace' && this.#word.length > 0) {
                if (this.#word.length < 5) {
                    this.#currentColVal--;
                }
                this.#currentSquare.classList.remove('pop-animation')
                this.#currentSquare.textContent = '';
    
            } else if(event.key === 'Enter' && this.#word.length == this.length) {
                        this.#checkWord()
                            .then(data => {
                                this.#compareWord();
                            })
                            .catch(error =>  {
                                this.#currentRow.classList.add('shake-animation');
                                setTimeout(() => {
                                    this.#currentRow.classList.remove('shake-animation');
                                }, 300);
                                console.error(error);
                            })
            }
        }

    }

    createKeyPad() {
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
                key.textContent = letter;
                keyRow.appendChild(key);
                tempCounter++;
                key.addEventListener('click', () => {
                    
                    key.classList.add('clicked')
                    setTimeout(() => {
                        key.classList.remove('clicked')
                    }, 100);

                    let keyCode = key.textContent
                    if (key.textContent === 'ENTER') {
                        keyCode = 'Enter';
                    } else if (key.textContent === '⌫') {
                        keyCode = 'Backspace';
                    }
                    const keyEvent = new KeyboardEvent('keydown', {key : `${keyCode}`})
                    document.dispatchEvent(keyEvent)
                });
            }
            this.keyContainer.appendChild(keyRow)
        }
    }

    updateKeyPad(letter, state) {
        let key = document.querySelector(`.${letter}`)
        key.classList.add(`letter-box-${state}`)
    }

    showGameOver(type) {
        // type 1 = won; type 2 = lose
        if (type === 1) {
            console.log("you won");
        }

        else if (type === 2) {
            console.log("you lose");
        }

        // game over screen
        const closeBtn = document.querySelector(".game-over-close-btn");
        const gameOverScreen = document.getElementById("gameOverScreen");

        gameOverScreen.style.display = 'flex';
        gameOverScreen.classList.add('screen-flip');

        closeBtn.addEventListener("click", () => {
            gameOverScreen.style.display = 'none';
        })

        // guess values
        const guessValues = document.querySelectorAll(".guess-value");

        for (let i = 0; i < guessValues.length; i++) {
            if (i === this.#currentRowVal) {
                guessValues[i].style.width = '100%';
                guessValues[i].style.backgroundColor = 'var(--box-correct)';
                const p = guessValues[i].firstElementChild;
                p.textContent = '1';
            } else {
                guessValues[i].style.width = 'fit-content';
            }
        }
    }
}
