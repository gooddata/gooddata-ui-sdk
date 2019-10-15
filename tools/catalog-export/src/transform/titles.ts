// (C) 2007-2019 GoodData Corporation
import { has } from "lodash";

export function createUniqueTitle(obj: any, itemName: string, orig: string = "", num: number = 1): string {
    const name = orig || itemName;
    if (has(obj, itemName)) {
        return createUniqueTitle(obj, `${name}(${num})`, name, num + 1);
    }

    return itemName;
}

const NonAlphaNumRegex = /[^\w\d$]+/g;

function titleToVariableName(title: string): string {
    /*
     * First do special substitution of chars that have common meaning
     *
     * Then replace all non-chars and non-digits (except for $) with whitespace
     */
    const onlyAlphaNumWithSpaces = title
        .replace(/&/g, " and ")
        .replace(/#/g, "Nr")
        .replace(/%/g, "Percent")
        .replace(/_/g, " ")
        .replace(NonAlphaNumRegex, " ");

    /*
     * Get rid of superfluous whitespace, capitalize words and prepare var name
     */
    const variableName = onlyAlphaNumWithSpaces
        .split(" ")
        .filter(s => s.length > 0)
        .map(s => s.charAt(0).toLocaleUpperCase() + s.substr(1))
        .join("");

    if (!variableName.length) {
        return "Untitled";
    }

    /*
     * Name must start with a character or with a $ sign (otherwise TS syntax error).
     */
    if (!variableName.charAt(0).match(/[A-Z$]/)) {
        return "_" + variableName;
    }

    return variableName;
}

export type TakenNamesMap = { [name: string]: any };

/**
 * Given a metadata object title, this function figures out the ideal name for the variable that should
 * represent the object in a TypeScript code.
 *
 * This function can also work with a mapping of used variable names. If the determined variable name is found
 * as used, it will append a number (1, 2 etc) to make the variable name unique. The provided mapping will be
 * used read-only. The value of the mapping is not used for anything - the mere presence of the key in the mapping
 * indicates the name is used.
 *
 * @param title - object title
 * @param taken - mapping of used variable names to whatever you see fit.
 */
export function createUniqueVariableName(title: string, taken: TakenNamesMap = {}): string {
    const variableName = titleToVariableName(title);
    let uniqueName: string = variableName;
    let num: number = 1;

    while (has(taken, uniqueName)) {
        uniqueName = `${variableName}${num}`;
        num++;
    }

    return uniqueName;
}
