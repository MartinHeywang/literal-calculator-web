import { minify, list, arrange } from "./format";
import { setFactor } from "./multiplier";
import { NumberData, stringifyNumber } from "./terms/number";
import { getOperator, isOperator, operators, stringifyOperator } from "./terms/operator";
import { isParenthesis, stringifyParenthesis } from "./terms/parenthesis";
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
        const term = list[i];

        // every nested symbol will be structured recursively
        if (nesting !== 0) cache.push(term);

        if (isParenthesis(stringifyTerm(term), { includeClosings: false })) {
            nesting++;

            // if nesting equals 1, then it was at zero and has not been added before;
            // the opening parenthesis needs to be added to the cache.
            if (nesting === 1) cache.push(term);
        } else if (isParenthesis(stringifyTerm(term), { includeOpenings: false })) {
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

        if (nesting === 0) result.push(term);
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

    throw new Error("Can't stringify term with wrong type.")
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
            // go deeper
            return isKnown(element);
        }

        if (isOperator(element) || isParenthesis(element)) return true;

        // empty multiplier
        return Object.keys((element as Term<"number">).data.multiplier).length === 0;
    });
}

export function handleKnown(expression: Expression) {
    const result = [];

    for (let i = 0; i < expression.length; i++) {
        const current = expression[i];

        if (Array.isArray(current)) {
            try {
                result.push(evaluate(current));
            } catch {
                // couldn't evaluate, dig deeper
                result.push(handleKnown(current));
            }
            continue;
        }

        result.push(current);
    }
}

export function handlePowers(expression: Expression) {
    const result: Expression = [];

    const popLastResult = () => result.pop();

    for (let i = 0; i < expression.length; i++) {
        const symbol = expression[i];

        const skipNextIteration = () => i++;

        // recursively search through parentheses as well
        if (Array.isArray(symbol)) {
            result.push(handlePowers(symbol));
            continue;
        }

        // not a power? i don't care
        if (stringifyTerm(symbol) !== operators.power.symbol) {
            result.push(symbol);
            continue;
        }

        const raised = expression[i - 1]!;
        const power = expression[i + 1]!;

        const isRaisedKnown = isKnown([raised]);
        const isPowerKnown = isKnown([power]);

        // power is unknown, just isolate
        // 2^n --> [2^n]
        // x^n --> [x^n]
        if (!isPowerKnown) {
            popLastResult();
            result.push(frozenExpression([raised, symbol, power]));
            skipNextIteration();
            continue;
        }

        // raised is unknown (but power is)
        // a^2
        // (48a + 5)^5

        if (!isRaisedKnown) {
            const powerValue = evaluate([power]);

            // a^2 --> updated multiplier
            if (!Array.isArray(raised)) {
                // change the value of the multiplier
                setFactor((raised as Term<"number">).data.multiplier, stringifyTerm(raised), powerValue);
                skipNextIteration();
                continue;
            }

            // raised it too complex, isolate
            // (48a + 5)^5 --> [(48a + 5)^5]

            popLastResult();
            result.push(frozenExpression([raised, symbol, power]));
            skipNextIteration();
            continue;
        }

        // both power and raised are known
        // 2^2 --> 4
        // 3^2 --> 9

        popLastResult();
        result.push(createTerm(evaluate([raised, symbol, power]).toString()));
        skipNextIteration();
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

    const findOperators = () => ({
        2: findOperator(list, { priority: 2 }),
        1: findOperator(list, { priority: 1 }),
        0: findOperator(list, { priority: 0 }),
    });

    // first operators, by priority
    let firstOperators = findOperators();

    const operatorsLeft = () => {
        firstOperators = findOperators();
        return firstOperators[2] !== null || firstOperators[1] !== null || firstOperators[0] !== null;
    };

    // handles an operation and mutates the list
    const handleOperatorAt = (index: number) => {
        const leftIndex = index - 1;
        const operatorIndex = index;
        const rightIndex = index + 1;

        const left = list[leftIndex] ?? null;
        const operator = list[index] as Term<"operator">;
        const right = list[rightIndex] ?? null;

        // an operator needs a value before and after it
        if (!left || !right) throw new Error("Misconstructed expression. Couldn't evaluate.");

        const leftValue = evaluate([left]);
        const rightValue = evaluate([right]);

        const result = getOperator(stringifyTerm(operator))!.operation(
            createTerm(leftValue.toString()) as Term<"number">,
            createTerm(rightValue.toString()) as Term<"number">
        );
        list[leftIndex] = result;
        list.splice(operatorIndex, 2);
    };

    while (operatorsLeft()) {
        if (firstOperators[2]) {
            handleOperatorAt(firstOperators[2]);
        } else if (firstOperators[1]) {
            handleOperatorAt(firstOperators[1]);
        } else if (firstOperators[0]) {
            handleOperatorAt(firstOperators[0]);
        }
    }

    return (list[0] as Term<"number">).data.value;
}

/**
 * Freezes an expression so it can't be changed anymore.
 * Useful to tell some operations not to dig to deep in this expression (parentheses)
 *
 * @param terms the expression to be frozen
 * @returns the frozen expression
 */
export function frozenExpression(terms: Expression): Expression {
    // here we are mismatching a mutable Expression with a readonly Expression. (return type annotation)

    // at runtime the array WILL be readonly
    // but to TypeScript's eyes it will be mutable

    // because of a TypeScript bug I prefer for now to do it like that.
    // consider this code :

    // Array.isArray(term) return;
    // this guard clause is preventing 'term' to be an array
    // now if the type of term "readonly Array", TypeScript would still be in doubt

    // "Array.isArray" is the way I check if a term is an array or not.
    // and adding casts everywhere is annoying

    // @ts-expect-error --> ts(4104)
    return Object.freeze(terms);
}

/**
 * Finds the first operator in the expression that matches the criteria.
 *
 * @param expression the expression to search through
 * @param options the criteria if needed
 * @returns the index of the first operator, or null if none were found.
 */
export function findOperator(expression: Expression, options?: { priority: number }) {
    for (let i = 0; i < expression.length; i++) {
        const term = expression[i];

        if (Array.isArray(term)) continue;

        if (isOperator(stringifyTerm(term), { priority: options?.priority })) return i;
    }

    return null;
}
