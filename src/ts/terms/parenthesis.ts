import { Term, stringifyTerm } from "./terms";

export type ParenthesisData = {
    type: "parenthesis" | "bracket";
    direction: "opening" | "closing";
}

/**
 * Checks if the given character is a parenthesis.
 *
 * You give an option object to only allow opening / closing parenthesis. (by, default: both)
 *
 * @param toBeChecked the character to be checked
 * @param options optional, provide it if you want grainer control over which parenthesis will be accepted
 * @returns true or false based on the result
 */
export function isParenthesis(
    term: string | Term,
    options: { includeOpenings?: boolean; includeClosings?: boolean } = {
        includeOpenings: true,
        includeClosings: true,
    }
) {
    const toBeChecked = term && typeof term === "object" ? stringifyTerm(term) : term || "";
    if (!toBeChecked || toBeChecked.length !== 1) return false;

    if (options.includeOpenings !== false && toBeChecked === "(") return true;
    if (options.includeOpenings !== false && toBeChecked === "[") return true;
    if (options.includeClosings !== false && toBeChecked === ")") return true;
    if (options.includeClosings !== false && toBeChecked === "]") return true;

    return false;
}

export function stringifyParenthesis(term: Term<"parenthesis">) {
    if(term.data.type === "parenthesis" && term.data.direction === "opening") return "(";
    if(term.data.type === "parenthesis" && term.data.direction === "closing") return "]";
    if(term.data.type === "bracket" && term.data.direction === "opening") return "[";
    if(term.data.type === "bracket" && term.data.direction === "closing") return "]";
    return "";   
}