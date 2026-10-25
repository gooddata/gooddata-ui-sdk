// (C) 2007-2026 GoodData Corporation

export interface IShortenTextOptions {
    maxLength?: number;
}

export function shortenText(value: string, options: IShortenTextOptions = {}): string {
    const maxLength = options.maxLength;

    if (maxLength < 1) {
        return "";
    }

    if (value && maxLength && value.length > maxLength) {
        return `${value.substr(0, maxLength - 1)}…`;
    }

    return value;
}

/**
 * Generates pseudo-random string.
 */
export function randomString(len: number): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < len; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
