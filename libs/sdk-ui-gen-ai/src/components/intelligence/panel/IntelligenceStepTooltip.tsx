// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { IInteractionCategory, IInteractionStepTile } from "../data/types.js";
import { resolveMessage } from "../format/resolveMessage.js";
import { e } from "../intelligenceBem.js";

import { IntelligenceDurationTokens } from "./IntelligenceDurationTokens.js";

export interface IIntelligenceStepTooltipProps {
    step: IInteractionStepTile;
    /** All of the turn's categories, to resolve the step's category ids to display labels. */
    categories: IInteractionCategory[];
}

/**
 * The hover tooltip for one timeline tile: an "ACTIVITY" eyebrow with the categories that ran
 * within the step (omitted when it ran none), a divider, and the step's own duration/tokens.
 */
export function IntelligenceStepTooltip({ step, categories }: IIntelligenceStepTooltipProps) {
    const intl = useIntl();
    const labelIdByCategory = new Map(categories.map((category) => [category.category, category.labelId]));

    return (
        <div className={e("step-tooltip")}>
            {step.categories.length > 0 ? (
                <>
                    <div className={e("step-tooltip__eyebrow")}>
                        {intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.tooltip.activity" })}
                    </div>
                    <div className={e("step-tooltip__activity-list")}>
                        {step.categories.map((category) => (
                            <div key={category}>
                                {resolveMessage(intl, labelIdByCategory.get(category), category)}
                            </div>
                        ))}
                    </div>
                    <div className={e("step-tooltip__divider")} />
                </>
            ) : null}
            <div className={e("step-tooltip__footer")}>
                <IntelligenceDurationTokens totals={step} showSlash={false} />
            </div>
        </div>
    );
}
