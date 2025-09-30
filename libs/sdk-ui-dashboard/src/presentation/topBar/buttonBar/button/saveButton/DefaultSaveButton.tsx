// (C) 2021-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { ISaveButtonProps } from "./types.js";
import { messages } from "../../../../../locales.js";
import {
    dispatchAndWaitFor,
    saveDashboard,
    selectCanSaveDashboard,
    selectDashboardTitle,
    selectIsDashboardDirty,
    selectIsDashboardSaving,
    selectIsInEditMode,
    selectIsPrivateDashboard,
    selectLayoutHasAnalyticalWidgets,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";

/**
 * @internal
 */
export function useSaveButtonProps(): ISaveButtonProps {
    const dispatch = useDashboardDispatch();

    const title = useDashboardSelector(selectDashboardTitle);
    const intl = useIntl();
    const emptyTitle = intl.formatMessage({ id: "untitled" });

    // In some cases, when you click the save button (for example immediately after you insert an insight)
    // and the dashboard is still processing some related requests to this insight, it can take few seconds,
    // before the CMD.SAVE starts to process (as dashboard can process only 1 command at a time).
    // We want to show the loading indicator immediately and avoid any double-save race conditions,
    // so add a local state for this case.
    const [optimisticIsSaving, setOptimisticIsSaving] = useState(false);

    const onSaveClick = useCallback(() => {
        setOptimisticIsSaving(true);
        dispatchAndWaitFor(
            dispatch,
            // the || is intentional, we want to replace empty string as well
            saveDashboard(title || emptyTitle),
        )
            .then(() => {
                setOptimisticIsSaving(false);
            })
            .catch(() => {
                setOptimisticIsSaving(false);
            });
    }, [dispatch, emptyTitle, title]);

    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isSavingDashboard = useDashboardSelector(selectIsDashboardSaving);
    const isPrivateDashboard = useDashboardSelector(selectIsPrivateDashboard);
    const isEmptyDashboard = !useDashboardSelector(selectLayoutHasAnalyticalWidgets); // we need at least one non-custom widget there
    const canSaveDashboard = useDashboardSelector(selectCanSaveDashboard);
    const isDashboardDirty = useDashboardSelector(selectIsDashboardDirty);
    const isSaving = isSavingDashboard || optimisticIsSaving;

    const isVisible = isEditing;
    const isEnabled = isDashboardDirty && !isEmptyDashboard && canSaveDashboard;

    let buttonTitle = messages.controlButtonsSaveAndPublishTitle;
    if (isPrivateDashboard) {
        buttonTitle = messages.controlButtonsSaveAsPrivateTitle;
    }

    if (!canSaveDashboard) {
        buttonTitle = messages.controlButtonsSaveAndPublishNoChanges;
    }

    if (isEmptyDashboard) {
        buttonTitle = messages.controlButtonsSaveAndPublishEmpty;
    }

    return {
        isVisible,
        isEnabled,
        isSaving,
        buttonTitle,
        onSaveClick,
    };
}

/**
 * @internal
 */
export function DefaultSaveButton({
    isVisible,
    isEnabled,
    isSaving,
    buttonTitle,
    onSaveClick,
}: ISaveButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    if (isSaving) {
        // While save is in progress, the save button needs to be disabled and show 'Saving...'
        return (
            <Button
                className="gd-button-action s-saving_button"
                value={intl.formatMessage({ id: "controlButtons.saving.value" })}
                disabled
                onClick={() => {}}
            />
        );
    }

    return (
        <BubbleHoverTrigger>
            <Button
                className="gd-button-action save-publish-button s-save_button"
                value={intl.formatMessage(messages.controlButtonsSaveValue)}
                onClick={onSaveClick}
                disabled={!isEnabled}
            />
            <Bubble
                alignPoints={[{ align: "bc tr" }]}
                arrowOffsets={{ "bc tr": [10, 20] }}
                alignTo={`.save-publish-button`}
            >
                <FormattedMessage {...buttonTitle} />
            </Bubble>
        </BubbleHoverTrigger>
    );
}
