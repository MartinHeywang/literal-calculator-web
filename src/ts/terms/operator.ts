import { Expression, isExpression } from "../expression";
import { mergeMultipliers, sameMultiplier, subtractMultipliers } from "../multiplier";
import { createTerm, Term, stringifyTerm } from "./terms";

export const operators = {
    sum: {
        priority: 0,
        symbol: "+",
        operation: (a: Term<"number"> | Expression, b: Term<"number"> | Expression) => {
            const terms = {
                a: !isExpression(a),
                b: !isExpression(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Term<"number">;
                const bTerm = b as Term<"number">;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value + bTerm.data.value;

                    const resultTerm: Term<"number"> = {
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
                operator: createTerm<"operator">("+"),
                right: b,

                frozen: true,
            };
        },
    },
    difference: {
        priority: 0,
        symbol: "-",
        operation: (a: Term<"number">, b: Term<"number">) => {
            const terms = {
                a: !isExpression(a),
                b: !isExpression(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Term<"number">;
                const bTerm = b as Term<"number">;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value - bTerm.data.value;

                    const resultTerm: Term<"number"> = {
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
                operator: createTerm<"operator">("-"),
                right: b,

                frozen: true,
            };
        },
    },
    product: {
        priority: 1,
        symbol: "*",
        operation: (a: Term<"number"> | Expression, b: Term<"number"> | Expression) => {
            const terms = {
                a: !isExpression(a),
                b: !isExpression(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Term<"number">;
                const bTerm = b as Term<"number">;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value * bTerm.data.value;

                    const resultTerm: Term<"number"> = {
                        type: "number",
                        data: {
                            value: resultValue,
                            multiplier: mergeMultipliers(aTerm.data.multiplier, bTerm.data.multiplier),
                        },
                    };

                    return resultTerm;
                }
            }

            // TODO: explore the expressions

            return {
                left: a,
                operator: createTerm<"operator">("*"),
                right: b,

                frozen: true,
            };
        },
    },
    quotient: {
        priority: 1,
        symbol: "/",
        operation: (a: Term<"number">, b: Term<"number">) => {
            const terms = {
                a: !isExpression(a),
                b: !isExpression(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Term<"number">;
                const bTerm = b as Term<"number">;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value / bTerm.data.value;

                    const resultTerm: Term<"number"> = {
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
                operator: createTerm<"operator">("/"),
                right: b,

                frozen: true,
            };
        },
    },
    power: {
        priority: 2,
        symbol: "^",
        operation: (a: Term<"number"> | Expression, b: Term<"number"> | Expression) => {
            const terms = {
                a: !isExpression(a),
                b: !isExpression(b),
            };

            if (terms.a && terms.b) {
                const aTerm = a as Term<"number">;
                const bTerm = b as Term<"number">;

                if (sameMultiplier(aTerm.data.multiplier, bTerm.data.multiplier)) {
                    const resultValue = aTerm.data.value / bTerm.data.value;

                    const resultTerm: Term<"number"> = {
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
                operator: createTerm<"operator">("/"),
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

export function stringifyOperator(term: Term<"operator">) {
    return `${operators[term.data.name].symbol}`;
}
