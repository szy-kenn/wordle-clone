import Wordle from './wordle.js';

// main containers for wordle and keys
const mainContainer = document.getElementById("mainContainer")
const keyContainer = document.getElementById("keyContainer")

// variable value initialization
let wordle = "GLASS"                    // word of the day
let tempWordle = wordle.split("");      // for checking since strings are immutable
let wordLength = 5;
let tries = 6;

// game initialization
const game = new Wordle(wordle, wordLength, tries, mainContainer, keyContainer)
game.initialize()

document.addEventListener("keydown", event => {
    if(!game.isBusy){
        game.respond(event);
    } 
});
