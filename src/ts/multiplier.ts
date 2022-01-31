export type Multiplier = {
    [x: string]: number;
};

export function createMultiplierObject() {
    return {};
}

export function incrementFactor(multiplier: Multiplier, factor: string, value = 1) {
    if (!multiplier[factor]) multiplier[factor] = 0;

    multiplier[factor] += value;
}

export function decrementFactor(multiplier: Multiplier, factor: string, value = 1) {
    incrementFactor(multiplier, factor, value * -1);
}

export function setFactor(multiplier: Multiplier, factor: string, value: number) {
    multiplier[factor] = value;
}

export function getMultiplierValue(multiplier: Multiplier, factor: string) {
    return multiplier[factor] ?? 0;
}

export function stringifyMultiplier(multiplier: Multiplier) {
    return Object.keys(multiplier)
        .sort()
        .reduce((previous, letter) => {
            const value = multiplier[letter]!;

            // value is zero -> empty string
            // value is one -> just the letter
            // others -> letter^value
            const valueAsString = !value ? "" : value === 1 ? letter : `${letter}^${value}`;

            return `${previous}${valueAsString}`;
        }, "");
}

export function sameMultiplier(a: Multiplier, b: Multiplier) {
    return stringifyMultiplier(a) === stringifyMultiplier(b);
}

export function mergeMultipliers(...multipliers: Multiplier[]) {
    const result = {};

    multipliers.forEach(multiplier => {
        Object.keys(multiplier).forEach(key => {
            incrementFactor(result, key, multiplier[key]);
        })
    })

    return result;
}

export function subtractMultipliers(a: Multiplier, b: Multiplier) {
    const result = Object.assign({}, a);

    Object.keys(b).forEach(key => {
        decrementFactor(result, key, b[key]);
    })

    return result;
}