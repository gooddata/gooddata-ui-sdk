// (C) 2007-2025 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { removeFromDom } from "../../utils/domUtilities.js";
import { addCssToStylesheet } from "../addCssToStylesheet.js";

describe("addCssToStylesheet", () => {
    const sheets: HTMLElement[] = [];

    const getElements = (id: string): NodeListOf<HTMLElement> => document.querySelectorAll(`#${id}`);
    const getElement = (id: string): HTMLElement | null => document.querySelector(`#${id}`);

    afterEach(() => {
        sheets.forEach((sheet) => {
            const sheetNode = getElement(sheet.id);
            removeFromDom(sheetNode);
        });
    });

    it("should create stylesheet", () => {
        sheets.push(addCssToStylesheet("css-alpha", ""));

        const elements = getElements("css-alpha") as NodeListOf<HTMLStyleElement>;

        expect(elements.length).toEqual(1);
        expect(elements.item(0).type).toEqual("text/css");
    });

    it("should add css to new stylesheet", () => {
        sheets.push(addCssToStylesheet("css-beta", "body {background: red }"));
        sheets.push(addCssToStylesheet("css-beta", "html {padding: 10px; }"));

        expect(getElement("css-beta")).toHaveTextContent("body {background: red }html {padding: 10px; }");
    });

    it("should clear the stylesheet when asked", () => {
        sheets.push(addCssToStylesheet("css-delta", "body {background: pink }"));
        sheets.push(addCssToStylesheet("css-delta", "html {padding: 5px; }", true));

        expect(getElement("css-delta")).toHaveTextContent("html {padding: 5px; }");
    });
});
