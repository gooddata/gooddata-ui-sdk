// (C) 2026 GoodData Corporation

import type { IntlShape } from "react-intl";

/**
 * Formats a token count as a translated, locale-aware string, compacting large counts (e.g.
 * "4K tokens" instead of "4,000 tokens") while keeping singular/plural driven by the real count.
 * @internal
 */
export function formatTokens(intl: IntlShape, count: number): string {
    const formattedCount = intl.formatNumber(count, { notation: "compact" });

    return intl.formatMessage(
        { id: "gd.gen-ai.interactionIntelligence.summary.tokens" },
        { count, formattedCount },
    );
}
