export const operators = {
    sum: {
        priority: 0,
        symbol: "+",
        operation: (a: number, b: number) => a + b,
    },
    difference: {
        priority: 0,
        symbol: "-",
        operation: (a: number, b: number) => a - b,
    },
    product: {
        priority: 1,
        symbol: "*",
        operation: (a: number, b: number) => a * b,
    },
    quotient: {
        priority: 1,
        symbol: "/",
        operation: (a: number, b: number) => a / b,
    },
    power: {
        priority: 2,
        symbol: "^",
        operation: (a: number, b: number) => Math.pow(a, b),
    },
};

export type OperatorData = {
    priority: number;
    name: string;
};

export type OperatorName = keyof typeof operators;

/**
 * Checks if the given char is one of the supported operators : + - * / ^
 *
 * @param symbol the character to be checked
 * @returns true or false based on the result
 */
export function isOperator(symbol: string, options?: { priority?: number }) {
    if (!symbol || symbol.length !== 1) return false;

    const name = getOperatorName(symbol) as OperatorName;
    if(name === null) return false; // not found

    // no priority specified, or matches
    if(options?.priority === undefined) return true;
    if(options.priority === operators[name].priority) return true;

    return false;
}

export function getOperatorName(symbol: string) {
    const keys = Object.keys(operators);

    return (
        keys.find(key => {
            const operator = operators[key as OperatorName];

            return operator.symbol === symbol;
        }) ?? null
    );
}

export function getOperator(symbol: string) {
    const name = getOperatorName(symbol) as OperatorName;
    if(name === null) return null;

    return operators[name];
}

export function getOperatorPriority(symbol: string) {
    const key =
        (Object.keys(operators).find(key => {
            const operator = operators[key as OperatorName];

            return operator.symbol === symbol;
        }) as OperatorName) ?? null;

    return operators[key].priority;
}
