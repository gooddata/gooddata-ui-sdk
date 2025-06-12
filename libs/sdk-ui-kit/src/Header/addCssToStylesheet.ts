// (C) 2007-2021 GoodData Corporation

import { removeFromDom } from "../utils/domUtilities.js";

/**
 * Appends CSS rules to existing stylesheet or creates it and appends to DOM first, if it does not exists.
 *
 * @param sheetId - ID of the stylesheet (<style> element in the DOM document).
 * @param rules - string with stylesheet rules, for example `html {border: 3px dotted black; padding: 20px;}`.
 * @param clear - true if stylesheet identified by 'sheetId' id should be removed from DOM if it is found, false if 'rules' should be appended to it.
 * @returns updated stylesheet
 *
 * @internal
 */
export function addCssToStylesheet(sheetId: string, rules: string, clear = false): HTMLStyleElement {
    const stylesNode = document.createTextNode(rules);
    let exStyleSheet = document.getElementById(sheetId) as HTMLStyleElement;

    // clear stylesheet
    if (clear && exStyleSheet) {
        removeFromDom(exStyleSheet);
        exStyleSheet = null;
    }

    // stylesheet already exist - we just append the rules
    if (exStyleSheet) {
        exStyleSheet.appendChild(stylesNode);
        return exStyleSheet;
    }

    // create new stylesheet and append the rules
    const styleElement = document.createElement("style");
    styleElement.id = sheetId;
    styleElement.type = "text/css";
    styleElement.appendChild(stylesNode);

    // append the styleSheet into DOM
    document.getElementsByTagName("head")[0].appendChild(styleElement);

    return styleElement;
}
