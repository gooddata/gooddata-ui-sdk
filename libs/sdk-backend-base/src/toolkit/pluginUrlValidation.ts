// (C) 2021 GoodData Corporation
import { sanitizeUrl } from "@braintree/sanitize-url";

const AboutBlank = "about:blank";

function validateUrl(url: string, messagePrefix: string) {
    const sanitized = sanitizeUrl(url);

    if (url !== sanitized) {
        // sanitized URL being different from the input means there was something fishy with the URL
        if (sanitized === AboutBlank) {
            // sanitization about return about:blank in case the url contains javascript/vbscript/data schemas
            return `${messagePrefix} contains invalid schema; possible XSS detected`;
        }

        return `${messagePrefix} contains invalid characters`;
    }

    // explicitly check for '/.' and '/..'
    if (url.search(/\/\.+/) > -1) {
        return `${messagePrefix} contains reserved filename characters`;
    }

    return undefined;
}

/**
 * Performs validation of dashboard plugin URL. This is purely client-side and checks that the URL does
 * not contain invalid characters and contains correct protocol.
 *
 * @param url - url to validate
 * @alpha
 */
export function validatePluginUrlIsSane(url: string): string | undefined {
    try {
        // ensure URL is valid and is https
        const parsedUrl: URL = new URL(url);
        if (parsedUrl.protocol !== "https:") {
            return `url does not use https`;
        }
    } catch (e: any) {
        return "url is malformed";
    }

    // validate URL as is; then decode from percent-encoded URL and do one more round with the same validations
    const validationError = validateUrl(url, "url") ?? validateUrl(decodeURIComponent(url), "decoded url");

    if (validationError) {
        return validationError;
    }

    return undefined;
}
