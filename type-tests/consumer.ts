import { tryToTextConverter } from 'turkish-lira-number-to-text-converter';

const numberResult: string = tryToTextConverter(1234.56);
const stringResult: string = tryToTextConverter('1.234,56');

// @ts-expect-error booleans are not valid amount inputs
tryToTextConverter(true);

void [numberResult, stringResult];
