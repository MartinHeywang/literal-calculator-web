import { Expression, isOperation, stringifyExpression } from "../expression";
import { optimizeMultiplier, stringifyMultiplier, subtractMultipliers } from "../multiplier";
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
    

    // in hand-written mathematics, there is no need to add parentheses 
    // to the members of a fraction.
    // but because here, fractions are written inline (e.g "1 | y"), 
    // there is no other way than adding parentheses to known what 
    // belongs to the fraction and what does not.

    const addParenthesesOn = {
        numerator: isOperation(fraction.data.numerator),
        denominator: isOperation(fraction.data.denominator),
    };

    return `${addParenthesesOn.numerator ? "(" : ""}${stringifyExpression(fraction.data.numerator)}${
        addParenthesesOn.numerator ? ")" : ""
    }|${addParenthesesOn.denominator ? "(" : ""}${stringifyExpression(fraction.data.denominator)}${
        addParenthesesOn.denominator ? ")" : ""
    }`;
}

export function isFraction(term: string | Term): term is Fraction {
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

export function simplifyFraction(input: Fraction): Fraction | Number {
    let { numerator, denominator } = input.data;
    if (stringifyExpression(numerator) === stringifyExpression(denominator)) {
        return createTerm("1");
    }

    if (isOperation(numerator) || isOperation(denominator)) {
        return createFraction(numerator, denominator);
    }

    // it may be possible to reduce sub-fractions into simple numbers, so do it!
    if (isFraction(numerator)) numerator = simplifyFraction(numerator);
    if (isFraction(denominator)) denominator = simplifyFraction(denominator);

    if (!isNumber(numerator) || !isNumber(denominator)) {
        return createFraction(numerator, denominator);
    }

    // at this point we are sure both the numerator and the denominator are numbers
    // and this is required in order to simplify fraction

    const resultMultiplier = subtractMultipliers(numerator.data.multiplier, denominator.data.multiplier);
    const numeratorMultiplier = optimizeMultiplier(resultMultiplier); // remove < 0 values
    const denominatorMultiplier = JSON.parse(JSON.stringify(resultMultiplier));

    console.log("deno multi");
    console.log(resultMultiplier);

    Object.keys(denominatorMultiplier).forEach(key => {
        const value = denominatorMultiplier[key];

        if (value >= 0) delete denominatorMultiplier[key];
        if (value < 0) denominatorMultiplier[key] *= -1;
    });

    console.log(denominatorMultiplier);

    const isDivisible = (a: number, b: number) => a % b === 0;

    if (
        isDivisible(numerator.data.value, denominator.data.value) &&
        Object.keys(denominatorMultiplier).length === 0
    ) {
        const numericalValue = numerator.data.value / denominator.data.value;
        return createTerm(`${numericalValue}${stringifyMultiplier(numeratorMultiplier)}`);
    }

    let divider = 1;
    const resetDivider = () => (divider = 1);

    let newNumeratorValue = numerator.data.value;
    let newDenominatorValue = denominator.data.value;

    while (divider <= newNumeratorValue && divider <= newDenominatorValue && divider <= 100_000) {
        divider++;

        if (isDivisible(newNumeratorValue, divider) && isDivisible(newDenominatorValue, divider)) {
            newNumeratorValue /= divider;
            newDenominatorValue /= divider;

            resetDivider();
        }
    }

    return {
        type: "fraction",

        data: {
            numerator: createTerm<Number>(
                `${newNumeratorValue}${stringifyMultiplier(numeratorMultiplier)}`
            ),
            denominator: createTerm<Number>(
                `${newDenominatorValue}${stringifyMultiplier(denominatorMultiplier)}`
            ),
        },
    };
}
