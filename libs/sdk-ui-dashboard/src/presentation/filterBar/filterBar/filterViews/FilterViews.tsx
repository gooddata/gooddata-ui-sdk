// (C) 2024 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IAlignPoint, DropdownButton, useMediaQuery } from "@gooddata/sdk-ui-kit";
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

const useCallbacks = () => {
    const dispatch = useDashboardDispatch();

    const toggleDialog = useCallback(() => dispatch(uiActions.toggleFilterViewsDialog()), [dispatch]);

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
    const isMobile = useMediaQuery("mobileDevice");
    const { toggleDialog, openAddDialog, openListDialog, closeDialog } = useCallbacks();

    useFilterViewsToastMessages();

    // On mobile the dropdown button is not on filter bar but rendered inside the "..." dashboard menu.
    // The dropdown body must still be rendered so the body can be opened when user uses the menu.
    // Also, the menu is not available for new dashboard as new filter view can be saved only for an existing
    // dashboard with ref id.
    const showDropdownButton = isFilterViewsEnabledForDashboard && !isNewDashboard && !isMobile;

    const buttonClassNames = cx(
        "gd-filter-views-button",
        "gd-filter-views__dropdown-anchor",
        "gd-button-large",
        {
            "gd-filter-views-button--open": isDialogOpen,
        },
    );

    return (
        <div className="gd-filter-views">
            {showDropdownButton ? (
                <>
                    <DropdownButton onClick={toggleDialog} className={buttonClassNames} isOpen={isDialogOpen}>
                        <DropdownButtonLabel filterViews={filterViews} />
                    </DropdownButton>
                    {isDashboardEditMode ? <div className="gd-filters-views__panel__divider" /> : null}
                </>
            ) : (
                <div className="gd-filter-views__dropdown-anchor" />
            )}
            {isDialogOpen ? (
                <ConfigurationBubble
                    classNames="gd-filters-views__panel"
                    onClose={closeDialog}
                    alignTo=".gd-filter-views__dropdown-anchor"
                    alignPoints={BUBBLE_ALIGN_POINTS}
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
                </ConfigurationBubble>
            ) : null}
        </div>
    );
};
