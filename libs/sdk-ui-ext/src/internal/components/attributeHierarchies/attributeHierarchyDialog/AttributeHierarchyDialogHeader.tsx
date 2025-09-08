// (C) 2023-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { EditableLabel } from "@gooddata/sdk-ui-kit";

import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

const ATTRIBUTE_HIERARCHY_TITLE_ROW = 1;

function AttributeHierarchyDialogHeader() {
    const { formatMessage } = useIntl();
    const { title, onUpdateTitle } = useAttributeHierarchyDialog();

    const placeholder = formatMessage(messages["hierarchyUntitled"]);

    return (
        <div className="gd-dialog-header">
            <i className="gd-attribute-hierarchy-icon s-gd-attribute-hierarchy-icon" />
            <EditableLabel
                value={title}
                className="attribute-hierarchy-title s-attribute-hierarchy-title"
                maxRows={ATTRIBUTE_HIERARCHY_TITLE_ROW}
                onSubmit={onUpdateTitle}
                placeholder={placeholder}
            />
        </div>
    );
}

export default AttributeHierarchyDialogHeader;
