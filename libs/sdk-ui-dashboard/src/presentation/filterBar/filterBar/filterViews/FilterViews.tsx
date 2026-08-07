// (C) 2024-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import cx from "classnames";
import { type IntlShape, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { type IDashboardFilterView } from "@gooddata/sdk-model";
import {
    type IAlignPoint,
    UiButton,
    UiReturnFocusOnUnmount,
    useIdPrefixed,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../../model/react/useDashboardUserInteraction.js";
import {
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsReadOnly,
} from "../../../../model/store/config/configSelectors.js";
import { selectFilterViews } from "../../../../model/store/filterViews/filterViewsReducersSelectors.js";
import {
    selectDisableFilterViews,
    selectIsNewDashboard,
} from "../../../../model/store/meta/metaSelectors.js";
import { selectCanCreateFilterView } from "../../../../model/store/permissions/permissionsSelectors.js";
import { selectIsInEditMode } from "../../../../model/store/renderMode/renderModeSelectors.js";
import { uiActions } from "../../../../model/store/ui/index.js";
import {
    selectFilterViewsDialogMode,
    selectIsFilterViewsDialogOpen,
} from "../../../../model/store/ui/uiSelectors.js";
import { ConfigurationBubble } from "../../../widget/common/configuration/ConfigurationBubble.js";

import { AddFilterView } from "./AddFilterView.js";
import { FilterViewsList } from "./FilterViewsList.js";
import { useFilterViewsToastMessages } from "./useFilterViewsToastMessages.js";

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "br tr", offset: { x: -10, y: -10 } }];

function getButtonLabel(intl: IntlShape, filterViews: IDashboardFilterView[]) {
    return filterViews.length === 0
        ? intl.formatMessage({ id: "filters.filterViews.dropdown.buttonEmpty" })
        : intl.formatMessage({ id: "filters.filterViews.dropdown.button" }, { count: filterViews.length });
}

const useCallbacks = (isDialogOpen: boolean, countOfSavedViews: number) => {
    const dispatch = useDashboardDispatch();
    const { savedFilterViewInteraction } = useDashboardUserInteraction();

    const toggleDialog = useCallback(() => {
        dispatch(uiActions.toggleFilterViewsDialog());
        if (!isDialogOpen) {
            savedFilterViewInteraction({
                type: "DIALOG_OPENED",
                countOfSavedViews,
            });
        }
    }, [dispatch, savedFilterViewInteraction, isDialogOpen, countOfSavedViews]);

    const openListDialog = useCallback(
        () =>
            dispatch(
                uiActions.toggleFilterViewsDialog({
                    open: true,
                    mode: "list",
                }),
            ),
        [dispatch],
    );

    const openAddDialog = useCallback(
        () =>
            dispatch(
                uiActions.toggleFilterViewsDialog({
                    open: true,
                    mode: "add",
                }),
            ),
        [dispatch],
    );

    const closeDialog = useCallback(
        () =>
            dispatch(
                uiActions.toggleFilterViewsDialog({
                    open: false,
                }),
            ),
        [dispatch],
    );

    const onSaveDialog = useCallback(() => {
        // Add a small delay to ensure action works with keyboard.
        setTimeout(() => {
            closeDialog();
        }, 100);
    }, [closeDialog]);

    return {
        toggleDialog,
        openListDialog,
        openAddDialog,
        closeDialog,
        onSaveDialog,
    };
};

