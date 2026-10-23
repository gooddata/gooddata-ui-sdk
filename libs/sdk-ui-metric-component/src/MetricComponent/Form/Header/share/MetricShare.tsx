// (C) 2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import { type IMeasureMetadataObject, isMeasureMetadataObject } from "@gooddata/sdk-model";
import { type IObjectShareDraft, ObjectShareDialog, useObjectAccessLevel } from "@gooddata/sdk-ui-ext";

import { useFeaturesAndSettings } from "../../../FeaturesAndSettings/index.js";
import { type IMeasureDef } from "../../../metric/metricHelpers.js";

import { MetricAccessChip } from "./MetricAccessChip.js";

export interface IMetricShareProps {
    metric: IMeasureDef;
    /** Whether this user may share this metric. Already accounts for the feature flag. */
    canShare?: boolean;
    /** Access drafted so far, kept by the tab. */
    draftAccess?: IObjectShareDraft;
    /** Required only to share a metric that does not exist yet; a saved one needs no draft. */
    onDraftAccessChange?: (draftAccess: IObjectShareDraft | undefined) => void;
}

/**
 * The Share control and its dialog. A metric being created has no ref, so the dialog runs in
 * draft mode and the tab keeps the draft; a saved metric writes directly.
 */
export function MetricShare({ metric, canShare, draftAccess, onDraftAccessChange }: IMetricShareProps) {
    const intl = useIntl();
    const { defaultMetricVisibility } = useFeaturesAndSettings();
    const [isOpen, setIsOpen] = useState(false);

    const saved = isMeasureMetadataObject(metric) ? (metric as IMeasureMetadataObject) : undefined;
    // The metric's own ref: the form splits the workspace prefix out of `id`, so a ref
    // rebuilt from `id` can address another object.
    const target = saved ? ({ kind: "measure", ref: saved.ref } as const) : undefined;
    // An unsaved metric can only be shared by drafting, and a draft needs somewhere to live.
    // Decided before the read, so nothing is fetched for a chip that will not be rendered.
    const isShareable = Boolean(canShare) && (Boolean(saved) || Boolean(onDraftAccessChange));
    const { level, isLoading, onSummaryChange } = useObjectAccessLevel({
        target,
        enabled: isShareable,
        draft: draftAccess,
        initialDraftGeneralAccess: defaultMetricVisibility,
    });

    if (!isShareable) {
        return null;
    }
    // Same placeholder the title field shows, for an unnamed metric.
    const title =
        metric.title?.trim() || intl.formatMessage({ id: "metricComponent.editMetricForm.namePlaceholder" });

    return (
        <>
            <MetricAccessChip
                level={level}
                isLoading={isLoading}
                isOpen={isOpen}
                onClick={() => setIsOpen(true)}
            />
            {isOpen ? (
                <ObjectShareDialog
                    isOpen
                    onClose={() => setIsOpen(false)}
                    objectTitle={title}
                    target={target}
                    draft={saved === undefined}
                    initialDraft={draftAccess}
                    onDraftChange={onDraftAccessChange}
                    onSummaryChange={onSummaryChange}
                    initialDraftGeneralAccess={defaultMetricVisibility}
                />
            ) : null}
        </>
    );
}
