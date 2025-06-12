// (C) 2024-2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { DropdownButton, useMediaQuery, IAlignPoint, UiFocusTrap, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { IDashboardFilterView } from "@gooddata/sdk-model";

import { ConfigurationBubble } from "../../../widget/common/configuration/ConfigurationBubble.js";
import {
    useDashboardSelector,
    selectFilterViews,
    selectIsInEditMode,
    useDashboardDispatch,
    uiActions,
    selectDisableFilterViews,
    selectIsFilterViewsDialogOpen,
    selectFilterViewsDialogMode,
    selectIsNewDashboard,
    selectCanCreateFilterView,
    useDashboardUserInteraction,
    selectIsReadOnly,
    selectEnableDashboardFiltersApplyModes,
} from "../../../../model/index.js";

import { FilterViewsList } from "./FilterViewsList.js";
import { useFilterViewsToastMessages } from "./useFilterViewsToastMessages.js";
import { AddFilterView } from "./AddFilterView.js";

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "br tr", offset: { x: -27, y: -10 } }];

const DropdownButtonLabel: React.FC<{ filterViews: IDashboardFilterView[] }> = ({ filterViews }) => {
    return filterViews.length === 0 ? (
        <FormattedMessage id="filters.filterViews.dropdown.buttonEmpty" />
    ) : (
        <FormattedMessage
            id="filters.filterViews.dropdown.button"
            values={{ count: filterViews?.length ?? 0 }}
        />
    );
};

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

    return {
        toggleDialog,
        openListDialog,
        openAddDialog,
        closeDialog,
    };
};

export const FilterViews: React.FC = () => {
    const isDialogOpen = useDashboardSelector(selectIsFilterViewsDialogOpen);
    const dialogMode = useDashboardSelector(selectFilterViewsDialogMode);
    const isDashboardEditMode = useDashboardSelector(selectIsInEditMode);
    const filterViews = useDashboardSelector(selectFilterViews);
    const isFilterViewsEnabledForDashboard = !useDashboardSelector(selectDisableFilterViews);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const canCreateFilterView = useDashboardSelector(selectCanCreateFilterView);
    const isMobile = useMediaQuery("mobileDevice");
    const enableDashboardFiltersApplyModes = useDashboardSelector(selectEnableDashboardFiltersApplyModes);
    const { toggleDialog, openAddDialog, openListDialog, closeDialog } = useCallbacks(
        isDialogOpen,
        filterViews.length,
    );

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

    const buttonClassNames = cx("gd-filter-views-button", dropdownAnchorClassName, "gd-button-large", {
        "gd-filter-views-button--open": isDialogOpen,
        "deprecated-margin-top": !enableDashboardFiltersApplyModes,
    });

    const triggerId = useIdPrefixed("FilterViewsTrigger");

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    if (isReadOnly) {
        return null;
    }

    return (
        <div className="gd-filter-views">
            {showDropdownButton ? (
                <>
                    <DropdownButton
                        id={triggerId}
                        onClick={toggleDialog}
                        className={buttonClassNames}
                        isOpen={isDialogOpen}
                    >
                        <DropdownButtonLabel filterViews={filterViews} />
                    </DropdownButton>
                    {isDashboardEditMode ? (
                        <div id={triggerId} className="gd-filters-views__panel__divider" />
                    ) : null}
                </>
            ) : (
                <div className={dropdownAnchorClassName} />
            )}
            {isDialogOpen ? (
                <ConfigurationBubble
                    classNames="gd-filters-views__panel"
                    onClose={closeDialog}
                    alignTo={`.${dropdownAnchorClassName}`}
                    alignPoints={BUBBLE_ALIGN_POINTS}
                >
                    <UiFocusTrap
                        returnFocusTo={triggerId}
                        returnFocusOnUnmount
                        onDeactivate={closeDialog}
                        autofocusOnOpen
                        refocusKey={dialogMode}
                    >
                        {dialogMode === "add" ? (
                            <AddFilterView onClose={openListDialog} />
                        ) : (
                            <FilterViewsList
                                filterViews={filterViews}
                                onAddNew={openAddDialog}
                                onClose={closeDialog}
                            />
                        )}
                    </UiFocusTrap>
                </ConfigurationBubble>
            ) : null}
        </div>
    );
};
