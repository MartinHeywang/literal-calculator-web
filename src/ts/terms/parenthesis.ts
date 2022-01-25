export type ParenthesisData = {
    type: "parenthesis" | "bracket";
    direction: "opening" | "closing";
}

/**
 * Checks if the given character is a parenthesis.
 *
 * You give an option object to only allow opening / closing parenthesis. (by, default: both)
 *
 * @param symbol the character to be checked
 * @param options optional, provide it if you want grainer control over which parenthesis will be accepted
 * @returns true or false based on the result
 */
export function isParenthesis(
    symbol: string,
    options: { includeOpenings?: boolean; includeClosings?: boolean } = {
        includeOpenings: true,
        includeClosings: true,
    }
) {
    if (!symbol || symbol.length !== 1) return false;

    if (symbol === "(" && options.includeOpenings !== false) return true;
    if (symbol === "[" && options.includeOpenings !== false) return true;
    if (symbol === ")" && options.includeClosings !== false) return true;
    if (symbol === "]" && options.includeClosings !== false) return true;

    return false;
}
