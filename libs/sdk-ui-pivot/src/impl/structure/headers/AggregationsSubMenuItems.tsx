// (C) 2023-2026 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";
import { type IntlShape } from "react-intl";

import {
    type IAttributeDescriptor,
    type ITotal,
    type TotalType,
    attributeDescriptorLocalId,
    attributeDescriptorName,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Header, Item } from "@gooddata/sdk-ui-kit";

import { type IMenuAggregationClickConfig } from "../../privateTypes.js";

import { isTotalEnabledForSubMenuAttribute } from "./aggregationsMenuHelper.js";
import { type IColumnTotal } from "./aggregationsMenuTypes.js";

interface IAggregationsSubMenuItemsProps {
    intl: IntlShape;
    attributeDescriptors: IAttributeDescriptor[];
    totalType: TotalType;
    measureLocalIdentifiers: string[];
    totals: IColumnTotal[];
    subtotalTooltip?: string;
    existingTotals?: ITotal[];
    isColumn: boolean;
    icon: ReactElement;
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
        if (isColumn) {
            return intl.formatMessage({ id: "visualizations.menu.aggregations.all-rows" });
        } else {
            return intl.formatMessage({ id: "visualizations.menu.aggregations.all-columns" });
        }
    }
    const attributeName = getPreviousAttributeName(rowAttributeDescriptors, afmAttributeHeaderIndex);
    return intl.formatMessage({ id: "visualizations.menu.aggregations.within-attribute" }, { attributeName });
};

const getSubtotalNameTestClass = (attributeLocalIdentifier: string) => {
    const attributeClass = attributeLocalIdentifier.replace(/\./g, "-");
    return `s-aggregation-item-${attributeClass}`;
};

export function AggregationsSubMenuItems({
    attributeDescriptors,
    measureLocalIdentifiers,
    intl,
    totalType,
    totals,
    subtotalTooltip,
    existingTotals,
    isColumn,
    icon,
    headerText,
    onAggregationSelect,
}: IAggregationsSubMenuItemsProps) {
    const attributeItems = attributeDescriptors.map(
        (_attributeDescriptor: IAttributeDescriptor, headerIndex: number) => {
            const attributeLocalIdentifier = attributeDescriptorLocalId(attributeDescriptors[headerIndex]);
            const tooltip = headerIndex > 0 ? subtotalTooltip : undefined;
            const isSelected = tooltip
                ? (existingTotals ?? []).some(
                      (total) =>
                          total.attributeIdentifier === attributeLocalIdentifier &&
                          total.type === totalType &&
                          measureLocalIdentifiers.includes(total.measureIdentifier),
                  )
                : isTotalEnabledForSubMenuAttribute(attributeLocalIdentifier, totalType, totals);
            const isDisabled = !!tooltip && !isSelected;
            const onClick = () => {
                if (isDisabled) {
                    return;
                }
                onAggregationSelect({
                    type: totalType,
                    measureIdentifiers: measureLocalIdentifiers,
                    include: !isSelected,
                    attributeIdentifier: attributeLocalIdentifier,
                    isColumn,
                });
            };

            const attributeName = getAttributeName(intl, attributeDescriptors, headerIndex, isColumn);
            const item = (
                <Item checked={isSelected} disabled={isDisabled} key={attributeLocalIdentifier}>
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
            return tooltip ? (
                <BubbleHoverTrigger key={attributeLocalIdentifier} showDelay={200} hideDelay={0}>
                    {item}
                    <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                        {tooltip}
                    </Bubble>
                </BubbleHoverTrigger>
            ) : (
                item
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
}
