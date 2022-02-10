import { createExpression, evaluate, findOperator, handlePowers, isKnown } from "../expression";
import { Term } from "../terms/terms";

describe("is known", () => {
    test("basic known", () => {
        const input = createExpression("54 + 3 * 2");

        expect(isKnown(input)).toBe(true);
    });

    test("basic unknown", () => {
        const input = createExpression("2x");

        expect(isKnown(input)).toBe(false);
    });

    test("complex known", () => {
        const input = createExpression("2 (46 + 5 ()) - 5");

        expect(isKnown(input)).toBe(true);
    });

    test("complex unknown", () => {
        const input = createExpression("2 (46x^2 + 3x - 50) + 3y");

        expect(isKnown(input)).toBe(false);
    });
});

describe("handle powers", () => {
    test("nothing to do", () => {
        const input = createExpression("2x (4 + 3x)");

        const output = handlePowers(input);

        expect(output).toStrictEqual(input);
    });

    test("known raised / known power", () => {
        const input = createExpression("2x (4^2 + 3x)");

        const output = handlePowers(input);

        const expected = createExpression("2x (16 + 3x)");

        expect(output).toStrictEqual(expected);
    });

    test("simple unknown raised / known power", () => {
        const base = "2 * x^2 - 4x + 3";
        const input = createExpression(base);

        const output = handlePowers(input);

        let expected = createExpression(base);
        // make the expected edits
        (expected[2] as Number).data.multiplier = { x: 2 };
        expected.splice(3, 2);

        expect(output).toStrictEqual(expected);
    });

    test("complex unknown raised / known power", () => {
        const base = "(4a + 5)^2 - 4x + 3";
        const input = createExpression(base);

        const output = handlePowers(input);

        let expected = createExpression(base);
        // make the expected edits
        expected[0] = [expected[0], expected[1], expected[2]];
        expected.splice(1, 2);

        expect(output).toStrictEqual(expected);
    });

    test("known raised / unknown power", () => {
        const base = "2^n + 3x";
        const input = createExpression(base);

        const output = handlePowers(input);

        let expected = createExpression(base);
        expected[0] = [expected[0], expected[1], expected[2]];
        expected.splice(1, 2);

        expect(output).toStrictEqual(expected);
    });

    test("unknown raised / unknown power", () => {
        const base = "x^n + 5x";
        const input = createExpression(base);

        const output = handlePowers(input);

        let expected = createExpression(base);
        expected[0] = [expected[0], expected[1], expected[2]];
        expected.splice(1, 2);

        expect(output).toStrictEqual(expected);
    });
});

describe("evaluate", () => {
    test("number", () => {
        const input = createExpression("42");

        expect(evaluate(input)).toBe(42);
    });

    test("letter", () => {
        const input = createExpression("-x");

        expect(() => {
            evaluate(input);
        }).toThrowError();
    });

    test("expression", () => {
        const input = createExpression("(34 + 5)^2 * 3 + 2 * 4");

        expect(evaluate(input)).toBe(4571);
    });
});

describe("find operator", () => {
    test("w/o criteria", () => {
        const input = createExpression("2x + 3");

        const output = findOperator(input);

        // remember the implicit multiplication between "2" and "x"
        expect(output).toBe(1);
    })

    test("priority 1", () => {
        const input = createExpression("2 + 3x");

        const output = findOperator(input, {priority: 1});

        // remember the implicit multiplication between "2" and "x"
        expect(output).toBe(3);
    })
    test("priority 2", () => {
        const input = createExpression("2 + 3x^2");

        const output = findOperator(input, {priority: 2});

        // remember the implicit multiplication between "2" and "x"
        expect(output).toBe(5);
    })

    test("null", () => {
        const input = createExpression("666");

        const output = findOperator(input);

        expect(output).toBeNull();
    })
})