// (C) 2026 GoodData Corporation

import type { IntlShape } from "react-intl";

/**
 * Resolves an authored label/value: translates `id` when present, falling back to the verbatim
 * authored text otherwise. Shared by every `xxxId ?? xxx` field in the Interaction Intelligence
 * render model (step/category labels, row labels, list headings, text values).
 * @internal
 */
export function resolveMessage(
    intl: IntlShape,
    id: string | undefined,
    fallback: string,
    values?: Record<string, string | number>,
): string {
    return id ? intl.formatMessage({ id }, values) : fallback;
}
