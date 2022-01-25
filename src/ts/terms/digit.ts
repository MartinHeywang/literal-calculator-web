// digit, not to be confused with number
// a digit is only numerical, where a number is a term of literal expression

export type DigitData = {
    value: number;
};

/**
 * Checks if the given symbol is a digit
 *
 * @param symbol the symbol to check
 * @returns true if the symbol is a digit, false otherwise
 */
export function isDigit(symbol: string) {
    if (!symbol) return false;

    return /^-?[0-9]+\.?[0-9]*$/g.test(symbol);
}
