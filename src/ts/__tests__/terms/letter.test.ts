import { isLetter } from "../../terms/letter";

describe("is letter", () => {
    test("basic digit", () => {
        const input = "5";

        expect(isLetter(input)).toBe(false);
    });

    test("basic letter", () => {
        const input = "x";

        expect(isLetter(input)).toBe(true);
    });

    test("negative number", () => {
        const input = "-x";

        expect(isLetter(input)).toBe(true);
    });
});
