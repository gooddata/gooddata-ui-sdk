// (C) 2007-2022 GoodData Corporation
import { Header, Icon, Item, ItemsWrapper, SubMenu } from "@gooddata/sdk-ui-kit";
import {
    TotalType,
    IAttributeDescriptor,
    attributeDescriptorLocalId,
    attributeDescriptorName,
} from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import cx from "classnames";
import React from "react";
import { IntlShape } from "react-intl";

import menuHelper from "./aggregationsMenuHelper";
import { IColumnTotal } from "./aggregationsMenuTypes";
import { IMenuAggregationClickConfig } from "../../privateTypes";

const MENU_HEADER_OFFSET = -36;

export interface IAggregationsSubMenuProps {
    intl: IntlShape;
    totalType: TotalType;
    toggler: JSX.Element;
    isMenuOpened?: boolean;
    rowAttributeDescriptors: IAttributeDescriptor[];
    measureLocalIdentifiers: string[];
    columnTotals: IColumnTotal[];
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
}

const HeaderIcon = () => {
    const theme = useTheme();
    return (
        <div className="gd-aggregation-submenu-header-icon">
            <Icon.Rows
                width={12}
                height={11}
                colorPalette={{
                    even: theme?.palette?.complementary?.c7,
                    odd: theme?.palette?.complementary?.c4,
                }}
            />
        </div>
    );
};

export default class AggregationsSubMenu extends React.Component<IAggregationsSubMenuProps> {
    public static defaultProps: Pick<IAggregationsSubMenuProps, "isMenuOpened"> = {
        isMenuOpened: false,
    };

    public render() {
        const { toggler, isMenuOpened, intl } = this.props;
        const menuOpenedProp = isMenuOpened ? { opened: true } : {};

        return (
            <SubMenu toggler={toggler} offset={MENU_HEADER_OFFSET} {...menuOpenedProp}>
                <ItemsWrapper>
                    <div className="gd-aggregation-submenu s-table-header-submenu-content">
                        <Header>
                            <HeaderIcon />
                            <span>{intl.formatMessage({ id: "visualizations.menu.aggregations.rows" })}</span>
                        </Header>
                        {this.renderSubMenuItems()}
                    </div>
                </ItemsWrapper>
            </SubMenu>
        );
    }

    private getPreviousAttributeName(
        rowAttributeDescriptors: IAttributeDescriptor[],
        attributeHeaderIndex: number,
    ): string {
        return attributeDescriptorName(rowAttributeDescriptors[attributeHeaderIndex - 1]);
    }

    private getAttributeName(
        rowAttributeDescriptors: IAttributeDescriptor[],
        afmAttributeHeaderIndex: number,
    ): string {
        const { intl } = this.props;
        if (afmAttributeHeaderIndex === 0) {
            return intl.formatMessage({ id: "visualizations.menu.aggregations.all-rows" });
        }
        const attributeName = this.getPreviousAttributeName(rowAttributeDescriptors, afmAttributeHeaderIndex);
        return intl.formatMessage(
            { id: "visualizations.menu.aggregations.within-attribute" },
            { attributeName },
        );
    }

    private getSubtotalNameTestClass(attributeLocalIdentifier: string) {
        const attributeClass = attributeLocalIdentifier.replace(/\./g, "-");
        return `s-aggregation-item-${attributeClass}`;
    }

    private renderSubMenuItems() {
        const { totalType, rowAttributeDescriptors, measureLocalIdentifiers, columnTotals } = this.props;

        return rowAttributeDescriptors.map(
            (_attributeDescriptor: IAttributeDescriptor, headerIndex: number) => {
                const attributeLocalIdentifier = attributeDescriptorLocalId(
                    rowAttributeDescriptors[headerIndex],
                );
                const isSelected = menuHelper.isTotalEnabledForAttribute(
                    attributeLocalIdentifier,
                    totalType,
                    columnTotals,
                );
                const onClick = () =>
                    this.props.onAggregationSelect({
                        type: totalType,
                        measureIdentifiers: measureLocalIdentifiers,
                        include: !isSelected,
                        attributeIdentifier: attributeLocalIdentifier,
                    });

                const attributeName = this.getAttributeName(rowAttributeDescriptors, headerIndex);
                return (
                    <Item checked={isSelected} key={attributeLocalIdentifier}>
                        <div
                            onClick={onClick}
                            className={cx(
                                "gd-aggregation-menu-item-inner",
                                "s-menu-aggregation-inner",
                                this.getSubtotalNameTestClass(attributeLocalIdentifier),
                                {
                                    "s-menu-aggregation-inner-selected": isSelected,
                                },
                            )}
                        >
                            {attributeName}
                        </div>
                    </Item>
                );
            },
        );
    }
}
