import { isNumber, isLetter, isDigit } from "./terms/number";
import { isOperator } from "./terms/operator";
import { isParenthesis } from "./terms/parenthesis";

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

    // for caching the current symbol
    let cache = "";

    const pushCache = () => {
        if (cache !== "") result.push(cache);
    };

    for (let i = 0; i < expression.length; i++) {
        const char = expression.charAt(i);

        // ignore spaces
        if (char === " ") continue;

        // multiple cases are possible at this point
        // the char can be an operator, a digit/letter or a parenthesis
        if (isOperator(char) || isParenthesis(char)) {
            if ((char === "+" || char === "-") && i === 0) {
                cache += char;
                continue;
            }

            pushCache();
            cache = "";
            result.push(char);
            continue;
        } else if (isLetter(char)) {
            // special case, when a negative letter (e.g. "-x") is at the beginning of the string
            if (i === 1 && (cache === "-" || cache === "+")) {
                cache += char;
                pushCache();
                cache = "";
                continue;
            }

            pushCache();
            cache = "";
            result.push(char);
            continue;
        }

        cache += char;
    }

    pushCache();

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

/**
 * Adds implicit multiplications between
 * - parentheses
 * - a parenthesis and a literal number
 *
 * @param list the list of symbols to process
 * @returns the new, edited list
 */
function addImplicitMultiplications(list: string[]) {
    const result: string[] = [];

    for (let i = 0; i < list.length; i++) {
        const previous = list[i - 1] ?? null;
        const current = list[i];

        // where to add multiplications
        // - when the previous symbol is NOT an operator, and the current symbol an opening parenthesis
        // - when the previous symbol is a digit, and the current symbol a letter
        // - when both the previous and the current symbol are letters
        if (
            (previous && !isOperator(previous) && isParenthesis(current, { includeClosings: false })) ||
            (isDigit(previous) && isLetter(current)) ||
            (isLetter(previous) && isLetter(current))
        ) {
            // inserting between the previous and the current symbol
            result.push("*");
        }

        result.push(current);
    }

    return result;
}

/**
 * Removes empty, useless parentheses.
 *
 * @param list the list to proceed
 * @returns the new, edited list
 */
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

/**
 * Adds a zero at the beginning of the expression if needed to avoid having
 * a plus or a minus at the beginning that would lead to an order check error.
 *
 * @param list the list to be treated
 * @returns the new, edited list
 */
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
