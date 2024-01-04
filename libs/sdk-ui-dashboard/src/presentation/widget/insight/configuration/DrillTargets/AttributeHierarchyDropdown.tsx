// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import {
    areObjRefsEqual,
    IAttributeDescriptor,
    ICatalogAttributeHierarchy,
    ICatalogDateAttributeHierarchy,
    IDrillDownReference,
    isCatalogAttributeHierarchy,
    objRefToString,
} from "@gooddata/sdk-model";
import { messages } from "@gooddata/sdk-ui";

import { AttributeHierarchyList, IAttributeHierarchyItem } from "./AttributeHierarchyList.js";
import { IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";
import {
    existBlacklistHierarchyPredicate,
    selectAllCatalogAttributeHierarchies,
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../model/index.js";

interface IAttributeHierarchyDropdownProps {
    config: IDrillDownAttributeHierarchyConfig;
    attributeDescriptor?: IAttributeDescriptor;
    onSelect: (targetItem: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) => void;
    onOpenAttributeHierarchyDialog: (
        attributeHierarchy?: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    ) => void;
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
    catalogAttributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[],
    ignoredDrillDownHierarchies: IDrillDownReference[],
) {
    const items: IAttributeHierarchyItem[] = [];
    catalogAttributeHierarchies.forEach((hierarchy) => {
        const hierarchyRef = isCatalogAttributeHierarchy(hierarchy)
            ? hierarchy.attributeHierarchy.ref
            : hierarchy.dateDatasetRef;
        const attributesRef = isCatalogAttributeHierarchy(hierarchy)
            ? hierarchy.attributeHierarchy.attributes
            : hierarchy.attributes;
        const isInBlacklist = ignoredDrillDownHierarchies.some((ref) =>
            existBlacklistHierarchyPredicate(
                ref,
                hierarchyRef,
                attributeDescriptor?.attributeHeader.formOf.ref,
            ),
        );
        const indexInHierarchy = attributesRef.findIndex(
            (ref) => objRefToString(ref) === attributeDescriptor?.attributeHeader.formOf.identifier,
        );
        if (indexInHierarchy >= 0 && indexInHierarchy < attributesRef.length - 1) {
            items.push({
                isDisabled: !isInBlacklist,
                hierarchy: hierarchy,
            });
        }
    });
    return items;
}

const AttributeHierarchyDropdown: React.FC<IAttributeHierarchyDropdownProps> = ({
    config,
    attributeDescriptor,
    onSelect,
    onOpenAttributeHierarchyDialog,
}) => {
    const { formatMessage } = useIntl();

    const catalogAttributeHierarchies = useDashboardSelector(selectAllCatalogAttributeHierarchies);
    const ignoredDrillDownHierarchies = useDashboardSelector(
        selectIgnoredDrillDownHierarchiesByWidgetRef(config.widgetRef),
    );
    const userInteraction = useDashboardUserInteraction();

    const selectedCatalogAttributeHierarchy = config.complete
        ? catalogAttributeHierarchies.find((hierarchy) => {
              const hierarchyRef = isCatalogAttributeHierarchy(hierarchy)
                  ? hierarchy.attributeHierarchy.ref
                  : hierarchy.dateDatasetRef;
              return areObjRefsEqual(hierarchyRef, config.attributeHierarchyRef);
          })
        : null;

    const items: IAttributeHierarchyItem[] = buildHierarchyItemList(
        attributeDescriptor,
        catalogAttributeHierarchies,
        ignoredDrillDownHierarchies,
    );

    const selectHierarchyTitle = isCatalogAttributeHierarchy(selectedCatalogAttributeHierarchy)
        ? selectedCatalogAttributeHierarchy?.attributeHierarchy.title
        : selectedCatalogAttributeHierarchy?.title;
    const buttonText = selectHierarchyTitle ?? formatMessage(messages.drilldownSelectHierarchy);

    return (
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
                    iconLeft={config.complete ? "gd-icon-attribute-hierarchy" : ""}
                    className="gd-button-small s-visualization-button-target-hierarchy"
                />
            )}
            renderBody={({ closeDropdown }) => {
                return (
                    <AttributeHierarchyList
                        hierarchies={items}
                        closeDropdown={closeDropdown}
                        onOpenAttributeHierarchyDialog={onOpenAttributeHierarchyDialog}
                        onSelect={(hierarchy) => {
                            onSelect(hierarchy);
                            closeDropdown();
                            userInteraction.attributeHierarchiesInteraction(
                                "attributeHierarchyDrillDownSelected",
                            );
                        }}
                    />
                );
            }}
        />
    );
};

export default AttributeHierarchyDropdown;
