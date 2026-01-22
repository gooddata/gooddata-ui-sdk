// (C) 2023-2026 GoodData Corporation

import { useRef, useState } from "react";

import { type ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

import {
    createAttributeHierarchyRequested,
    deleteAttributeHierarchyRequested,
} from "../../../../../model/events/attributeHierarchies.js";
import { useDashboardDispatch } from "../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../../../../model/react/useDashboardEventDispatch.js";
import { catalogActions } from "../../../../../model/store/catalog/index.js";

interface IUseAttributeHierarchy {
    onDeleteInteraction: () => void;
}

export const useAttributeHierarchy = (params: IUseAttributeHierarchy) => {
    const { onDeleteInteraction } = params;
    const dispatch = useDashboardDispatch();
    const eventDispatch = useDashboardEventDispatch();

    const [shouldDisplayAttributeHierarchyDialog, setDisplayAttributeHierarchyDialog] = useState(false);
    const editingAttributeHierarchyRef = useRef<ICatalogAttributeHierarchy | undefined>(undefined);

    const onOpenAttributeHierarchyDialog = (attributeHierarchy?: ICatalogAttributeHierarchy) => {
        editingAttributeHierarchyRef.current = attributeHierarchy;
        setDisplayAttributeHierarchyDialog(true);
    };

    const onCloseAttributeHierarchyDialog = () => {
        setDisplayAttributeHierarchyDialog(false);
    };

    const onSaveAttributeHierarchy = (attributeHierarchy?: ICatalogAttributeHierarchy) => {
        eventDispatch(createAttributeHierarchyRequested());

        if (editingAttributeHierarchyRef.current && attributeHierarchy) {
            dispatch(catalogActions.updateAttributeHierarchy(attributeHierarchy));
            return;
        }

        if (attributeHierarchy) {
            onDeleteInteraction();
            dispatch(catalogActions.addAttributeHierarchy(attributeHierarchy));
        }
    };

    const onDeleteAttributeHierarchy = () => {
        if (editingAttributeHierarchyRef.current) {
            dispatch(catalogActions.deleteAttributeHierarchy(editingAttributeHierarchyRef.current));

            eventDispatch(deleteAttributeHierarchyRequested());
        }
    };

    return {
        shouldDisplayAttributeHierarchyDialog,
        editingAttributeHierarchyRef,
        onOpenAttributeHierarchyDialog,
        onCloseAttributeHierarchyDialog,
        onSaveAttributeHierarchy,
        onDeleteAttributeHierarchy,
    };
};
