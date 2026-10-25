// (C) 2023-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ICatalogAttributeHierarchy } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeHierarchyDialog } from "@gooddata/sdk-ui-ext";

import { hideDialog } from "../actions/dialogs_actions.js";
import { CatalogUiActions } from "../sagas/catalog/catalog_ui_actions.js";
import { attributeHierarchyEditDialogSelector } from "../selectors/dialogs_selector.js";
import { type AppDispatch } from "../store/types.js";

export function AttributeHierarchyEditingDialog() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const { openAttributeHierarchyEditDialog, attributeHierarchy } = useSelector(
        attributeHierarchyEditDialogSelector,
    );

    const handleHideDialog = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    const handleDeleteAttributeHierarchy = () => {
        dispatch(CatalogUiActions.deleteCatalogAttributeHierarchy(attributeHierarchy.attributeHierarchy.id));
    };

    const handleUpdateAttributeHierarchy = (attributeHierarchy: ICatalogAttributeHierarchy) => {
        dispatch(CatalogUiActions.updateCatalogAttributeHierarchy(attributeHierarchy));
    };

    return openAttributeHierarchyEditDialog ? (
        <IntlWrapper locale={intl.locale}>
            <AttributeHierarchyDialog
                editingAttributeHierarchy={attributeHierarchy}
                onClose={handleHideDialog}
                onDeleteSuccess={handleDeleteAttributeHierarchy}
                onSaveOrUpdateSuccess={handleUpdateAttributeHierarchy}
            />
        </IntlWrapper>
    ) : null;
}
