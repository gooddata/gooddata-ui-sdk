// (C) 2024 GoodData Corporation

import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { isObjRef, isIdentifierRef } from "@gooddata/sdk-model";
import { Icon, IIconProps } from "@gooddata/sdk-ui-kit";

import { ValuesLimitingItem } from "../../../../types.js";
import { messages } from "../../../../../../../locales.js";

export const UnknownItemTitle: React.FC = () => {
    return (
        <em>
            <FormattedMessage id="attributesDropdown.valuesLimiting.unknownItem" />
        </em>
    );
};

interface ITitleWithIconProps {
    title?: string;
    tooltip?: string;
    IconComponent?: React.FC<IIconProps>;
    iconSize?: number;
}

const ItemTitleWithIcon: React.FC<ITitleWithIconProps> = ({ title, tooltip, IconComponent, iconSize }) => {
    return (
        <span className="attribute-filter__limit__item__title" title={tooltip}>
            {IconComponent ? (
                <IconComponent
                    className="attribute-filter__limit__item__icon"
                    width={iconSize}
                    height={iconSize}
                />
            ) : null}
            <span className="attribute-filter__limit__item__name">{title ?? <UnknownItemTitle />}</span>
        </span>
    );
};

const AggregatedItemTitle: React.FC<{ titleNode: React.ReactNode; tooltip: string }> = ({
    titleNode,
    tooltip,
}) => {
    return (
        <span className="attribute-filter__limit__item__title--aggregated" title={tooltip}>
            {titleNode}
        </span>
    );
};

const isMetric = (item: ValuesLimitingItem) => isIdentifierRef(item) && item.type === "measure";
const isFact = (item: ValuesLimitingItem) => isIdentifierRef(item) && item.type === "fact";
const isAttribute = (item: ValuesLimitingItem) => isIdentifierRef(item) && item.type === "attribute";
const isParentFilter = (item: ValuesLimitingItem) => !isObjRef(item);
const isDateFilter = (item: ValuesLimitingItem) => isObjRef(item);

export interface ILimitingItemTitleProps {
    title?: string;
    item: ValuesLimitingItem;
}

export const LimitingItemTitle: React.FC<ILimitingItemTitleProps> = ({ item, title }) => {
    const intl = useIntl();
    const titleTooltip = title ?? intl.formatMessage(messages.filterUnknownItemTitle);

    if (isParentFilter(item)) {
        return (
            <ItemTitleWithIcon
                title={title}
                tooltip={titleTooltip}
                IconComponent={Icon.AttributeFilter}
                iconSize={14}
            />
        );
    }
    if (isMetric(item)) {
        return (
            <ItemTitleWithIcon
                title={title}
                tooltip={titleTooltip}
                IconComponent={Icon.Metric}
                iconSize={14}
            />
        );
    }
    if (isFact(item)) {
        return (
            <AggregatedItemTitle
                tooltip={intl.formatMessage(messages.filterSumMetricTitle, { fact: titleTooltip })}
                titleNode={
                    <FormattedMessage
                        id="attributesDropdown.valuesLimiting.sumFact"
                        values={{
                            fact: <ItemTitleWithIcon title={title} IconComponent={Icon.Fact} iconSize={18} />,
                        }}
                    />
                }
            />
        );
    }
    if (isAttribute(item)) {
        return (
            <AggregatedItemTitle
                tooltip={intl.formatMessage(messages.filterCountMetricTitle, { attribute: titleTooltip })}
                titleNode={
                    <FormattedMessage
                        id="attributesDropdown.valuesLimiting.countAttribute"
                        values={{
                            attribute: (
                                <ItemTitleWithIcon
                                    title={title}
                                    IconComponent={Icon.Attribute}
                                    iconSize={18}
                                />
                            ),
                        }}
                    />
                }
            />
        );
    }
    if (isDateFilter(item)) {
        return (
            <ItemTitleWithIcon title={title} tooltip={titleTooltip} IconComponent={Icon.Date} iconSize={14} />
        );
    }

    return <ItemTitleWithIcon title={title} tooltip={titleTooltip} />;
};

export interface ILimitingItemProps {
    title?: string;
    item: ValuesLimitingItem;
    onDelete: () => void;
}

export const LimitingItem: React.FC<ILimitingItemProps> = (props) => {
    return (
        <div className="attribute-filter__limit__item">
            <LimitingItemTitle {...props} />
            <span
                className="attribute-filter__limit__item__delete gd-icon-trash s-filter-limit-delete"
                onClick={props.onDelete}
                aria-label="Attribute filter limit delete"
            />
        </div>
    );
};
