// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";

import { interactionIntelligenceEnabledSelector } from "../../store/chatWindow/chatWindowSelectors.js";

import type { IInteractionCategory, InteractionIntelligenceMode } from "./data/types.js";
import { useInteractionIntelligenceData } from "./data/useInteractionIntelligenceData.js";
import { IntelligenceCategoryDetail } from "./detail/IntelligenceCategoryDetail.js";
import { b } from "./intelligenceBem.js";
import { IntelligenceCategoryList } from "./panel/IntelligenceCategoryList.js";
import { IntelligenceFooter } from "./panel/IntelligenceFooter.js";
import { IntelligenceHeader } from "./panel/IntelligenceHeader.js";
import { IntelligenceTimeline } from "./panel/IntelligenceTimeline.js";

/**
 * Props for the {@link GenAiInteractionIntelligence} component.
 * @public
 */
export interface IGenAiInteractionIntelligenceProps {
    responseId: string;
    onClose: () => void;
    /** Lets a consumer render directly into a specific category's detail view. */
    initialMode?: InteractionIntelligenceMode;
    /** Category id to open when `initialMode === "detail"`. Falls back to list mode if unknown. */
    initialCategory?: string;
}

/**
 * The Interaction Intelligence panel: a single timeline of the processing steps behind one
 * assistant response, with a list view and a per-category detail view. Loads its own data on
 * mount and owns which view/category is currently shown.
 * @public
 */
export function GenAiInteractionIntelligence({
    responseId,
    onClose,
    initialMode = "list",
    initialCategory,
}: IGenAiInteractionIntelligenceProps) {
    // Self-gated on the feature flag/prop, not just by whoever mounts this component — it is a
    // public export, so a caller other than AssistantItem must not be able to show it by omission.
    const interactionIntelligenceEnabled = useSelector(interactionIntelligenceEnabledSelector);
    const data = useInteractionIntelligenceData(responseId, interactionIntelligenceEnabled);

    const [view, setView] = useState<{ mode: InteractionIntelligenceMode; categoryIndex: number }>();
    const [hoveredStepIndexes, setHoveredStepIndexes] = useState<number[] | undefined>(undefined);
    const panelRef = useRef<HTMLDivElement>(null);

    // Mounted from AssistantItem the trace is already in the store, so this resolves on the first
    // render. A consumer that mounts the panel while the response still streams gets it as soon as
    // the trace lands instead, which is why the initial view is derived rather than seeded.
    const resolvedView =
        view ??
        (data
            ? resolveInitialView(data.categories, initialMode, initialCategory)
            : { mode: "list" as const, categoryIndex: 0 });

    const openCategory = useCallback((categoryIndex: number) => {
        setView({ mode: "detail", categoryIndex });
    }, []);

    const backToList = useCallback(() => setView({ mode: "list", categoryIndex: 0 }), []);

    const hasData = !!data;

    // The panel opens below the message and the detail view is taller than the list, so both
    // opening it and switching views can push its bottom out of the viewport. Scroll it back into
    // view once it has something to show, and on every view change after that.
    useEffect(() => {
        panelRef.current?.scrollIntoView({ block: "nearest" });
    }, [resolvedView.mode, hasData]);

    if (!data) {
        return null;
    }

    return (
        <div className={b()} ref={panelRef}>
            {resolvedView.mode === "detail" ? (
                <IntelligenceCategoryDetail
                    data={data}
                    categoryIndex={resolvedView.categoryIndex}
                    onBack={backToList}
                    onClose={onClose}
                    onSelectCategory={openCategory}
                />
            ) : (
                <>
                    <IntelligenceHeader onClose={onClose} />
                    <IntelligenceTimeline
                        steps={data.steps}
                        totalDurationMs={data.totals.durationMs}
                        categories={data.categories}
                        highlightedStepIndexes={hoveredStepIndexes}
                    />
                    <IntelligenceCategoryList
                        categories={data.categories}
                        onSelectCategory={openCategory}
                        onHoveredStepIndexesChange={setHoveredStepIndexes}
                    />
                    {data.traceId ? <IntelligenceFooter traceId={data.traceId} /> : null}
                </>
            )}
        </div>
    );
}

/** Opens on `initialCategory`'s detail when asked for one that exists, else on the list. */
function resolveInitialView(
    categories: IInteractionCategory[],
    initialMode: InteractionIntelligenceMode,
    initialCategory: string | undefined,
): { mode: InteractionIntelligenceMode; categoryIndex: number } {
    const categoryIndex = categories.findIndex((category) => category.category === initialCategory);

    return initialMode === "detail" && categoryIndex >= 0
        ? { mode: "detail", categoryIndex }
        : { mode: "list", categoryIndex: 0 };
}
