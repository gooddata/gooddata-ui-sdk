// (C) 2021-2026 GoodData Corporation

import { type IntlShape, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../shared/theme/index.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

const useStyles = makeStyles()(() => ({
    root: {
        ".modalityPlugin-mask": {
            zIndex: 5001,
        },
    },
}));

interface IChangedMetric {
    metric: IMeasureDef;
    changed: boolean;
}

interface IUnsavedChangesConfirmDialogProps {
    metrics: Array<IChangedMetric>;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export function UnsavedChangesConfirmDialog({
    metrics,
    onClose,
    onCancel,
    onSubmit,
}: IUnsavedChangesConfirmDialogProps) {
    const intl = useIntl();
    const { classes, cx } = useStyles();

    const changedMetrics = metrics.filter((metric) => metric.changed);

    const submitButtonText = getSubmitText(intl, metrics);
    const { headline, content } = getDescription(intl, metrics, changedMetrics);

    return (
        <ConfirmDialog
            cancelButtonText={intl.formatMessage({
                id: "metricComponent.unsavedChangesConfirmDialog.cancel",
            })}
            onCancel={onCancel}
            onClose={onClose}
            submitButtonText={submitButtonText}
            isSubmitDisabled={false}
            showProgressIndicator={false}
            onSubmit={onSubmit}
            headline={headline}
            containerClassName={cx(classes.root, "s-unsaved_changes_dialog")}
            isPositive
        >
            {content}
        </ConfirmDialog>
    );
}

function getSubmitText(intl: IntlShape, allMetrics: IChangedMetric[]) {
    if (allMetrics.length <= 1) {
        const [metric] = allMetrics;

        if (metric.metric.isLocked) {
            return intl.formatMessage({
                id: "metricComponent.unsavedChangesConfirmDialog.submitAsNew",
            });
        }
        return intl.formatMessage({
            id: "metricComponent.unsavedChangesConfirmDialog.submit",
        });
    }

    return intl.formatMessage({
        id: "metricComponent.unsavedChangesConfirmDialog.submitAll",
    });
}

function getDescription(
    intl: IntlShape,
    allMetrics: IChangedMetric[],
    changedMetrics: IChangedMetric[],
): { headline: string; content: string } {
    if (allMetrics.length <= 1) {
        return {
            headline: intl.formatMessage({
                id: "metricComponent.unsavedChangesConfirmDialog.metric.headline",
            }),
            content: intl.formatMessage({ id: "metricComponent.unsavedChangesConfirmDialog.metric.content" }),
        };
    }

    return {
        headline: intl.formatMessage({ id: "metricComponent.unsavedChangesConfirmDialog.metrics.headline" }),
        content: intl.formatMessage(
            { id: "metricComponent.unsavedChangesConfirmDialog.metrics.content" },
            { count: changedMetrics.length },
        ),
    };
}
