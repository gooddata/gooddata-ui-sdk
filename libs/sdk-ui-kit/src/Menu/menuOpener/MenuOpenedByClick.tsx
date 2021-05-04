// (C) 2007-2018 GoodData Corporation
import React from "react";

import { OutsideClickHandler } from "../utils/OutsideClickHandler";
import { MenuPosition } from "../positioning/MenuPosition";

import { IMenuOpenedBySharedProps } from "./MenuOpenedBySharedProps";

export const MenuOpenedByClick = (props: IMenuOpenedBySharedProps): JSX.Element => {
    const outsideClick = () => props.onOpenedChange({ opened: false, source: "OUTSIDE_CLICK" });
    const togglerWrapperClick = () =>
        props.onOpenedChange({ opened: !props.opened, source: "TOGGLER_BUTTON_CLICK" });

    const OutsideClickHandlerWrapped = (props: { children: React.ReactNode }) => (
        // UseCapture is set to false (default event bubbling). This has the disadvantage that we will not
        // get notified of click events with preventDefault or stopPropagation methods called on them. On the
        // other hand it greatly simplifies event handling with toggler elements, for example if we have
        // opened menu and we used useCapture=true, and somebody clicked togger element, OutsideClickHandler
        // would get notified, he would set opened state from true to false, and then togger element click
        // handler would get notified, that would toggle it back to true, so menu would stay opened. This
        // could be solved by OutsideClickHandler ignoring clicks that are inside togglerWrapped.
        <OutsideClickHandler onOutsideClick={outsideClick} useCapture={false}>
            {props.children}
        </OutsideClickHandler>
    );

    const togglerWrapped = (
        <div onClick={togglerWrapperClick} className="gd-menuOpenedByClick-togglerWrapped">
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
};
