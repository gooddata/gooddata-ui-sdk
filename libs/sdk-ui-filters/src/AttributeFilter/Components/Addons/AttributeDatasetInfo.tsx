// (C) 2023-2025 GoodData Corporation

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
export function AttributeDatasetInfo({
    title,
    defaultAttributeFilterTitle,
    attributeDataSet,
}: IAttributeDatasetInfoProps) {
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
}
