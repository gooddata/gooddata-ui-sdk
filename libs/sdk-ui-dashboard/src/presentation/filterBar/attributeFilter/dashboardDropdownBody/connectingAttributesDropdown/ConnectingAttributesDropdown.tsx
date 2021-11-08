// (C) 2007-2021 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import React from "react";
import { Dropdown, IAlignPoint } from "@gooddata/sdk-ui-kit";

// const DROPDOWN_BODY_WIDTH = 205;

export type HandleConnectingAttributeSelect = (ref: ObjRef, targetRef: ObjRef) => void;

export interface IConnectingAttribute {
    ref: ObjRef;
    title: string;
    icon: string;
}

interface IConnectingAttributesDropdownProps {
    objRef: ObjRef;
    selectedConnectingAttributeRef: ObjRef;
    connectingAttributes: IConnectingAttribute[];
    onSelect: HandleConnectingAttributeSelect;
}

// const getConnectingAttributeBySelection = (
//     selectedConnectingAttributeRef: ObjRef,
//     connectingAttributes: IConnectingAttribute[],
// ): IConnectingAttribute => {
//     return connectingAttributes.find(({ ref }) => areObjRefsEqual(ref, selectedConnectingAttributeRef))!;
// };

const dropdownAlignPoints: IAlignPoint[] = [{ align: "br tr" }, { align: "tr br" }];

export const ConnectingAttributesDropdown: React.FC<IConnectingAttributesDropdownProps> = () =>
    // {
    //     objRef,
    //     selectedConnectingAttributeRef,
    //     connectingAttributes,
    //     onSelect,
    // },
    {
        // const selectedConnectingAttribute = getConnectingAttributeBySelection(
        //     selectedConnectingAttributeRef,
        //     connectingAttributes,
        // );

        return (
            <Dropdown
                className="connecting-attributes-dropdown s-connecting-attributes-dropdown"
                closeOnParentScroll={true}
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                alignPoints={dropdownAlignPoints}
                // button={
                //     <DropdownButton
                //         value={selectedConnectingAttribute.title}
                //         iconLeft={selectedConnectingAttribute.icon}
                //         title={selectedConnectingAttribute.title}
                //     />
                // }
                //@ts-expect-error Functionality will be implemented in a future
                body={
                    <div>body</div>
                    // <DropdownBody
                    //     className="connecting-attributes-dropdown-body s-connecting-attributes-dropdown-body"
                    //     width={DROPDOWN_BODY_WIDTH}
                    //     items={connectingAttributes}
                    //     selection={selectedConnectingAttribute}
                    //     onSelect={(target: IConnectingAttribute) => onSelect(objRef, target.ref)}
                    // />
                }
            />
        );
    };
