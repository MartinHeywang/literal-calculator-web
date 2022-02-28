import { createExpression, reduce, stringifyExpression } from "./expression";

// "e" is a shorthand for elements
const e = {
    def: {
        function: document.querySelector<HTMLSpanElement>("#function-def")!,
        a: document.querySelector<HTMLSpanElement>("#a-def")!
    },
    compute: document.querySelector<HTMLButtonElement>("#compute")!
}

e.compute.addEventListener("click", () => {
    const textDef = e.def.function.textContent || "";
    // const abscissa = parseFloat(e.def.a.textContent || "1");

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
})