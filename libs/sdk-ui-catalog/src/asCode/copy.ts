// (C) 2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

const canonicalUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const trailingCopySuffixRegex = /^(.*) \((\d+)\)$/;

/**
 * Derives the identity (id + title) of a copied as-code object from the original; the remaining
 * fields are copied by each type.
 *
 * The title gains a ` (2)` suffix, or increments an existing ` (N)`. The id is re-derived from that
 * title or dropped (see `shouldOmitCopiedId`). Absent fields are left off so a spread does not
 * introduce them.
 */
export function deriveCopyIdentity(source: { id?: string; title?: string }): {
    id?: string;
    title?: string;
} {
    const title = getCopiedTitle(source.title);
    const id = shouldOmitCopiedId(source.id) ? undefined : getCopiedId(title);
    return {
        ...(id === undefined ? {} : { id }),
        ...(title === undefined ? {} : { title }),
    };
}

function getCopiedTitle(title: string | undefined): string | undefined {
    if (title === undefined) {
        return undefined;
    }
    if (title === "") {
        return "";
    }
    const match = title.match(trailingCopySuffixRegex);
    if (match) {
        const [, prefix, suffix] = match;
        return `${prefix} (${Number(suffix) + 1})`;
    }
    return `${title} (2)`;
}

// A UUID id was server-generated, so the copy omits its id and lets the server generate a fresh one.
// A human-authored id (e.g. "revenue.total") is instead re-derived from the copied title to stay
// readable; a resulting collision is handled by the create 409 retry-without-id.
function shouldOmitCopiedId(id: string | undefined): boolean {
    return id === undefined || isCanonicalUuid(id);
}

function getCopiedId(title: string | undefined): string | undefined {
    if (!title) {
        return undefined;
    }
    const normalizedTitle = title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\W/g, "_")
        .toLowerCase();
    return normalizedTitle || undefined;
}

function isCanonicalUuid(value: string): boolean {
    return canonicalUuidRegex.test(value);
}

/** A create failed because the chosen id already exists (backend responds with HTTP 409). */
export function isDuplicateIdError(error: unknown): boolean {
    return isUnexpectedResponseError(error) && error.httpStatus === 409;
}
