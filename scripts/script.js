'use strict'

const startingView = document.querySelector('.starting-view')
const boardgameView = document.querySelector('.boardgame-view')
const congratsView = document.querySelector('.congrats-view')
const creditsView = document.querySelector('.credits-view')
const body = document.body
const clickToStart = document.querySelector('.heading-secondary-startingView')
const grid = document.getElementById('grid')
const reStart = document.querySelector('.start-btn')
const cards = document.querySelectorAll('.card')
const slide = document.querySelector('.slide')
const cardFrontImg = '.card-front img'
const cardsBack = document.querySelectorAll('.card-back')
const lives = document.querySelectorAll('.eye-of-sauron')
const gameOverView = document.getElementById('gameOver-view')
const matchScore = document.querySelector('.match-score')
const guessScore = document.querySelector('.guess-score')
const startBtn = document.querySelector('.start-btn')
const playAgainBtns = document.querySelectorAll('.playAgain-btn')
const quitBtns = document.querySelectorAll('.quit-btn')
const backToStartBtns = document.querySelectorAll('.back-to-start')

const audioLostPage = new Audio(`./assets/media/music/lost-page.mp3`)
const audioWinPage = new Audio(`./assets/media/music/win-page.mp3`)
const audioCreditsPage = new Audio(`./assets/media/music/credits-page.mp3`)

const mediaQueryListener = window.matchMedia('(min-width: 29em)')

//Game state variables
let lockCards = false
let flippedCards = []
let matches = 0
let guesses = 0
let livesLeft = lives.length
let currentAudio = null

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
function playAudio(audio, stop = false) {
  currentAudio = audio
  audio.volume = 0.1
  // if currrentAudio is NOT null and NOT paused, stop the audio.
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
  //if stop=true, stop current audio thats playing
  if (!stop) {
    audio.play()
  }
}

body.addEventListener('keydown', start)
clickToStart.addEventListener('click', start)

function hideStartingView() {
  startingView.classList.add('hidden')
  startingView.classList.remove('display-flex')
  boardgameView.classList.remove('hidden')
}

function start(event) {
  if (event.key == 'Enter') {
    hideStartingView()
  }
  hideStartingView()
}

//Shuffle cards by changing grid template area
function shuffleCards() {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
  //https://medium.com/@khaledhassan45/how-to-shuffle-an-array-in-javascript-6ca30d53f772
  function shuffle(array) {
    //loops through the array's length minus 1 to count down starting from 0.
    //Math.random() rounds it down to a whole number
    for (let i = array.length - 1; i > 0; i--) {
      // var j picks a random index between 0 and the current value of i
      const j = Math.floor(Math.random() * (i + 1))
      //This line will swap whatever element is at our currently randomized index of j, with the index at the value of i.
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const shuffled = shuffle(letters)
  //https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList
  if (mediaQueryListener.matches) {
    grid.style.gridTemplateAreas = `"${shuffled[0]} ${shuffled[1]} ${shuffled[2]} ${shuffled[3]} " "${shuffled[4]} ${shuffled[5]} ${shuffled[6]} ${shuffled[7]}" " ${shuffled[8]} ${shuffled[9]} ${shuffled[10]} ${shuffled[11]}"`
  } else {
    grid.style.gridTemplateAreas = `"${shuffled[0]} ${shuffled[1]} ${shuffled[2]}" "${shuffled[3]} ${shuffled[4]} ${shuffled[5]}" "${shuffled[6]} ${shuffled[7]} ${shuffled[8]}" "${shuffled[9]} ${shuffled[10]} ${shuffled[11]}"`
  }
}
//Call Shuffle Cards on Page load
shuffleCards(mediaQueryListener)

// Add event listeners to call shuffleCards on media query changes and page load
mediaQueryListener.addEventListener('change', function () {
  console.log(mediaQueryListener)
  shuffleCards(mediaQueryListener)
})

window.addEventListener('load', function () {
  console.log(mediaQueryListener)

  shuffleCards(mediaQueryListener)
})

function clickCards() {
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      //exit click function if lockCards is true or if there is a match
      if (lockCards || this.classList.contains('matched')) {
        return
      }
      //check if there is a card already flipped and
      //if the card just clicked is the same, if both true return.
      if (flippedCards.length === 1 && flippedCards[0] === this) {
        return
      }
      const cardBack = this.querySelector('.card-back')
      cardBack.classList.add('flip')
      flippedCards.push(this)
      //Lock cards if the length of flipped cards is equal to 2
      if (flippedCards.length === 2) {
        lockCards = true
        checkMatch()
      }
    })
  })
}
clickCards()

function checkMatch() {
  const firstCard = flippedCards[0]
  const firstCardAlt = firstCard.querySelector(cardFrontImg).getAttribute('alt')
  const secondCard = flippedCards[1]
  const secondCardAlt = secondCard
    .querySelector(cardFrontImg)
    .getAttribute('alt')

  if (firstCardAlt === secondCardAlt) {
    firstCard.classList.add('matched')
    secondCard.classList.add('matched')
    unflipCards(true) //matched cards should be kept flipped and not unflip
    matches += 1
    matchScore.textContent = matches
    const audioMatch = new Audio(
      `assets/media/sfx/${firstCardAlt.toLowerCase()}.mp3`
    )
    playAudio(audioMatch)
    if (matches === 6) {
      setTimeout(function () {
        boardgameView.classList.add('hidden')
        congratsView.style.display = 'flex'
      }, 2000)
      playAudio(audioWinPage)
    }
  } else {
    unflipCards()
    guesses += 1
    guessScore.textContent = guesses
    removeLife()
  }
}

