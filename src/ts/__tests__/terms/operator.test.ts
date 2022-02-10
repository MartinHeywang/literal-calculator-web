import { isOperator, operators } from "../../terms/operator";
import { createTerm } from "../../terms/terms";

import { Number } from "../../terms/number";

describe("is operator", () => {
    test("plus", () => {
        const input = "+";

        expect(isOperator(input)).toBe(true);
    });

    test("minus", () => {
        const input = "-";

        expect(isOperator(input)).toBe(true);
    });

    test("times", () => {
        const input = "*";

        expect(isOperator(input)).toBe(true);
    });

    test("divide", () => {
        const input = "/";

        expect(isOperator(input)).toBe(true);
    });

    test("power", () => {
        const input = "^";

        expect(isOperator(input)).toBe(true);
    });

    test("equal", () => {
        const input = "=";

        expect(isOperator(input)).toBe(false);
    });

    test("digit", () => {
        const input = "2";

        expect(isOperator(input)).toBe(false);
    });

    test("letter", () => {
        const input = "x";

        expect(isOperator(input)).toBe(false);
    });

    test("number", () => {
        const input = "2x";

        expect(isOperator(input)).toBe(false);
    });
});

describe("operations", () => {
    describe("sum", () => {
        test("all known", () => {
            const left = createTerm<Number>("8");
            const right = createTerm<Number>("367");

            const output = operators.sum.operation(left, right);

            expect(output).toStrictEqual(createTerm("375"));
        });

        test("unknown, same multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("367x");

            const output = operators.sum.operation(left, right);

            expect(output).toStrictEqual(createTerm("375x"));
        });

        test("unknown, different multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("367y");

            const output = operators.sum.operation(left, right);

            expect(output).toStrictEqual([left, createTerm("+"), right]);
        });
    });

    describe("difference", () => {
        test("all known", () => {
            const left = createTerm<Number>("8");
            const right = createTerm<Number>("48");

            const output = operators.difference.operation(left, right);

            expect(output).toStrictEqual(createTerm("-40"));
        });

        test("unknown, same multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("367x");

            const output = operators.difference.operation(left, right);

            expect(output).toStrictEqual(createTerm("-359x"));
        });

        test("unknown, different multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("367y");

            const output = operators.difference.operation(left, right);

            expect(output).toStrictEqual([left, createTerm("-"), right]);
        });
    });

    describe("product", () => {
        test("all known", () => {
            const left = createTerm<Number>("8");
            const right = createTerm<Number>("6");

            const output = operators.product.operation(left, right);

            expect(output).toStrictEqual(createTerm("48"));
        });

        test("unknown, same multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("6x");

            const output = operators.product.operation(left, right);

            const expected = createTerm<Number>("48");
            expected.data.multiplier["x"] = 2;

            expect(output).toStrictEqual(expected);
        });

        test("unknown, different multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("6y");

            const output = operators.product.operation(left, right);

            expect(output).toStrictEqual(createTerm("48xy"));
        });
    });

    describe("quotient", () => {
        test("all known", () => {
            const left = createTerm<Number>("8");
            const right = createTerm<Number>("2");

            const output = operators.quotient.operation(left, right);

            expect(output).toStrictEqual(createTerm("4"));
        });

        test("unknown, different multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("2");

            const output = operators.quotient.operation(left, right);

            expect(output).toStrictEqual(createTerm("4x"));
        });

        test("unknown, same multiplier", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("2x");

            const output = operators.quotient.operation(left, right);

            expect(output).toStrictEqual(createTerm("4"));
        });

        test("unknown, division by zero", () => {
            const left = createTerm<Number>("8x");
            const right = createTerm<Number>("0");

            expect(() => {
                operators.quotient.operation(left, right);
            }).toThrowError();
        });
    });
});
