// (C) 2007-2023 GoodData Corporation
import { ItemsWrapper, SubMenu } from "@gooddata/sdk-ui-kit";
import { TotalType, IAttributeDescriptor } from "@gooddata/sdk-model";
import cx from "classnames";
import React from "react";
import { IntlShape } from "react-intl";

import { IColumnTotal } from "./aggregationsMenuTypes.js";
import { IMenuAggregationClickConfig } from "../../privateTypes.js";
import { tableHasColumnAttributes, tableHasRowAttributes } from "../../utils.js";
import { AggregationsSubMenuItems } from "./AggregationsSubMenuItems.js";
import { RowsHeaderIcon } from "./subMenuIcons/RowsIcon.js";
import { ColumnsHeaderIcon } from "./subMenuIcons/ColumnsIcon.js";

const MENU_HEADER_OFFSET = -36;

export interface IAggregationsSubMenuProps {
    intl: IntlShape;
    totalType: TotalType;
    toggler: JSX.Element;
    isMenuOpened?: boolean;
    rowAttributeDescriptors: IAttributeDescriptor[];
    columnAttributeDescriptors: IAttributeDescriptor[];
    measureLocalIdentifiers: string[];
    columnTotals: IColumnTotal[];
    rowTotals: IColumnTotal[];
    showColumnsSubMenu: boolean;
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
}

export default class AggregationsSubMenu extends React.Component<IAggregationsSubMenuProps> {
    public static defaultProps: Pick<IAggregationsSubMenuProps, "isMenuOpened"> = {
        isMenuOpened: false,
    };

    public render() {
        const {
            toggler,
            isMenuOpened,
            rowAttributeDescriptors,
            columnAttributeDescriptors,
            intl,
            measureLocalIdentifiers,
            totalType,
            columnTotals,
            rowTotals,
            showColumnsSubMenu,
            onAggregationSelect,
        } = this.props;
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
                                isColumn={true}
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
}
