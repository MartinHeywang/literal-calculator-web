import { isLetter } from "./terms/letter";
import { Term } from "./terms/terms";

export type Expression = (Term | Expression)[];

/**
 * Checks if the value of a the given list can be calculated.
 *
 * The value of the given list is known if it does not contain any letter.
 *
 * @param list the symbol list to be checked
 * @returns true, if the value of the list is known, or not
 */
export function isKnown(list: Expression): boolean {
    return list.every(element => {
        if (Array.isArray(element)) {
            // it's a SymbolList!
            return isKnown(element);
        }

        return !isLetter(element.text);
    });
}
