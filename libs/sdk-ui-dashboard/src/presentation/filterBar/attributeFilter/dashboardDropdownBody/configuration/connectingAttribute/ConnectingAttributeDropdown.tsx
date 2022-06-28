// (C) 2022 GoodData Corporation
import React from "react";

import { Dropdown, DropdownButton, DropdownList } from "@gooddata/sdk-ui-kit";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { selectCatalogAttributes, useDashboardSelector, IConnectingAttribute } from "../../../../../../model";
import { ConnectingAttributeItem } from "./ConnectingAttributeItem";

import invariant from "ts-invariant";

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

    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const selectedConnectingAttribute = catalogAttributes.find((attr) =>
        areObjRefsEqual(attr.attribute.ref, selectedConnectingAttributeRef),
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
                    value={selectedConnectingAttribute.attribute.title}
                    iconLeft="gd-icon-attribute"
                    title={selectedConnectingAttribute.attribute.title}
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
