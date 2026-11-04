// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { collectElements } from "./doHover.js";

/**
 * A line the way the editor renders a decorated reference: the badge widget, the buffer the editor
 * puts after a widget, and the reference text wrapped in the nested spans of the semantic token
 * and the hover highlight.
 */
function renderLine(): HTMLElement {
    const line = document.createElement("div");
    line.className = "cm-line";
    line.innerHTML =
        '<span class="maql-semantic-keyword">SELECT</span> SUM(' +
        '<span class="decorator metric" contenteditable="false"> Metric </span>' +
        '<img class="cm-widgetBuffer" aria-hidden="true">' +
        '<span class="maql-semantic-metric"><span class="hovered-decorator">' +
        '<span class="decorator-item metric">{metric/test}</span></span></span>)';
    document.body.appendChild(line);
    return line;
}

describe("collectElements", () => {
    it("collects the badge and the text of the reference from its text span", () => {
        const line = renderLine();
        const text = line.querySelector<HTMLElement>(".decorator-item")!;

        expect(collectElements(text).map((el) => el.className)).toEqual([
            "decorator metric",
            "decorator-item metric",
        ]);
    });

    it("collects the badge and the text of the reference from its badge", () => {
        const line = renderLine();
        const badge = line.querySelector<HTMLElement>(".decorator")!;

        expect(collectElements(badge).map((el) => el.className)).toEqual([
            "decorator metric",
            "decorator-item metric",
        ]);
    });

    it("finds nothing for plain text", () => {
        const line = renderLine();
        const keyword = line.querySelector<HTMLElement>(".maql-semantic-keyword")!;

        expect(collectElements(keyword)).toEqual([]);
    });
});
