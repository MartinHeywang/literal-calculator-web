import { Multiplier } from "../multiplier";

export type LetterData = {
    multiplier: Multiplier;
}

/**
 * Checks if the given symbol is a letter.
 *
 * @param symbol the symbol to check
 * @returns true if the symbol is a letter, false otherwise
 */
export function isLetter(symbol: string) {
    if (!symbol) return false;

    return /^-?[a-z]$/g.test(symbol);
}
