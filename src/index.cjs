const UNIT_WORDS = ['', 'BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ'];

const TENS_WORDS = [
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

const SCALE_WORDS = [
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

function normalizeLiraAmount(amount) {
  if (typeof amount !== 'number' && typeof amount !== 'string') {
    throw new TypeError('Amount must be a number or string');
  }

  let normalizedInput;
  let isNegative = false;

  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) {
      throw new TypeError('Amount must be finite');
    }
    if (amount < 0) {
      throw new RangeError('Amount must not be negative');
    }
    if (Number.isInteger(amount) && !Number.isSafeInteger(amount)) {
      throw new RangeError('Amount must be a safe number');
    }

    normalizedInput = String(amount);
    if (/[eE]/.test(normalizedInput) || /^\d+\.\d{3,}$/.test(normalizedInput)) {
      throw new RangeError('Amount must have at most two decimal digits');
    }
  } else {
    normalizedInput = amount.trim();
    if (normalizedInput === '') {
      throw new TypeError('Amount must not be empty');
    }

    if (normalizedInput.startsWith('-')) {
      isNegative = true;
      normalizedInput = normalizedInput.slice(1);
    }
    if (/[+-]/.test(normalizedInput)) {
      throw new TypeError('Invalid amount sign');
    }
  }

  let liraDigits;
  let centsDigits = '';
  const isGroupedInteger =
    typeof amount === 'string' && /^\d{1,3}(?:\.\d{3})+$/.test(normalizedInput);

  if (
    (!isGroupedInteger && /^\d+\.\d{3,}$/.test(normalizedInput)) ||
    /^\d+,\d{3,}$/.test(normalizedInput) ||
    /^\d{1,3}(?:\.\d{3})*,\d{3,}$/.test(normalizedInput)
  ) {
    throw new RangeError('Amount must have at most two decimal digits');
  }

  if (/^\d{1,3}(?:\.\d{3})*,\d{1,2}$/.test(normalizedInput)) {
    [liraDigits, centsDigits] = normalizedInput.split(',');
    liraDigits = liraDigits.replaceAll('.', '');
  } else if (isGroupedInteger) {
    liraDigits = normalizedInput.replaceAll('.', '');
  } else if (/^\d+(?:\.\d{1,2})?$/.test(normalizedInput) && normalizedInput.includes('.')) {
    [liraDigits, centsDigits] = normalizedInput.split('.');
  } else if (/^\d+(?:,\d{1,2})?$/.test(normalizedInput) && normalizedInput.includes(',')) {
    [liraDigits, centsDigits] = normalizedInput.split(',');
  } else if (/^\d+$/.test(normalizedInput)) {
    liraDigits = normalizedInput;
  } else {
    throw new TypeError('Invalid amount');
  }

  if (isNegative) {
    throw new RangeError('Amount must not be negative');
  }

  const normalizedLiraDigits = liraDigits.replace(/^0+(?=\d)/, '');
  if (Math.ceil(normalizedLiraDigits.length / 3) > SCALE_WORDS.length) {
    throw new RangeError('Amount exceeds the supported scale');
  }

  return {
    liraDigits: normalizedLiraDigits,
    cents: Number(centsDigits.padEnd(2, '0')),
  };
}

function threeDigitGroupToWords(groupValue) {
  const numericGroup = Number(groupValue);
  const resultWords = [];
  const hundredsDigit = Math.floor(numericGroup / 100);
  const tensDigit = Math.floor((numericGroup % 100) / 10);
  const unitsDigit = numericGroup % 10;

  if (hundredsDigit > 0) {
    if (hundredsDigit > 1) resultWords.push(UNIT_WORDS[hundredsDigit]);
    resultWords.push('YÜZ');
  }
  if (tensDigit > 0) resultWords.push(TENS_WORDS[tensDigit]);
  if (unitsDigit > 0) resultWords.push(UNIT_WORDS[unitsDigit]);

  return resultWords;
}

function liraIntegerToWords(digits) {
  const resultWords = [];
  let scaleIndex = 0;

  for (let groupEnd = digits.length; groupEnd > 0; groupEnd -= 3) {
    const groupStart = Math.max(0, groupEnd - 3);
    const groupValue = Number(digits.slice(groupStart, groupEnd));

    if (groupValue !== 0) {
      if (scaleIndex === 1 && groupValue === 1) {
        resultWords.unshift(SCALE_WORDS[scaleIndex]);
      } else {
        const groupWords = threeDigitGroupToWords(groupValue);
        if (SCALE_WORDS[scaleIndex]) groupWords.push(SCALE_WORDS[scaleIndex]);
        resultWords.unshift(...groupWords);
      }
    }
    scaleIndex += 1;
  }

  return resultWords.length === 0 ? ['SIFIR'] : resultWords;
}

function tryToTextConverter(amount) {
  const { liraDigits, cents } = normalizeLiraAmount(amount);
  const resultWords = [...liraIntegerToWords(liraDigits), 'TÜRK', 'LİRASI'];

  if (cents !== 0) resultWords.push(...threeDigitGroupToWords(cents), 'KURUŞ');

  return resultWords.join(' ');
}
const TryToTextConverter = tryToTextConverter;

module.exports = { TryToTextConverter, tryToTextConverter };
