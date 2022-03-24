import { createExpression, reduce, stringifyExpression } from "./expression";

// "e" is a shorthand for elements
const e = {
    def: {
        function: document.querySelector<HTMLSpanElement>("#function-def")!,
        a: document.querySelector<HTMLSpanElement>("#a-def")!
    },
    result: {
        p: document.querySelector<HTMLParagraphElement>(".result__paragraph")!,
    },
    compute: document.querySelector<HTMLButtonElement>("#compute")!
}

e.compute.addEventListener("click", () => {
    const textDef = e.def.function.textContent || "";

    try {
        const def = createExpression(textDef);
        const reduced = reduce(def);

        console.groupCollapsed("%cParsed", "color: orange; font-size: 1.2rem");
        console.log(def)
        console.log(stringifyExpression(def))
        console.groupEnd();
        
        console.group("%cReduced", "color: yellow; font-size: 1.2rem")
        console.log(reduced);
        console.log(stringifyExpression(reduced));
        console.groupEnd();

        e.result.p.textContent = `${textDef} = ${stringifyExpression(reduced)}`
    } catch (err) {
        e.result.p.textContent = "An error occurred. Double-check the input literal expression.";

        console.log(err);
    }

})