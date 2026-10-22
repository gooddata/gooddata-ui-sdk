// (C) 2023-2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { type IMeasureExpressionToken } from "@gooddata/sdk-backend-spi";
import { type ICatalogAttribute, type IDataSetMetadataObject, type ISeparators } from "@gooddata/sdk-model";
import { createNumberFormatter, formatAttributeValue } from "@gooddata/sdk-ui";

import type { IUseAttributeElements } from "../../../../../model/types/attributeFilterTypes.js";

const PLAIN_TOKEN_TYPES = ["text", "quoted_text", "number", "comment", "bracket"];

function AttrTooltipExpression({ tokens }: { tokens: IMeasureExpressionToken[] }) {
    const intl = useIntl();

    return (
        <>
            {tokens.map((token, idx) => {
                if (PLAIN_TOKEN_TYPES.includes(token.type)) {
                    return <span key={idx}>{token.value}</span>;
                }
                if (token.type === "attributeElement") {
                    const title = token.deleted
                        ? `(${intl.formatMessage({ id: "deleted_value" })})`
                        : token.value || `(${intl.formatMessage({ id: "empty_value" })})`;

                    return (
                        <span key={idx} className="gd-maql-token-attribute-element">
                            {title}
                        </span>
                    );
                }

                return (
                    <span key={idx} className={`gd-maql-token-object gd-maql-token-${token.type}`}>
                        {token.value}
                    </span>
                );
            })}
        </>
    );
}

function AttrTooltipElements({
    elements,
    totalCount,
    numberFormat,
    separators,
}: IUseAttributeElements & { separators?: ISeparators }) {
    const intl = useIntl();

    const remainingElementsCount = totalCount - elements.length;
    // the values of a numeric computed attribute are displayed formatted, like the filter displays them
    const formatter = createNumberFormatter(separators);
    const displayTitle = (title: string | null) =>
        numberFormat ? formatAttributeValue(title, numberFormat, formatter) : title;

    return (
        <>
            {elements.map((element, idx) => (
                <span key={idx} className="gd-attribute-element s-attribute-element">
                    {displayTitle(element.title) || `(${intl.formatMessage({ id: "empty_value" })})`}
                    <br />
                </span>
            ))}
            {remainingElementsCount > 0 && (
                <span key={elements.length} className="attribute-tooltip-elements-more">
                    <FormattedMessage
                        id="attributesDropdown.details.shortening_decoration"
                        values={{ count: remainingElementsCount }}
                    />
                </span>
            )}
        </>
    );
}

interface IAttributeListItemTooltipContentProps {
    item: ICatalogAttribute;
    /**
     * Hide the data set section; a computed attribute belongs to no data set.
     */
    hideDataSet?: boolean;
    attributesDataSetLoading: boolean;
    attributesElementsLoading: boolean;
    attributeDataSet?: IDataSetMetadataObject;
    attributeElements?: IUseAttributeElements;
    /**
     * Separators to format the values of a numeric computed attribute with.
     */
    separators?: ISeparators;
    /**
     * Tokenized MAQL expression; provided only for computed attributes, rendered after the values
     * with the referenced objects resolved to their titles.
     */
    expressionTokens?: IMeasureExpressionToken[];
    expressionTokensLoading?: boolean;
}

/**
 * @internal
 */
export function AttributeListItemTooltipContent({
    item,
    hideDataSet,
    attributesDataSetLoading,
    attributesElementsLoading,
    attributeDataSet,
    attributeElements,
    separators,
    expressionTokens,
    expressionTokensLoading,
}: IAttributeListItemTooltipContentProps) {
    const showExpression = expressionTokensLoading || expressionTokens !== undefined;

    return (
        <div className="gd-attribute-dropdown-list-tooltip-content s-attribute-dropdown-item-list-tooltip-content">
            <h3 className="s-attribute-filter-tooltip-header">{item.attribute.title}</h3>
            {hideDataSet ? null : (
                <>
                    <h4>
                        <FormattedMessage id="attributesDropdown.details.dataset" />
                    </h4>
                    <p className="s-attribute-filter-tooltip-item-dataset">
                        {attributesDataSetLoading ? (
                            <FormattedMessage id="loading" />
                        ) : (
                            attributeDataSet?.title
                        )}
                    </p>
                </>
            )}
            <h4>
                <FormattedMessage id="attributesDropdown.details.values" />
            </h4>
            <p className="s-attribute-filter-tooltip-item-elements">
                {attributesElementsLoading ? (
                    <FormattedMessage id="loading" />
                ) : attributeElements ? (
                    <AttrTooltipElements
                        elements={attributeElements.elements}
                        totalCount={attributeElements.totalCount}
                        numberFormat={attributeElements.numberFormat}
                        separators={separators}
                    />
                ) : null}
            </p>
            {showExpression ? (
                <>
                    <h4>
                        <FormattedMessage id="attributesDropdown.details.definedAs" />
                    </h4>
                    <p className="s-attribute-filter-tooltip-item-maql">
                        {expressionTokensLoading ? (
                            <FormattedMessage id="loading" />
                        ) : (
                            <AttrTooltipExpression tokens={expressionTokens!} />
                        )}
                    </p>
                </>
            ) : null}
        </div>
    );
}
