import {
    isOperation,
    Expression,
    isKnown,
    breakInTerms,
    isNumber as isExpressionNumber,
    oppositeExpression,
    stringifyExpression,
    createExpression,
    Operation,
    isFraction,
    cloneExpression,
} from "../expression";
import { incrementFactor, mergeMultipliers, stringifyMultiplier } from "../multiplier";
import { createTerm, Term, stringifyTerm } from "./terms";
import { extractMultiplier, Number } from "./number";
import { structure } from "../format";
import { createFraction, simplifyFraction } from "./fraction";

export type Operator = Term<"operator">;

export const operators = {
    sum: {
        priority: 0,
        symbol: "+",
        operation: (a: Expression, b: Expression) => {
            const brokenTerms = [...breakInTerms(a), ...breakInTerms(b)];

            const termsCount: { [x: string]: number } = {};

            brokenTerms.forEach(expression => {
                if (isExpressionNumber(expression)) {
                    const stringified = stringifyMultiplier(expression.data.multiplier);

                    termsCount[stringified] ||= 0; // init to 0 if yet undefined (falsy)
                    termsCount[stringified] += expression.data.value;
                    return; // equals continue;
                }

                const stringified = stringifyExpression(expression);
                termsCount[stringified] ||= 0;
                termsCount[stringified]++;
            });

            console.log("Summing up terms");

            const termsUnstructured = Object.keys(termsCount)
                .sort((a, b) => {
                    if (a.length < b.length) return 1;
                    if (a.length > b.length) return -1;
                    return 0;
                })
                .map(key => {
                    const count = termsCount[key]!;

                    let result: Expression | null;

                    if (count === 0) return null;

                    // does the key contains operators ?
                    outerCondition: if (/[\+\-\*\/|]/.test(key)) {
                        const expression = createExpression(key) as Operation;

                        console.log(`Key%c${key}%c contains operators.`, "color: skyblue");

                        if (count === 1) {
                            result = expression;
                            break outerCondition;
                        }

                        result = {
                            left: createTerm<Number>(count.toString()),
                            operator: createTerm<Operator>("*"),
                            right: { ...expression, impossible: true }, // mark as impossible
                        };
                    } else {
                        console.log(`Key %c${key}%c does not contain operators.`, "color: skyblue");
                        result = createTerm<Number>(`${count}${key}`);
                    }

                    return [result, createTerm("+")];
                })
                .flat(100) // magic number
                .filter(o => o !== null);

            termsUnstructured.pop();
            console.log(termsUnstructured);

            // @ts-expect-error
            // we're sure 'termsUnstructured' does not contain 'null' elements
            // null elements have been filtered out
            return structure(termsUnstructured, { markAsImpossible: true });
        },
    },
    difference: {
        priority: 0,
        symbol: "-",
        operation: (a: Expression, b: Expression) => {
            return operators.sum.operation(a, oppositeExpression(b));
        },
    },
    product: {
        priority: 1,
        symbol: "*",
        operation: (a: Expression, b: Expression) => {
            const brokenA = breakInTerms(a);
            const brokenB = breakInTerms(b);

            const termsOfSum = brokenA
                .map(termOfA => {
                    return brokenB.map(termOfB => {
                        let result: Expression;

                        outerCondition: if (!isOperation(termOfA) && !isOperation(termOfB)) {
                            if (isExpressionNumber(termOfA) && isExpressionNumber(termOfB)) {
                                result = {
                                    type: "number",
                                    data: {
                                        value: termOfA.data.value * termOfB.data.value,
                                        multiplier: mergeMultipliers(
                                            termOfA.data.multiplier,
                                            termOfB.data.multiplier
                                        ),
                                    },
                                };
                                break outerCondition;
                            }

                            const fractionA = isFraction(termOfA)
                                ? cloneExpression(termOfA)
                                : createFraction(cloneExpression(termOfA), createTerm<Number>("1"));
                            const fractionB = isFraction(termOfB)
                                ? cloneExpression(termOfB)
                                : createFraction(cloneExpression(termOfB), createTerm<Number>("1"));

                            console.log("Multiplying fractions");
                            console.log(fractionA);
                            console.log(fractionB);

                            result = simplifyFraction(
                                createFraction(
                                    operators.product.operation(
                                        fractionA.data.numerator,
                                        fractionB.data.numerator
                                    ),
                                    operators.product.operation(
                                        fractionA.data.denominator,
                                        fractionB.data.denominator
                                    )
                                )
                            );

                            console.log(result);
                        } else {
                            // operation is impossible
                            result = {
                                left: termOfA,
                                right: termOfB,
                                operator: createTerm<Operator>("*"),

                                impossible: true,
                            };
                        }

                        // add the result and a plus sign
                        return [result, createTerm("+")];
                    });
                })
                .flat(100); // 100 = magic number

            termsOfSum.pop(); // remove the plus sign at the very end

            // WHERE DOES THIS COME FROM?
            // the sum operation contains a logic that sums up the terms of the development
            return operators.sum.operation(structure(termsOfSum), createTerm<Number>("0"));
        },
    },
    quotient: {
        priority: 1,
        symbol: "/",
        operation: (a: Expression, b: Expression) => {
            return createFraction(cloneExpression(a), cloneExpression(b));
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
                    const resultTerm = JSON.parse(JSON.stringify(aTerm)) as Number;

                    incrementFactor(
                        resultTerm.data.multiplier,

                        // we could think that the result of "stringifyNumber" may start with a number (e.g. "2x")
                        // but, when parsing, letters and numbers are separated
                        // and, because powers are always calculated first
                        // this will never happen
                        stringifyMultiplier(extractMultiplier(stringifyTerm(aTerm))!),

                        bTerm.data.value - 1
                    );

                    return resultTerm;
                }
            }

            condition: if(terms.b && isKnown(b)) {
                const bTerm  = b as Number;
                const bValue = bTerm.data.value;

                // if the power is too high
                // first, it's no use calculating it,
                // second, the browser quickly reaches the recursion limit (73?),
                if(bValue > 50) break condition;

                let result = [];
                for(let i = 0; i < bValue; i++) {
                    result.push(cloneExpression(a));
                    result.push(createTerm("*"));
                }
                result.pop(); // pops the last operator

                return structure(result);
            }

            return {
                left: a,
                operator: createTerm<Operator>("^"),
                right: b,

                impossible: true,
            };
        },
    },
    fraction: {
        priority: 1,
        symbol: "|",
        operation: (a: Expression, b: Expression) => {
            return createFraction(a, b);
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
    if(typeof term === "object") {
        return term.type === "operator";
    }

    if (!term || term.length !== 1) return false;

    const name = getOperatorName(term) as OperatorName;
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
