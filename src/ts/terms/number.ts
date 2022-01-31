import {
    createMultiplierObject,
    getMultiplierValue,
    incrementFactor,
    Multiplier,
    stringifyMultiplier,
} from "../multiplier";
import { isLetter } from "./letter";
import { Term } from "./terms";

export type NumberData = {
    value: number;
    multiplier: Multiplier;
};

export function isNumber(term: string) {
    if (!term || term.length === 0) return false;

    return /^(-?[0-9]*(\.?[0-9]+)?[a-z]*){1}$/g.test(term);
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

/**
 * Merges the array of digits and the array of letters into a single number.
 *
 * The digits are multiplied together, and the letters are creating the multiplier.
 *
 * @param digits an array of digits
 * @param letters an array of letters
 */
export function merge(digits: Term<"digit">[], letters: Term<"letter">[]) {
    const value = digits.reduce((previous, digit) => {
        return previous * digit.data.value;
    }, 1);

    const multiplier = createMultiplierObject();
    letters.forEach(letter => {
        incrementFactor(
            multiplier,
            letter.text,
            getMultiplierValue(letter.data.multiplier, letter.text)
        );
    });

    const number: Term<"number"> = {
        text: `${value.toString()}${stringifyMultiplier(multiplier)}`,
        type: "number",

        data: {
            value,
            multiplier,
        },
    };

    return number;
}
