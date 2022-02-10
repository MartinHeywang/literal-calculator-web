import { minify, list, arrange, transform } from "./format";
import { incrementFactor, isMultiplierEmpty, mergeMultipliers } from "./multiplier";
import { parseValueToTerm, stringifyNumber, Number } from "./terms/number";
import { operators, Operator } from "./terms/operator";
import { createTerm, Term } from "./terms/terms";
import { regexCheck, parenthesesCheck, orderCheck } from "./verify";

export type Expression = Operation | Number;

export type Operation = {
    left: Expression;
    operator: Operator;
    right: Expression;

    // means that this operation can't be done directly
    impossible?: boolean;
};

export function createExpression(text: string) {
    const minified = minify(text);

    if (!regexCheck(minified)) {
        throw new Error(
            `The expression '${text}' could not be parsed because it contains unsupported characters.`
        );
    }

    const listed = list(minified);
    const arranged = arrange(listed);
    if (!parenthesesCheck(arranged)) {
        throw new Error(`The expression '${text}' could not be parsed because of a parentheses error.`);
    }
    if (!orderCheck(arranged)) {
        throw new Error(`The expression '${text}' could not be parsed because of an order error.`);
    }

    const transformed = transform(arranged);

    return transformed;
}

/**
 * Checks if the value of a the given list can be calculated.
 *
 * The value of the given list is known if it does not contain any letter.
 *
 * @param list the symbol list to be checked
 * @returns true, if the value of the list is known, or not
 */
export function isKnown(expression: Expression): boolean {
    const isTermKnown = (term: Number) => {
        return isMultiplierEmpty(term.data.multiplier);
    };

    if (!isOperation(expression)) return isTermKnown(expression);

    return (
        (isOperation(expression.left) ? isKnown(expression.left) : isTermKnown(expression.left)) &&
        (isOperation(expression.right) ? isKnown(expression.right) : isTermKnown(expression.right))
    );
}

export function reduce(expression: Expression) {
    // a term can't be reduced
    if (!isOperation(expression)) return expression;

    let result: Operation | Term = expression;
    result = handleKnown(expression);
    result = reduceSimplePowers(expression);
    result = reduceSimpleMultiplications(expression);

    return result;
}

function handleKnown(expression: Expression) {
    if (!isOperation(expression)) return expression;

    if (!isKnown(expression)) {
        // the whole expression is not known, search deeper

        if (isOperation(expression.left)) handleKnown(expression.left);
        if (isOperation(expression.right)) handleKnown(expression.right);

        return expression;
    }

    expression = parseValueToTerm(evaluate(expression));

    return expression;
}

function reduceSimplePowers(expression: Expression): Expression {
    if (!isOperation(expression)) return expression;

    if (isOperation(expression.left)) expression.left = reduceSimplePowers(expression.left);
    if (isOperation(expression.right)) expression.right = reduceSimplePowers(expression.right);

    // if both the left and the right branch are simple terms, then we're facing a "simple multiplication"
    if (
        expression.operator.data.name === "power" &&
        !isOperation(expression.left) &&
        isKnown(expression.right)
    ) {
        incrementFactor(expression.left.data.multiplier, stringifyNumber(expression.left), evaluate(expression.right) - 1);

        return expression.left;
    }

    return expression;
}

function reduceSimpleMultiplications(expression: Expression) {
    if (!isOperation(expression)) return expression;

    if (isOperation(expression.left)) expression.left = reduceSimpleMultiplications(expression.left);
    if (isOperation(expression.right)) expression.right = reduceSimpleMultiplications(expression.right);

    // if both the left and the right branch are simple terms, then we're facing a "simple multiplication"
    if (
        expression.operator.data.name === "product" &&
        !isOperation(expression.left) &&
        !isOperation(expression.right)
    ) {
        const result: Number = {
            type: "number",

            data: {
                value: expression.left.data.value * expression.right.data.value,
                multiplier: mergeMultipliers(
                    expression.left.data.multiplier,
                    expression.right.data.multiplier
                ),
            },
        };

        return result;
    }

    return expression;
}

/**
 * Evaluates the value of a numerical expression.
 *
 * @param expression the list of symbols to evaluate
 * @returns the value of the numerical expression
 */
export function evaluate(element: Expression): number {
    if (!isKnown(element)) throw new Error("An unknown element can't be evaluated.");

    if (!isOperation(element)) {
        return element.data.value;
    }

    const expression = element;

    const leftTerm = (
        isOperation(expression.left)
            ? // evaluate deeper to create a term
              createTerm(evaluate(expression.left).toString())
            : // or get the term that's directly under our nose
              expression.left
    ) as Number;
    const rightTerm = (
        isOperation(expression.right)
            ? createTerm(evaluate(expression.right).toString())
            : expression.right
    ) as Number;

    return (operators[expression.operator.data.name].operation(leftTerm, rightTerm) as Number)
        .data.value;
}

/**
 * Checks if the given expression is, at its root, an operation.
 * 
 * @param expression the expression to check
 * @returns true if the expression is an operation, false otherwise
 */
export function isOperation(expression: Expression): expression is Operation {
    return expression.hasOwnProperty("operator");
}
