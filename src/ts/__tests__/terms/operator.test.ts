import { isOperator } from "../../terms/operator";

describe("is operator", () => {
    test("plus", () => {
        const input = "+";

        expect(isOperator(input)).toBe(true);
    })

    test("minus", () => {
        const input = "-";

        expect(isOperator(input)).toBe(true);
    })

    test("times", () => {
        const input = "*";

        expect(isOperator(input)).toBe(true);
    })

    test("divide", () => {
        const input = "/";

        expect(isOperator(input)).toBe(true);
    })

    test("power", () => {
        const input = "^";

        expect(isOperator(input)).toBe(true);
    })

    test("equal", () => {
        const input = "=";

        expect(isOperator(input)).toBe(false);
    })

    test("digit", () => {
        const input = "2";

        expect(isOperator(input)).toBe(false);
    })

    test("letter", () => {
        const input = "x";

        expect(isOperator(input)).toBe(false);
    })

    test("number", () => {
        const input = "2x";

        expect(isOperator(input)).toBe(false);
    })
});