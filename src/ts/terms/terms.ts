import { extractMultiplier, extractValue, isNumber, NumberData } from "./number";
import { DigitData } from "./digit";
import { LetterData } from "./letter";
import { getOperatorName, getOperatorPriority, isOperator, OperatorData } from "./operator";
import { isParenthesis, ParenthesisData } from "./parenthesis";

export type TermType = "digit" | "letter" | "number" | "operator" | "parenthesis";

export type Term<T extends TermType = TermType> = {
    type: T;

    // prettier-ignore
    data: 
        T extends "operator" ? OperatorData
        : T extends "digit" ? DigitData
        : T extends "letter" ? LetterData
        : T extends "parenthesis" ? ParenthesisData
        : T extends "number" ? NumberData 
        : null // won't happen
    ;
};

export function createTerm(text: string) {
    if (isParenthesis(text)) {
        const data: Term<"parenthesis"> = {
            type: "parenthesis",

            data: {
                direction: isParenthesis(text, { includeClosings: false }) ? "opening" : "closing",
                type: text === "(" || text === ")" ? "parenthesis" : "bracket",
            },
        };

        return data;
    } else if (isOperator(text)) {
        const data: Term<"operator"> = {
            type: "operator",
            
            data: {
                name: getOperatorName(text)!,
                priority: getOperatorPriority(text)!,
            },
        };
        return data;
    } else if (isNumber(text)) {
        const data: Term<"number"> = {
            type: "number",

            data: {
                value: extractValue(text) || 0,
                multiplier: extractMultiplier(text) || {},
            },
        };
        return data;
    } else {
        throw new Error(`The text '${text}' could not be recognized as a term.`);
    }
}
