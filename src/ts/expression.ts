import { minify, list, arrange } from "./format";
import { incrementFactor, isMultiplierEmpty, mergeMultipliers } from "./multiplier";
import { parseValueToTerm, stringifyNumber } from "./terms/number";
import { isOperator, operators } from "./terms/operator";
import { isParenthesis } from "./terms/parenthesis";
import { createTerm, Term, stringifyTerm } from "./terms/terms";
import { regexCheck, parenthesesCheck, orderCheck } from "./verify";

export type TermList = (Term | TermList)[];
export type Expression = {
    left: Expression | Term<"number">;
    operator: Term<"operator">;
    right: Expression | Term<"number">;

    // means that this operation can't be done directly
    frozen?: boolean;
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

    const withData = addData(arranged);
    const withDepth = giveDepth(withData);

    const structured = structure(withDepth);

    return structured;
}

/**
 * Adds data to the symbol so they get more meaning on their own.
 * Numbers get separated in two : their numeric value and the multiplier, such as x or x^2.
 * Operators get a name and a priority level.
 * Parentheses are differentiated whether they are opening or closing.
 *
 * @param list the list of symbols to proceed
 * @returns a new array of symbols with their computed data
 */
function addData(list: string[]) {
    const result: Term[] = list.map(text => createTerm(text));
    return result;
}

/**
 * Structure the list of symbols; removing in the process any parentheses.
 *
 * The returned is a SymbolList, which means that it can contain both Term
 * and SymbolList themselves. A nested array corresponds to parentheses.
 *
 * @param list the list to proceed
 * @returns the new, edited SymbolList
 */
function giveDepth(list: Term[]) {
    const result: TermList = [];

    // cache the content when in between parentheses
    let cache: Term[] = [];
    let nesting = 0;

    for (let i = 0; i < list.length; i++) {
        const term = list[i];

        // every nested symbol will be structured recursively
        if (nesting !== 0) cache.push(term);

        if (isParenthesis(stringifyTerm(term), { includeClosings: false })) {
            nesting++;

            // if nesting equals 1, then it was at zero and has not been added before;
            // the opening parenthesis needs to be added to the cache.
            if (nesting === 1) cache.push(term);
        } else if (isParenthesis(stringifyTerm(term), { includeOpenings: false })) {
            nesting--;

            // closed parentheses; if we're not nested anymore
            if (nesting === 0) {
                // recursively call structure()
                // slice() helps removing the opening and closing parentheses
                result.push(giveDepth(cache.slice(1, -1)));
                cache = [];
                continue;
            }
        }

        if (nesting === 0) result.push(term);
    }

    // before returning, flatten arrays with only one element
    // (-> useless parentheses -> "2(x)" for example)
    return result.map(element => {
        if (Array.isArray(element) && element.length === 1) {
            return element[0];
        }
        return element;
    });
}

function structure(list: TermList): Expression | Term<"number"> {
    if (list.length === 1) {
        // lists with only one term are special

        // in case we're facing a (user-defined) parenthesis, we have the unwrap it
        if (Array.isArray(list[0])) {
            return structure(list[0]);
        }

        // else just return the term -> there will be no operator to structure
        return list[0] as Term<"number">;
    }

    const findOperators = () => ({
        2: findLastOperator(list, { priority: 2 }),
        1: findLastOperator(list, { priority: 1 }),
        0: findLastOperator(list, { priority: 0 }),
    });
    let lastOperators = findOperators();

    // lowest priority first -> the operator of the root expression will be the last to be computed
    // that's to say the one that was written last + the one with the lowest priority
    const operatorIndex = (lastOperators[0] ?? lastOperators[1] ?? lastOperators[2])!;

    const left = list.slice(0, operatorIndex);
    const operator = list[operatorIndex]! as Term<"operator">;
    const right = list.slice(operatorIndex + 1 /*, until the end */);

    if (!left || !right) {
        throw new Error("Could not structure misconstructed expression.");
    }

    const leftStructured = structure(left);
    const rightStructured = structure(right);

    return {
        left: leftStructured,
        operator,
        right: rightStructured,
    };
}

/**
 * Checks if the value of a the given list can be calculated.
 *
 * The value of the given list is known if it does not contain any letter.
 *
 * @param list the symbol list to be checked
 * @returns true, if the value of the list is known, or not
 */
export function isKnown(element: Expression | Term<"number">): boolean {
    const isTermKnown = (term: Term<"number">) => {
        return isMultiplierEmpty(term.data.multiplier);
    };

    if (!isExpression(element)) return isTermKnown(element);

    const expression = element;

    return (
        (isExpression(expression.left) ? isKnown(expression.left) : isTermKnown(expression.left)) &&
        (isExpression(expression.right) ? isKnown(expression.right) : isTermKnown(expression.right))
    );
}

export function reduce(element: Expression | Term<"number">) {
    // a term can't be reduced
    if (!isExpression(element)) return element;

    let result: Expression | Term = element;
    result = handleKnown(element);
    result = reduceSimplePowers(element);
    result = reduceSimpleMultiplications(element);

    return result;
}

