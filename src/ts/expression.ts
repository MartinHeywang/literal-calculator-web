import { minify, list, arrange, transform } from "./format";
import { isMultiplierEmpty } from "./multiplier";
import { createFraction, Fraction, simplifyFraction } from "./terms/fraction";
import { Number } from "./terms/number";
import { Operator, stringifyOperator, getOperator, operators } from "./terms/operator";
import { createTerm, stringifyTerm, Term } from "./terms/terms";
import { regexCheck, parenthesesCheck, orderCheck } from "./verify";

/**
 * An Expression represents a mathematical expression. Under the hood, it is either an operation or a number.
 */
export type Expression = Operation | Number | Fraction;

/**
 * An Operation is a small part from an expression. It joins two expressions with a given operator.
 */
export type Operation = {
    left: Expression;
    operator: Operator;
    right: Expression;

    // means that this operation can't be done directly
    impossible?: boolean;
};

/**
 * Creates an expression based on the given string.
 *
 * @param text the input text
 * @returns the new expression
 */
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
 * Returns the clone of an expression
 *
 * @param expression the expression to be cloned
 * @returns the cloned expression
 */
export function cloneExpression<T extends Expression>(expression: T) {
    return JSON.parse(JSON.stringify(expression)) as T;
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
    const isTermKnown = (term: Number | Fraction) => {
        return isNumber(term) ? isNumberKnown(term) : isFractionKnown(term);
    };

    const isNumberKnown = (term: Number) => {
        return isMultiplierEmpty(term.data.multiplier);
    };

    const isFractionKnown = (term: Fraction) => {
        return isKnown(term.data.numerator) && isKnown(term.data.denominator);
    };

    if (!isOperation(expression)) return isTermKnown(expression);

    return (
        (isOperation(expression.left) ? isKnown(expression.left) : isTermKnown(expression.left)) &&
        (isOperation(expression.right) ? isKnown(expression.right) : isTermKnown(expression.right))
    );
}

/**
 * Stringifies the given expression in a human-readable way.
 *
 * @param expression the expression to stringify
 * @returns the human-readable string for the expression
 */
export function stringifyExpression(expression: Expression) {
    if (!isOperation(expression)) return stringifyTerm(expression);

    const areOperations = {
        left: isOperation(expression.left),
        right: isOperation(expression.right),
    };

    const priorities = {
        left: areOperations.left ? (expression.left as Operation).operator.data.priority : null,
        thisOperation: expression.operator.data.priority,
        right: areOperations.right ? (expression.right as Operation).operator.data.priority : null,
    };

    const addParenthesesOn = {
        left: priorities.left === null ? false : priorities.left < priorities.thisOperation,
        right: priorities.right === null ? false : priorities.right < priorities.thisOperation,
    };

    let result = "";

    result += `${addParenthesesOn.left ? "(" : ""}${stringifyExpression(expression.left)}${
        addParenthesesOn.left ? ")" : ""
    }`;
    result += ` ${stringifyOperator(expression.operator)} `;
    result += `${addParenthesesOn.right ? "(" : ""}${stringifyExpression(expression.right)}${
        addParenthesesOn.right ? ")" : ""
    }`;

    return result;
}

/**
 * Reduces the given expression. May mutate the object and returns it.
 *
 * @param expression the expression to reduce
 * @returns the reduced expression
 */
export function reduce(expression: Expression): Expression {
    let result: Expression = JSON.parse(JSON.stringify(expression));

    console.groupCollapsed("%cReduction step", "color: limegreen; font-size: 1.2rem");

    let lastResultStr = "";

    while (isReducible(result)) {
        const operation = result as Operation;

        const reducedLeft = reduce(operation.left);
        console.log(stringifyOperator(operation.operator));
        const reducedRight = reduce(operation.right);

        lastResultStr = stringifyExpression(result);
        result = getOperator(stringifyOperator(operation.operator))!.operation(
            reducedLeft,
            reducedRight
        );

        // anti infinite recursion / loop system
        // if no change has happened in the last reduction step
        // then move over
        if(lastResultStr === stringifyExpression(result)) break;
    }

    if (isFraction(result)) {
        console.log(`Simplifying fraction : %c${stringifyExpression(result)}`, "color: hotpink");
        result = simplifyFraction(result);
    }

    console.log("Result : %c" + stringifyExpression(result), "color: skyblue");
    console.groupEnd();

    return result;
}

