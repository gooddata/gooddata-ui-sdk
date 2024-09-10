// (C) 2024 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import { BubbleHoverTrigger, Bubble, Button, Typography, Icon, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { IDashboardFilterView, objRefToString } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import {
    useDashboardDispatch,
    applyFilterView,
    deleteFilterView,
    setFilterViewAsDefault,
    useDashboardSelector,
    selectFilterViewsAreLoading,
} from "../../../../model/index.js";

import { FilterViewDeleteConfirm } from "./FilterViewDeleteConfirm.js";
import { LoadingComponent } from "@gooddata/sdk-ui";

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

const SetAsDefaultButton: React.FC<{ isDefault: boolean; onClick: () => void }> = ({
    isDefault,
    onClick,
}) => (
    <Button className="gd-button gd-button-link gd-filter-view__item__button" size="small" onClick={onClick}>
        {isDefault ? (
            <FormattedMessage id="filters.filterViews.dropdown.unsetAsDefault" />
        ) : (
            <FormattedMessage id="filters.filterViews.dropdown.setAsDefault" />
        )}
    </Button>
);

const DeleteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <span className="gd-bubble-trigger-wrapper gd-filter-view__item__delete-button-wrapper">
        <BubbleHoverTrigger>
            <Button
                className="gd-button gd-button-link gd-button-icon-only gd-filter-view__item__button gd-filter-view__item__button--delete"
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

const FilterListItem: React.FC<{
    item: IDashboardFilterView;
    onApply: () => void;
    onSetAsDefault: () => void;
    onDelete: () => void;
}> = ({ item, onApply, onDelete, onSetAsDefault }) => {
    const { name, isDefault = false } = item;
    return (
        <div className="gd-filter-view__item">
            <DeleteButton onClick={onDelete} />
            <SetAsDefaultButton isDefault={isDefault} onClick={onSetAsDefault} />
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
};

export interface IFilterViewsDropdownBodyProps {
    filterViews: IDashboardFilterView[] | undefined;
    onAddNew: () => void;
    onClose: () => void;
}

export const FilterViewsList: React.FC<IFilterViewsDropdownBodyProps> = ({
    filterViews,
    onAddNew,
    onClose,
}) => {
    const theme = useTheme();
    const dispatch = useDashboardDispatch();
    const [filterViewToDelete, setFilterViewToDelete] = React.useState<IDashboardFilterView | undefined>(
        undefined,
    );
    const isLoading = useDashboardSelector(selectFilterViewsAreLoading);

    return (
        <>
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
                <div className="configuration-category">
                    {isLoading ? (
                        <div className="gd-filter-view__list__empty">
                            <LoadingComponent />
                        </div>
                    ) : filterViews && filterViews.length > 0 ? (
                        filterViews.map((filterView) => (
                            <FilterListItem
                                key={objRefToString(filterView.ref)}
                                item={filterView}
                                onApply={() => {
                                    dispatch(applyFilterView(filterView.ref));
                                    onClose();
                                }}
                                onSetAsDefault={() => {
                                    dispatch(setFilterViewAsDefault(filterView.ref, !filterView.isDefault));
                                    onClose();
                                }}
                                onDelete={() => setFilterViewToDelete(filterView)}
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
                            disabled={isLoading}
                        >
                            <FormattedMessage id="filters.filterViews.dropdown.newButton" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
