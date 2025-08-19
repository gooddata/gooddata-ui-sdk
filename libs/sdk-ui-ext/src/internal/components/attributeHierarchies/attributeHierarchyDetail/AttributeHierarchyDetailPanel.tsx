// (C) 2023-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

/**
 *
 * @internal
 */
export interface IAttributeHierarchyDetailItem {
    title: string;
    isDate: boolean;
}

/**
 *
 * @internal
 */
export interface IAttributeHierarchyDetailPanelProps {
    title: string;
    description?: string;
    attributes: IAttributeHierarchyDetailItem[];
    onEdit?: () => void;
}

/**
 *
 * @internal
 */
export const AttributeHierarchyDetailPanel: React.FC<IAttributeHierarchyDetailPanelProps> = ({
    title,
    description,
    attributes,
    onEdit,
}) => {
    const { formatMessage } = useIntl();

    const hierarchyLevelsText = formatMessage(messages.hierarchyListLevels);
    const editText = formatMessage(messages.hierarchyListEdit);

    return (
        <div className="gd-attribute-hierarchy-detail-panel">
            <div className="gd-attribute-hierarchy-detail-title">{title}</div>
            {description ? (
                <div className="gd-attribute-hierarchy-detail-description">{description}</div>
            ) : null}
            <div className="gd-attribute-hierarchy-detail-levels">{hierarchyLevelsText}</div>
            {attributes.map((item, index) => {
                const itemClassNames = cx("gd-attribute-hierarchy-detail-item", {
                    "is-date": item.isDate,
                    "is-attribute": !item.isDate,
                });
                return (
                    <div key={index} className={itemClassNames}>
                        {item.title}
                    </div>
                );
            })}

            {onEdit ? (
                <div className="gd-attribute-hierarchy-detail-panel-actions s-gd-attribute-hierarchy-detail-panel-actions">
                    <Button
                        className="gd-button-secondary gd-icon-pencil gd-button-small gd-attribute-hierarchy-detail-edit-button s-gd-attribute-hierarchy-detail-edit-button"
                        value={editText}
                        onClick={onEdit}
                    />
                </div>
            ) : null}
        </div>
    );
};
