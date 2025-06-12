// (C) 2007-2022 GoodData Corporation
import has from "lodash/has.js";
import deburr from "lodash/deburr.js";

const NonAlphaNumRegex = /[^\w$]+/g;

/**
 * Given a string, returns a version of it that is safe to be used as a variable identifier in TypeScript.
 *
 * @param input - string to create a variable name for
 * @returns a string that can be used as a variable identifier in TypeScript
 */
export function stringToVariableName(input: string): string {
    /*
     * Remove diacritic
     */
    const removedDiacritic = deburr(input);

    /*
     * Do special substitution of chars that have common meaning
     *
     * Then replace all non-chars and non-digits (except for $) with whitespace
     */
    const onlyAlphaNumWithSpaces = removedDiacritic
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
        .filter((s) => s.length > 0)
        .map((s) => s.charAt(0).toLocaleUpperCase() + s.substr(1))
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

export type TakenNamesSet = { [name: string]: any };

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
 * @param scope - uniqueness scope
 */
export function createUniqueVariableName(title: string, scope: TakenNamesSet = {}): string {
    const variableName = stringToVariableName(title);

    return createUniqueName(variableName, scope);
}

/**
 * Ensure provided name is unique within the desired scope. The scope is expected to be an object which contains
 * key per name that is already used within some logical scope. The value associated with the key is irrelevant.
 *
 * Uniqueness is ensured by appending a sequence number to the input name.
 *
 * @param name - name to ensure uniqueness of
 * @param scope - uniqueness scope
 */
export function createUniqueName(name: string, scope: object): string {
    let uniqueName: string = name;
    let num: number = 1;

    while (has(scope, uniqueName)) {
        uniqueName = `${name}_${num}`;
        num++;
    }

    return uniqueName;
}
