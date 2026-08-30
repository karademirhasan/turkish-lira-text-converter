import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';

const numberResult: string = convertTurkishLiraToText(1234.56);
const stringResult: string = convertTurkishLiraToText('1.234,56');

// @ts-expect-error booleans are not valid amount inputs
convertTurkishLiraToText(true);

void [numberResult, stringResult];
