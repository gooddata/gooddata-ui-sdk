// (C) 2024-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { IDashboardFilterView, objRefToString } from "@gooddata/sdk-model";
import { LoadingComponent } from "@gooddata/sdk-ui";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    IAlignPoint,
    SELECT_ITEM_ACTION,
    Typography,
    UiFocusManager,
    UiIconButton,
    UiTooltip,
    useId,
    useListWithActionsKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";

import { FilterViewDeleteConfirm } from "./FilterViewDeleteConfirm.js";
import {
    applyFilterView,
    deleteFilterView,
    selectCanCreateFilterView,
    selectFilterViewsAreLoading,
    setFilterViewAsDefault,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";

type IAction = "setDefault" | "delete" | typeof SELECT_ITEM_ACTION;

const ITEM_TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "br tr",
        offset: { x: -10, y: 2 },
    },
];

function SetAsDefaultButton({
    isDefault,
    isFocused,
    onClick,
}: {
    isDefault: boolean;
    isFocused: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            className={cx("gd-button gd-button-link gd-filter-view__item__button", {
                "gd-filter-view__item__button--isFocused": isFocused,
            })}
            size="small"
            onClick={onClick}
        >
            {isDefault ? (
                <FormattedMessage id="filters.filterViews.dropdown.unsetAsDefault" />
            ) : (
                <FormattedMessage id="filters.filterViews.dropdown.setAsDefault" />
            )}
        </Button>
    );
}

