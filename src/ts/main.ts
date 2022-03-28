import { createExpression, reduce, stringifyExpression } from "./expression";

// "e" is a shorthand for elements
const e = {
    def: {
        function: document.querySelector<HTMLSpanElement>("#function-def")!,
        a: document.querySelector<HTMLSpanElement>("#a-def")!,
    },
    result: {
        p: document.querySelector<HTMLParagraphElement>(".result__paragraph")!,
        issue: document.querySelector<HTMLAnchorElement>(".result__issue")!,
        copy: document.querySelector<HTMLAnchorElement>(".result__copy")!,
        copyAnswer: document.querySelector<HTMLAnchorElement>(".result__copy-answer")!,
        links: document.querySelector<HTMLDivElement>(".result__links")!
    },
    compute: document.querySelector<HTMLButtonElement>("#compute")!,
};

function action() {
    const textDef = e.def.function.textContent || "";

    const summaryStr = (str: string, length = 35) =>
        str.length <= length ? str : str.slice(0, length) + "...";

    try {
        const def = createExpression(textDef);

        console.groupCollapsed("%cParsed", "color: orange; font-size: 1.2rem");
        console.log(def);
        console.log(stringifyExpression(def));
        console.groupEnd();

        const reduced = reduce(def);

        console.group("%cReduced", "color: yellow; font-size: 1.2rem");
        console.log(reduced);
        console.log(stringifyExpression(reduced));
        console.groupEnd();

        const issueTitle = `Unexpected result when reducing: '${summaryStr(textDef)}'`;
        const issueBody = `${issueTitle}\n\nInput: '${textDef}'\nCurrent output: ${stringifyExpression(
            reduced
        )}\nExpected output: please complete here`;

        e.result.p.textContent = `${textDef} = ${stringifyExpression(reduced)}`;
        e.result.issue.href = `https://github.com/martinheywang/literal-calculator-web/issues/new?title=${encodeURIComponent(
            issueTitle
        )}&body=${encodeURIComponent(issueBody)}`;

        e.result.copyAnswer.style.display = "unset";
        e.result.copyAnswer.onclick = () => navigator.clipboard.writeText(stringifyExpression(reduced));

    } catch (err: any) {
        const message: string = err.message;
        const issueTitle = `Error when reducing: '${summaryStr(textDef)}'`;
        const issueBody = `${issueTitle}\n\nInput: '${textDef}'\nMessage: "${message}"`;

        e.result.p.textContent = `Error: "${message}"`;
        e.result.issue.href = `https://github.com/martinheywang/literal-calculator-web/issues/new?title=${encodeURIComponent(
            issueTitle
        )}&body=${encodeURIComponent(issueBody)}`;
        e.result.copyAnswer.style.display = "none";

        console.log(err);
    }

    e.result.links.style.display = "flex";
}

e.compute.addEventListener("click", action);

const params = new URLSearchParams(location.search);
const expression = decodeURIComponent(params.get("expression") || "");

if(expression) {
    e.def.function.textContent = expression;
    action();
}

e.result.copy.addEventListener("click", copyURL)

function copyURL() {
    const url = `${location.origin}${location.pathname}?expression=${encodeURIComponent(e.def.function.textContent || "")}`
    navigator.clipboard.writeText(url)
}