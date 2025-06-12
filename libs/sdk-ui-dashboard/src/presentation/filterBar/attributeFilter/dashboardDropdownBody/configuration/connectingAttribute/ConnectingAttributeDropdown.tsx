// (C) 2022 GoodData Corporation
import React from "react";

import { Dropdown, DropdownButton, DropdownList } from "@gooddata/sdk-ui-kit";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IConnectingAttribute } from "../../../../../../model/index.js";
import { ConnectingAttributeItem } from "./ConnectingAttributeItem.js";

import { invariant } from "ts-invariant";

interface IConnectingAttributeDropdownProps {
    itemLocalId: string;
    selectedConnectingAttributeRef: ObjRef;
    connectingAttributes: IConnectingAttribute[];
    onSelect: (itemLocalId: string, targetRef: ObjRef) => void;
}

const DROPDOWN_BODY_WIDTH = 205;
const ALIGN_POINTS = [
    {
        align: "br tr",
    },
    {
        align: "tr br",
    },
];

export const ConnectingAttributeDropdown: React.FC<IConnectingAttributeDropdownProps> = (props) => {
    const { itemLocalId, selectedConnectingAttributeRef, connectingAttributes, onSelect } = props;

    const selectedConnectingAttribute = connectingAttributes.find((attr) =>
        areObjRefsEqual(attr.ref, selectedConnectingAttributeRef),
    );

    invariant(
        selectedConnectingAttribute,
        "Cannot find connecting attribute in the catalog attribute items.",
    );

    return (
        <Dropdown
            className="connecting-attributes-dropdown s-connecting-attributes-dropdown"
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            alignPoints={ALIGN_POINTS}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    value={selectedConnectingAttribute.title}
                    iconLeft="gd-icon-attribute"
                    title={selectedConnectingAttribute.title}
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="connecting-attributes-dropdown-body s-connecting-attributes-dropdown-body"
                    width={DROPDOWN_BODY_WIDTH}
                    items={connectingAttributes}
                    renderItem={({ item }) => {
                        const selected = areObjRefsEqual(item.ref, selectedConnectingAttributeRef);
                        const onClick = () => {
                            closeDropdown();
                            if (!selected) {
                                onSelect(itemLocalId, item.ref);
                            }
                        };

                        return (
                            <ConnectingAttributeItem
                                title={item.title}
                                icon="gd-icon-attribute"
                                selected={selected}
                                onClick={onClick}
                            />
                        );
                    }}
                />
            )}
        />
    );
};
