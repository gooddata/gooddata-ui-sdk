// (C) 2023 GoodData Corporation
import React from "react";
import {
    areObjRefsEqual,
    IAttributeDescriptor,
    ICatalogAttributeHierarchy,
    IDrillDownReference,
    objRefToString,
} from "@gooddata/sdk-model";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import { messages } from "@gooddata/sdk-ui";

import { IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";
import {
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    selectCatalogAttributeHierarchies,
    useDashboardSelector,
    existBlacklistHierarchyPredicate,
} from "../../../../../model/index.js";
import { useIntl } from "react-intl";
import isEmpty from "lodash/isEmpty.js";
import { AttributeHierarchyList, IAttributeHierarchyItem } from "./AttributeHierarchyList.js";

interface IDrillTargetDashboardItemProps {
    config: IDrillDownAttributeHierarchyConfig;
    onSelect: (targetItem: ICatalogAttributeHierarchy) => void;
}

const DROPDOWN_ALIGN_POINTS = [
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 4,
        },
    },
    {
        align: "tl bl",
        offset: {
            x: 0,
            y: -4,
        },
    },
];

function buildHierarchyItemList(
    attributeDescriptor: IAttributeDescriptor | undefined,
    catalogAttributeHierarchies: ICatalogAttributeHierarchy[],
    ignoredDrillDownHierarchies: IDrillDownReference[],
) {
    const items: IAttributeHierarchyItem[] = [];
    catalogAttributeHierarchies.forEach((hierarchy) => {
        const attributesRef = hierarchy.attributeHierarchy.attributes;
        const isInBlacklist = ignoredDrillDownHierarchies.some((ref) =>
            existBlacklistHierarchyPredicate(
                ref,
                hierarchy.attributeHierarchy.ref,
                attributeDescriptor?.attributeHeader.identifier,
            ),
        );
        const isInHierarchy = attributesRef.find(
            (ref) => objRefToString(ref) === attributeDescriptor?.attributeHeader.identifier,
        );
        if (isInHierarchy) {
            items.push({
                isDisabled: !isInBlacklist,
                hierarchy: hierarchy,
            });
        }
    });
    return items;
}

const DrillTargetAttributeHierarchyItem: React.FC<IDrillTargetDashboardItemProps> = ({
    config,
    onSelect,
}) => {
    const intl = useIntl();
    const catalogAttributeHierarchies = useDashboardSelector(selectCatalogAttributeHierarchies);
    const ignoredDrillDownHierarchies = useDashboardSelector(
        selectIgnoredDrillDownHierarchiesByWidgetRef(config.widgetRef),
    );

    const attributeDescriptor = config.attributes.find(
        (attr) => attr.attributeHeader.localIdentifier === config.originLocalIdentifier,
    );

    const selectedCatalogAttributeHierarchy = config.complete
        ? catalogAttributeHierarchies.find((hierarchy) =>
              areObjRefsEqual(hierarchy.attributeHierarchy.ref, config.attributeHierarchyRef),
          )
        : null;

    const existInHierarchies = catalogAttributeHierarchies.filter((hierarchy) => {
        return hierarchy.attributeHierarchy.attributes.some(
            (ref) => objRefToString(ref) === attributeDescriptor?.attributeHeader.identifier,
        );
    });
    const items: IAttributeHierarchyItem[] = buildHierarchyItemList(
        attributeDescriptor,
        catalogAttributeHierarchies,
        ignoredDrillDownHierarchies,
    );

    const emptyHierarchyMessage = intl.formatMessage(messages.emtpyHierarchyInfo);
    const shouldShowEmptyMessage = isEmpty(existInHierarchies) && !config.complete;
    const buttonText =
        selectedCatalogAttributeHierarchy?.attributeHierarchy.title ??
        intl.formatMessage(messages.drilldownSelectHierarchy);

    return (
        <>
            {shouldShowEmptyMessage ? (
                <div className="drill-config-empty-hierarchy-target s-drill-config-empty-hierarchy-target">
                    {emptyHierarchyMessage}
                </div>
            ) : (
                <Dropdown
                    className="drill-config-hierarchy-target-select s-drill-config-hierarchy-target-select"
                    closeOnMouseDrag={false}
                    closeOnParentScroll={true}
                    closeOnOutsideClick={true}
                    alignPoints={DROPDOWN_ALIGN_POINTS}
                    renderButton={({ isOpen, toggleDropdown }) => (
                        <DropdownButton
                            value={buttonText}
                            onClick={toggleDropdown}
                            isOpen={isOpen}
                            isSmall={false}
                            disabled={config.complete}
                            iconLeft={config.complete ? "gd-icon-attribute-hierarchy" : ""}
                            className="gd-button-small s-visualization-button-target-hierarchy"
                        />
                    )}
                    renderBody={({ closeDropdown }) => {
                        return (
                            <AttributeHierarchyList
                                hierarchies={items}
                                onSelect={(hierarchy) => {
                                    onSelect(hierarchy);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            )}
        </>
    );
};

export default DrillTargetAttributeHierarchyItem;