function handleKnown(expression: Expression | Term<"number">) {
    if (!isExpression(expression)) return expression;

    if (!isKnown(expression)) {
        // the whole expression is not known, search deeper

        if (isExpression(expression.left)) handleKnown(expression.left);
        if (isExpression(expression.right)) handleKnown(expression.right);

        return expression;
    }

    expression = parseValueToTerm(evaluate(expression));

    return expression;
}

function reduceSimplePowers(element: Expression | Term<"number">): Expression | Term<"number"> {
    if (!isExpression(element)) return element;

    const expression = element;

    if (isExpression(expression.left)) expression.left = reduceSimplePowers(expression.left);
    if (isExpression(expression.right)) expression.right = reduceSimplePowers(expression.right);

    // if both the left and the right branch are simple terms, then we're facing a "simple multiplication"
    if (
        expression.operator.data.name === "power" &&
        !isExpression(expression.left) &&
        isKnown(expression.right)
    ) {
        incrementFactor(expression.left.data.multiplier, stringifyNumber(expression.left), evaluate(expression.right) - 1);

        return expression.left;
    }

    return expression;
}

function reduceSimpleMultiplications(element: Expression | Term<"number">) {
    if (!isExpression(element)) return element;

    const expression = element;

    if (isExpression(expression.left)) expression.left = reduceSimpleMultiplications(expression.left);
    if (isExpression(expression.right)) expression.right = reduceSimpleMultiplications(expression.right);

    // if both the left and the right branch are simple terms, then we're facing a "simple multiplication"
    if (
        expression.operator.data.name === "product" &&
        !isExpression(expression.left) &&
        !isExpression(expression.right)
    ) {
        const result: Term<"number"> = {
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
export function evaluate(element: Expression | Term<"number">): number {
    if (!isKnown(element)) throw new Error("An unknown element can't be evaluated.");

    if (!isExpression(element)) {
        return element.data.value;
    }

    const expression = element;

    const leftTerm = (
        isExpression(expression.left)
            ? // evaluate deeper to create a term
              createTerm(evaluate(expression.left).toString())
            : // or get the term that's directly under our nose
              expression.left
    ) as Term<"number">;
    const rightTerm = (
        isExpression(expression.right)
            ? createTerm(evaluate(expression.right).toString())
            : expression.right
    ) as Term<"number">;

    return (operators[expression.operator.data.name].operation(leftTerm, rightTerm) as Term<"number">)
        .data.value;
}

/**
 * Freezes an expression so it can't be changed anymore.
 * Useful to tell some operations not to dig to deep in this expression (parentheses)
 *
 * @param terms the expression to be frozen
 * @returns the frozen expression
 */
export function frozenExpression(terms: TermList): TermList {
    // here we are mismatching a mutable Expression with a readonly Expression. (return type annotation)

    // at runtime the array WILL be readonly
    // but to TypeScript's eyes it will be mutable

    // because of a TypeScript bug I prefer for now to do it like that.
    // consider this code :

    // Array.isArray(term) return;
    // this guard clause is preventing 'term' to be an array
    // now if the type of term "readonly Array", TypeScript would still be in doubt

    // "Array.isArray" is the way I check if a term is an array or not.
    // and adding casts everywhere is annoying

    // @ts-expect-error --> ts(4104)
    return Object.freeze(terms);
}

/**
 * Finds the first operator in the expression that matches the criteria.
 *
 * @param expression the expression to search through
 * @param options the criteria if needed
 * @returns the index of the first operator, or null if none were found.
 */
export function findOperator(expression: TermList, options?: { priority?: number }) {
    for (let i = 0; i < expression.length; i++) {
        const term = expression[i];

        if (Array.isArray(term)) continue;

        if (isOperator(stringifyTerm(term), { priority: options?.priority })) return i;
    }

    return null;
}

export function findLastOperator(expression: TermList, options?: { priority?: number }) {
    for (let i = expression.length - 1; i >= 0; i--) {
        const term = expression[i];

        if (Array.isArray(term)) continue;

        if (isOperator(stringifyTerm(term), { priority: options?.priority })) return i;
    }

    return null;
}

export function stringifyExpression(expression: TermList) {
    let result = "";

    for (let i = 0; i < expression.length; i++) {
        const current = expression[i];

        if (Array.isArray(current)) {
            result += ` (${stringifyExpression(current)}) `;
            continue;
        }

        const operator = isOperator(current);
        if (operator) result += " ";
        result += stringifyTerm(current);
        if (operator) result += " ";
    }

    return result;
}

export function isExpression(a: Expression | Term): a is Expression {
    return a.hasOwnProperty("operator");
}

/**
 * Checks if the given expression is the end of its branch, that's to say in other words
 * if both its left and right properties refers to Term.s, and not Expression.s.
 *
 * @param expression the expression to check
 * @returns true is this expression is the last of its branch, false otherwise
 */
export function isEndOfBranch(expression: Expression) {
    return !isExpression(expression.left) && !isExpression(expression.right);
}
