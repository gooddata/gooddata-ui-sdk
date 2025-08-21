// (C) 2023-2025 GoodData Corporation

import React, { MouseEvent } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateAttribute,
    ICatalogDateAttributeHierarchy,
    getHierarchyAttributes,
    getHierarchyTitle,
    isCatalogAttribute,
    isCatalogDateAttributeHierarchy,
} from "@gooddata/sdk-model";
import { messages } from "@gooddata/sdk-ui";
import {
    AttributeHierarchyDetailBubble,
    AttributeHierarchyDetailPanel,
    IAttributeHierarchyDetailItem,
} from "@gooddata/sdk-ui-ext";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";
import {
    selectAllCatalogAttributesMap,
    selectCanManageAttributeHierarchy,
    useDashboardSelector,
} from "../../../../../model/index.js";

/**
 * @internal
 */
export interface IAttributeHierarchyListItemProps {
    item: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy;
    onClick: () => void;
    isSelected?: boolean;
    isDisabled?: boolean;
    onEdit: (attributeHierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) => void;
}

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 56, y: 0 } }];

function buildAttributeHierarchyDetailItems(
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    allCatalogAttributes: ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>,
) {
    const attributeRefs = getHierarchyAttributes(hierarchy);
    const items: IAttributeHierarchyDetailItem[] = [];
    attributeRefs.forEach((ref) => {
        const attribute = allCatalogAttributes.get(ref);
        if (attribute) {
            items.push({
                title: attribute.attribute.title,
                isDate: !isCatalogAttribute(attribute),
            });
        }
    });
    return items;
}

export function AttributeHierarchyListItem(props: IAttributeHierarchyListItemProps) {
    const intl = useIntl();
    const { onClick, item, isDisabled } = props;
    const allCatalogAttributes = useDashboardSelector(selectAllCatalogAttributesMap);
    const canManageAttributeHierarchy = useDashboardSelector(selectCanManageAttributeHierarchy);

    const handleEdit = (event?: MouseEvent) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        props.onEdit(item);
    };

    const hierarchyTitle = getHierarchyTitle(item);

    const hierarchyListItemClassname = cx(
        "attribute-hierarchy-list-item s-attribute-hierarchy-list-item",
        `s-${stringUtils.simplifyText(hierarchyTitle)}`,
        {
            "is-disabled s-is-disable": isDisabled,
        },
    );
    const attributeDetailItems = buildAttributeHierarchyDetailItems(item, allCatalogAttributes);
    const isAdhocDateHierarchy = isCatalogDateAttributeHierarchy(item);
    const isEditEnabled = canManageAttributeHierarchy && !isAdhocDateHierarchy;
    const hierarchyDescription = isAdhocDateHierarchy
        ? intl.formatMessage(messages.hierarchyListGenericDateInfo)
        : undefined;
    return (
        <div className={hierarchyListItemClassname} onClick={onClick}>
            <div className="attribute-hierarchy-list-item-content s-attribute-hierarchy-list-item-content">
                <ShortenedText
                    className="attribute-hierarchy-title s-attribute-hierarchy-title"
                    tooltipAlignPoints={TOOLTIP_ALIGN_POINTS}
                    displayTooltip={!isDisabled}
                >
                    {hierarchyTitle}
                </ShortenedText>
            </div>
            <div className="attribute-hierarchy-list-item-actions s-attribute-hierarchy-list-item-actions">
                {isEditEnabled ? (
                    <div
                        className="gd-icon-pencil attribute-hierarchy-item-edit-button s-attribute-hierarchy-item-edit-button"
                        onClick={handleEdit}
                    />
                ) : null}
                <div className="attribute-hierarchy-list-item-description s-attribute-hierarchy-list-item-description">
                    <AttributeHierarchyDetailBubble>
                        <AttributeHierarchyDetailPanel
                            title={hierarchyTitle}
                            description={hierarchyDescription}
                            attributes={attributeDetailItems}
                            onEdit={isEditEnabled ? handleEdit : undefined}
                        />
                    </AttributeHierarchyDetailBubble>
                </div>
            </div>
        </div>
    );
}
