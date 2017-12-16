// client-side js
// run by the browser each time your view template is loaded

console.log('hi')

// Define allowed values for slots
const slotAlphabet = ['💖', '🐱', '✨', '🌈', '🦄', '🌼', '🐶', '💎', '🌷', '🐣', '🦊', '🐇', '🌺'];
// Boolean for determining if spinning or not
let spinningState = false;
// Variable for holding the setInterval identifier
let spinningInterval = undefined;
// ms between emoji change
const spinDelay = 100;

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * Source: https://stackoverflow.com/a/12646864
 */
const shuffleArray = function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Generator that loops through a shuffled valueArray forever
const valueGenerator = function* valueGenerator(valueArray) {
  const shuffledValueArray = shuffleArray(valueArray.slice(0));
  for (let index = 0; true; index++){
    index = index % shuffledValueArray.length;
    yield shuffledValueArray[index];
  }
}

// Generator that yields an array of slotValues
const slotValuesGenerator = function* slotValuesGenerator(valueArray, length) {
  const generators = Array(length).fill().map(() => {
    return valueGenerator(valueArray);
  });

  while (true){
    yield generators.map(gen => gen.next().value);
  }
}

// Set the textContent of the elements in elemArray to the values in valArray
const displaySlotValues = function displaySlotValues(elemArray, valArray) {
  elemArray.forEach((value, index, array) => {
    array[index].textContent = valArray[index];
  });
};

// Self-calling function to display a certain number of slots a given amount of times
// Source: https://stackoverflow.com/a/3583740
const displaySlicedValues = function displaySlicedValues(iterations, generator, elementArray, islice, delay) {
  displaySlotValues(elementArray.slice(islice), generator.next().value.slice(islice));
  iterations--;
  if (iterations > 0) {
    setTimeout(() => {
        displaySlicedValues(iterations, generator, elementArray, islice, delay)
    }, delay);
  }
}

// Self-calling function to stop the slots one-by-one with delay (like a slot machine!)
// Source: https://stackoverflow.com/a/3583740
const slowdownSpin = function slowdownSpin(slices, iterations, generator, elementArray, delay) {
  let islice = elementArray.length - slices
  displaySlicedValues(iterations, generator, elementArray, islice, delay)
  slices--;
  if (slices > 0){
    setTimeout(() => {
        slowdownSpin(slices, iterations, generator, elementArray, delay)
    }, delay*iterations);
  }
}

// Toggle the spinning of the emoji
const toggleSpinning = function toggleSpinning(generator, elementArray){
  if (spinningState) {
    // If spinning, stop spinning
    clearInterval(spinningInterval);
    // Wind down the slots one-by-one
    slowdownSpin(elementArray.length - 1, 5, generator, elementArray, spinDelay)
    // Officially done!
    spinningState = false;
  } else {
    // If not spinning, start spinning
    // Make the button more responsive by updating the emoji immediately instead of after spinDelay
    displaySlotValues(elementArray, generator.next().value);
    spinningInterval = setInterval(() => displaySlotValues(elementArray, generator.next().value), spinDelay);
    spinningState = true;
  }
};

// Stop the double-tap zoom on mobile
// Source: https://stackoverflow.com/a/28752323
const preventDoubleTapZoom = event => {
  event.preventDefault();
  event.target.click();
};

// Get array of slot elements
const slotElements = Array.from(document.querySelectorAll('#slot-row .slot'));

// Instantiate a generator for the slot values
const slotsGenerator = slotValuesGenerator(slotAlphabet, slotElements.length);

// Make a button to start and stop the spinning
const slotButton = document.getElementById('slot-button');
slotButton.addEventListener('touchend', preventDoubleTapZoom);
slotButton.addEventListener('click', event => {
  // Start or stop the spinning
  toggleSpinning(slotsGenerator, slotElements);
  // Change the button text
  event.target.textContent = `${spinningState ? 'Stop' : 'Start'} Spinning!`;
  // Change the button style
  event.target.classList.toggle('italic');

  // Make a button to copy emoji string if it doesn't exist
  if (!document.getElementById('copy-to-clipboard-btn')){
    const copyButton = document.createElement('button');
    copyButton.id = 'copy-to-clipboard-btn';
    copyButton.textContent = 'Copy to Clipboard 📋';
    copyButton.addEventListener('touchend', preventDoubleTapZoom);
    copyButton.addEventListener('click', event => {
      const emojiString = slotElements.map(elem => elem.textContent).join('');
      const tempInput = document.createElement('input');
      tempInput.value = emojiString;
      document.getElementById('emoji-slot').appendChild(tempInput);
      tempInput.select();
      try {
        const success = document.execCommand('copy');
        console.log(`${success ? `successful: ${emojiString}` : 'unsuccessful'}`);
        event.target.textContent = success ? 'Copied!' : 'Couldn\'t copy 😢';
      } catch (err) {
        console.log(err);
      }
      tempInput.remove();
    });
    document.getElementById('clipboard-button-flex').appendChild(copyButton);
  } else {
    document.getElementById('copy-to-clipboard-btn').textContent = 'Copy to Clipboard 📋';
  }
});




