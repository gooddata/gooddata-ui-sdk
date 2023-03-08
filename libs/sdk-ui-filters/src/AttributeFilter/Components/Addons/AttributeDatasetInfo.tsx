// (C) 2023 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import { IDataSetMetadataObject } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IAttributeDatasetInfoProps {
    title?: string;
    defaultAttributeFilterTitle?: string;
    attributeDataSet?: IDataSetMetadataObject;
}

/**
 * @internal
 */
export const AttributeDatasetInfo: React.FC<IAttributeDatasetInfoProps> = ({
    title,
    defaultAttributeFilterTitle,
    attributeDataSet,
}) => {
    return (
        <div className="gd-attribute-filter-tooltip-content s-attribute-filter-tooltip-content">
            <h3 className="s-attribute-filter-tooltip-header">{title ?? defaultAttributeFilterTitle}</h3>
            <h4>
                <FormattedMessage id="attributesDropdown.details.type" />
            </h4>
            <p className="s-attribute-filter-tooltip-item-name">{defaultAttributeFilterTitle}</p>
            <h4>
                <FormattedMessage id="attributesDropdown.details.dataset" />
            </h4>
            <p className="s-attribute-filter-tooltip-item-dataset">{attributeDataSet.title}</p>
        </div>
    );
};
