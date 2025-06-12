// (C) 2023 GoodData Corporation
import React, { useRef, useState } from "react";
import { Button } from "@gooddata/sdk-ui-kit";

import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";
import AddActionMenu from "./AddActionMenu.js";

interface IAttributeItemCellProps {
    rowIndex: number;
}

const AttributeItemActions: React.FC<IAttributeItemCellProps> = ({ rowIndex }) => {
    const [shouldDisplayAddActions, setDisplayAddActions] = useState<boolean>(false);
    const { onDeleteAttribute } = useAttributeHierarchyDialog();
    const addAttributeRef = useRef();

    const handleAddAttribute = () => {
        setDisplayAddActions(true);
    };

    const handleDeleteAttribute = () => {
        onDeleteAttribute(rowIndex);
    };

    const handleCloseAddActionMenu = () => {
        setDisplayAddActions(false);
    };

    return (
        <div className="attribute-item-actions s-attribute-item-actions">
            <div ref={addAttributeRef}>
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-plus attribute-item-add-action s-attribute-item-add-action"
                    onClick={handleAddAttribute}
                />
            </div>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-trash attribute-item-delete-action s-attribute-item-delete-action"
                onClick={handleDeleteAttribute}
            />
            {shouldDisplayAddActions ? (
                <AddActionMenu
                    rowIndex={rowIndex}
                    alignTo={addAttributeRef.current}
                    onClose={handleCloseAddActionMenu}
                />
            ) : null}
        </div>
    );
};

export default AttributeItemActions;
