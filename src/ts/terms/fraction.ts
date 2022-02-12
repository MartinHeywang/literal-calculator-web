import { Expression, stringifyExpression } from "../expression";
import { Term } from "./terms";

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
 * Stringifies the given fraction in a human-readable way.
 * 
 * @param fraction the fraction to stringify
 * @returns the human-readable version of the fraction
 */
export function stringifyFraction(fraction: Fraction): string {
    return `${stringifyExpression(fraction.data.numerator)}/${stringifyExpression(
        fraction.data.denominator
    )}`;
}
