const LIST_DIGITS = {
	UNITS: ['SIFIR', 'BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ'],
	TENS: ['', 'ON', 'YİRMİ', 'OTUZ', 'KIRK', 'ELLİ', 'ALTMIŞ', 'YETMİŞ', 'SEKSEN', 'DOKSAN'],
	HUNDREDS: [
		'YÜZ',
		'BİN',
		'MİLYON',
		'MİLYAR',
		'TRİLYON',
		'KATRİLYON',
		'KETRİLYON',
		'SEKSİLYON',
		'SEPTİLYON',
		'OKTİLYON',
		'NONİLYON',
		'DESİLYON',
		'UNDESİLYON',
		'DODESİLYON',
		'TREDESİLYON',
		'KATORDESİLYON',
		'KENDESİLYON',
		'SEKSDESİLYON',
		'SEPTENDESİLYON',
		'OKTODESİLYON',
		'NOVEMDESİLYON',
		'VİGİNTİLYON',
	]
}

const LIST_TEXT = {
	PENNY: 'Kuruş',
	BRACE: ',',
	SYMBOL: 'Türk Lirası '
}




const TryToTextConverter = (value) => {
	var NUMBER_TEXT = '';

	var NUMBER_VALUE = value.toString();
	NUMBER_VALUE = NUMBER_VALUE.replace('.', '')
	const NUMBER_LENGTH = Number(NUMBER_VALUE.length) - 2;

	const VALUE_PENNY = NUMBER_VALUE.slice(-2)
	NUMBER_VALUE = NUMBER_VALUE.slice(0, -2)

	const LAST_STEP_VALUE_LENGTH = NUMBER_LENGTH % 3

	const NUMBER_VALUE_ARRAY = []
	var temporaryValue = '';

	var NUMBER_LENGTH_INDEX = NUMBER_LENGTH;

	while (NUMBER_LENGTH_INDEX--) {
		temporaryValue = temporaryValue + NUMBER_VALUE[NUMBER_LENGTH_INDEX]
		if ((NUMBER_LENGTH - NUMBER_LENGTH_INDEX) % 3 == 0) {
			NUMBER_VALUE_ARRAY.push(temporaryValue.split("").reverse().join(""))
			temporaryValue = ''
		}
	}


	if (LAST_STEP_VALUE_LENGTH == 1) {
		NUMBER_VALUE_ARRAY.push(NUMBER_VALUE[0])
	} else if (LAST_STEP_VALUE_LENGTH == 2) {
		NUMBER_VALUE_ARRAY.push(NUMBER_VALUE[0] + NUMBER_VALUE[1])
	}




	NUMBER_VALUE_ARRAY.forEach((item, index) => {

		if (item.length == 2) {
			item = "0" + item
		}

		if (item.length == 1) {
			item = "00" + item
		}

		var FIRST_STEP = item[0] == 0 ? ' ' : item[0] == 1 ? LIST_DIGITS.HUNDREDS[0] : LIST_DIGITS.UNITS[item[0]] + ' ' + LIST_DIGITS.HUNDREDS[0];
		var SECOND_STEP = item[1] == 0 ? ' ' : LIST_DIGITS.TENS[item[1]];
		var THIRD_STEP = item[2] == 0 ? ' ' : LIST_DIGITS.UNITS[item[2]];

		var STEP_NAME = index >= 1 ? LIST_DIGITS.HUNDREDS[index] : ''

		if (item[0] == 0 && item[1] == 0 && item[2] == 1) {
			THIRD_STEP = ''
		}
		if (item.split('').every((itemValue) => itemValue == 0)) {
			STEP_NAME = ''
		}



		NUMBER_TEXT = `
			${FIRST_STEP} ${SECOND_STEP} ${THIRD_STEP} ${STEP_NAME ? STEP_NAME + LIST_TEXT.BRACE : ''} ${NUMBER_TEXT}
		`;
	})
	return NUMBER_TEXT + LIST_TEXT.SYMBOL + LIST_DIGITS.TENS[VALUE_PENNY[0]] + ' ' + (VALUE_PENNY[1] == 0 ? '' : LIST_DIGITS.UNITS[VALUE_PENNY[1]]) + ' ' + (VALUE_PENNY !== '00' ? LIST_TEXT.PENNY : '')
}



export {
	TryToTextConverter
}