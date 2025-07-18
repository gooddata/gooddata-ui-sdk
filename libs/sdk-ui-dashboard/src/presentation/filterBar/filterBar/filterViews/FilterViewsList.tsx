// (C) 2024-2025 GoodData Corporation

import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    IAlignPoint,
    Icon,
    SELECT_ITEM_ACTION,
    Typography,
    UiFocusManager,
    useListWithActionsKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";
import { IDashboardFilterView, objRefToString } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import {
    applyFilterView,
    deleteFilterView,
    selectCanCreateFilterView,
    selectFilterViewsAreLoading,
    setFilterViewAsDefault,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";

import { FilterViewDeleteConfirm } from "./FilterViewDeleteConfirm.js";
import { LoadingComponent } from "@gooddata/sdk-ui";
import cx from "classnames";

type IAction = "setDefault" | "delete" | typeof SELECT_ITEM_ACTION;

const HEADER_TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "br tr",
        offset: { x: -5, y: 0 },
    },
];

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
    const theme = useTheme();
    const dispatch = useDashboardDispatch();
    const [filterViewToDelete, setFilterViewToDelete] = useState<IDashboardFilterView | undefined>(undefined);
    const isLoading = useDashboardSelector(selectFilterViewsAreLoading);
    const canCreateFilterView = useDashboardSelector(selectCanCreateFilterView);

    const getItemAdditionalActions = useCallback((): IAction[] => {
        if (!canCreateFilterView) {
            return [];
        }

        return ["setDefault", "delete"];
    }, [canCreateFilterView]);

    const handleSelect = useCallback(
        (filterView: IDashboardFilterView) => () => {
            dispatch(applyFilterView(filterView.ref));
            onClose();
        },
        [dispatch, onClose],
    );

    const handleSetAsDefault = useCallback(
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

    const handleDelete = useCallback(
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
                selectItem: handleSelect,
                setDefault: handleSetAsDefault,
                delete: handleDelete,
            },
        },
    );

    return (
        <UiFocusManager enableFocusTrap enableAutofocus={{ refocusKey }}>
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
                    <Typography tagName="h3" className="configuration-panel-header-title">
                        <div className="gd-title-with-icon">
                            <FormattedMessage id="filters.filterViews.dropdown.title" />
                            <span className="gd-bubble-trigger-wrapper">
                                <BubbleHoverTrigger>
                                    <Icon.QuestionMark
                                        color={theme?.palette?.complementary?.c7 ?? "#B0BECA"}
                                        width={16}
                                        height={16}
                                    />
                                    <Bubble alignPoints={HEADER_TOOLTIP_ALIGN_POINTS}>
                                        <div className="gd-filter-view__list__tooltip">
                                            <FormattedMessage
                                                id="filters.filterViews.dropdown.tooltip"
                                                values={{
                                                    p: (chunks) => <p>{chunks}</p>,
                                                }}
                                            />
                                        </div>
                                    </Bubble>
                                </BubbleHoverTrigger>
                            </span>
                        </div>
                    </Typography>
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
                                onApply={handleSelect(filterView)}
                                onSetAsDefault={handleSetAsDefault(filterView)}
                                onDelete={handleDelete(filterView)}
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
