const letters = document.querySelectorAll('.scoreboard-letter');
const loadingIcon = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init () {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch('https://words.dev-apis.com/word-of-the-day');
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split('');
    const done = false;
    setLoading(false);
    isLoading = false;


    console.log(wordParts);

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            // adds letter to the end
            currentGuess += letter;
        } else {
            // replaces last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;

        //console.log(currentGuess);
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return;
        }

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: 'POST',
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        /* 
        the line above can be written as 
        const { validWord } = resObj;  
        */

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        // state markups
        const guessParts = currentGuess.split('');
        const map = makeMap(wordParts);
        console.log(map);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //correct markup
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                // already done
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                // mark as close
                letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
            }
        }

        currentRow++;

        // user wins
        if (currentGuess === word) {
            alert('You Win!');
            document.querySelector('.brand').classList.add('winner');
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`You Lose! the word was ${word}`);
            done = true;
        }

        currentGuess = '';
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
    }

    function markInvalidWord() {
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');

            setTimeout(function () {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid'); 
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress(event) {
        if (done || isLoading) {
            // do nothing
            return;
        }

        const action = event.key;

        //console.log(action);

        if (action === "Enter") {
            commit();
          } else if (action === "Backspace") {
            backspace();
          } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
          } else {
            // do nothing
          }
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingIcon.classList.toggle('hidden', !isLoading);
}

function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }

    return obj;
}

init();