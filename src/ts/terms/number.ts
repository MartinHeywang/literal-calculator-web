import { stringifyTerm } from "../expression";
import {
    createMultiplierObject,
    incrementFactor,
    Multiplier,
    stringifyMultiplier,
} from "../multiplier";
import { Term } from "./terms";

export type NumberData = {
    value: number;
    multiplier: Multiplier;
};

export function isNumber(term: string | Term) {
    if(!term) return false;

    const toBeChecked = typeof term === "object" ? stringifyTerm(term) : term;

    return /^(-?[0-9]*(\.?[0-9]+)?[a-z]*){1}$/g.test(toBeChecked);
}

/**
 * Checks if the given symbol is a digit
 *
 * @param symbol the symbol to check
 * @returns true if the symbol is a digit, false otherwise
 */
export function isDigit(term: string | Term) {
    if (!term) return false;

    const toBeChecked = typeof term === "object"  ? stringifyTerm(term) : term;

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

export function extractValue(term: string) {
    if (!isNumber(term)) return null;

    let numericPart = "";

    for (let i = 0; i < term.length; i++) {
        const char = term.charAt(i);

        if (isLetter(char)) break;

        numericPart += char;
    }

    // "x" is the same as "1x"
    if (numericPart === "") return 1;
    if (numericPart === "-") return -1;

    return parseFloat(numericPart);
}

export function extractMultiplier(term: string) {
    if (!isNumber(term)) return null;

    const multiplier = createMultiplierObject();
    let multiplierPart = "";

    for (let i = 0; i < term.length; i++) {
        const letter = term.charAt(i);

        if (isLetter(letter)) {
            if (term.charAt(i + 1) === "^") {
                incrementFactor(multiplier, letter, parseFloat(term.charAt(i + 2)));
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

export function stringifyNumber(term: Term<"number">) {
    return `${term.data.value !== 1 ? term.data.value : ""}${stringifyMultiplier(term.data.multiplier)}`
}
