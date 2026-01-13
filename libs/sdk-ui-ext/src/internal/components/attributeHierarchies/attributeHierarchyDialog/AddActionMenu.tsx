// (C) 2023-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { Item, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";

import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

interface IAddActionMenuProps {
    rowIndex: number;
    alignTo: HTMLElement | null;
    onClose: () => void;
}

const ALIGN_POINTS = [{ align: "br tr" }];

export function AddActionMenu({ rowIndex, alignTo, onClose }: IAddActionMenuProps) {
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

    const addAboveText = formatMessage(messages["hierarchyAddAttributeAbove"]);
    const addBellowText = formatMessage(messages["hierarchyAddAttributeBellow"]);

    return (
        <Overlay
            alignTo={alignTo}
            alignPoints={ALIGN_POINTS}
            closeOnMouseDrag
            closeOnOutsideClick
            onClose={onClose}
            className="attribute-hierarchy-add-action-menu s-attribute-hierarchy-add-action-menu"
        >
            <ItemsWrapper smallItemsSpacing>
                <Item onClick={handleAddAbove}>
                    <i className="gd-icon-arrow-up s-add-above" />
                    {addAboveText}
                </Item>
                <Separator />
                <Item onClick={handleAddBellow}>
                    <i className="gd-icon-arrow-down s-add-below" />
                    {addBellowText}
                </Item>
            </ItemsWrapper>
        </Overlay>
    );
}
