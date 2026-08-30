import { tryToTextConverter } from '../src/index.js';

const form = document.querySelector('#converter-form');
const input = document.querySelector('#amount');
const result = document.querySelector('#result');
const error = document.querySelector('#error');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  result.textContent = '';
  error.textContent = '';

  try {
    result.textContent = tryToTextConverter(input.value);
  } catch (caughtError) {
    error.textContent = caughtError instanceof Error ? caughtError.message : String(caughtError);
  }
});
