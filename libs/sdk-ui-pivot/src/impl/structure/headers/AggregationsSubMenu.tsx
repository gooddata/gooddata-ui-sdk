// (C) 2007-2025 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";
import { type IntlShape } from "react-intl";

import { type IAttributeDescriptor, type TotalType } from "@gooddata/sdk-model";
import { ItemsWrapper, SubMenu } from "@gooddata/sdk-ui-kit";

import { type IColumnTotal } from "./aggregationsMenuTypes.js";
import { AggregationsSubMenuItems } from "./AggregationsSubMenuItems.js";
import { ColumnsHeaderIcon } from "./subMenuIcons/ColumnsIcon.js";
import { RowsHeaderIcon } from "./subMenuIcons/RowsIcon.js";
import { type IMenuAggregationClickConfig } from "../../privateTypes.js";
import { tableHasColumnAttributes, tableHasRowAttributes } from "../../utils.js";

const MENU_HEADER_OFFSET = -36;

export interface IAggregationsSubMenuProps {
    intl: IntlShape;
    totalType: TotalType;
    toggler: ReactElement;
    isMenuOpened?: boolean;
    rowAttributeDescriptors: IAttributeDescriptor[];
    columnAttributeDescriptors: IAttributeDescriptor[];
    measureLocalIdentifiers: string[];
    columnTotals: IColumnTotal[];
    rowTotals: IColumnTotal[];
    showColumnsSubMenu: boolean;
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
}

export function AggregationsSubMenu({
    intl,
    totalType,
    toggler,
    isMenuOpened = false,
    rowAttributeDescriptors,
    columnAttributeDescriptors,
    measureLocalIdentifiers,
    columnTotals,
    rowTotals,
    showColumnsSubMenu,
    onAggregationSelect,
}: IAggregationsSubMenuProps) {
    const menuOpenedProp = isMenuOpened ? { opened: true } : {};

    const shouldRenderSeparator =
        tableHasRowAttributes(rowAttributeDescriptors) &&
        tableHasColumnAttributes(columnAttributeDescriptors) &&
        showColumnsSubMenu;

    return (
        <SubMenu toggler={toggler} offset={MENU_HEADER_OFFSET} {...menuOpenedProp}>
            <ItemsWrapper>
                <div className="gd-aggregation-submenu s-table-header-submenu-content">
                    {tableHasRowAttributes(rowAttributeDescriptors) ? (
                        <AggregationsSubMenuItems
                            intl={intl}
                            attributeDescriptors={rowAttributeDescriptors}
                            measureLocalIdentifiers={measureLocalIdentifiers}
                            totalType={totalType}
                            totals={columnTotals}
                            isColumn
                            icon={<RowsHeaderIcon />}
                            headerText={intl.formatMessage({
                                id: "visualizations.menu.aggregations.rows",
                            })}
                            onAggregationSelect={onAggregationSelect}
                        />
                    ) : null}
                    <div
                        className={cx("s-table-header-submenu-rows-separator", {
                            "gd-aggregation-submenu-rows-separator": shouldRenderSeparator,
                        })}
                    />
                    {tableHasColumnAttributes(columnAttributeDescriptors) && showColumnsSubMenu ? (
                        <AggregationsSubMenuItems
                            intl={intl}
                            attributeDescriptors={columnAttributeDescriptors}
                            measureLocalIdentifiers={measureLocalIdentifiers}
                            totalType={totalType}
                            totals={rowTotals}
                            isColumn={false}
                            icon={<ColumnsHeaderIcon />}
                            headerText={intl.formatMessage({
                                id: "visualizations.menu.aggregations.columns",
                            })}
                            onAggregationSelect={onAggregationSelect}
                        />
                    ) : null}
                </div>
            </ItemsWrapper>
        </SubMenu>
    );
}
