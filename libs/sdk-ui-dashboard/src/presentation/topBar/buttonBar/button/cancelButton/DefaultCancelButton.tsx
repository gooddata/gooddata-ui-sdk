// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { type ICancelButtonProps } from "./types.js";
import { cancelEditRenderMode } from "../../../../../model/commands/renderMode.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectIsDashboardDirty } from "../../../../../model/store/meta/metaSelectors.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { selectIsDashboardSaving } from "../../../../../model/store/saving/savingSelectors.js";
import { uiActions } from "../../../../../model/store/ui/index.js";

/**
 * @internal
 */
export function useCancelButtonProps(): ICancelButtonProps {
    const dispatch = useDashboardDispatch();
    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isSaving = useDashboardSelector(selectIsDashboardSaving);

    const isDirty = useDashboardSelector(selectIsDashboardDirty);

    const onCancelClick = useCallback(() => {
        if (isDirty) {
            dispatch(uiActions.openCancelEditModeDialog());
        } else {
            dispatch(cancelEditRenderMode());
        }
    }, [dispatch, isDirty]);

    return {
        isVisible: isEditing && !isSaving,
        onCancelClick,
    };
}

/**
 * @internal
 */
export function DefaultCancelButton({ isVisible, onCancelClick }: ICancelButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            className="gd-button-secondary cancel-button s-cancel_button"
            value={intl.formatMessage({ id: "cancel" })}
            onClick={onCancelClick}
        />
    );
}
