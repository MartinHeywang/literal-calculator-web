import { stringifyTerm } from "../expression";
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

export function isNumber(term: string | Term) {
    const toBeChecked = term && typeof term === "object" ? stringifyTerm(term) : term || "";
    if (!toBeChecked || toBeChecked.length === 0) return false;

    return /^(-?[0-9]*(\.?[0-9]+)?[a-z]*){1}$/g.test(toBeChecked);
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
            stringifyTerm(letter),
            getMultiplierValue(letter.data.multiplier, stringifyTerm(letter))
        );
    });

    const number: Term<"number"> = {
        type: "number",

        data: {
            value,
            multiplier,
        },
    };

    return number;
}

export function stringifyNumber(term: Term<"number">) {
    return `${term.data.value !== 1 ? term.data.value : ""}${stringifyMultiplier(term.data.multiplier)}`
}