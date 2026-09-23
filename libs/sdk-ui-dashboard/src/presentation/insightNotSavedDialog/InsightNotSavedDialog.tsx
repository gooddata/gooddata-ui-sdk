// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";

import { ConfirmDialog, Typography, UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../model/store/ui/index.js";
import {
    selectInsightNotSavedDialogDraftInsightsToPersist,
    selectIsInsightNotSavedDialogOpen,
} from "../../model/store/ui/uiSelectors.js";

/**
 * @internal
 */
export function InsightNotSavedDialog() {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const [showVisualisationsList, setShowVisualisationsList] = useState(true);

    const isInsightNotSavedDialogOpen = useDashboardSelector(selectIsInsightNotSavedDialogOpen);
    const submitDialog = useCallback(() => {
        dispatch(uiActions.confirmInsightNotSavedDialogSubmit());
    }, [dispatch]);
    const closeDialog = useCallback(() => dispatch(uiActions.closeInsightNotSavedDialog()), [dispatch]);

    const unsavedInsights = useDashboardSelector(selectInsightNotSavedDialogDraftInsightsToPersist);

    if (!isInsightNotSavedDialogOpen) {
        return null;
    }

    return (
        <ConfirmDialog
            isPositive
            dataTestId="s-insight-not-saved-dialog"
            headline={intl.formatMessage({ id: "insightNotSavedDialog.headline" })}
            submitButtonText={intl.formatMessage({ id: "insightNotSavedDialog.saveAll" })}
            cancelButtonText={intl.formatMessage({ id: "insightNotSavedDialog.cancel" })}
            onCancel={closeDialog}
            onSubmit={submitDialog}
        >
            <div className="gdc-insight-not-saved-dialog">
                <Typography tagName="p">
                    {intl.formatMessage({ id: "insightNotSavedDialog.message" })}
                </Typography>
                <UiButton
                    iconBeforeSize={12}
                    variant="dropdownInline"
                    label={intl.formatMessage(
                        { id: "insightNotSavedDialog.visualisations" },
                        {
                            count: unsavedInsights.length,
                        },
                    )}
                    iconBefore={showVisualisationsList ? "navigateDown" : "navigateRight"}
                    onClick={() => setShowVisualisationsList(!showVisualisationsList)}
                />
                {showVisualisationsList ? (
                    <ul>
                        {unsavedInsights.map((insight) => (
                            <li key={insight.insight.identifier}>
                                <UiIcon type="visualization" size={18} color="complementary-5" />{" "}
                                {insight.insight.title}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </ConfirmDialog>
    );
}
