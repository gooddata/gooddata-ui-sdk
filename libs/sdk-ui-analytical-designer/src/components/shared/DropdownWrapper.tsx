// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import { Overlay } from "@gooddata/sdk-ui-kit";

import { DROPDOWN_ALIGNMENTS } from "../../utils/dropdown.js";

interface IDropdownWrapperProps {
    buttonNode: HTMLElement;
    onClose: () => void;
    dialogHeight: number;
    children: ReactNode;
}

export function DropdownWrapper(props: IDropdownWrapperProps) {
    const { buttonNode, onClose, dialogHeight } = props;

    return (
        <Overlay
            alignTo={buttonNode}
            alignPoints={DROPDOWN_ALIGNMENTS}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnMouseDrag
            onClose={onClose}
        >
            <div style={{ maxHeight: dialogHeight }}>{props.children}</div>
        </Overlay>
    );
}
