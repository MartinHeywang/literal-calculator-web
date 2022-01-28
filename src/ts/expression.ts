import { minify, list, arrange } from "./format";
import { isLetter } from "./terms/letter";
import { NumberData } from "./terms/number";
import { getOperator, isOperator, operators } from "./terms/operator";
import { isParenthesis } from "./terms/parenthesis";
import { createTerm, Term } from "./terms/terms";
import { regexCheck, parenthesesCheck, orderCheck } from "./verify";

export type Expression = (Term | Expression)[];

export function createExpression(text: string) {
    const minified = minify(text);

    if (!regexCheck(minified)) {
        throw new Error(
            `The expression '${text}' could not be parsed because it contains unsupported characters.`
        );
    }

    const listed = list(minified);
    const arranged = arrange(listed);
    if (!parenthesesCheck(arranged)) {
        throw new Error(`The expression '${text}' could not be parsed because of a parentheses error.`);
    }
    if (!orderCheck(arranged)) {
        throw new Error(`The expression '${text}' could not be parsed because of an order error.`);
    }

    const withData = addData(arranged);
    const structured = structure(withData);

    return structured;
}

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

export function handlePowers(expression: Expression) {
    const result: Expression = [];

    for (let i = 0; i < expression.length; i++) {
        const symbol = expression[i];

        // recursively search through parentheses as well
        if (Array.isArray(symbol)) {
            result.push(handlePowers(symbol));
            continue;
        }

        // not a power? i don't care
        if (symbol.text !== operators.power.symbol) {
            result.push(symbol);
            continue;
        }

        const raised = expression[i - 1]!;
        const power = expression[i + 1]!;

        const isRaisedKnown = isKnown([raised]);
        const isPowerKnown = isKnown([power]);

        // power is not known, just isolate
        if (!isPowerKnown) {
            const block = [];
            block.push(raised);
            block.push(symbol);
            block.push(power);
            Object.freeze(block);

            result.pop();
            i++;
            result.push(block);
            continue;
        }

        // raised is not known (but power is)
        if (!isRaisedKnown) {
            const powerValue = evaluate([power]);

            if (!Array.isArray(raised)) {
                // change the value of the multiplier
                (raised as Term<"number">).data.multiplier[raised.text] = powerValue;
                i++; // skip the power symbol, already treated
                continue;
            }

            // raised it too complex, isolate
            const block = [];
            block.push(raised);
            block.push(symbol);
            block.push(power);
            Object.freeze(block);

            result.pop();
            i++;
            result.push(block);
            continue;
        }

        // both power and raised are known

        result.pop(); // remove the term one front the stack
        result.push(createTerm(evaluate([raised, symbol, power]).toString()));
        i++; // skip the next element
    }

    return result;
}

/**
 * Evaluates the value of a numerical expression.
 *
 * @param list the list of symbols to evaluate
 * @returns the value of the numerical expression
 */
export function evaluate(list: Expression): number {
    if (!isKnown(list)) throw new Error("An unknown list can't be evaluated.");

    if (list.length === 0) return 0;
    if (list.length === 1) {
        if (!Array.isArray(list[0])) return (list[0].data as NumberData).value;
        else return evaluate(list[0]);
    }

    const firstOperator = (priority: number) => {
        for (let i = 0; i < list.length; i++) {
            const symbol = list[i];

            if (Array.isArray(symbol)) continue;

            if (isOperator(symbol.text, { priority })) return i;
        }

        return null;
    };

    // first operators, by priority
    let firstOperators = {
        2: firstOperator(2),
        1: firstOperator(1),
        0: firstOperator(0),
    };

    // refresh the first operators
    const computeFirstOperators = () => {
        firstOperators = {
            2: firstOperator(2),
            1: firstOperator(1),
            0: firstOperator(0),
        };
    };

    // handles an operation and mutates the list
    const handleOperatorAt = (index: number) => {
        const leftIndex = index - 1;
        const operatorIndex = index;
        const rightIndex = index + 1;

        const left = list[leftIndex] ?? null;
        const operator = list[index] as Term<"operator">;
        const right = list[rightIndex] ?? null;

        if (!left || !right) throw new Error("Misconstrued expression. Couldn't evaluate.");

        const leftValue = evaluate([left]);
        const rightValue = evaluate([right]);

        const result = getOperator(operator.text)!.operation(leftValue, rightValue);
        list[operatorIndex] = createTerm(result.toString());
        list.splice(leftIndex, 1);
        list.splice(rightIndex - 1, 1); // -1 because an element as already been removed.
    };

    // as long as we got operators to proceed:
    while (firstOperators[2] !== null || firstOperators[1] !== null || firstOperators[0] !== null) {
        if (firstOperators[2]) {
            handleOperatorAt(firstOperators[2]);
        } else if (firstOperators[1]) {
            handleOperatorAt(firstOperators[1]);
        } else if (firstOperators[0]) {
            handleOperatorAt(firstOperators[0]);
        }

        computeFirstOperators();
    }

    return (list[0] as Term<"number">).data.value;
}
