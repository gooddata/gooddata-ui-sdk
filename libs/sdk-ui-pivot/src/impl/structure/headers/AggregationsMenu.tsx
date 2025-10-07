// (C) 2019-2025 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { IntlShape } from "react-intl";

import {
    IAttributeDescriptor,
    IExecutionDefinition,
    ITheme,
    ITotal,
    TotalType,
    isMeasureValueFilter,
    isRankingFilter,
    measureValueFilterCondition,
} from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    Header,
    IOnOpenedChangeParams,
    Icon,
    Item,
    ItemsWrapper,
    Menu,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import menuHelper, { getAttributeDescriptorsLocalId } from "./aggregationsMenuHelper.js";
import { IColumnTotal } from "./aggregationsMenuTypes.js";
import AggregationsSubMenu from "./AggregationsSubMenu.js";
import { messages } from "../../../locales.js";
import { IMenuAggregationClickConfig } from "../../privateTypes.js";
import { TableDescriptor } from "../tableDescriptor.js";
import {
    isRootCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
    isSliceMeasureCol,
} from "../tableDescriptorTypes.js";
/*
 * TODO: same thing is in sdk-ui-ext .. but pivot must not depend on it. we may be in need of some lower-level
 *  project on which both of filters and ext can depend. perhaps the purpose of the new project would be to provide
 *  thin layer on top of goodstrap (?)
 */
const SHOW_DELAY_DEFAULT = 200;
const HIDE_DELAY_DEFAULT = 0;

export interface IAggregationsMenuProps {
    intl: IntlShape;
    isMenuOpened: boolean;
    isMenuButtonVisible: boolean;
    showSubmenu: boolean;
    showColumnsSubMenu: boolean;
    availableTotalTypes: TotalType[];
    colId: string;
    getTableDescriptor: () => TableDescriptor;
    getExecutionDefinition: () => IExecutionDefinition;
    getColumnTotals?: () => ITotal[];
    getRowTotals?: () => ITotal[];
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
    onMenuOpenedChange: ({ opened, source }: IOnOpenedChangeParams) => void;
    theme?: ITheme;
}

function MenuToggler() {
    const theme = useTheme();

    const BurgerMenuIcon = Icon["BurgerMenu"];

    return (
        <div className="menu-icon">
            <BurgerMenuIcon color={theme?.palette?.complementary?.c8} />
        </div>
    );
}

