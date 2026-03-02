// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export interface IParsedAcceptedTypes {
    extensions: string[];
    exactMimeTypes: string[];
    wildcardMimePrefixes: string[];
}

/**
 * @internal
 */
export const parseAcceptedTypes = (acceptedFileTypes: string): IParsedAcceptedTypes => {
    const extensions: string[] = [];
    const exactMimeTypes: string[] = [];
    const wildcardMimePrefixes: string[] = [];

    acceptedFileTypes.split(",").forEach((token) => {
        const type = token.trim().toLowerCase();
        if (!type) {
            return;
        }
        if (type.startsWith(".")) {
            extensions.push(type);
        } else if (type.endsWith("/*")) {
            wildcardMimePrefixes.push(type.slice(0, -1)); // e.g. "image/" from "image/*"
        } else {
            exactMimeTypes.push(type);
        }
    });

    return { extensions, exactMimeTypes, wildcardMimePrefixes };
};
