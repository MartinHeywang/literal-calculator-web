import { extractMultiplier, extractValue, isNumber } from "../../terms/number";

describe("is number", () => {
    test("basic digit", () => {
        const input = "5";

        expect(isNumber(input)).toBe(true);
    });

    test("basic letter", () => {
        const input = "x";

        expect(isNumber(input)).toBe(true);
    });

    test("basic letter and number", () => {
        const input = "5x";

        expect(isNumber(input)).toBe(true);
    });

    test("negative number", () => {
        const input = "-2";

        expect(isNumber(input)).toBe(true);
    });

    test("decimal number", () => {
        const input = "0.5";

        expect(isNumber(input)).toBe(true);
    });

    test("complex digit", () => {
        const input = "-345.238xs";

        expect(isNumber(input)).toBe(true);
    });
});

describe("extract value", () => {
    test("digit", () => {
        const input = "2";

        const output = extractValue(input);

        expect(output).toBe(2);
    });

    test("letter", () => {
        const input = "-x";

        const output = extractValue(input);

        expect(output).toBe(-1);
    });

    test("number", () => {
        const input = "-3h";

        const output = extractValue(input);

        expect(output).toBe(-3);
    });
});

describe("extract multiplier", () => {
    test("digit", () => {
        const input = "2";

        const output = extractMultiplier(input);

        expect(output).toStrictEqual({});
    });

    test("letter", () => {
        const input = "-x";

        const output = extractMultiplier(input);

        expect(output).toStrictEqual({ x: 1 });
    });

    test("number", () => {
        const input = "-3h";

        const output = extractMultiplier(input);

        expect(output).toStrictEqual({ h: 1 });
    });
});
