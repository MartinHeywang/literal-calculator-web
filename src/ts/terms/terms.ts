import { extractMultiplier, extractValue, isNumber, NumberData, stringifyNumber } from "./number";
import { getOperatorName, getOperatorPriority, isOperator, OperatorData, stringifyOperator } from "./operator";
import { isParenthesis, ParenthesisData, stringifyParenthesis } from "./parenthesis";

export type TermType = "number" | "operator" | "parenthesis";

export type Term<T extends TermType = TermType> = {
    type: T;

    // prettier-ignore
    data: 
        T extends "operator" ? OperatorData
        : T extends "parenthesis" ? ParenthesisData
        : T extends "number" ? NumberData 
        : null // won't happen
    ;
};

export function createTerm<T extends TermType>(text: string): Term<T> {
    if (isParenthesis(text)) {
        const data: Term<"parenthesis"> = {
            type: "parenthesis",

            data: {
                direction: isParenthesis(text, { includeClosings: false }) ? "opening" : "closing",
                type: text === "(" || text === ")" ? "parenthesis" : "bracket",
            },
        };

        return data as Term<T>;
    } else if (isOperator(text)) {
        const data: Term<"operator"> = {
            type: "operator",
            
            data: {
                name: getOperatorName(text)!,
                priority: getOperatorPriority(text)!,
            },
        };
        return data as Term<T>;
    } else if (isNumber(text)) {
        const data: Term<"number"> = {
            type: "number",

            data: {
                value: extractValue(text) || 0,
                multiplier: extractMultiplier(text) || {},
            },
        };
        return data as Term<T>;
    } else {
        throw new Error(`The text '${text}' could not be recognized as a term.`);
    }
}


export function stringifyTerm(term: Term) {
    if (term.type === "number") {
        return stringifyNumber(term as Term<"number">);
    }
    if (term.type === "operator") {
        return stringifyOperator(term as Term<"operator">);
    }
    if (term.type === "parenthesis") {
        return stringifyParenthesis(term as Term<"parenthesis">);
    }

    throw new Error("Can't stringify term of an unknown type.");
}
