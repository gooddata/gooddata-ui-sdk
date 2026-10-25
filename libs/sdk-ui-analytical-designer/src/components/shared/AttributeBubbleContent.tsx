// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { createNumberFormatter, formatAttributeValue } from "@gooddata/sdk-ui";

import { type IOrganizedCatalogTooltipDetailsAttribute } from "../../typings/catalog.js";

export function TooltipAttrElements({
    attrElements,
    attrElementsTotalCount,
    attrElementsNumberFormat,
    separators,
}: IOrganizedCatalogTooltipDetailsAttribute) {
    const intl = useIntl();

    const remainingElementsCount = attrElementsTotalCount - attrElements.length;
    // the values of a numeric computed attribute are displayed formatted, like the filter displays them
    const formatter = createNumberFormatter(separators);
    const displayTitle = (title: string) =>
        attrElementsNumberFormat ? formatAttributeValue(title, attrElementsNumberFormat, formatter) : title;

    return (
        <>
            {attrElements.map((element, idx) => (
                <span key={idx} className="s-attribute-element">
                    {displayTitle(element.title) || `(${intl.formatMessage({ id: "empty_value" })})`}
                    <br />
                </span>
            ))}
            {remainingElementsCount > 0 && (
                <span key={attrElements.length} className="adi-tooltip-elements-more">
                    <FormattedMessage
                        id="dashboard.catalog_item.shortening_decoration"
                        values={{ count: remainingElementsCount }}
                    />
                </span>
            )}
        </>
    );
}

export function TooltipValuesSection(props: IOrganizedCatalogTooltipDetailsAttribute) {
    const { attrElements } = props;

    return (
        <>
            <h4>
                <FormattedMessage id="dashboard.catalog_item.values" />
            </h4>
            <p className="s-values-wrapper">
                {attrElements ? <TooltipAttrElements {...props} /> : <FormattedMessage id="loading" />}
            </p>
        </>
    );
}

export function AttributeBubbleContent(props: IOrganizedCatalogTooltipDetailsAttribute) {
    const { dataset } = props;

    return (
        <span>
            <h4>
                <FormattedMessage id="dashboard.catalog_item.dataset" />
            </h4>
            <p className="s-dataset-wrapper">
                {dataset ? (
                    <span className="s-dataset-name">{dataset.title}</span>
                ) : (
                    <FormattedMessage id="loading" />
                )}
            </p>
            <TooltipValuesSection {...props} />
        </span>
    );
}
