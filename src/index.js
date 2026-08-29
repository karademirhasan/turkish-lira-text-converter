const units = [
  '',
  'BİR',
  'İKİ',
  'ÜÇ',
  'DÖRT',
  'BEŞ',
  'ALTI',
  'YEDİ',
  'SEKİZ',
  'DOKUZ',
];

const tens = [
  '',
  'ON',
  'YİRMİ',
  'OTUZ',
  'KIRK',
  'ELLİ',
  'ALTMIŞ',
  'YETMİŞ',
  'SEKSEN',
  'DOKSAN',
];

const scales = [
  '',
  'BİN',
  'MİLYON',
  'MİLYAR',
  'TRİLYON',
  'KATRİLYON',
  'KENTİLYON',
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
];

function normalizeAmount(value) {
  const amount = typeof value === 'number' ? String(value) : value;
  let liraDigits;
  let kurusDigits = '';

  if (amount.includes(',')) {
    const [integerPart, decimalPart, extraPart] = amount.split(',');
    if (
      extraPart !== undefined
      || !/^\d{1,2}$/.test(decimalPart)
      || !(
        /^\d+$/.test(integerPart)
        || /^\d{1,3}(?:\.\d{3})+$/.test(integerPart)
      )
    ) {
      throw new TypeError('Invalid amount');
    }

    liraDigits = integerPart.replaceAll('.', '');
    kurusDigits = decimalPart;
  } else if (/^\d+\.\d{1,2}$/.test(amount)) {
    [liraDigits, kurusDigits] = amount.split('.');
  } else if (/^\d+$/.test(amount)) {
    liraDigits = amount;
  } else {
    throw new TypeError('Invalid amount');
  }

  return {
    liraDigits: liraDigits.replace(/^0+(?=\d)/, ''),
    kurus: Number(kurusDigits.padEnd(2, '0')),
  };
}

function threeDigitsToWords(group) {
  const value = Number(group);
  const words = [];
  const hundredsDigit = Math.floor(value / 100);
  const tensDigit = Math.floor((value % 100) / 10);
  const unitsDigit = value % 10;

  if (hundredsDigit > 0) {
    if (hundredsDigit > 1) words.push(units[hundredsDigit]);
    words.push('YÜZ');
  }
  if (tensDigit > 0) words.push(tens[tensDigit]);
  if (unitsDigit > 0) words.push(units[unitsDigit]);

  return words;
}

function integerToWords(digits) {
  const words = [];
  let groupIndex = 0;

  for (let end = digits.length; end > 0; end -= 3) {
    const start = Math.max(0, end - 3);
    const group = Number(digits.slice(start, end));

    if (group !== 0) {
      if (groupIndex === 1 && group === 1) {
        words.unshift(scales[groupIndex]);
      } else {
        const groupWords = threeDigitsToWords(group);
        if (scales[groupIndex]) groupWords.push(scales[groupIndex]);
        words.unshift(...groupWords);
      }
    }
    groupIndex += 1;
  }

  return words.length === 0 ? ['SIFIR'] : words;
}

function tryToTextConverter(value) {
  const { liraDigits, kurus } = normalizeAmount(value);
  const words = [...integerToWords(liraDigits), 'TÜRK', 'LİRASI'];

  if (kurus !== 0) words.push(...threeDigitsToWords(kurus), 'KURUŞ');

  return words.join(' ');
}
const TryToTextConverter = tryToTextConverter;

export { TryToTextConverter, tryToTextConverter };
