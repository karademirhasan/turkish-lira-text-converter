import { TryToTextConverter, tryToTextConverter } from 'turkish-lira-number-to-text-converter';

const numberResult: string = tryToTextConverter(1234.56);
const stringResult: string = tryToTextConverter('1.234,56');
const legacyResult: string = TryToTextConverter(0);

// @ts-expect-error booleans are not valid amount inputs
tryToTextConverter(true);

void [numberResult, stringResult, legacyResult];
