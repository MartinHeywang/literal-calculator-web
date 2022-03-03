import { Expression, stringifyExpression } from "../expression";
import { isNumber, Number } from "./number";
import { createTerm, stringifyTerm, Term } from "./terms";

export type FractionData = {
    numerator: Expression;
    denominator: Expression;
};

export type Fraction = Term<"fraction">;

/**
 * Creates a fraction using the given numerator and denominator.
 *
 * @param numerator the numerator of the fraction
 * @param denominator the denominator of the fraction
 * @returns the new fraction
 */
export function createFraction(numerator: Expression, denominator: Expression) {
    const result: Fraction = {
        type: "fraction",

        data: {
            numerator,
            denominator,
        },
    };

    return result;
}

/**
 * Parses the given text as a fraction.
 * 
 * @param text the input text
 * @returns the created fraction
 */
export function parseFraction(text: string) {
    if (!text.includes("|")) {
        throw new Error(
            "Could not parse text as fraction : the input string does not contain a '|'. Valid example: '12 | 5'"
        );
    }

    const barIndex = text.indexOf("|");

    const leftSide = text.slice(0, barIndex);
    const rightSide = text.slice(barIndex + 1);

    if (rightSide.indexOf("|") !== -1) {
        throw new Error("Could not parse text as fraction : the input string contains multiplie bars.");
    }

    const numerator = createTerm<Number>(leftSide);
    const denominator = createTerm<Number>(rightSide);

    if (!isNumber(numerator) || !isNumber(denominator)) {
        throw new Error(
            "Could not parse text as fraction : could not parse numerator and/or denominator as number."
        );
    }

    const fraction = createFraction(numerator, denominator);
    return fraction;
}

/**
 * Stringifies the given fraction in a human-readable way.
 *
 * @param fraction the fraction to stringify
 * @returns the human-readable version of the fraction
 */
export function stringifyFraction(fraction: Fraction): string {
    return `${stringifyExpression(fraction.data.numerator)}|${stringifyExpression(
        fraction.data.denominator
    )}`;
}

export function isFraction(term: string | Term) {
    if (!term) return false;

    const text = typeof term === "object" ? stringifyTerm(term) : term;

    // there must be one and only one bar '|'
    if (!text.includes("|")) return false;
    if (text.indexOf("|") !== text.lastIndexOf("|")) return false;

    // there must be numbers
    if (!isNumber(text.slice(0, text.indexOf("|")))) return false;
    if (!isNumber(text.slice(text.indexOf("|") + 1))) return false;

    return true;
}