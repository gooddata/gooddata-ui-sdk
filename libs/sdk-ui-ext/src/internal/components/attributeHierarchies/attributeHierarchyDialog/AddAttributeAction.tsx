// (C) 2023 GoodData Corporation
import React from "react";
import { Button } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

const AddAttributeAction: React.FC = () => {
    const { formatMessage } = useIntl();
    const { onAddEmptyAttribute, attributes } = useAttributeHierarchyDialog();

    const handleAddAttribute = () => {
        onAddEmptyAttribute(attributes.length - 1);
    };

    const addAttributeText = formatMessage(messages.hierarchyAddAttribute);

    return (
        <div className="attribute-hierarchy-add-attribute-action s-attribute-hierarchy-add-attribute-action">
            <Button
                className="gd-button-link gd-icon-plus"
                value={addAttributeText}
                onClick={handleAddAttribute}
            />
        </div>
    );
};

export default AddAttributeAction;
