// (C) 2007-2020 GoodData Corporation

/**
 * @internal
 */
export interface IShortenTextOptions {
    maxLength?: number;
}

/**
 * Shortens string if it exceeds maximum length. If the shortening occurs, the ellipsis char will
 * be added at the end.
 *
 * @param value - string to be shortened
 * @param options - currently only allows you to specify maxLength
 * @returns original string if it does not exceed limits, shortened string otherwise
 *
 * @internal
 */
export function shortenText(value: string, options: IShortenTextOptions = {}): string {
    const { maxLength } = options;

    if (value && maxLength && value.length > maxLength) {
        return `${value.substr(0, maxLength)}…`;
    }

    return value;
}

/**
 * Escapes special characters used in regular expressions.
 * @param value - string to be escaped
 * @returns escaped regular expression
 *
 * @internal
 */
export function escapeRegExp(value: string): string {
    // eslint-disable-next-line no-useless-escape
    return value.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * Generates pseudo-random string.
 *
 * @param len - length of string to be generated
 * @returns random string
 *
 * @internal
 */
export function randomString(len: number): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < len; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Replaces non-alphanumerical characters with underscore and lower-cases all characters.
 *
 * @param value - string to perform replacement on
 * @returns simplified string
 *
 * @internal
 */
export function simplifyText(value: string | number | null): string {
    const s = value && value.toString ? value.toString() : "";
    return s.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
}

/**
 * Parse string in a form of [foo, bar] to an array of objects.
 * Assume alphanumeric strings in the array; if some is not alphanumeric , return null
 * @param str - input string with the array definition
 * @returns parsed array of strings
 *
 * @internal
 */
export function parseStringToArray(str: string): string[] | null {
    if (str) {
        if (str.match(/^\[]$/)) {
            // empty array of tags []
            return [];
        }

        if (str.match(/^\[[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*]$/)) {
            // [foo], [foo,bar]
            return str.slice(1, -1).split(",");
        }
    }

    return null;
}

/**
 * Returns a hash code for a string.
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param value - s a string
 * @returns a hash code value for the given string.
 *
 * @internal
 */

export function hashCodeString(value: string): number {
    if (!value || !value.length) {
        return 0;
    }

    const chars: string[] = value.split("");
    const hashCode = chars.reduce((hashCode: number, char: string): number => {
        const charCode = char.charCodeAt(0);
        return ((hashCode << 5) - hashCode + charCode) | 0;
    }, 0);

    return Math.abs(hashCode);
}
