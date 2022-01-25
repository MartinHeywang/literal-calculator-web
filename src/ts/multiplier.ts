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

export function getMultiplierValue(multiplier: Multiplier, factor: string) {
    return multiplier[factor] ?? 0;
}

export function multiplierToString(multiplier: Multiplier) {
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
