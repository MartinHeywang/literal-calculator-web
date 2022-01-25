import { Expression, isKnown } from "./expression";
import { minify, list, arrange } from "./format";
import { extractMultiplier, extractValue, isNumber } from "./terms/number";
import { getOperatorName, getOperatorPriority, isOperator, operators } from "./terms/operator";
import { isParenthesis } from "./terms/parenthesis";
import { createTerm, Term } from "./terms/terms";
import { regexCheck, parenthesesCheck, orderCheck } from "./verify";

export function parseExpression(expression: string) {
    const minified = minify(expression);
    if (!regexCheck(minified)) return "character error lol";

    const listed = list(minified);
    const arranged = arrange(listed);
    if (!parenthesesCheck(arranged)) return "parentheses error lol";
    if (!orderCheck(arranged)) return "order error lol";

    const withData = addData(arranged);
    console.log(withData);
    const structured = structure(withData);
    // const powersHandled = handlePowers(structured);

    return structured;
}

/* ========================================================================= */
/* modify-functions ======================================================== */
/* ========================================================================= */

/**
 * Adds data to the symbol so they get more meaning on their own.
 * Numbers get separated in two : their numeric value and the multiplier, such as x or x^2.
 * Operators get a name and a priority level.
 * Parentheses are differentiated whether they are opening or closing.
 *
 * @param list the list of symbols to proceed
 * @returns a new array of symbols with their computed data
 */
function addData(list: string[]) {
    const result: Term[] = list.map(text => createTerm(text));
    return result;
}

/**
 * Structure the list of symbols; removing in the process any parentheses.
 *
 * The returned is a SymbolList, which means that it can contain both Term
 * and SymbolList themselves. A nested array corresponds to parentheses.
 *
 * @param list the list to proceed
 * @returns the new, edited SymbolList
 */
function structure(list: Term[]) {
    const result: Expression = [];

    // cache the content when in between parentheses
    let cache: Term[] = [];
    let nesting = 0;

    for (let i = 0; i < list.length; i++) {
        const symbol = list[i];

        // every nested symbol will be structured recursively
        if (nesting !== 0) cache.push(symbol);

        if (isParenthesis(symbol.text, { includeClosings: false })) {
            nesting++;

            // if nesting equals 1, then it was at zero and has not been added before;
            // the opening parenthesis needs to be added to the cache.
            if (nesting === 1) cache.push(symbol);
        } else if (isParenthesis(symbol.text, { includeOpenings: false })) {
            nesting--;

            // closed parentheses; if we're not nested anymore
            if (nesting === 0) {
                // recursively call structure()
                // slice() helps removing the opening and closing parentheses
                result.push(structure(cache.slice(1, -1)));
                cache = [];
                continue;
            }
        }

        if (nesting === 0) result.push(symbol);
    }

    // before returning, flatten arrays with only one element
    // (-> useless parentheses -> "2(x)" for example)
    return result.map(element => {
        if (Array.isArray(element) && element.length === 1) {
            return element[0];
        }
        return element;
    });
}

// function handlePowers(list: Expression) {
//     const result: Expression = [];

//     for (let i = 0; i < list.length; i++) {
//         const symbol = list[i];

//         // recursively search through parentheses as well
//         if (Array.isArray(symbol)) {
//             result.push(handlePowers(symbol));
//             continue;
//         }
//         // not a power? i don't care
//         if (symbol.text !== operators.power.symbol) {
//             result.push(symbol);
//             continue;
//         }

//         const raised = list[i - 1]!;
//         const power = list[i + 1]!;

//         const isRaisedKnown = isKnown([raised]);
//         const isPowerKnown = isKnown([power]);
//     }

//     return result;
// }

/* ========================================================================= */
/* calculation functions =================================================== */
/* ========================================================================= */

/**
 * Evaluates the value of a numerical expression.
 *
 * @param list the list of symbols to evaluate
 * @returns the value of the numerical expression
 */
// function evaluate(list: Expression) {
//     if (!isKnown(list)) return null;
//     if (list.length === 0) return null;

//     for(let i = 0; i < list.length; i++) {
//         const current = list[i];

//         if(Array.isArray(current)) {
//             result.push(evaluate(current));
//         }
//     }

//     return result;
// }
