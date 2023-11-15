// (C) 2023 GoodData Corporation

import React from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { messages } from "@gooddata/sdk-ui";

/**
 *
 * @alpha
 */
export interface IAttributeHierarchyDetailItem {
    title: string;
    isDate: boolean;
}

/**
 *
 * @alpha
 */
export interface IAttributeHierarchyDetailPanelProps {
    title: string;
    description?: string;
    attributes: IAttributeHierarchyDetailItem[];
}

/**
 *
 * @alpha
 */
export const AttributeHierarchyDetailPanel: React.FC<IAttributeHierarchyDetailPanelProps> = ({
    title,
    description,
    attributes,
}) => {
    const intl = useIntl();
    const hierarchyLevelsText = intl.formatMessage(messages.hierarchyListLevels);
    return (
        <div className="gd-attribute-hierarchy-detail-panel">
            <div className="gd-attribute-hierarchy-detail-title">{title}</div>
            {description && <div className="gd-attribute-hierarchy-detail-description">{description}</div>}
            <div className="gd-attribute-hierarchy-detail-levels">{hierarchyLevelsText}</div>
            {attributes.map((item) => {
                const itemClassNames = cx("gd-attribute-hierarchy-detail-item", {
                    "is-date": item.isDate,
                    "is-attribute": !item.isDate,
                });
                return <div className={itemClassNames}>{item.title}</div>;
            })}
        </div>
    );
};