function DeleteButton({ isFocused, onClick }: { isFocused: boolean; onClick: () => void }) {
    return (
        <span className="gd-bubble-trigger-wrapper gd-filter-view__item__delete-button-wrapper">
            <BubbleHoverTrigger>
                <Button
                    className={cx(
                        "gd-button gd-button-link gd-button-icon-only gd-filter-view__item__button gd-filter-view__item__button--delete",
                        { "gd-filter-view__item__button--isFocused": isFocused },
                    )}
                    iconLeft="gd-icon-trash"
                    size="small"
                    onClick={onClick}
                />
                <Bubble alignPoints={ITEM_TOOLTIP_ALIGN_POINTS}>
                    <FormattedMessage id="filters.filterViews.add.deleteTooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}

function FilterListItem({
    item,
    focusedAction,
    onApply,
    onDelete,
    onSetAsDefault,
}: {
    item: IDashboardFilterView;
    focusedAction?: IAction;
    onApply: () => void;
    onSetAsDefault?: () => void;
    onDelete?: () => void;
}) {
    const { name, isDefault = false } = item;
    return (
        <div
            className={cx("gd-filter-view__item", {
                "gd-filter-view__item--isFocused": !!focusedAction,
                "gd-filter-view__item--isFocusedSelectItem": focusedAction === SELECT_ITEM_ACTION,
            })}
        >
            {onDelete ? <DeleteButton onClick={onDelete} isFocused={focusedAction === "delete"} /> : null}
            {onSetAsDefault ? (
                <SetAsDefaultButton
                    isDefault={isDefault}
                    onClick={onSetAsDefault}
                    isFocused={focusedAction === "setDefault"}
                />
            ) : null}
            <div className="gd-filter-view__item__value" onClick={onApply}>
                <span className="gd-filter-view__item__value__title">{name}</span>
                {isDefault ? (
                    <span className="gd-filter-view__item__value__suffix">
                        <FormattedMessage id="filters.filterViews.dropdown.isDefault" />
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export interface IFilterViewsDropdownBodyProps {
    filterViews: IDashboardFilterView[] | undefined;
    onAddNew: () => void;
    onClose: () => void;
}

export function FilterViewsList({ filterViews = [], onAddNew, onClose }: IFilterViewsDropdownBodyProps) {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const [filterViewToDelete, setFilterViewToDelete] = React.useState<IDashboardFilterView | undefined>(
        undefined,
    );
    const isLoading = useDashboardSelector(selectFilterViewsAreLoading);
    const canCreateFilterView = useDashboardSelector(selectCanCreateFilterView);
    const id = useId();
    const createViewId = `create-view-${id}`;
    const filterViewTooltipId = `filter-view-tooltip-${id}`;

    const getItemAdditionalActions = React.useCallback((): IAction[] => {
        if (!canCreateFilterView) {
            return [];
        }
        return ["setDefault", "delete"];
    }, [canCreateFilterView]);

    const createSelectHandler = React.useCallback(
        (filterView: IDashboardFilterView) => () => {
            dispatch(applyFilterView(filterView.ref));
            onClose();
        },
        [dispatch, onClose],
    );

    const createSetAsDefaultHandler = React.useCallback(
        (filterView: IDashboardFilterView) => {
            if (!canCreateFilterView) {
                return undefined;
            }
            return () => {
                dispatch(setFilterViewAsDefault(filterView.ref, !filterView.isDefault));
            };
        },
        [canCreateFilterView, dispatch],
    );

    const createSetAsDefaultAndCloseHandler = React.useCallback(
        (filterView: IDashboardFilterView) => {
            const handler = createSetAsDefaultHandler(filterView);
            if (handler === undefined) {
                return undefined;
            }
            return () => {
                handler();
                onClose();
            };
        },
        [createSetAsDefaultHandler, onClose],
    );

    const createDeleteHandler = React.useCallback(
        (filterView: IDashboardFilterView) => {
            if (!canCreateFilterView) {
                return undefined;
            }
            return () => {
                setFilterViewToDelete(filterView);
            };
        },
        [canCreateFilterView],
    );

    const refocusKey = `${isLoading}`;

    const { onKeyboardNavigation, onBlur, focusedItem, focusedAction } = useListWithActionsKeyboardNavigation(
        {
            items: filterViews,
            getItemAdditionalActions,
            actionHandlers: {
                selectItem: createSelectHandler,
                setDefault: createSetAsDefaultAndCloseHandler,
                delete: createDeleteHandler,
            },
        },
    );

    const contentTooltip = (
        <div className="gd-filter-view__list__tooltip">
            <FormattedMessage
                id="filters.filterViews.dropdown.tooltip"
                values={{
                    p: (chunks) => <p>{chunks}</p>,
                }}
            />
        </div>
    );

    return (
        <UiFocusManager enableFocusTrap enableAutofocus={{ refocusKey, initialFocus: createViewId }}>
            {filterViewToDelete ? (
                <FilterViewDeleteConfirm
                    filterView={filterViewToDelete}
                    onConfirm={() => {
                        dispatch(deleteFilterView(filterViewToDelete.ref));
                        setFilterViewToDelete(undefined);
                    }}
                    onCancel={() => setFilterViewToDelete(undefined)}
                />
            ) : null}
            <div className="configuration-panel configuration-panel__filter-view__list">
                <div className="configuration-panel-header">
                    <div className="gd-title-with-icon">
                        <Typography tagName="h3" className="configuration-panel-header-title">
                            <FormattedMessage id="filters.filterViews.dropdown.title" />
                        </Typography>
                        <UiTooltip
                            id={filterViewTooltipId}
                            arrowPlacement="top-end"
                            content={contentTooltip}
                            anchor={
                                <UiIconButton
                                    icon="question"
                                    variant="tertiary"
                                    size="small"
                                    accessibilityConfig={{
                                        ariaDescribedBy: filterViewTooltipId,
                                        ariaLabel: intl.formatMessage({
                                            id: "filters.filterViews.tooltip.ariaLabel",
                                        }),
                                    }}
                                />
                            }
                            triggerBy={["hover", "focus"]}
                        />
                    </div>
                </div>
                <div
                    className="configuration-category gd-filter-view__list"
                    onKeyDown={onKeyboardNavigation}
                    onBlur={onBlur}
                    tabIndex={filterViews.length > 0 ? 0 : -1}
                >
                    {isLoading ? (
                        <div className="gd-filter-view__list__empty">
                            <LoadingComponent />
                        </div>
                    ) : filterViews.length > 0 ? (
                        filterViews.map((filterView) => (
                            <FilterListItem
                                key={objRefToString(filterView.ref)}
                                item={filterView}
                                focusedAction={filterView === focusedItem ? focusedAction : undefined}
                                onApply={createSelectHandler(filterView)}
                                onSetAsDefault={createSetAsDefaultHandler(filterView)}
                                onDelete={createDeleteHandler(filterView)}
                            />
                        ))
                    ) : (
                        <div className="gd-filter-view__list__empty">
                            <FormattedMessage id="filters.filterViews.dropdown.emptyList" />
                        </div>
                    )}
                </div>
                <div className="configuration-panel-footer">
                    <div className="configuration-panel-footer__content">
                        <Button
                            id={createViewId}
                            className="gd-button gd-button gd-button-link"
                            iconLeft="gd-icon-plus"
                            size="small"
                            onClick={onAddNew}
                            disabled={!canCreateFilterView}
                        >
                            <FormattedMessage id="filters.filterViews.dropdown.newButton" />
                        </Button>
                    </div>
                </div>
            </div>
        </UiFocusManager>
    );
}
