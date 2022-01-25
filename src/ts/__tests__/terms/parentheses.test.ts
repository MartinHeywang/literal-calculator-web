import { isParenthesis } from "../../terms/parenthesis";

describe("is parenthesis", () => {
    test("opening parenthesis", () => {
        const input = "(";

        expect(isParenthesis(input)).toBe(true);
    });

    test("closing parenthesis", () => {
        const input = ")";

        expect(isParenthesis(input)).toBe(true);
    });

    test("opening bracket", () => {
        const input = "[";

        expect(isParenthesis(input)).toBe(true);
    });

    test("closing bracket", () => {
        const input = "]";

        expect(isParenthesis(input)).toBe(true);
    });

    test("equal sign??", () => {
        const input = "=";

        expect(isParenthesis(input)).toBe(false);
    });
});

describe("is opening parenthesis", () => {
    test("opening parenthesis", () => {
        const input = "(";

        expect(isParenthesis(input, { includeClosings: false })).toBe(true);
    });

    test("opening bracket", () => {
        const input = "[";

        expect(isParenthesis(input, { includeClosings: false })).toBe(true);
    });

    test("closing parenthesis", () => {
        const input = ")";

        expect(isParenthesis(input, { includeClosings: false })).toBe(false);
    });
});

describe("is closing parenthesis", () => {
    test("closing parenthesis", () => {
        const input = ")";

        expect(isParenthesis(input, { includeOpenings: false })).toBe(true);
    });

    test("closing bracket", () => {
        const input = "]";

        expect(isParenthesis(input, { includeOpenings: false })).toBe(true);
    });

    test("opening parenthesis", () => {
        const input = "(";

        expect(isParenthesis(input, { includeOpenings: false })).toBe(false);
    });
});
