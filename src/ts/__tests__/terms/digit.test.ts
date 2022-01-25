import { isDigit } from "../../terms/digit";

describe("is digit", () => {
    test("basic digit", () => {
        const input = "5";

        expect(isDigit(input)).toBe(true);
    })

    test("basic letter", () => {
        const input = "x";

        expect(isDigit(input)).toBe(false);
    })

    test("negative number", () => {
        const input = "-2";

        expect(isDigit(input)).toBe(true);
    })

    test("decimal number", () => {
        const input = "0.5";

        expect(isDigit(input)).toBe(true);
    })

    test("complex digit", () => {
        const input = "-546.245326";

        expect(isDigit(input)).toBe(true);
    })
});