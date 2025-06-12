// (C) 2023 GoodData Corporation
import React from "react";
import { ICatalogAttributeHierarchy, ObjRef } from "@gooddata/sdk-model";

import { AttributeHierarchyDialogProvider } from "./AttributeHierarchyDialogProvider.js";
import AttributeHierarchyDialogCore from "./AttributeHierarchyDialogCore.js";

/**
 * @internal
 */
export interface IAttributeHierarchyDialogProps {
    initialAttributeRef?: ObjRef;
    editingAttributeHierarchy?: ICatalogAttributeHierarchy;
    onClose?: () => void;
    onSaveOrUpdateSuccess?: (attributeHierarchy: ICatalogAttributeHierarchy) => void;
    onDeleteSuccess?: () => void;
    onAddAttributeClicked?: () => void;
    onCreateHierarchyClicked?: () => void;
}

/**
 * @internal
 */
export const AttributeHierarchyDialog: React.FC<IAttributeHierarchyDialogProps> = ({
    initialAttributeRef,
    editingAttributeHierarchy,
    onClose,
    onSaveOrUpdateSuccess,
    onDeleteSuccess,
    onAddAttributeClicked,
    onCreateHierarchyClicked,
}) => {
    return (
        <AttributeHierarchyDialogProvider
            initialAttributeRef={initialAttributeRef}
            editingAttributeHierarchy={editingAttributeHierarchy}
            onClose={onClose}
            onSaveOrUpdateSuccess={onSaveOrUpdateSuccess}
            onDeleteSuccess={onDeleteSuccess}
            onAddAttributeClicked={onAddAttributeClicked}
            onCreateHierarchyClicked={onCreateHierarchyClicked}
        >
            <AttributeHierarchyDialogCore />
        </AttributeHierarchyDialogProvider>
    );
};
