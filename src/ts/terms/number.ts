import { createMultiplierObject, incrementFactor, Multiplier, stringifyMultiplier } from "../multiplier";
import { Term, stringifyTerm, createTerm } from "./terms";

export type Number = Term<"number">;

export type NumberData = {
    value: number;
    multiplier: Multiplier;
};

export function isNumber(term: string | Term) {
    if (!term) return false;

    const toBeChecked = typeof term === "object" ? stringifyTerm(term) : term;

    // handmade regex
    return /^(-?[0-9]*(\.?[0-9]+)?([a-z](\^[0-9]+)?)*){1}$/g.test(toBeChecked);
}

/**
 * Checks if the given symbol is a digit
 *
 * @param symbol the symbol to check
 * @returns true if the symbol is a digit, false otherwise
 */
export function isDigit(term: string | Term) {
    if (!term) return false;

    const toBeChecked = typeof term === "object" ? stringifyTerm(term) : term;

    return /^-?[0-9]+\.?[0-9]*$/g.test(toBeChecked);
}

/**
 * Checks if the given symbol is a letter.
 *
 * @param term the symbol to check
 * @returns true if the symbol is a letter, false otherwise
 */
export function isLetter(term: string) {
    if (!term) return false;

    const toBeChecked = typeof term === "object" ? stringifyTerm(term) : term;

    return /^-?[a-z]$/g.test(toBeChecked);
}

/**
 * Extracts the numerical value from the given number (as a string).
 * 
 * @param text the input text
 * @returns the extracted numerical value
 */
export function extractValue(text: string) {
    if (!isNumber(text)) return null;

    let numericPart = "";

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);

        if (isLetter(char)) break;

        numericPart += char;
    }

    // "x" is the same as "1x"
    if (numericPart === "") return 1;
    if (numericPart === "-") return -1;

    return parseFloat(numericPart);
}

/**
 * Extracts and creates the multiplier from the given number (as a string).
 * 
 * @param text the input text
 * @returns the new multiplier
 */
export function extractMultiplier(text: string) {
    if (!isNumber(text)) return null;

    const multiplier = createMultiplierObject();
    let multiplierPart = "";

    for (let i = 0; i < text.length; i++) {
        const letter = text.charAt(i);

        if (isLetter(letter)) {
            if (text.charAt(i + 1) === "^") {
                incrementFactor(multiplier, letter, parseFloat(text.charAt(i + 2)));
                i += 2;
            } else {
                incrementFactor(multiplier, letter);
            }
        }
    }

    for (let i = 0; i < multiplierPart.length; i++) {
        const letter = multiplierPart.charAt(i);

        incrementFactor(multiplier, letter);
    }

    return multiplier;
}

/**
 * Stringifies the given number into a human-readable string.
 * 
 * @param term the term to stringify
 * @returns the human-readable string
 */
export function stringifyNumber(term: Number) {

    let digits = term.data.value.toString();
    if(digits === "1") digits = "";
    if(digits === "-1") digits = "-";

    const multiplier = stringifyMultiplier(term.data.multiplier);
    
    const result = `${digits}${multiplier}`;

    // empty string means one, not zero
    // this empty string means that both the digits part and the multiplier are empty
    // and if the digits part is empty, it means it is equal to one (look for the condition above)
    if(result === "") return "1";

    return result;
}

/**
 * Parses the given numerical value (number) into a new term (Number)
 * 
 * @param value the value to parse
 * @returns the new term
 */
export function parseValueToTerm(value: number) {
    return createTerm<Number>(value.toString());
}

/**
 * Returns the Number with the opposite value.
 * 
 * @param number the input number
 * @returns the opposite term
 */
export function oppositeTerm(number: Number) {
    const copy = JSON.parse(JSON.stringify(number)) as Number;

    copy.data.value *= -1;

    return copy;
}
