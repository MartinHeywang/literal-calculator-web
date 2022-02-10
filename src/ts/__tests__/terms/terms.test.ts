import { createTerm } from "../../terms/terms";
import { Number } from "../../terms/number";
import { Operator } from "../../terms/operator";
import { Parenthesis } from "../../terms/parenthesis";

describe("create-term", () => {
    test("digit", () => {
        const input = "-2";

        const output = createTerm(input);

        const expected: Number = {
            type: "number",

            data: {
                value: -2,
                multiplier: {},
            },
        };

        expect(output).toStrictEqual(expected);
    });

    test("letter", () => {
        const input = "-x";

        const output = createTerm(input);

        const expected: Number = {
            type: "number",

            data: {
                value: -1,
                multiplier: {
                    x: 1,
                },
            },
        };

        expect(output).toStrictEqual(expected);
    });

    test("operator", () => {
        const input = "*";

        const output = createTerm(input);

        const expected: Operator = {
            type: "operator",

            data: {
                priority: 1,
                name: "product",
            },
        };

        expect(output).toStrictEqual(expected);
    });

    test("parentheses", () => {
        const input = "[";

        const output = createTerm(input);

        const expected: Parenthesis = {
            type: "parenthesis",

            data: {
                direction: "opening",
                type: "bracket",
            },
        };

        expect(output).toStrictEqual(expected);
    });

    test("invalid", () => {
        const input = "3xa-";

        expect(() => {
            createTerm(input);
        }).toThrow(input); // means that the error message should contain the input string
    });
});
