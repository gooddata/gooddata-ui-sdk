// (C) 2019-2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { IntlShape } from "react-intl";
import {
    IExecutionDefinition,
    isMeasureValueFilter,
    ITotal,
    TotalType,
    measureValueFilterCondition,
    isRankingFilter,
    ITheme,
    IAttributeDescriptor,
} from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    Header,
    Icon,
    Item,
    ItemsWrapper,
    Menu,
    IOnOpenedChangeParams,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import menuHelper, { getAttributeDescriptorsLocalId } from "./aggregationsMenuHelper.js";
import AggregationsSubMenu from "./AggregationsSubMenu.js";
import { IColumnTotal } from "./aggregationsMenuTypes.js";
import { TableDescriptor } from "../tableDescriptor.js";
import { isScopeCol, isSeriesCol, isRootCol, isSliceCol } from "../tableDescriptorTypes.js";
import { IMenuAggregationClickConfig } from "../../privateTypes.js";
import { messages } from "../../../locales.js";
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

const MenuToggler = () => {
    const theme = useTheme();
    return (
        <div className="menu-icon">
            <Icon.BurgerMenu color={theme?.palette?.complementary?.c8} />
        </div>
    );
};

export default class AggregationsMenu extends React.Component<IAggregationsMenuProps> {
    public render() {
        const { intl, colId, getTableDescriptor, isMenuOpened, onMenuOpenedChange, showColumnsSubMenu } =
            this.props;

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

        const measures = isSeriesCol(col)
            ? [col.seriesDescriptor.measureDescriptor]
            : tableDescriptor.getMeasures();
        const measureLocalIdentifiers = measures.map((m) => m.measureHeaderItem.localIdentifier);
        const columnTotals = this.getColumnTotals(measureLocalIdentifiers, isScopeCol(col));
        const rowTotals = this.getRowTotals(measureLocalIdentifiers, isScopeCol(col));
        const rowAttributeDescriptors = tableDescriptor.getSlicingAttributes();
        const columnAttributeDescriptors = tableDescriptor.getScopingAttributes();

        return (
            <Menu
                toggler={<MenuToggler />}
                togglerWrapperClassName={this.getTogglerClassNames()}
                opened={isMenuOpened}
                onOpenedChange={onMenuOpenedChange}
                openAction={"click"}
                closeOnScroll={true}
            >
                <ItemsWrapper>
                    <div className="s-table-header-menu-content">
                        <Header>{intl.formatMessage({ id: "visualizations.menu.aggregations" })}</Header>
                        {this.renderMainMenuItems(
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

    private getColumnTotals(measureLocalIdentifiers: string[], isGroupedHeader: boolean): IColumnTotal[] {
        const columnTotals = this.props.getColumnTotals?.() ?? [];

        if (isGroupedHeader) {
            return menuHelper.getTotalsForAttributeHeader(columnTotals, measureLocalIdentifiers);
        }

        return menuHelper.getTotalsForMeasureHeader(columnTotals, measureLocalIdentifiers[0]);
    }

    private getRowTotals(measureLocalIdentifiers: string[], isGroupedHeader: boolean): IColumnTotal[] {
        const rowTotals = this.props.getRowTotals?.() ?? [];

        if (isGroupedHeader) {
            return menuHelper.getTotalsForAttributeHeader(rowTotals, measureLocalIdentifiers);
        }

        return menuHelper.getTotalsForMeasureHeader(rowTotals, measureLocalIdentifiers[0]);
    }

    private getTogglerClassNames() {
        const { isMenuButtonVisible, isMenuOpened } = this.props;

        return cx("s-table-header-menu", "gd-pivot-table-header-menu", {
            "gd-pivot-table-header-menu--show": isMenuButtonVisible,
            "gd-pivot-table-header-menu--hide": !isMenuButtonVisible,
            "gd-pivot-table-header-menu--open": isMenuOpened,
        });
    }

    private renderMenuItemContent(
        totalType: TotalType,
        isSelected: boolean,
        hasSubMenu = false,
        disabled: boolean,
        tooltipMessage?: string,
    ) {
        const { intl } = this.props;
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
    }

    private getItemClassNames(totalType: TotalType): string {
        return cx("gd-aggregation-menu-item", "s-menu-aggregation", `s-menu-aggregation-${totalType}`);
    }

    private isTableFilteredByMeasureValue(): boolean {
        const definition = this.props.getExecutionDefinition();

        // ignore measure value filters without condition, these are not yet specified by the user and are not sent as part of the execution
        return definition.filters.some(
            (filter) => isMeasureValueFilter(filter) && !!measureValueFilterCondition(filter),
        );
    }

    private isTableFilteredByRankingFilter(): boolean {
        const definition = this.props.getExecutionDefinition();
        return definition.filters.some(isRankingFilter);
    }

    private renderMainMenuItems(
        columnTotals: IColumnTotal[],
        rowTotals: IColumnTotal[],
        measureLocalIdentifiers: string[],
        rowAttributeDescriptors: IAttributeDescriptor[],
        columnAttributeDescriptors: IAttributeDescriptor[],
        showColumnsSubMenu: boolean,
    ) {
        const { intl, onAggregationSelect, showSubmenu, availableTotalTypes } = this.props;
        const isFilteredByMeasureValue = this.isTableFilteredByMeasureValue();
        const isFilteredByRankingFilter = this.isTableFilteredByRankingFilter();
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
            const itemClassNames = this.getItemClassNames(totalType);

            const disabled = totalType === "nat" && (isFilteredByMeasureValue || isFilteredByRankingFilter);
            const cause = isFilteredByMeasureValue ? messages[`disabled.mvf`] : messages[`disabled.ranking`];
            const tooltipMessage = disabled ? intl.formatMessage(cause) : undefined;

            const renderSubmenu = !disabled && showSubmenu;
            const toggler = this.renderMenuItemContent(
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
    }
}
