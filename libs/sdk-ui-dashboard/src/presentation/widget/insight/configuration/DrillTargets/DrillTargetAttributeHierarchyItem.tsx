// (C) 2023-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    areObjRefsEqual,
    getHierarchyAttributes,
    isCatalogAttributeHierarchy,
} from "@gooddata/sdk-model";
import { AttributeHierarchyDialog } from "@gooddata/sdk-ui-ext";

import { AttributeHierarchyDropdown } from "./AttributeHierarchyDropdown.js";
import { EmptyAttributeHierarchyInfo } from "./EmptyAttributeHierarchyInfo.js";
import { useAttributeHierarchy } from "./useAttributeHierarchy.js";
import {
    selectAllCatalogAttributeHierarchies,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../model/index.js";
import { type IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";

interface IDrillTargetDashboardItemProps {
    config: IDrillDownAttributeHierarchyConfig;
    onSelect: (targetItem: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) => void;
    onDeleteInteraction: () => void;
}

export function DrillTargetAttributeHierarchyItem({
    config,
    onSelect,
    onDeleteInteraction,
}: IDrillTargetDashboardItemProps) {
    const catalogAttributeHierarchies = useDashboardSelector(selectAllCatalogAttributeHierarchies);
    const userInteraction = useDashboardUserInteraction();

    const {
        editingAttributeHierarchyRef,
        shouldDisplayAttributeHierarchyDialog,
        onDeleteAttributeHierarchy,
        onSaveAttributeHierarchy,
        onOpenAttributeHierarchyDialog,
        onCloseAttributeHierarchyDialog,
    } = useAttributeHierarchy({ onDeleteInteraction });

    const attributeDescriptor = config.attributes.find(
        (attr) => attr.attributeHeader.localIdentifier === config.originLocalIdentifier,
    );

    const existInHierarchies = catalogAttributeHierarchies.filter((hierarchy) => {
        const attributesRef = getHierarchyAttributes(hierarchy);
        return attributesRef.some((ref) =>
            areObjRefsEqual(ref, attributeDescriptor?.attributeHeader.formOf.ref),
        );
    });

    const shouldShowEmptyMessage = isEmpty(existInHierarchies) && !config.complete;

    const onOpenDialog = (item?: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) => {
        if (!item || isCatalogAttributeHierarchy(item)) {
            onOpenAttributeHierarchyDialog(item);
        }
    };

    return (
        <>
            {shouldShowEmptyMessage ? (
                <EmptyAttributeHierarchyInfo
                    onOpenAttributeHierarchyDialog={onOpenAttributeHierarchyDialog}
                />
            ) : (
                <AttributeHierarchyDropdown
                    config={config}
                    onSelect={onSelect}
                    attributeDescriptor={attributeDescriptor}
                    onOpenAttributeHierarchyDialog={onOpenDialog}
                />
            )}
            {shouldDisplayAttributeHierarchyDialog ? (
                <AttributeHierarchyDialog
                    initialAttributeRef={attributeDescriptor?.attributeHeader.formOf.ref}
                    editingAttributeHierarchy={editingAttributeHierarchyRef.current}
                    onClose={onCloseAttributeHierarchyDialog}
                    onSaveOrUpdateSuccess={onSaveAttributeHierarchy}
                    onDeleteSuccess={onDeleteAttributeHierarchy}
                    onAddAttributeClicked={() => {
                        userInteraction.attributeHierarchiesInteraction(
                            "attributeHierarchyAddAttributeClicked",
                        );
                    }}
                    onCreateHierarchyClicked={() => {
                        userInteraction.attributeHierarchiesInteraction("attributeHierarchyCreateClicked");
                    }}
                />
            ) : null}
        </>
    );
}
