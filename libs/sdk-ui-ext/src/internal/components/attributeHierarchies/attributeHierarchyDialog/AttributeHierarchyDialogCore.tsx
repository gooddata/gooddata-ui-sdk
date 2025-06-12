// (C) 2023-2025 GoodData Corporation
import React from "react";
import { Dialog, useId } from "@gooddata/sdk-ui-kit";

import AttributeHierarchyDialogHeader from "./AttributeHierarchyDialogHeader.js";
import AttributeHierarchyDialogContent from "./AttributeHierarchyDialogContent.js";
import AttributeHierarchyDialogFooter from "./AttributeHierarchyDialogFooter.js";
import DeleteAttributeHierarchyConfirmation from "./DeleteAttributeHieraryConfirmation.js";
import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

const AttributeHierarchyDialogCore: React.FC = () => {
    const { onClose, shouldDisplayDeleteConfirmation, title } = useAttributeHierarchyDialog();

    const titleElementId = useId();

    return shouldDisplayDeleteConfirmation ? (
        <DeleteAttributeHierarchyConfirmation />
    ) : (
        <Dialog
            containerClassName="attribute-hierarchy-overlay s-attribute-hierarchy-overlay"
            className="attribute-hierarchy-dialog s-attribute-hierarchy-dialog"
            displayCloseButton={true}
            onClose={onClose}
            accessibilityConfig={{ titleElementId }}
        >
            <h2 className={"sr-only"} id={titleElementId}>
                {title}
            </h2>

            <AttributeHierarchyDialogHeader />
            <AttributeHierarchyDialogContent />
            <AttributeHierarchyDialogFooter />
        </Dialog>
    );
};

export default AttributeHierarchyDialogCore;
