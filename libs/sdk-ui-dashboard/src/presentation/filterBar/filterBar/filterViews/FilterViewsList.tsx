// (C) 2024-2025 GoodData Corporation

import { FocusEventHandler, MutableRefObject, useCallback, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { IDashboardFilterView, objRefToString } from "@gooddata/sdk-model";
import { LoadingComponent } from "@gooddata/sdk-ui";
import {
    Button,
    ListWithActionsFocusStore,
    SELECT_ITEM_ACTION,
    Typography,
    UiFocusManager,
    UiIcon,
    UiIconButton,
    UiLink,
    UiTooltip,
    useFocusWithinContainer,
    useId,
    useIdPrefixed,
    useListWithActionsFocusStoreValue,
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

function SetAsDefaultButton({
    isDefault,
    isFocused,
    onClick,
    title,
    id,
}: {
    isDefault: boolean;
    isFocused: boolean;
    onClick: () => void;
    title: string;
    id?: string;
}) {
    const { formatMessage } = useIntl();

    return (
        <div
            className={cx("gd-filter-view__item__button", {
                "gd-filter-view__item__button--isFocused": isFocused,
            })}
            role={"gridcell"}
        >
            <UiLink
                variant={"primary"}
                flipUnderline
                onClick={onClick}
                id={id}
                tabIndex={isFocused ? 0 : -1}
                role={"button"}
                aria-label={
                    isDefault
                        ? formatMessage(
                              { id: "filters.filterViews.dropdown.unsetAsDefault.ariaLabel" },
                              { name: title },
                          )
                        : formatMessage(
                              { id: "filters.filterViews.dropdown.setAsDefault.ariaLabel" },
                              { name: title },
                          )
                }
            >
                {isDefault ? (
                    <FormattedMessage id="filters.filterViews.dropdown.unsetAsDefault" />
                ) : (
                    <FormattedMessage id="filters.filterViews.dropdown.setAsDefault" />
                )}
            </UiLink>
        </div>
    );
}

function DeleteButton({
    isFocused,
    onClick,
    title,
    id,
}: {
    isFocused: boolean;
    onClick: () => void;
    title: string;
    id?: string;
}) {
    const { formatMessage } = useIntl();

    return (
        <div className="gd-filter-view__item__delete-button-wrapper" role={"gridcell"}>
            <UiTooltip
                arrowPlacement="top-end"
                triggerBy={isFocused ? [] : ["hover"]}
                content={formatMessage({ id: "filters.filterViews.add.deleteTooltip" })}
                anchor={
                    <div
                        className={cx("gd-filter-view__item__button gd-filter-view__item__button--delete", {
                            "gd-filter-view__item__button--isFocused": isFocused,
                        })}
                        role={"button"}
                        aria-label={formatMessage(
                            { id: "filters.filterViews.add.deleteTooltip.ariaLabel" },
                            { name: title },
                        )}
                        onClick={onClick}
                        id={id}
                        tabIndex={isFocused ? 0 : -1}
                    >
                        <UiIcon type={"trash"} size={12} ariaHidden layout={"block"} color={"currentColor"} />
                    </div>
                }
            />
        </div>
    );
}

function FilterListItem({
    item,
    index,
    focusedAction,
    onApply,
    onDelete,
    onSetAsDefault,
}: {
    item: IDashboardFilterView;
    index: number;
    focusedAction?: IAction;
    onApply: () => void;
    onSetAsDefault?: () => void;
    onDelete?: () => void;
}) {
    const { name, isDefault = false } = item;

    const isFocused = !!focusedAction;
    const makeId = ListWithActionsFocusStore.useContextStoreOptional((ctx) => ctx.makeId);
    const titleId = useIdPrefixed("title");

    return (
        <div
            className={cx("gd-filter-view__item", {
                "gd-filter-view__item--isFocused": isFocused,
                "gd-filter-view__item--isFocusedSelectItem": focusedAction === SELECT_ITEM_ACTION,
            })}
            role="row"
            aria-rowindex={index + 1}
            aria-labelledby={titleId}
            tabIndex={-1}
        >
            <div className="gd-filter-view__item__value" onClick={onApply} id={titleId} role={"gridcell"}>
                <div
                    role={"button"}
                    tabIndex={focusedAction === SELECT_ITEM_ACTION ? 0 : -1}
                    id={makeId?.({ item, action: SELECT_ITEM_ACTION }) ?? undefined}
                >
                    <span className="gd-filter-view__item__value__title">{name}</span>
                    {isDefault ? (
                        <span className="gd-filter-view__item__value__suffix">
                            &nbsp;
                            <FormattedMessage id="filters.filterViews.dropdown.isDefault" />
                        </span>
                    ) : null}
                </div>
            </div>
            {onSetAsDefault ? (
                <SetAsDefaultButton
                    isDefault={isDefault}
                    title={name}
                    onClick={onSetAsDefault}
                    isFocused={focusedAction === "setDefault"}
                    id={makeId?.({ item, action: "setDefault" })}
                />
            ) : null}
            {onDelete ? (
                <DeleteButton
                    onClick={onDelete}
                    title={name}
                    isFocused={focusedAction === "delete"}
                    id={makeId?.({ item, action: "delete" })}
                />
            ) : null}
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
    const [filterViewToDelete, setFilterViewToDelete] = useState<IDashboardFilterView | undefined>(undefined);
    const isLoading = useDashboardSelector(selectFilterViewsAreLoading);
    const canCreateFilterView = useDashboardSelector(selectCanCreateFilterView);
    const id = useId();
    const createViewId = `create-view-${id}`;
    const filterViewTooltipId = `filter-view-tooltip-${id}`;

    const getItemAdditionalActions = useCallback((): IAction[] => {
        if (!canCreateFilterView) {
            return [];
        }
        return ["setDefault", "delete"];
    }, [canCreateFilterView]);

    const createSelectHandler = useCallback(
        (filterView: IDashboardFilterView) => () => {
            dispatch(applyFilterView(filterView.ref));
            onClose();
        },
        [dispatch, onClose],
    );

    const createSetAsDefaultHandler = useCallback(
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

    const createSetAsDefaultAndCloseHandler = useCallback(
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

    const createDeleteHandler = useCallback(
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

    const { onKeyboardNavigation, focusedItem, focusedAction, setFocusedAction } =
        useListWithActionsKeyboardNavigation({
            items: filterViews,
            getItemAdditionalActions,
            actionHandlers: {
                selectItem: createSelectHandler,
                setDefault: createSetAsDefaultAndCloseHandler,
                delete: createDeleteHandler,
            },
            isSimple: true,
        });

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

    const listWithActionsFocusStoreValue = useListWithActionsFocusStoreValue((item) =>
        item ? objRefToString((item as IDashboardFilterView).ref) : "",
    );

    const { containerRef } = useFocusWithinContainer(
        listWithActionsFocusStoreValue.makeId({ item: focusedItem, action: focusedAction }) ?? "",
    );

    const handleBlur = useCallback<FocusEventHandler>(
        // Select the default action when the focus leaves the list
        (e) => {
            if (containerRef.current.contains(e.relatedTarget)) {
                return;
            }

            setFocusedAction(SELECT_ITEM_ACTION);
        },
        [containerRef, setFocusedAction],
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
                <ListWithActionsFocusStore value={listWithActionsFocusStoreValue}>
                    <div
                        className="configuration-category gd-filter-view__list"
                        role="grid"
                        ref={containerRef as MutableRefObject<HTMLDivElement>}
                        onKeyDown={onKeyboardNavigation}
                        onBlur={handleBlur}
                        tabIndex={-1}
                        id={listWithActionsFocusStoreValue.containerId}
                        aria-label={
                            canCreateFilterView
                                ? intl.formatMessage({ id: "filters.filterViews.list.ariaLabel.withActions" })
                                : intl.formatMessage({ id: "filters.filterViews.list.ariaLabel.noActions" })
                        }
                        aria-rowcount={filterViews.length}
                    >
                        {isLoading ? (
                            <div className="gd-filter-view__list__empty">
                                <LoadingComponent />
                            </div>
                        ) : filterViews.length > 0 ? (
                            filterViews.map((filterView, index) => (
                                <FilterListItem
                                    key={objRefToString(filterView.ref)}
                                    item={filterView}
                                    index={index}
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
                </ListWithActionsFocusStore>
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
