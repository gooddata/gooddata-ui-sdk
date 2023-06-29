// (C) 2023 GoodData Corporation
import React from "react";
import { ICatalogAttribute, IDataSetMetadataObject } from "@gooddata/sdk-model";
import { FormattedMessage, useIntl } from "react-intl";

import { IUseAttributeElements } from "../../../../../model/index.js";

function AttrTooltipElements(props: IUseAttributeElements) {
    const intl = useIntl();
    const { elements, totalCount } = props;
    const remainingElementsCount = totalCount - elements.length;

    return (
        <>
            {elements.map((element, idx) => (
                <span key={idx} className="gd-attribute-element s-attribute-element">
                    {element.title || `(${intl.formatMessage({ id: "empty_value" })})`}
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
    attributesDataSetLoading: boolean;
    attributesElementsLoading: boolean;
    attributeDataSet?: IDataSetMetadataObject;
    attributeElements?: IUseAttributeElements;
}

/**
 * @internal
 */
export const AttributeListItemTooltipContent: React.FC<IAttributeListItemTooltipContentProps> = ({
    item,
    attributesDataSetLoading,
    attributesElementsLoading,
    attributeDataSet,
    attributeElements,
}) => {
    return (
        <div className="gd-attribute-dropdown-list-tooltip-content s-attribute-dropdown-item-list-tooltip-content">
            <h3 className="s-attribute-filter-tooltip-header">{item.attribute.title}</h3>
            <h4>
                <FormattedMessage id="attributesDropdown.details.dataset" />
            </h4>
            <p className="s-attribute-filter-tooltip-item-dataset">
                {attributesDataSetLoading ? <FormattedMessage id="loading" /> : attributeDataSet?.title}
            </p>
            <h4>
                <FormattedMessage id="attributesDropdown.details.values" />
            </h4>
            <p className="s-attribute-filter-tooltip-item-elements">
                {attributesElementsLoading ? (
                    <FormattedMessage id="loading" />
                ) : (
                    <AttrTooltipElements
                        elements={attributeElements!.elements}
                        totalCount={attributeElements!.totalCount}
                    />
                )}
            </p>
        </div>
    );
};
