// (C) 2023-2025 GoodData Corporation
import React, { useEffect, useState } from "react";

import { useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

import AttributeDropdownBody from "./AttributeDropdownBody.js";
import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";
import { ICatalogAttributeData } from "./types.js";

interface IAttributeDropdownProps {
    rowIndex: number;
}

const AttributeDropdown: React.FC<IAttributeDropdownProps> = ({ rowIndex }) => {
    const { formatMessage } = useIntl();
    const { getValidAttributes, onCompleteAttribute } = useAttributeHierarchyDialog();

    const [items, setItems] = useState<ICatalogAttributeData[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);

    const handleSelect = (selectedItem: ICatalogAttributeData) => {
        onCompleteAttribute(selectedItem, rowIndex);
    };

    useEffect(() => {
        getValidAttributes(rowIndex).then((attributes) => {
            setItems(attributes);
            setLoading(false);
        });
    }, [getValidAttributes, rowIndex]);

    const chooseAttributeText = formatMessage(messages.hierarchyAttributeDropdown);

    return (
        <Dropdown
            className="attribute-hierarchy-attribute-dropdown s-attribute-hierarchy-attribute-dropdown"
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            openOnInit={true}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    className="attribute-heirarchy-attribute-dropdown-button s-attribute-heirarchy-attribute-dropdown-button"
                    value={chooseAttributeText}
                    isOpen={isOpen}
                    isSmall={true}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => {
                return (
                    <AttributeDropdownBody
                        items={items}
                        isLoading={isLoading}
                        onSelect={handleSelect}
                        closeDropdown={closeDropdown}
                    />
                );
            }}
        />
    );
};

export default AttributeDropdown;
