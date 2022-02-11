import { isOperation, Expression, isKnown, evaluate } from "../expression";
import { incrementFactor, mergeMultipliers, sameMultiplier, subtractMultipliers } from "../multiplier";
import { createTerm, Term, stringifyTerm } from "./terms";
import { Number, oppositeTerm, stringifyNumber } from "./number";

export type Operator = Term<"operator">;

export const operators = {
    sum: {
        priority: 0,
        symbol: "+",
        operation: (a: Expression, b: Expression) => {
            const terms = {
                a: !isOperation(a),
                b: !isOperation(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Number;
                const bTerm = b as Number;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value + bTerm.data.value;

                    const resultTerm: Number = {
                        type: "number",
                        data: {
                            value: resultValue,
                            multiplier: aTerm.data.multiplier,
                        },
                    };

                    return resultTerm;
                }
            }

            // TODO: explore the expressions

            return {
                left: a,
                operator: createTerm<Operator>("+"),
                right: b,

                impossible: true,
            };
        },
    },
    difference: {
        priority: 0,
        symbol: "-",
        operation: (a: Expression, b: Expression) => {
            const terms = {
                a: !isOperation(a),
                b: !isOperation(b),
            };

            if (terms.a && terms.b) {
                return operators.sum.operation(a as Number, oppositeTerm(b as Number));
            }

            return {
                left: a,
                operator: createTerm<Operator>("-"),
                right: b,

                impossible: true,
            };
        },
    },
    product: {
        priority: 1,
        symbol: "*",
        operation: (a: Expression, b: Expression) => {
            const terms = {
                a: !isOperation(a),
                b: !isOperation(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Number;
                const bTerm = b as Number;

                const resultValue = aTerm.data.value * bTerm.data.value;

                const resultTerm: Number = {
                    type: "number",
                    data: {
                        value: resultValue,
                        multiplier: mergeMultipliers(aTerm.data.multiplier, bTerm.data.multiplier),
                    },
                };

                return resultTerm;
            }

            // TODO: explore the expressions

            return {
                left: a,
                operator: createTerm<Operator>("*"),
                right: b,

                impossible: true,
            };
        },
    },
    quotient: {
        priority: 1,
        symbol: "/",
        operation: (a: Expression, b: Expression) => {
            const terms = {
                a: !isOperation(a),
                b: !isOperation(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Number;
                const bTerm = b as Number;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value / bTerm.data.value;

                    const resultTerm: Number = {
                        type: "number",
                        data: {
                            value: resultValue,
                            multiplier: subtractMultipliers(
                                aTerm.data.multiplier,
                                bTerm.data.multiplier
                            ),
                        },
                    };

                    return resultTerm;
                }
            }

            // TODO: explore the expressions

            return {
                left: a,
                operator: createTerm<Operator>("/"),
                right: b,

                impossible: true,
            };
        },
    },
    power: {
        priority: 2,
        symbol: "^",
        operation: (a: Expression, b: Expression) => {
            const terms = {
                a: !isOperation(a),
                b: !isOperation(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Number;
                const bTerm = b as Number;

                // simplest case -> 2^5 for example
                if (isKnown(aTerm) && isKnown(bTerm)) {
                    const resultValue = Math.pow(aTerm.data.value, bTerm.data.value);

                    const resultTerm: Number = {
                        type: "number",
                        data: {
                            value: resultValue,
                            multiplier: {},
                        },
                    };

                    return resultTerm;
                }

                // compacts numbers -> x^2 for example
                if (isKnown(bTerm)) {
                    incrementFactor(
                        aTerm.data.multiplier,

                        // hey! we could think that the result of "stringifyNumber" may start with a number (e.g. "2x")
                        // but, when parsing, letters and numbers are separated
                        // and, because powers are always calculated first
                        // this will never happen
                        // conclusion: this is safe
                        stringifyNumber(aTerm),
                        evaluate(bTerm) - 1
                    );

                    return aTerm;
                }
            }

            // TODO: explore the expressions

            return {
                left: a,
                operator: createTerm<Operator>("^"),
                right: b,

                frozen: true,
            };
        },
    },
};

export type OperatorData = {
    priority: number;
    name: OperatorName;
};

export type OperatorName = keyof typeof operators;

/**
 * Checks if the given char is one of the supported operators : + - * / ^
 *
 * @param toBeChecked the character to be checked
 * @returns true or false based on the result
 */
export function isOperator(term: string | Term, options?: { priority?: number }) {
    const toBeChecked = term && typeof term === "object" ? stringifyTerm(term) : term || "";
    if (!toBeChecked || toBeChecked.length !== 1) return false;

    const name = getOperatorName(toBeChecked) as OperatorName;
    if (name === null) return false; // not found

    // no priority specified, or matches
    if (options?.priority === undefined) return true;
    if (options.priority === operators[name].priority) return true;

    return false;
}

export function getOperatorName(symbol: string) {
    const keys = Object.keys(operators);

    return (
        (keys.find(key => {
            const operator = operators[key as OperatorName];

            return operator.symbol === symbol;
        }) as OperatorName) ?? null
    );
}

export function getOperator(symbol: string) {
    const name = getOperatorName(symbol) as OperatorName;
    if (name === null) return null;

    return operators[name];
}

export function getOperatorPriority(symbol: string) {
    const key =
        (Object.keys(operators).find(key => {
            const operator = operators[key as OperatorName];

            return operator.symbol === symbol;
        }) as OperatorName) ?? null;

    return operators[key].priority;
}

export function stringifyOperator(term: Operator) {
    return `${operators[term.data.name].symbol}`;
}
