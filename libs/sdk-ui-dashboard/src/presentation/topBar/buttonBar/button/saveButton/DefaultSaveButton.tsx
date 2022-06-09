// (C) 2021-2022 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";
import {
    dispatchAndWaitFor,
    saveDashboard,
    selectIsDashboardSaving,
    selectIsLayoutEmpty,
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";
import { ISaveButtonProps } from "./types";
import { cancelEditRenderMode } from "../../../../../model/commands/ui";
import { selectCanSaveDashboard, selectIsPrivateDashboard } from "../selectors";
import { selectEnableAnalyticalDashboardPermissions } from "../../../../../model/store/config/configSelectors";
import { selectIsDashboardDirty, selectIsNewDashboard } from "../../../../../model/store/meta/metaSelectors";
import noop from "lodash/noop";

/**
 * @internal
 */
export function useSaveButtonProps(): ISaveButtonProps {
    const dispatch = useDashboardDispatch();
    const onSaveClick = useCallback(
        () =>
            dispatchAndWaitFor(dispatch, saveDashboard()).then(() => {
                dispatch(cancelEditRenderMode());
            }),
        [dispatch],
    );

    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const arePermissionsEnabled = useDashboardSelector(selectEnableAnalyticalDashboardPermissions);
    const isPrivateDashboard = useDashboardSelector(selectIsPrivateDashboard);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isEmptyDashboard = useDashboardSelector(selectIsLayoutEmpty);
    const canSaveDashboard = useDashboardSelector(selectCanSaveDashboard);
    const isDashboardDirty = useDashboardSelector(selectIsDashboardDirty);

    const isVisible = isEditing;
    const isEnabled = isNewDashboard ? !isEmptyDashboard : isDashboardDirty;

    const buttonValue = arePermissionsEnabled
        ? "controlButtons.save.value"
        : "controlButtons.saveAndPublish.value";

    let buttonTitle = "controlButtons.saveAndPublish.title";
    if (isPrivateDashboard) {
        buttonTitle = "controlButtons.saveAsPrivate.title";
    }

    if (!canSaveDashboard) {
        buttonTitle = "controlButtons.saveAndPublish.disable.noChanges.title";
    }

    if (isEmptyDashboard) {
        buttonTitle = "controlButtons.saveAndPublish.disable.empty.title";
    }

    return {
        isVisible,
        isEnabled,
        isSaving,
        buttonValue: { id: buttonValue },
        buttonTitle: { id: buttonTitle },
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
    buttonValue,
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
                onClick={noop}
            />
        );
    }

    return (
        <BubbleHoverTrigger>
            <Button
                className="gd-button-action save-publish-button s-save_button"
                value={intl.formatMessage(buttonValue)}
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
