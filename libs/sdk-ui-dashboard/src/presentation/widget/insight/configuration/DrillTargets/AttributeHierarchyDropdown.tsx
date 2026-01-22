// (C) 2023-2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    type IAttributeDescriptor,
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    type IDrillDownReference,
    type ObjRef,
    areObjRefsEqual,
    getHierarchyAttributes,
    getHierarchyRef,
    getHierarchyTitle,
    objRefToString,
} from "@gooddata/sdk-model";
import { messages } from "@gooddata/sdk-ui";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

import { AttributeHierarchyList, type IAttributeHierarchyItem } from "./AttributeHierarchyList.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../../../model/react/useDashboardUserInteraction.js";
import { selectAllCatalogAttributeHierarchies } from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectIgnoredDrillDownHierarchiesByWidgetRef } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import { existBlacklistHierarchyPredicate } from "../../../../../model/utils/attributeHierarchyUtils.js";
import { type IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";

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

const isHierarchyInBlackList = (
    ignoredDrillDownHierarchies: IDrillDownReference[],
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    attributeRef: ObjRef | undefined,
) => {
    return ignoredDrillDownHierarchies.some((ref) =>
        existBlacklistHierarchyPredicate(ref, hierarchy, attributeRef),
    );
};

function buildHierarchyItemList(
    attributeDescriptor: IAttributeDescriptor | undefined,
    catalogAttributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[],
    ignoredDrillDownHierarchies: IDrillDownReference[],
) {
    const items: IAttributeHierarchyItem[] = [];
    catalogAttributeHierarchies.forEach((hierarchy) => {
        const attributesRef = getHierarchyAttributes(hierarchy);
        const isInBlacklist = isHierarchyInBlackList(
            ignoredDrillDownHierarchies,
            hierarchy,
            attributeDescriptor?.attributeHeader.formOf.ref,
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

export function AttributeHierarchyDropdown({
    config,
    attributeDescriptor,
    onSelect,
    onOpenAttributeHierarchyDialog,
}: IAttributeHierarchyDropdownProps) {
    const { formatMessage } = useIntl();

    const catalogAttributeHierarchies = useDashboardSelector(selectAllCatalogAttributeHierarchies);
    const ignoredDrillDownHierarchies = useDashboardSelector(
        selectIgnoredDrillDownHierarchiesByWidgetRef(config.widgetRef),
    );
    const userInteraction = useDashboardUserInteraction();

    const selectedCatalogAttributeHierarchy = config.complete
        ? catalogAttributeHierarchies.find((hierarchy) => {
              const hierarchyRef = getHierarchyRef(hierarchy);
              return areObjRefsEqual(hierarchyRef, config.attributeHierarchyRef);
          })
        : null;

    const items: IAttributeHierarchyItem[] = buildHierarchyItemList(
        attributeDescriptor,
        catalogAttributeHierarchies,
        ignoredDrillDownHierarchies,
    );

    const selectHierarchyTitle =
        selectedCatalogAttributeHierarchy && getHierarchyTitle(selectedCatalogAttributeHierarchy);
    const buttonText = selectHierarchyTitle ?? formatMessage(messages["drilldownSelectHierarchy"]);

    return (
        <Dropdown
            className="drill-config-hierarchy-target-select s-drill-config-hierarchy-target-select"
            closeOnMouseDrag={false}
            closeOnParentScroll
            closeOnOutsideClick
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
}
