import { createMultiplierObject, getMultiplierValue, incrementFactor, multiplierToString } from "../multiplier";

describe("creation", () => {
    test("creates empty object", () => {
        expect(createMultiplierObject()).toStrictEqual({});
    })
})

describe("increment", () => {
    test("by default amount on existing letter", () => {
        const multiplier = {
            x: 1
        }

        incrementFactor(multiplier, "x");

        expect(multiplier).toStrictEqual({
            x: 2
        });
    })

    test("by default amount on non-existing letter", () => {
        const multiplier = {}

        incrementFactor(multiplier, "x");

        expect(multiplier).toStrictEqual({
            x: 1
        });
    })

    test("by given amount", () => {
        const multiplier = {};

        incrementFactor(multiplier, "x", 2);

        expect(multiplier).toStrictEqual({
            x: 2
        })
    })
})

describe("get-value", () => {
    test("existing value", () => {
        const multiplier = {
            x: 6
        }

        expect(getMultiplierValue(multiplier, "x")).toBe(6)
    })

    test("non-existing value", () => {
        const multiplier = {};

        expect(getMultiplierValue(multiplier, "x")).toBe(0);
    })
})

describe("to-string", () => {
    test("empty multiplier", () => {
        const multiplier = {

        }

        expect(multiplierToString(multiplier)).toBe("");
    })

    test("basic multiplier", () => {
        const multiplier = {
            x: 2
        }

        expect(multiplierToString(multiplier)).toBe("x^2");
    })

    test("complex multiplier", () => {
        const multiplier = {
            x: 1,
            a: 3,
            k: 8,
            z: 2,
            b: 3
        }

        expect(multiplierToString(multiplier)).toBe("a^3b^3k^8xz^2");
    })
})