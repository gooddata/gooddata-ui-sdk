// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import {
    areObjRefsEqual,
    IAttributeDescriptor,
    ICatalogAttributeHierarchy,
    IDrillDownReference,
    objRefToString,
} from "@gooddata/sdk-model";
import { messages } from "@gooddata/sdk-ui";

import { AttributeHierarchyList, IAttributeHierarchyItem } from "./AttributeHierarchyList.js";
import { IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";
import {
    existBlacklistHierarchyPredicate,
    selectCatalogAttributeHierarchies,
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    useDashboardSelector,
} from "../../../../../model/index.js";

interface IAttributeHierarchyDropdownProps {
    config: IDrillDownAttributeHierarchyConfig;
    attributeDescriptor?: IAttributeDescriptor;
    onSelect: (targetItem: ICatalogAttributeHierarchy) => void;
    onOpenAttributeHierarchyDialog: (attributeHierarchy?: ICatalogAttributeHierarchy) => void;
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

const AttributeHierarchyDropdown: React.FC<IAttributeHierarchyDropdownProps> = ({
    config,
    attributeDescriptor,
    onSelect,
    onOpenAttributeHierarchyDialog,
}) => {
    const { formatMessage } = useIntl();

    const catalogAttributeHierarchies = useDashboardSelector(selectCatalogAttributeHierarchies);
    const ignoredDrillDownHierarchies = useDashboardSelector(
        selectIgnoredDrillDownHierarchiesByWidgetRef(config.widgetRef),
    );

    const selectedCatalogAttributeHierarchy = config.complete
        ? catalogAttributeHierarchies.find((hierarchy) =>
              areObjRefsEqual(hierarchy.attributeHierarchy.ref, config.attributeHierarchyRef),
          )
        : null;

    const items: IAttributeHierarchyItem[] = buildHierarchyItemList(
        attributeDescriptor,
        catalogAttributeHierarchies,
        ignoredDrillDownHierarchies,
    );

    const buttonText =
        selectedCatalogAttributeHierarchy?.attributeHierarchy.title ??
        formatMessage(messages.drilldownSelectHierarchy);

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
                    disabled={config.complete}
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
                        }}
                    />
                );
            }}
        />
    );
};

export default AttributeHierarchyDropdown;