function unflipCards(matched = false) {
  //if true, reset the array, set lockCard to false allowing interaction with cards again
  if (matched) {
    flippedCards = []
    lockCards = false
    return
  }
  setTimeout(function () {
    flippedCards.forEach((card) => {
      card.querySelector('.card-back').classList.remove('flip')
      flippedCards = []
      lockCards = false
    })
  }, 500)
}

function removeLife() {
  if (livesLeft > 0) {
    lives[livesLeft - 1].style.display = 'none'
    livesLeft--
  }

  if (livesLeft === 0) {
    setTimeout(function () {
      boardgameView.classList.add('hidden')
      gameOverView.style.display = 'flex'
    }, 700)
    playAudio(audioLostPage)
  }
}

playAgainBtns.forEach(function (playAgainBtn) {
  playAgainBtn.addEventListener('click', function () {
    resetGame()
    gameOverView.style.display = 'none'
    congratsView.style.display = 'none'
    creditsView.style.display = 'none'
    boardgameView.classList.remove('hidden')
    playAudio(audioCreditsPage, true)
  })
})

startBtn.addEventListener('click', function () {
  resetGame()
})

backToStartBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    boardgameView.classList.add('hidden')
    startingView.classList.remove('hidden')
    startingView.classList.add('display-flex')
    congratsView.style.display = 'none'
    gameOverView.style.display = 'none'
    resetGame()
  })
})

quitBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    console.log('ckick')
    congratsView.style.display = 'none'
    gameOverView.style.display = 'none'
    creditsView.style.display = 'flex'
    boardgameView.classList.add('hidden')
    playAudio(audioLostPage, true)
    playAudio(audioWinPage, true)
    playAudio(audioCreditsPage)
  })
})

function resetGame() {
  playAudio(audioLostPage, true)
  playAudio(audioWinPage, true)
  lives.forEach((life) => {
    life.style.display = 'block'
  })
  cards.forEach((card) => {
    card.classList.remove('matched')
    card.querySelector('.card-back').classList.remove('flip')
  })
  lockCards = false
  flippedCards = []
  matches = 0
  guesses = 0
  matchScore.textContent = '0'
  guessScore.textContent = '0'
  livesLeft = lives.length
  setTimeout(shuffleCards, 700)
  clickCards()
}

function add(num1, num2) {
  return num1 + num2
}
console.log('add', add(2, 3))

//Write a function that takes any number of arguments of type number
// and returns the sum of all arguments

function sum(...args) {
  //using the spread operator to spread the number out of the array
  let sum = 0 //it will hold the sum as I iterate through each number
  for (let i = 0; i < args.length; i++) {
    sum += args[i] //sum = sum + args[i]
  }
  return sum
}
console.log('sum', sum(2, 3, 4, 5))

//Write a function that takes two strings, A and B,
//and returns whether B is in A in a case insensitive way.

function stringIncludes(string1, string2) {
  const lowerCaseStr1 = string1.toLowerCase()
  const lowerCaseStr2 = string2.toLowerCase()
  if (lowerCaseStr1.includes(string2)) {
    return 'It contains same word'
  }
  return 'not same word'
}

console.log(
  'stringIncludes',
  stringIncludes('I drove to New York in a van with my friend', 'new')
)

//Write a functuon that takes an array of objects,
//adn returns an array of the objects "name" property, only if that property exists

// chatGPT

function getNames(arr) {
  // Create an empty array to store the names
  const names = []

  // Loop through the objects in the array
  for (let obj of arr) {
    // Check if the object has a "name" property
    if (obj.hasOwnProperty('name')) {
      // If the "name" property exists, push it to the names array
      names.push(obj.name)
    }
  }

  // Return the names array
  return names
}

//With a regular for loop
function getNames2(arr) {
  // Create an empty array to store the names
  const names = []

  // Loop through the objects in the array using a regular for loop
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i]
    // Check if the object has a "name" property
    if (obj.hasOwnProperty('name')) {
      // If the "name" property exists, push it to the names array
      names.push(obj.name)
    }
  }

  // Return the names array
  return names
}

//With a forEach loop
function getNames3(arr) {
  const names = []

  arr.forEach(function (obj) {
    if (obj.hasOwnProperty('name')) {
      names.push(obj.name)
    }
  })

  return names
}

function getNames1(arr) {
  return arr
    .map((obj) => {
      if (obj.hasOwnProperty('name')) {
        return obj.name
      }
    })
    .filter((name) => name !== undefined)
}

console.log(
  'GetNames',
  getNames([
    { a: 1 },
    { name: 'Jane' },
    {},
    { name: 'mark' },
    { name: 'Sophia' },
    { b: 2 },
  ])
) //Expects ["jane, "mark, 'sophia]

//Write a function that takes an array of numbers
//and returns the index of the largest number

function getLargestNumberNumberIndex(numbers) {
  let numberSortedArr = []
  for (i = 0; i < numbers.length; i++) {
    if (numbers[0] < numbers[1]) {
    }
  }
}

console.log(
  'GetLargestNumber INdex',
  getLargestNumberNumberIndex([7, 1, 4, 12, 9])
) //expects 3

//Write a function that returns a promise that resolves after n number of milliseconds

function delay(n) {}

;async () => {
  console.time('testing delay')
  await delay(1000)
  console.timeEnd('testing delay')
}
