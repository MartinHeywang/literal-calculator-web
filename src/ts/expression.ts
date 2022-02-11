import { minify, list, arrange, transform } from "./format";
import { isMultiplierEmpty } from "./multiplier";
import { Number } from "./terms/number";
import { operators, Operator, stringifyOperator, getOperator } from "./terms/operator";
import { createTerm, stringifyTerm } from "./terms/terms";
import { regexCheck, parenthesesCheck, orderCheck } from "./verify";

/**
 * An Expression represents a mathematical expression. Under the hood, it is either an operation or a number.
 */
export type Expression = Operation | Number;

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

    console.groupEnd();
    
    return result;
}

/**
 * Reduces the given expression. May mutate the object and returns it.
 * 
 * @param expression the expression to reduce
 * @returns the reduced expression
 */
export function reduce(expression: Expression): Expression {
    if (!isOperation(expression)) return expression;

    const reducedLeft = reduce(expression.left);
    const reducedRight = reduce(expression.right);

    return getOperator(stringifyOperator(expression.operator))!.operation(reducedLeft, reducedRight);
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

    return (operators[expression.operator.data.name].operation(leftTerm, rightTerm) as Number).data
        .value;
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

/**
 * Checks if the given expression is a sum (or a difference)
 * 
 * @param expression the expression to check
 * @returns true if the expression is a sum, false otherwise
 */
export function isSum(expression: Expression) {
    if(!isOperation(expression)) return false;

    return expression.operator.data.name === "sum" || expression.operator.data.name === "difference";
}

/**
 * Checks if the given expression is a product (or a quotient)
 * 
 * @param expression the expression to check
 * @returns true if the expression is a product, false otherwise
 */
export function isProduct(expression: Expression) {
    if(!isOperation(expression)) return false;

    return expression.operator.data.name === "product" || expression.operator.data.name === "quotient";
}
