// (C) 2023 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import cx from "classnames";
import {
    attributeDescriptorLocalId,
    attributeDescriptorName,
    IAttributeDescriptor,
    TotalType,
} from "@gooddata/sdk-model";
import { Header, Item } from "@gooddata/sdk-ui-kit";

import { IColumnTotal } from "./aggregationsMenuTypes.js";
import menuHelper from "./aggregationsMenuHelper.js";
import { IMenuAggregationClickConfig } from "../../privateTypes.js";

interface IAggregationsSubMenuItemsProps {
    intl: IntlShape;
    attributeDescriptors: IAttributeDescriptor[];
    totalType: TotalType;
    measureLocalIdentifiers: string[];
    totals: IColumnTotal[];
    isColumn: boolean;
    icon: JSX.Element;
    headerText: string;
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
}

const getPreviousAttributeName = (
    rowAttributeDescriptors: IAttributeDescriptor[],
    attributeHeaderIndex: number,
): string => {
    return attributeDescriptorName(rowAttributeDescriptors[attributeHeaderIndex - 1]);
};

const getAttributeName = (
    intl: IntlShape,
    rowAttributeDescriptors: IAttributeDescriptor[],
    afmAttributeHeaderIndex: number,
    isColumn: boolean,
): string => {
    if (afmAttributeHeaderIndex === 0) {
        if (!isColumn) {
            return intl.formatMessage({ id: "visualizations.menu.aggregations.all-columns" });
        } else {
            return intl.formatMessage({ id: "visualizations.menu.aggregations.all-rows" });
        }
    }
    const attributeName = getPreviousAttributeName(rowAttributeDescriptors, afmAttributeHeaderIndex);
    return intl.formatMessage({ id: "visualizations.menu.aggregations.within-attribute" }, { attributeName });
};

const getSubtotalNameTestClass = (attributeLocalIdentifier: string) => {
    const attributeClass = attributeLocalIdentifier.replace(/\./g, "-");
    return `s-aggregation-item-${attributeClass}`;
};

export const AggregationsSubMenuItems: React.FC<IAggregationsSubMenuItemsProps> = ({
    attributeDescriptors,
    measureLocalIdentifiers,
    intl,
    totalType,
    totals,
    isColumn,
    icon,
    headerText,
    onAggregationSelect,
}) => {
    const attributeItems = attributeDescriptors.map(
        (_attributeDescriptor: IAttributeDescriptor, headerIndex: number) => {
            const attributeLocalIdentifier = attributeDescriptorLocalId(attributeDescriptors[headerIndex]);
            const isSelected = menuHelper.isTotalEnabledForSubMenuAttribute(
                attributeLocalIdentifier,
                totalType,
                totals,
            );
            const onClick = () =>
                onAggregationSelect({
                    type: totalType,
                    measureIdentifiers: measureLocalIdentifiers,
                    include: !isSelected,
                    attributeIdentifier: attributeLocalIdentifier,
                    isColumn,
                });

            const attributeName = getAttributeName(intl, attributeDescriptors, headerIndex, isColumn);
            return (
                <Item checked={isSelected} key={attributeLocalIdentifier}>
                    <div
                        onClick={onClick}
                        className={cx(
                            "gd-aggregation-menu-item-inner",
                            "s-menu-aggregation-inner",
                            getSubtotalNameTestClass(attributeLocalIdentifier),
                            {
                                "s-menu-aggregation-inner-selected": isSelected,
                                "s-menu-aggregation-inner-column": !isColumn,
                                "s-menu-aggregation-inner-row": isColumn,
                            },
                        )}
                    >
                        {attributeName}
                    </div>
                </Item>
            );
        },
    );

    return (
        <>
            <Header>
                {icon}
                <span>{headerText}</span>
            </Header>
            {attributeItems}
        </>
    );
};
