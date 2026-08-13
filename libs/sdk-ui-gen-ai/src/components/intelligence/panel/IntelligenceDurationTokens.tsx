// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { IInteractionIntelligenceTotals } from "../data/types.js";
import { formatDuration } from "../format/formatDuration.js";
import { formatTokens } from "../format/formatTokens.js";
import { e } from "../intelligenceBem.js";

export interface IIntelligenceDurationTokensProps {
    totals: Pick<IInteractionIntelligenceTotals, "durationMs" | "tokens">;
    /** The trigger shows a dimmed "/" between the two figures; the timeline tooltip omits it. */
    showSlash?: boolean;
}

/**
 * The "{duration} / {tokens}" fragment shown by the inline Interaction Intelligence trigger,
 * omitting the tokens segment when `tokens` is unknown.
 */
export function IntelligenceDurationTokens({ totals, showSlash = true }: IIntelligenceDurationTokensProps) {
    const intl = useIntl();

    if (totals.tokens === undefined) {
        return <span>{formatDuration(intl, totals.durationMs)}</span>;
    }

    return (
        <>
            <span>{formatDuration(intl, totals.durationMs)}</span>{" "}
            {showSlash ? <span className={e("duration-tokens__separator")}>/ </span> : null}
            <span>{formatTokens(intl, totals.tokens)}</span>
        </>
    );
}
