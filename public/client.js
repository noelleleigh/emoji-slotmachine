// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

// Define allowed values for slots
const slotAlphabet = ['💖', '🐱', '✨', '🌈', '🦄', '🌼', '🐶', '💎'];
// Boolean for determining if spinning or not
let spinningState = false;
// Variable for holding the setInterval identifier
let spinningInterval = undefined;
// ms between emoji change
const spinDelay = 100;

// Random number generator (https://stackoverflow.com/a/7228322)
const randomIntFromInterval = function randomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * Source: https://stackoverflow.com/a/12646864
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Generator that loops through a shuffled valueArray forever
function* valueGenerator(valueArray) {
  const shuffledValueArray = shuffleArray(valueArray.slice(0))
  for (let index = 0; true; index++){
    index = index % shuffledValueArray.length;
    yield shuffledValueArray[index];
  }
}

// Generator that yields an array of slotValues
function* slotValuesGenerator(valueArray, length) {
  const generators = Array(length).fill().map(() => {
    return valueGenerator(valueArray)
  });

  while (true){
    yield generators.map(gen => gen.next().value);
  }
}


// Set the textContent of the elements in elemArray to the values in valArray
const displaySlotValues = (elemArray, valArray) => {
  elemArray.forEach((value, index, array) => {
    array[index].textContent = valArray[index]
  });
}

// Toggle the spinning of the emoji
const toggleSpinning = function toggleSpinning(generator, elementArray){
  if (spinningState) {
    // If spinning, stop spinning
    clearInterval(spinningInterval);
    spinningState = false;
  } else {
    // If not spinning, start spinning
    spinningInterval = setInterval(() => displaySlotValues(elementArray, generator.next().value), spinDelay);
    spinningState = true;
  }
}

// Get array of slot elements
const slotElements = Array.prototype.slice.call(
  document.querySelectorAll('#slot-row .slot')
);

// Instantiate a generator for the slot values
const slotsGenerator = slotValuesGenerator(slotAlphabet, slotElements.length);

// Make a button to start and stop the spinning
const slotButton = document.getElementById('slot-button');
slotButton.addEventListener('click', event => {
  // Start or stop the spinning
  toggleSpinning(slotsGenerator, slotElements);
  // Change the button text
  event.target.textContent = `${spinningState ? 'Stop' : 'Start'} Spinning!`;
  // Change the button style
  event.target.classList.toggle('italic');
});