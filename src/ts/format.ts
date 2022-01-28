import { isDigit } from "./terms/digit";
import { isLetter } from "./terms/letter";
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
            if((i === 1 && (cache === "-" || cache === "+"))) {
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
        if (previous && 
            (!isOperator(previous) && isParenthesis(current, { includeClosings: false })) ||
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
