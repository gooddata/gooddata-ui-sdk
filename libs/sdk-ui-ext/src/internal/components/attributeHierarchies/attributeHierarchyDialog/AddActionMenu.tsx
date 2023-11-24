// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ItemsWrapper, Item, Separator, Overlay } from "@gooddata/sdk-ui-kit";
import { messages } from "@gooddata/sdk-ui";

import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

interface IAddActionMenuProps {
    rowIndex: number;
    alignTo: HTMLElement;
    onClose: () => void;
}

const ALIGN_POINTS = [{ align: "br tr" }];

const AddActionMenu: React.FC<IAddActionMenuProps> = ({ rowIndex, alignTo, onClose }) => {
    const { formatMessage } = useIntl();
    const { onAddEmptyAttribute } = useAttributeHierarchyDialog();

    const handleAddAbove = () => {
        onAddEmptyAttribute(rowIndex - 1);
        onClose();
    };

    const handleAddBellow = () => {
        onAddEmptyAttribute(rowIndex);
        onClose();
    };

    const addAboveText = formatMessage(messages.hierarchyAddAttributeAbove);
    const addBellowText = formatMessage(messages.hierarchyAddAttributeBellow);

    return (
        <Overlay
            alignTo={alignTo}
            alignPoints={ALIGN_POINTS}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            onClose={onClose}
            className="attribute-hierarchy-add-action-menu s-attribute-hierarchy-add-action-menu"
        >
            <ItemsWrapper smallItemsSpacing>
                <Item onClick={handleAddAbove}>
                    <i className="gd-icon-arrow-up" />
                    {addAboveText}
                </Item>
                <Separator />
                <Item onClick={handleAddBellow}>
                    <i className="gd-icon-arrow-down" />
                    {addBellowText}
                </Item>
            </ItemsWrapper>
        </Overlay>
    );
};

export default AddActionMenu;