/**
 * Breaks the given expression in terms of a sum.
 *
 * Example:
 * - "2 + 3 - 2x" -> ["2", "3", "-2x"]
 *
 * @param expression the expression to break
 * @returns an array of expressions
 */
export function breakInTerms(expression: Expression): Expression[] {
    if (!isOperation(expression)) return [expression];

    if (expression.operator.data.name === "sum") {
        return [...breakInTerms(expression.left), ...breakInTerms(expression.right)];
    }
    if (expression.operator.data.name === "difference") {
        return [...breakInTerms(expression.left), ...breakInTerms(oppositeExpression(expression.right))];
    }

    return [expression];
}

/**
 * Returns the opposite of the given expression.
 *
 * @param expression the input expression
 * @returns the opposite of the input expression
 */
export function oppositeExpression(expression: Expression) {
    return operators.product.operation(JSON.parse(JSON.stringify(expression)), createTerm<Number>("-1"));
}

/**
 * Returns the inverse of the given expression
 *
 * @param expression the input expression
 * @returns the inverse of the input expression
 */
export function inverseExpression(expression: Expression) {
    if (isFraction(expression)) {
        // we can just swap the numerator and the denominator
        return createFraction(
            cloneExpression(expression.data.denominator),
            /* over */
            cloneExpression(expression.data.numerator)
        );
    }

    return createFraction(
        createTerm<Number>("1"),
        /* over */
        cloneExpression(expression)
    );
}

/* CHECKS -------------------------------------------------------------------------------------- */

/**
 * Checks if the given expression is, at its root, an operation.
 *
 * @param expression the expression to check
 * @returns true if the expression is an operation, false otherwise
 */
export function isOperation(expression: Expression | Term): expression is Operation {
    return expression.hasOwnProperty("operator");
}

/**
 * Checks if the given expression is only composed of a single number.
 *
 * @param expression the input expression
 * @returns true if the given expression is a simple number, false otherwise
 */
export function isNumber(expression: Expression | Term): expression is Number {
    return !isOperation(expression) && !isFraction(expression);
}

/**
 * Checks if the given expression is only composed of a fraction.
 *
 * @param expression the input expression
 * @returns true if the expression is a fraction, false otherwise
 */
export function isFraction(expression: Expression | Term): expression is Fraction {
    // @ts-ignore
    // property data may not exist on 'expression'
    // but in this case, the optional channelling operator prevents any undefined error.
    const result = expression.data?.hasOwnProperty("numerator");

    return result ? true : false;
}

/**
 * Checks if the given expression is a sum (or a difference)
 *
 * @param expression the expression to check
 * @returns true if the expression is a sum, false otherwise
 */
export function isSum(expression: Expression) {
    if (!isOperation(expression)) return true;

    return expression.operator.data.name === "sum" || expression.operator.data.name === "difference";
}

/**
 * Checks if the given expression is a product (or a quotient)
 *
 * @param expression the expression to check
 * @returns true if the expression is a product, false otherwise
 */
export function isProduct(expression: Expression) {
    if (!isOperation(expression)) return true;

    return expression.operator.data.name === "product" || expression.operator.data.name === "quotient";
}

/**
 * Predicts whether the expression is potentially reducible.
 *
 * @param expression the expression to check
 * @returns whether the expression is reducible or not
 */
export function isReducible(expression: Expression): boolean {
    if (!isOperation(expression)) return false;

    // not impossible -> reducible
    if (expression.impossible !== true) return true;

    const leftAnswer = isReducible(expression.left);
    if (leftAnswer) return true;

    const rightAnswer = isReducible(expression.right);
    if (rightAnswer) return true;

    return false;
}
