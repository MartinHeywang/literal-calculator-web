import { orderCheck, parenthesesCheck, regexCheck } from "../verify";

describe("regex", () => {
    test("empty", () => {
        const input = "";

        expect(regexCheck(input)).toBe(false);
    });

    test("basic digit", () => {
        const input = "2";

        expect(regexCheck(input)).toBe(true);
    });

    test("basic letter", () => {
        const input = "x";

        expect(regexCheck(input)).toBe(true);
    });

    test("basic number", () => {
        const input = "2x";

        expect(regexCheck(input)).toBe(true);
    });

    test("negative number", () => {
        const input = "-2x";

        expect(regexCheck(input)).toBe(true);
    });

    test("unsigned float", () => {
        const input = "0.5x";

        expect(regexCheck(input)).toBe(true);
    });

    test("complex expression", () => {
        const input = "48x+35x^2(3+45x)/(h+2)";

        expect(regexCheck(input)).toBe(true);
    });
});

describe("parentheses", () => {
    test("single pair of parentheses", () => {
        const input = ["48", "x", "*", "(", "4", "x", "+", "3", ")"];

        expect(parenthesesCheck(input)).toBe(true);
    });

    test("single pair of brackets", () => {
        const input = ["48", "x", "*", "[", "4", "x", "+", "3", "]"];

        expect(parenthesesCheck(input)).toBe(true);
    });

    test("mix of parentheses and brackets", () => {
        const input = ["48", "x", "*", "[", "4", "x", "+", "3", "]", "/", "(", "h", "+", "2", ")"];

        expect(parenthesesCheck(input)).toBe(true);
    })

    test("unclosed parentheses", () => {
        const input = ["48", "x", "("]

        expect(parenthesesCheck(input)).toBe(false);
    })

    test("closing parenthesis before opening one", () => {
        const input = ["48", ")", "x", "("]

        expect(parenthesesCheck(input)).toBe(false);
    })
});

describe("order", () => {
    test("logical order", () => {
        const input = ["-3", "x",  "+",  "48", "(", "x",  "-",  "56", ")",  "/",  "(", "h",  "+",  "2", ")"];

        expect(orderCheck(input)).toBe(true);
    })

    test("negative number at the beginning", () => {
        const input = ["-3", "x"];

        expect(orderCheck(input)).toBe(true);
    })

    test("operator at the beginning", () => {
        const input = ["+", "3"];

        expect(orderCheck(input)).toBe(false);
    })
    
    test("operator at the end", () => {
        const input = ["3", "*"];
        
        expect(orderCheck(input)).toBe(false);
    })

    test("two operators in a row", () => {
        const input = ["3", "+", "^", "2"];

        expect(orderCheck(input)).toBe(false);
    })

    test("digit directly after letter", () => {
        const input = ["3", "x", "5"];

        expect(orderCheck(input)).toBe(false);
    })
})