export default function AggregationsMenu({
    intl,
    colId,
    getTableDescriptor,
    isMenuOpened,
    onMenuOpenedChange,
    showColumnsSubMenu,
    isMenuButtonVisible,
    getColumnTotals,
    getRowTotals,
    getExecutionDefinition,
    onAggregationSelect,
    showSubmenu,
    availableTotalTypes,
}: IAggregationsMenuProps) {
    const getColumnTotalsWrapper = (
        measureLocalIdentifiers: string[],
        isGroupedHeader: boolean,
        ignoreMeasures: boolean,
    ): IColumnTotal[] => {
        const columnTotals = getColumnTotals?.() ?? [];

        if (isGroupedHeader) {
            return menuHelper.getTotalsForAttributeHeader(
                columnTotals,
                measureLocalIdentifiers,
                ignoreMeasures,
            );
        }

        return menuHelper.getTotalsForMeasureHeader(columnTotals, measureLocalIdentifiers[0]);
    };

    const getRowTotalsWrapper = useCallback(
        (
            measureLocalIdentifiers: string[],
            isGroupedHeader: boolean,
            ignoreMeasures: boolean,
        ): IColumnTotal[] => {
            const rowTotals = getRowTotals?.() ?? [];

            if (isGroupedHeader) {
                return menuHelper.getTotalsForAttributeHeader(
                    rowTotals,
                    measureLocalIdentifiers,
                    ignoreMeasures,
                );
            }

            return menuHelper.getTotalsForMeasureHeader(rowTotals, measureLocalIdentifiers[0]);
        },
        [getRowTotals],
    );

    const getTogglerClassNames = useCallback(() => {
        return cx("s-table-header-menu", "gd-pivot-table-header-menu", {
            "gd-pivot-table-header-menu--show": isMenuButtonVisible,
            "gd-pivot-table-header-menu--hide": !isMenuButtonVisible,
            "gd-pivot-table-header-menu--open": isMenuOpened,
        });
    }, [isMenuButtonVisible, isMenuOpened]);

    const renderMenuItemContent = useCallback(
        (
            totalType: TotalType,
            isSelected: boolean,
            hasSubMenu = false,
            disabled: boolean,
            tooltipMessage?: string,
        ) => {
            const itemElement = (
                <Item checked={isSelected} subMenu={hasSubMenu} disabled={disabled}>
                    <div className="gd-aggregation-menu-item-inner s-menu-aggregation-inner">
                        {intl.formatMessage(messages[totalType])}
                    </div>
                </Item>
            );
            return disabled ? (
                <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                    {itemElement}
                    <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                        {tooltipMessage}
                    </Bubble>
                </BubbleHoverTrigger>
            ) : (
                itemElement
            );
        },
        [intl],
    );

    const getItemClassNames = useCallback((totalType: TotalType): string => {
        return cx("gd-aggregation-menu-item", "s-menu-aggregation", `s-menu-aggregation-${totalType}`);
    }, []);

    const isTableFilteredByMeasureValue = useCallback(() => {
        const definition = getExecutionDefinition();

        // ignore measure value filters without condition, these are not yet specified by the user and are not sent as part of the execution
        return definition.filters.some(
            (filter) => isMeasureValueFilter(filter) && !!measureValueFilterCondition(filter),
        );
    }, [getExecutionDefinition]);

    const isTableFilteredByRankingFilter = useCallback(() => {
        const definition = getExecutionDefinition();
        return definition.filters.some(isRankingFilter);
    }, [getExecutionDefinition]);

    const renderMainMenuItems = useCallback(
        (
            columnTotals: IColumnTotal[],
            rowTotals: IColumnTotal[],
            measureLocalIdentifiers: string[],
            rowAttributeDescriptors: IAttributeDescriptor[],
            columnAttributeDescriptors: IAttributeDescriptor[],
            showColumnsSubMenu: boolean,
        ) => {
            const isFilteredByMeasureValue = isTableFilteredByMeasureValue();
            const isFilteredByRankingFilter = isTableFilteredByRankingFilter();
            const rowAttributeIdentifiers = getAttributeDescriptorsLocalId(rowAttributeDescriptors);
            const columnAttributeIdentifiers = getAttributeDescriptorsLocalId(columnAttributeDescriptors);

            return availableTotalTypes.map((totalType: TotalType) => {
                const isSelected = menuHelper.isTotalEnabledForAttribute(
                    rowAttributeIdentifiers,
                    columnAttributeIdentifiers,
                    totalType,
                    columnTotals,
                    rowTotals,
                );
                const itemClassNames = getItemClassNames(totalType);

                const disabled =
                    totalType === "nat" && (isFilteredByMeasureValue || isFilteredByRankingFilter);
                const cause = isFilteredByMeasureValue
                    ? messages[`disabled.mvf`]
                    : messages[`disabled.ranking`];
                const tooltipMessage = disabled ? intl.formatMessage(cause) : undefined;

                const renderSubmenu = !disabled && showSubmenu;
                const toggler = renderMenuItemContent(
                    totalType,
                    isSelected,
                    renderSubmenu,
                    disabled,
                    tooltipMessage,
                );

                return (
                    <div className={itemClassNames} key={totalType}>
                        {renderSubmenu ? (
                            <AggregationsSubMenu
                                intl={intl}
                                totalType={totalType}
                                rowAttributeDescriptors={rowAttributeDescriptors}
                                columnAttributeDescriptors={columnAttributeDescriptors}
                                columnTotals={columnTotals}
                                rowTotals={rowTotals}
                                measureLocalIdentifiers={measureLocalIdentifiers}
                                onAggregationSelect={onAggregationSelect}
                                toggler={toggler}
                                showColumnsSubMenu={showColumnsSubMenu}
                            />
                        ) : (
                            toggler
                        )}
                    </div>
                );
            });
        },
        [
            availableTotalTypes,
            getItemClassNames,
            intl,
            isTableFilteredByMeasureValue,
            isTableFilteredByRankingFilter,
            onAggregationSelect,
            renderMenuItemContent,
            showSubmenu,
        ],
    );

    if (!colId) {
        return null;
    }

    // Because of Ag-grid react wrapper does not rerender the component when we pass
    // new gridOptions we need to pull the data manually on each render
    const tableDescriptor = getTableDescriptor();

    const canShowMenu = tableDescriptor.canTableHaveColumnTotals() && showColumnsSubMenu;

    if (!tableDescriptor.canTableHaveRowTotals() && !canShowMenu) {
        return null;
    }

    const col = tableDescriptor.getCol(colId);

    if (isSliceCol(col) || isRootCol(col)) {
        // aggregation menu should not appear on headers of the slicing columns or on the
        // very to header which describes table grouping
        return null;
    }

    // Note: for measures in rows, where the column is of type isSliceMeasureCol()
    // we have all measures associated with the menu. This is overriden in the individual
    // cell renderers for particular measure with specific onMenuAggregationClick fn.
    const measures = isSeriesCol(col)
        ? [col.seriesDescriptor.measureDescriptor]
        : tableDescriptor.getMeasures();
    const measureLocalIdentifiers = measures.map((m) => m.measureHeaderItem.localIdentifier);
    const useGrouped = isScopeCol(col) || isSliceMeasureCol(col);
    const columnTotals = getColumnTotalsWrapper(measureLocalIdentifiers, useGrouped, isSliceMeasureCol(col));
    const rowTotals = getRowTotalsWrapper(measureLocalIdentifiers, useGrouped, isSliceMeasureCol(col));
    const rowAttributeDescriptors = tableDescriptor.getSlicingAttributes();
    const columnAttributeDescriptors = tableDescriptor.getScopingAttributes();

    return (
        <Menu
            toggler={<MenuToggler />}
            togglerWrapperClassName={getTogglerClassNames()}
            opened={isMenuOpened}
            onOpenedChange={onMenuOpenedChange}
            openAction={"click"}
            closeOnScroll
        >
            <ItemsWrapper>
                <div className="s-table-header-menu-content">
                    <Header>{intl.formatMessage({ id: "visualizations.menu.aggregations" })}</Header>
                    {renderMainMenuItems(
                        columnTotals,
                        rowTotals,
                        measureLocalIdentifiers,
                        rowAttributeDescriptors,
                        columnAttributeDescriptors,
                        showColumnsSubMenu,
                    )}
                </div>
            </ItemsWrapper>
        </Menu>
    );
}
