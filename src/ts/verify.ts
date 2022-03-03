import { isDigit, isLetter } from "./terms/number";
import { isOperator } from "./terms/operator";
import { isParenthesis } from "./terms/parenthesis";

/**
 * Checks via a regular expression if the expression seems valid.
 *
 * This program allows :
 * - digits, 0-9
 * - lowercase letters, a-z,
 * - operators : + - * / ^
 * - parenthesis and brackets : ( ) [ ]
 *
 * @param expression
 * @returns
 */
export function regexCheck(expression: string) {
    return /^[0-9\.a-z\+\-\*\/\(\)\^\[\]|]+$/g.test(expression);
}

/**
 * Checks if there is an even number of parentheses and brackets.
 *
 * @param list the list to proceed
 */
export function parenthesesCheck(list: string[]) {
    let nesting = 0;

    for (let i = 0; i < list.length; i++) {
        const symbol = list[i];

        if (isParenthesis(symbol, { includeClosings: false })) {
            nesting++;
        } else if (isParenthesis(symbol, { includeOpenings: false })) {
            nesting--;
            if (nesting < 0) return false;
        }
    }

    return nesting === 0;
}

/**
 * Checks if the order of symbols in the list seems correct.
 * For example, are forbidden:
 * - two operators in a row
 * - a number directly after a letter
 *
 * @param list the list to check
 * @returns true of false, whether the order seems right
 */
export function orderCheck(list: string[]) {
    const first = list[0];
    const last = list[list.length - 1];

    if (isOperator(first)) return false;
    if (isOperator(last)) return false;

    for (let i = 0; i < list.length; i++) {
        const previous = list[i - 1] ?? null;
        const current = list[i];
        // const next = list[i + 1] ?? null;

        // two operators in a row
        if (isOperator(current) && (previous ? isOperator(previous) : true)) return false;

        // a digit directly after a letter
        if (isDigit(current) && (previous ? isLetter(previous) : false)) return false;
    }

    return true;
}
