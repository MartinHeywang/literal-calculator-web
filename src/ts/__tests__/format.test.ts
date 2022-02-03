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
    describe("implicit multiplication", () => {
        test("simple number", () => {
            const input = ["2", "x"];
    
            const output = arrange(input);
    
            expect(output).toStrictEqual(["2", "*", "x"]);
        })
    
        test("complex expression", () => {
            const input = ["5", "(", "3", "x", "+", "5", ")"];
    
            const output = arrange(input);
    
            expect(output).toStrictEqual(["5", "*", "(", "3", "*", "x", "+", "5", ")"]);
        })
    })
    
    describe("remove parentheses", () => {
        test("basic example", () => {
            const input = ["(", ")", "5"];
    
            const output = arrange(input);
    
            expect(output).toStrictEqual(["5"]);
        })
    
        test("complex expression", () => {
            const input = ["(", ")", "5", "*", "(", "3", "*", "x", "+", "5", "(", ")", ")"];
    
            const output = arrange(input);
    
            expect(output).toStrictEqual(["5", "*", "(", "3", "*", "x", "+", "5", ")"]);
        })
    })

    describe("sign at the beginning", () => {

        test("before a number", () => {
            const input = ["-", "5", "*", "3"];

            const output = arrange(input);

            expect(output).toStrictEqual(["-5", "*", "3"]);
        })
        
        test("before a parenthesis", () => {
            const input = ["-", "(", "48", "*", "a", "+", "5", ")"]

            const output = arrange(input);

            expect(output).toStrictEqual(["0", "-", "(", "48", "*", "a", "+", "5", ")"]);
        })
    })
    
    describe("mix", () => {
        test("complex expression", () => {
            const input = ["-", "(", ")", "5", "(", ")", "(", "3", "x", "+", "5", "(", ")", ")", "(", ")"];
    
            const output = arrange(input);

            expect(output).toStrictEqual(["-5", "*", "(", "3", "*", "x", "+", "5", ")"]);
        })
    })
})