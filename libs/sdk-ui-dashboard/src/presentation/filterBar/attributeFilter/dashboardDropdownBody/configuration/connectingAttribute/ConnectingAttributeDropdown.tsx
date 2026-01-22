// (C) 2022-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Dropdown, DropdownButton, DropdownList } from "@gooddata/sdk-ui-kit";

import { ConnectingAttributeItem } from "./ConnectingAttributeItem.js";
import { type IConnectingAttribute } from "../../../../../../model/types/attributeFilterTypes.js";

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

export function ConnectingAttributeDropdown({
    itemLocalId,
    selectedConnectingAttributeRef,
    connectingAttributes,
    onSelect,
}: IConnectingAttributeDropdownProps) {
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
            closeOnParentScroll
            closeOnMouseDrag
            closeOnOutsideClick
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
}
