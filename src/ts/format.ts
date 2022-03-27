import { Expression, Operation } from "./expression";
import { isNumber, isLetter, isDigit, Number } from "./terms/number";
import { isOperator, Operator } from "./terms/operator";
import { isParenthesis } from "./terms/parenthesis";
import { createTerm, stringifyTerm, Term } from "./terms/terms";
import { ExpressionList, findLastOperator, TermList } from "./termsList";

/**
 * Removes whitespace and other useless characters from the expression.
 *
 * @param expression the expression to minify
 * @returns the minified expression
 */
export function minify(expression: string) {
    return expression.replace(/\s+/g, "");
}

/**
 * Creates a list of all symbols of the expression.
 * A symbol can be a number, a letter, a parenthesis.
 *
 * Examples of symbol :
 * - a
 * - (
 * - 45
 * - 2x
 *
 * @param expression the expression to process
 * @returns the list of all symbols
 */
export function list(expression: string) {
    const result: string[] = [];
    const appendToResult = (str: string) => {
        if (str) result.push(str);
    };

    // for caching the current symbol
    let cache = "";
    const appendToCache = (str: string) => {
        if (str) cache += str;
    };

    const pushAndEmptyCache = () => {
        if (cache !== "") {
            result.push(cache);
            cache = "";
        }
    };

    for (let i = 0; i < expression.length; i++) {
        const char = expression.charAt(i);

        // ignore spaces
        if (char === " ") continue;

        // multiple cases are possible at this point
        // the char can be an operator, a digit/letter or a parenthesis
        if (isOperator(char) || isParenthesis(char)) {
            if (i === 0 && (char === "+" || char === "-")) {
                appendToCache(char);
                continue;
            }

            pushAndEmptyCache();
            appendToResult(char);
            continue;
        } else if (isLetter(char)) {
            // special case, when a signed letter (e.g. "-x") is at the beginning of the string
            if (i === 1 && (cache === "-" || cache === "+")) {
                appendToCache(char);
                pushAndEmptyCache();
                continue;
            }

            appendToCache(char);
            continue;
        }

        // if nothing could be done...
        appendToCache(char);
    }

    pushAndEmptyCache();

    return result;
}

/**
 * Arranges the symbol list (not making any calculation) to make the list usable.
 * For example, adds implicit multiplications between parentheses.
 *
 * @param list the list to process
 * @returns a new edited list
 */
export function arrange(list: string[]) {
    let result = list;
    result = removeEmptyParentheses(result);
    result = addImplicitMultiplications(result);
    result = treatNegativeParentheses(result);

    return result;
}

function addImplicitMultiplications(list: string[]) {
    const result: string[] = [];

    for (let i = 0; i < list.length; i++) {
        const previous = list[i - 1] ?? null;
        const current = list[i];

        // where to add multiplications
        // - when the previous symbol is neither an operator nor an opening parenthesis, and the current symbol an opening parenthesis e.g "(a+b) * (a-b)", but NOT for "((2+1))"
        // - when the previous symbol is a digit, and the current symbol a letter e.g "5 * x"
        // - when both the previous and the current symbol are letters e.g "x * y"
        if (
            // either
            (previous &&
                !isOperator(previous) &&
                !isParenthesis(previous, { includeClosings: false }) &&
                isParenthesis(current, { includeClosings: false })) ||

            // or
            (isDigit(previous) && isLetter(current)) ||

            // or
            (isLetter(previous) && isLetter(current))
        ) {
            // inserting between the previous and the current symbol
            result.push("*");
        }

        result.push(current);
    }

    return result;
}

function removeEmptyParentheses(list: string[]) {
    const result: string[] = [];
    const lastSymbol = () => result[result.length - 1] ?? null;

    for (let i = 0; i < list.length; i++) {
        const symbol = list[i];

        if (
            isParenthesis(lastSymbol(), { includeClosings: false }) &&
            isParenthesis(symbol, { includeOpenings: false })
        ) {
            result.pop();
        } else result.push(symbol);
    }

    return result;
}

function treatNegativeParentheses(list: string[]) {
    const result = Array.from(list);
    if (list.length < 2) return result;

    condition: if (isOperator(result[0], { priority: 0 })) {
        // we can't add a minus sign on a parenthesis, so we prefer to insert a "0" at the beginning
        if (isParenthesis(result[1])) {
            result.unshift("0");
            break condition;
        }

        // on a number, we do! We're just adding this minus sign to the symbol
        if (isNumber(result[1])) {
            result[1] = `${result[0]}${result[1]}`;
            result.splice(0, 1);
            break condition;
        }
    }

    return result;
}

export function transform(list: string[]) {
    return structure(deepen(addData(list)));
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
function deepen(list: Term[]) {
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
                result.push(deepen(cache.slice(1, -1)));
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

/**
 * Structures the given terms list in the form of a binary tree.
 * Each node has two branches :
 * - the operator defines the type of operation
 * - both branches (left and right) may be operations themselves or a simple number
 *
 * @param list the terms list to structure
 * @returns the new expression
 */
export function structure(
    list: ExpressionList,
    options?: {
        markAsImpossible?: boolean;
    }
): Expression {
    if (list.length === 0) return createTerm<Number>("0");

    if (list.length === 1) {
        // lists with only one term are special

        // in case we're facing a (user-defined) parenthesis, we have the unwrap it
        if (Array.isArray(list[0])) {
            return structure(list[0]);
        }

        // else just return the term -> there will be no operator to structure
        return list[0] as Exclude<Expression, Operation>;
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
    const operator = list[operatorIndex]! as Operator;
    const right = list.slice(operatorIndex + 1 /*, until the end */);

    if (!left || !right) {
        throw new Error("Could not structure misconstructed expression.");
    }

    return {
        left: structure(left, options),
        operator,
        right: structure(right, options),

        impossible: options?.markAsImpossible || false,
    };
}
