import { extractMultiplier, extractValue, isNumber, NumberData, stringifyNumber, Number } from "./number";
import { getOperatorName, getOperatorPriority, isOperator, Operator, OperatorData, stringifyOperator } from "./operator";
import { isParenthesis, Parenthesis, ParenthesisData, stringifyParenthesis } from "./parenthesis";

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

export function createTerm<T extends Term>(text: string): T {
    if (isParenthesis(text)) {
        const data: Parenthesis = {
            type: "parenthesis",

            data: {
                direction: isParenthesis(text, { includeClosings: false }) ? "opening" : "closing",
                type: text === "(" || text === ")" ? "parenthesis" : "bracket",
            },
        };

        // @ts-ignore
        return data;
    } else if (isOperator(text)) {
        const data: Operator = {
            type: "operator",
            
            data: {
                name: getOperatorName(text)!,
                priority: getOperatorPriority(text)!,
            },
        };

        // @ts-ignore
        return data;
    } else if (isNumber(text)) {
        const data: Number = {
            type: "number",

            data: {
                value: extractValue(text) || 0,
                multiplier: extractMultiplier(text) || {},
            },
        };

        // @ts-ignore
        return data as Term<T>;
    } else {
        throw new Error(`The text '${text}' could not be recognized as a term.`);
    }
}


export function stringifyTerm(term: Term) {
    if (term.type === "number") {
        return stringifyNumber(term as Number);
    }
    if (term.type === "operator") {
        return stringifyOperator(term as Operator);
    }
    if (term.type === "parenthesis") {
        return stringifyParenthesis(term as Parenthesis);
    }

    throw new Error("Can't stringify term of an unknown type.");
}
