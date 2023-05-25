// (C) 2007-2022 GoodData Corporation
import has from "lodash/has.js";

const NonAlphaNumRegex = /[^\w$]+/g;

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
        return "$" + variableName;
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
    const variableName = titleToVariableName(title);

    return createUniqueName(variableName, scope);
}

/**
 * Given metadata object identifier, this function returns a valid typescript variable name. Optionally this
 * function can assure uniqueness of the returned name within some scope.
 *
 * @param id - metadata object identifier
 * @param scope - uniqueness scope
 */
export function createUniqueVariableNameForIdentifier(id: string, scope: TakenNamesSet = {}): string {
    return createUniqueName(id.replace(/\./g, "_"), scope);
}

/**
 * Given workspace id, return variable name for the workspace.
 */
export function workspaceName(workspace: string): string {
    return `ws_${workspace}`;
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
function createUniqueName(name: string, scope: any): string {
    let uniqueName: string = name;
    let num: number = 1;

    while (has(scope, uniqueName)) {
        uniqueName = `${name}_${num}`;
        num++;
    }

    return uniqueName;
}
