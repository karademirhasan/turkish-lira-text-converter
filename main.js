import './style.scss';
;


import { TryToTextConverter } from './src/try-to-text-converter';

const tryFormatConverter = (value) => {
	const currency_symbol = "₺"
	const formatter = new Intl.NumberFormat('tr-TR', {
		style: 'currency',
		currency: 'TRY',
		minimumFractionDigits: 2
	})
	return formatter.format(value).replace(currency_symbol, '') + ' ' + currency_symbol
}

const input = document.querySelector('.input');
const button = document.querySelector('.button');
const result = document.querySelector('.result');
const result_format = document.querySelector('.result-format');

button.addEventListener('click', () => {

	const value = input.value
	result.innerHTML = TryToTextConverter(value)
	result_format.innerHTML = tryFormatConverter(value)
})




