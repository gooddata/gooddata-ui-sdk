// (C) 2023 GoodData Corporation

import React from "react";
import cx from "classnames";

import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

import { areObjRefsEqual, ICatalogAttributeHierarchy } from "@gooddata/sdk-model";
import {
    AttributeHierarchyDetailBubble,
    AttributeHierarchyDetailPanel,
    IAttributeHierarchyDetailItem,
} from "@gooddata/sdk-ui-ext";
import {
    selectCatalogAttributes,
    selectCatalogDateAttributes,
    useDashboardSelector,
} from "../../../../../model/index.js";

/**
 * @internal
 */
export interface IAttributeHierarchyListItemProps {
    item: ICatalogAttributeHierarchy;
    onClick: () => void;
    isSelected?: boolean;
}
export const AttributeHierarchyListItem: React.FC<IAttributeHierarchyListItemProps> = (props) => {
    const { onClick, item } = props;
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const catalogDateAttributes = useDashboardSelector(selectCatalogDateAttributes);

    const hierarchyListItemClassname = cx(
        "attribute-hierarchy-list-item s-attribute-hierarchy-list-item",
        `s-${stringUtils.simplifyText(item.attributeHierarchy.title)}`,
    );
    const attributeDetailItems = item.attributeHierarchy.attributes
        .map((item) => {
            const attribute = catalogAttributes.find((attr) => areObjRefsEqual(attr.attribute.ref, item));
            if (attribute) {
                return {
                    title: attribute.attribute.title,
                    isDate: false,
                };
            }
            const dateAttribute = catalogDateAttributes.find((dateAttr) =>
                areObjRefsEqual(dateAttr.attribute.ref, item),
            );
            if (dateAttribute) {
                return {
                    title: dateAttribute.attribute.title,
                    isDate: true,
                };
            }
            return undefined;
        })
        .filter((item): item is IAttributeHierarchyDetailItem => !!item);
    return (
        <div className={hierarchyListItemClassname} onClick={onClick}>
            <div className="attribute-hierarchy-list-item-content s-attribute-hierarchy-list-item-content">
                <ShortenedText>{item.attributeHierarchy.title}</ShortenedText>
            </div>

            <div className="attribute-hierarchy-list-item-description s-attribute-hierarchy-list-item-description">
                <AttributeHierarchyDetailBubble>
                    <AttributeHierarchyDetailPanel
                        title={item.attributeHierarchy.title}
                        attributes={attributeDetailItems}
                    />
                </AttributeHierarchyDetailBubble>
            </div>
        </div>
    );
};
