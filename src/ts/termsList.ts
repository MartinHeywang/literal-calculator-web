import { isOperator } from "./terms/operator";
import { stringifyTerm, Term } from "./terms/terms";

export type TermList = (Term | TermList)[];


/**
 * Stringifies the given terms list in a human-readable way.
 * 
 * @param list the terms list to stringify
 * @returns the human-readable string generated based on the given list
 */
export function stringifyTermsList(list: TermList) {
    let result = "";

    for (let i = 0; i < list.length; i++) {
        const current = list[i];

        if (Array.isArray(current)) {
            result += ` (${stringifyTermsList(current)}) `;
            continue;
        }

        const operator = isOperator(current);
        if (operator) result += " ";
        result += stringifyTerm(current);
        if (operator) result += " ";
    }

    return result;
}

/**
 * Finds the first operator in the terms list that matches the criteria.
 *
 * @param list the expression to search through
 * @param options the criteria if needed
 * @returns the index of the first operator, or null if none were found.
 */
export function findOperator(list: TermList, options?: { priority?: number }) {
    for (let i = 0; i < list.length; i++) {
        const term = list[i];

        if (Array.isArray(term)) continue;

        if (isOperator(stringifyTerm(term), { priority: options?.priority })) return i;
    }

    return null;
}

/**
 * Finds the last operator in the terms list that matches the criteria.
 *
 * @param list the expression to search through
 * @param options the criteria if needed
 * @returns the index of the first operator, or null if none were found.
 */
export function findLastOperator(list: TermList, options?: { priority?: number }) {
    for (let i = list.length - 1; i >= 0; i--) {
        const term = list[i];

        if (Array.isArray(term)) continue;

        if (isOperator(stringifyTerm(term), { priority: options?.priority })) return i;
    }

    return null;
}
