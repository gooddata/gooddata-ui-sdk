// (C) 2023-2026 GoodData Corporation

import cx from "classnames";

import {
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    isCatalogAttributeHierarchy,
    objRefToString,
} from "@gooddata/sdk-model";

import { type IDrillDown } from "../../../selectors/drill_down_selectors.js";

import { AttributeHierarchyItem } from "./AttributeHierarchyItem.js";

const extractKey = (hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) => {
    if (isCatalogAttributeHierarchy(hierarchy)) {
        return hierarchy.attributeHierarchy.id;
    }
    return `${hierarchy.templateId}_${objRefToString(hierarchy.dateDatasetRef)}`;
};

export interface IDrillDownItemProps {
    item: IDrillDown;
}

export function DrillDownItem({ item }: IDrillDownItemProps) {
    const { bucketItem, attributeHierarchies } = item;
    const attributeClassNames = cx(
        "gd-drill-down-item-attribute",
        bucketItem.type === "date" ? "date-field-icon" : "attr-field-icon",
    );
    return (
        <div className="gd-drill-down-item">
            <div className="gd-drill-down-item-content">
                <div className={attributeClassNames}>
                    <div>{bucketItem.title}</div>
                </div>
                {attributeHierarchies.map((item) => (
                    <AttributeHierarchyItem key={extractKey(item)} item={item} />
                ))}
            </div>
        </div>
    );
}