export function FilterViews() {
    const isDialogOpen = useDashboardSelector(selectIsFilterViewsDialogOpen);
    const dialogMode = useDashboardSelector(selectFilterViewsDialogMode);
    const isDashboardEditMode = useDashboardSelector(selectIsInEditMode);
    const filterViews = useDashboardSelector(selectFilterViews);
    const isFilterViewsEnabledForDashboard = !useDashboardSelector(selectDisableFilterViews);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const canCreateFilterView = useDashboardSelector(selectCanCreateFilterView);
    const isMobile = useMediaQuery("mobileDevice");
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const { toggleDialog, openAddDialog, openListDialog, closeDialog, onSaveDialog } = useCallbacks(
        isDialogOpen,
        filterViews.length,
    );
    const intl = useIntl();

    const listDialogTitleId = useIdPrefixed("FilterViewsListTitle");
    const addDialogTitleId = useIdPrefixed("AddFilterViewTitle");

    useFilterViewsToastMessages();

    // filter views dropdown should be visible when user looses the permission but had some views created
    const isUserPermittedToSeeDropdown = filterViews.length > 0 || canCreateFilterView;

    // On mobile the dropdown button is not on filter bar but rendered inside the "..." dashboard menu.
    // The dropdown body must still be rendered so the body can be opened when user uses the menu.
    // Also, the menu is not available for new dashboard as new filter view can be saved only for an existing
    // dashboard with ref id.
    const showDropdownButton =
        isFilterViewsEnabledForDashboard && isUserPermittedToSeeDropdown && !isNewDashboard && !isMobile;

    // generate unique anchor class name to open dropdown next to the correct button if app uses multiple
    // dashboard components
    const dropdownAnchorClassName = useMemo(() => `gd-filter-views__dropdown-anchor-${uuid()}`, []);

    // UiButton has no className prop, so the dropdown anchor and layout tweaks live on a wrapper
    const buttonWrapperClassNames = cx("gd-filter-views-button", dropdownAnchorClassName, {
        "deprecated-margin-top": !isApplyAllAtOnceEnabledAndSet,
    });

    const triggerId = useIdPrefixed("FilterViewsTrigger");
    const dropdownId = useIdPrefixed("FilterViewsDropdown");

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    if (isReadOnly) {
        return null;
    }

    return (
        <div className="gd-filter-views">
            {showDropdownButton ? (
                <>
                    <div className={buttonWrapperClassNames}>
                        <UiButton
                            id={triggerId}
                            variant="tertiary"
                            // tertiary has no padding, so size only drives font-size and height;
                            // "medium" keeps the 14px label the button had in both densities
                            size="medium"
                            label={getButtonLabel(intl, filterViews)}
                            iconAfter={isDialogOpen ? "navigateUp" : "navigateDown"}
                            onClick={toggleDialog}
                            dataTestId="filter-views-button"
                            accessibilityConfig={{
                                ariaHaspopup: "dialog",
                                ariaExpanded: isDialogOpen,
                                ariaControls: isDialogOpen ? dropdownId : undefined,
                            }}
                            disableIconAnimation
                        />
                    </div>
                    {isDashboardEditMode ? <div className="gd-filters-views__panel__divider" /> : null}
                </>
            ) : (
                <div className={dropdownAnchorClassName} />
            )}
            {isDialogOpen ? (
                <UiReturnFocusOnUnmount returnFocusTo={triggerId}>
                    <ConfigurationBubble
                        id={dropdownId}
                        classNames="gd-filters-views__panel"
                        onClose={closeDialog}
                        closeOnEscape
                        alignTo={`.${dropdownAnchorClassName}`}
                        alignPoints={BUBBLE_ALIGN_POINTS}
                        accessibilityConfig={{
                            role: "dialog",
                            ariaLabelledBy: dialogMode === "add" ? addDialogTitleId : listDialogTitleId,
                        }}
                    >
                        {dialogMode === "add" ? (
                            <AddFilterView
                                onClose={openListDialog}
                                onSave={onSaveDialog}
                                titleId={addDialogTitleId}
                            />
                        ) : (
                            <FilterViewsList
                                filterViews={filterViews}
                                onAddNew={openAddDialog}
                                onClose={closeDialog}
                                titleId={listDialogTitleId}
                            />
                        )}
                    </ConfigurationBubble>
                </UiReturnFocusOnUnmount>
            ) : null}
        </div>
    );
}
