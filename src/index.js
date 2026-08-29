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
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new TypeError('Amount must be a number or string');
  }

  let amount;
  let isNegative = false;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('Amount must be finite');
    }
    if (value < 0) {
      throw new RangeError('Amount must not be negative');
    }
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new RangeError('Amount must be a safe number');
    }

    amount = String(value);
    if (/[eE]/.test(amount) || /^\d+\.\d{3,}$/.test(amount)) {
      throw new RangeError('Amount must have at most two decimal digits');
    }
  } else {
    amount = value.trim();
    if (amount === '') {
      throw new TypeError('Amount must not be empty');
    }

    if (amount.startsWith('-')) {
      isNegative = true;
      amount = amount.slice(1);
    }
    if (/[+-]/.test(amount)) {
      throw new TypeError('Invalid amount sign');
    }
  }

  let liraDigits;
  let kurusDigits = '';

  if (
    /^\d+\.\d{3,}$/.test(amount)
    || /^\d+,\d{3,}$/.test(amount)
    || /^\d{1,3}(?:\.\d{3})*,\d{3,}$/.test(amount)
  ) {
    throw new RangeError('Amount must have at most two decimal digits');
  }

  if (/^\d{1,3}(?:\.\d{3})*,\d{1,2}$/.test(amount)) {
    [liraDigits, kurusDigits] = amount.split(',');
    liraDigits = liraDigits.replaceAll('.', '');
  } else if (/^\d+(?:\.\d{1,2})?$/.test(amount) && amount.includes('.')) {
    [liraDigits, kurusDigits] = amount.split('.');
  } else if (/^\d+(?:,\d{1,2})?$/.test(amount) && amount.includes(',')) {
    [liraDigits, kurusDigits] = amount.split(',');
  } else if (/^\d+$/.test(amount)) {
    liraDigits = amount;
  } else {
    throw new TypeError('Invalid amount');
  }

  if (isNegative) {
    throw new RangeError('Amount must not be negative');
  }

  const normalizedLiraDigits = liraDigits.replace(/^0+(?=\d)/, '');
  if (Math.ceil(normalizedLiraDigits.length / 3) > scales.length) {
    throw new RangeError('Amount exceeds the supported scale');
  }

  return {
    liraDigits: normalizedLiraDigits,
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
