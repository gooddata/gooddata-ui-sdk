// (C) 2007-2025 GoodData Corporation
import { ReactNode, useRef } from "react";

import { OutsideClickHandler } from "../utils/OutsideClickHandler.js";
import { MenuPosition } from "../positioning/MenuPosition.js";

import { IMenuOpenedBySharedProps } from "./MenuOpenedBySharedProps.js";

export function MenuOpenedByClick(props: IMenuOpenedBySharedProps) {
    const outsideClick = () => props.onOpenedChange({ opened: false, source: "OUTSIDE_CLICK" });
    const togglerWrapperClick = () =>
        props.onOpenedChange({ opened: !props.opened, source: "TOGGLER_BUTTON_CLICK" });
    const togglerRef = useRef<HTMLDivElement>(null);

    function OutsideClickHandlerWrapped(props: { children: ReactNode }) {
        return (
            <OutsideClickHandler onOutsideClick={outsideClick} useCapture={true} toggler={togglerRef.current}>
                {props.children}
            </OutsideClickHandler>
        );
    }

    const togglerWrapped = (
        <div onClick={togglerWrapperClick} className="gd-menuOpenedByClick-togglerWrapped" ref={togglerRef}>
            {props.toggler}
        </div>
    );

    return (
        <MenuPosition
            opened={props.opened}
            toggler={togglerWrapped}
            togglerWrapperClassName={props.togglerWrapperClassName}
            contentWrapper={OutsideClickHandlerWrapped}
            topLevelMenu={props.topLevelMenu}
            portalTarget={props.portalTarget}
            alignment={props.alignment}
            spacing={props.spacing}
            offset={props.offset}
        >
            {props.children}
        </MenuPosition>
    );
}
