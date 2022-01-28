import { minify, list, arrange } from "../format";

describe("minify", () => {
    test("already minified expression", () => {
        const input = "2x";

        const output = minify(input);

        expect(output).toBe("2x");
    });

    test("simple expression", () => {
        const input = "    2  x     ";

        const output = minify(input);

        expect(output).toBe("2x");
    });

    test("complex expression", () => {
        const input = "46   x  (5 ^     2 + 3 *   7 - 48     )   / (2 + h)";

        const output = minify(input);

        expect(output).toBe("46x(5^2+3*7-48)/(2+h)");
    });
});

describe("list", () => {
    test("simple expression", () => {
        const input = "2x";
        const output = list(input);

        expect(output).toStrictEqual(["2", "x"]);
    });

    test("complex expression", () => {
        const input = "48^2 + 5(53x + 2)";

        const output = list(input);

        expect(output).toStrictEqual(["48", "^", "2", "+", "5", "(", "53", "x", "+", "2", ")"])
    })

    test("negative letter at the beginning", () => {
        const input = "-x";

        const output = list(input);

        expect(output).toStrictEqual(["-x"]);
    })

    test("minus sign before a parenthesis (beginning)", () => {
        const input = "- (3x + 2)";

        const output = list(input);

        expect(output).toStrictEqual(["-", "(", "3", "x", "+", "2", ")"]);
    })
})

describe("arrange", () => {
    test("implicit multiplication, simple", () => {
        const input = ["2", "x"];

        const output = arrange(input);

        expect(output).toStrictEqual(["2", "*", "x"]);
    })

    test("implicit multiplication, complex", () => {
        const input = ["5", "(", "3", "x", "+", "5", ")"];

        const output = arrange(input);

        expect(output).toStrictEqual(["5", "*", "(", "3", "*", "x", "+", "5", ")"]);
    })

    test("empty parentheses, simple", () => {
        const input = ["(", ")", "5"];

        const output = arrange(input);

        expect(output).toStrictEqual(["5"]);
    })

    test("empty parentheses, simple", () => {
        const input = ["(", ")", "5", "*", "(", "3", "*", "x", "+", "5", "(", ")", ")"];

        const output = arrange(input);

        expect(output).toStrictEqual(["5", "*", "(", "3", "*", "x", "+", "5", ")"]);
    })

    test("both, complex", () => {
        const input = ["(", ")", "5", "(", ")", "(", "3", "x", "+", "5", "(", ")", ")", "(", ")"];

        const output = arrange(input);

        expect(output).toStrictEqual(["5", "*", "(", "3", "*", "x", "+", "5", ")"]);
    })
})