// (C) 2021-2026 GoodData Corporation

import { memo } from "react";

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IMetadataObject, type ISeparators } from "@gooddata/sdk-model";
import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { useEvents } from "../../../shared/eventing/useEvents.js";
import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { useMetricFormStatus } from "../hooks/useMetricFormStatus.js";

import { events } from "./EditMetricContentHeader.events.js";
import { LockedBubble } from "./LockedBubble.js";
import { MetricDescriptionField } from "./MetricDescriptionField.js";
import { MetricIdField } from "./MetricIdField.js";
import { MetricTitleField } from "./MetricTitleField.js";
import { MetricShare } from "./share/MetricShare.js";
import { Usage } from "./Usage/Usage.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        padding: "20px 20px 20px 16px",
    },
    firstRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: 5,
        marginRight: 30,
        gap: 10,
    },
    locked: {
        display: "flex",
        alignItems: "center",
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 5,
        paddingLeft: 5,
    },
    description: {
        display: "flex",
        color: theme.globals.colors.description,
    },
}));

export interface IEditMetricContentHeaderProps {
    regenerateId?: boolean;
    usage?: IMeasureReferencing;
    separators?: ISeparators;
    className?: string;
    onDescriptionHeightChange?: (height: number) => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    useReferences?: boolean;
    /** The metric being edited, for the share dialog's target and title. */
    metric?: IMeasureDef;
    /** Whether this user may share this metric. */
    canShare?: boolean;
    /** Access drafted so far, kept by the tab. */
    draftAccess?: IObjectShareDraft;
    onDraftAccessChange?: (draftAccess: IObjectShareDraft | undefined) => void;
}

function EditMetricContentHeaderComponent({
    regenerateId,
    usage,
    separators,
    onDescriptionHeightChange,
    metricOpenType,
    onMetricClick,
    activeInsight,
    insightOpenType,
    onInsightClick,
    useReferences,
    metric,
    canShare,
    draftAccess,
    onDraftAccessChange,
}: IEditMetricContentHeaderProps) {
    const { classes, cx } = useStyles();

    const { metricUsageClick } = useEvents(events);
    const { isLocked } = useMetricFormStatus();
    const meta = (
        <>
            <MetricIdField regenerateId={regenerateId} />
            {usage ? (
                <Usage
                    data={usage}
                    onOpenUsage={metricUsageClick}
                    activeInsight={activeInsight}
                    insightOpenType={insightOpenType}
                    onInsightClick={onInsightClick}
                    metricOpenType={metricOpenType}
                    onMetricClick={onMetricClick}
                />
            ) : null}
        </>
    );

    return (
        <div className={classes.root}>
            <div className={classes.firstRow}>
                {isLocked && (
                    <div className={cx(classes.locked)}>
                        <LockedBubble />
                    </div>
                )}
                <MetricTitleField />
                {metric ? (
                    <MetricShare
                        metric={metric}
                        canShare={canShare}
                        draftAccess={draftAccess}
                        onDraftAccessChange={onDraftAccessChange}
                    />
                ) : null}
            </div>
            <div className={classes.metaRow}>{meta}</div>
            <MetricDescriptionField
                className={classes.description}
                onDescriptionHeightChange={onDescriptionHeightChange}
                separators={separators}
                useReferences={useReferences}
            />
        </div>
    );
}

export const EditMetricContentHeader = memo(EditMetricContentHeaderComponent);
