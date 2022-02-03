import { createTerm, Term } from "../../terms/terms";

describe("create-term", () => {
    test("digit", () => {
        const input = "-2";

        const output = createTerm(input);

        const expected: Term<"number"> = {
            type: "number",

            data: {
                value: -2,
                multiplier: {}
            }
        }

        expect(output).toStrictEqual(expected)
    });

    test("letter", () => {
        const input = "-x";

        const output = createTerm(input);

        const expected: Term<"number"> = {
            type: "number",

            data: {
                value: -1,
                multiplier: {
                    x: 1
                }
            }
        }

        expect(output).toStrictEqual(expected)
    });

    test("operator", () => {
        const input = "*";

        const output = createTerm(input);

        const expected: Term<"operator"> = {
            type: "operator",

            data: {
                priority: 1,
                name: "product"
            }
        }

        expect(output).toStrictEqual(expected)
    });

    test("parentheses", () => {
        const input = "[";

        const output = createTerm(input);

        const expected: Term<"parenthesis"> = {
            type: "parenthesis",

            data: {
                direction: "opening",
                type: "bracket"
            }
        }

        expect(output).toStrictEqual(expected)
    });

    test("invalid", () => {
        const input = "3xa-";

        expect(() => {
            console.log(createTerm(input))
        }).toThrow(input); // means that the error message should contain the input string
    });
});
