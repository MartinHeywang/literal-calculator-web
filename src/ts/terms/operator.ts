export const operators = {
    sum: {
        priority: 0,
        symbol: "+",
    },
    difference: {
        priority: 0,
        symbol: "-",
    },
    product: {
        priority: 1,
        symbol: "*",
    },
    quotient: {
        priority: 1,
        symbol: "/",
    },
    power: {
        priority: 2,
        symbol: "^",
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
export function isOperator(symbol: string) {
    if (!symbol || symbol.length !== 1) return false;
    if (Object.keys(operators).some(key => operators[key as OperatorName].symbol === symbol))
        return true;

    return false;
}

export function getOperatorName(symbol: string) {

    const keys = Object.keys(operators);

    return keys.find(key => {
        const operator = operators[key as OperatorName];
        
        return operator.symbol === symbol
    }) ?? null;
}

export function getOperatorPriority(symbol: string) {
    const key = Object.keys(operators).find(key => {
        const operator = operators[key as OperatorName];

        return operator.symbol === symbol;
    }) as OperatorName ?? null;

    return operators[key].priority;
}