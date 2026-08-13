// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { IInteractionIntelligenceTotals } from "./data/types.js";
import { e } from "./intelligenceBem.js";
import { IntelligenceDurationTokens } from "./panel/IntelligenceDurationTokens.js";

export interface IInteractionIntelligenceTriggerProps {
    /** The turn's duration/tokens, shown as the trigger's own content. Renders nothing until available. */
    totals?: IInteractionIntelligenceTotals;
    isOpen: boolean;
    onToggle: () => void;
}

/**
 * The Interaction Intelligence trigger shown next to an assistant message: the turn's
 * duration/tokens, styled like the panel's own summary stats, acting as the clickable trigger.
 * Renders nothing until `totals` is available. A plain toggle — it holds no state and renders no
 * panel itself.
 */
export function InteractionIntelligenceTrigger({
    totals,
    isOpen,
    onToggle,
}: IInteractionIntelligenceTriggerProps) {
    const intl = useIntl();

    if (!totals) {
        return null;
    }

    const label = intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.explain" });

    return (
        <button
            type="button"
            className={e("trigger")}
            onClick={onToggle}
            aria-label={label}
            aria-expanded={isOpen}
        >
            <IntelligenceDurationTokens totals={totals} />
        </button>
    );
}
