// (C) 2007-2025 GoodData Corporation

import { ReactElement, ReactNode, useCallback, useRef } from "react";

import { IMenuOpenedBySharedProps } from "./MenuOpenedBySharedProps.js";
import { MenuPosition } from "../positioning/MenuPosition.js";
import { OutsideClickHandler } from "../utils/OutsideClickHandler.js";

export function MenuOpenedByClick(props: IMenuOpenedBySharedProps): ReactElement {
    const { onOpenedChange, opened } = props;
    const outsideClick = useCallback(
        () => onOpenedChange({ opened: false, source: "OUTSIDE_CLICK" }),
        [onOpenedChange],
    );
    const togglerWrapperClick = useCallback(
        () => onOpenedChange({ opened: !opened, source: "TOGGLER_BUTTON_CLICK" }),
        [onOpenedChange, opened],
    );
    const togglerRef = useRef<HTMLDivElement>(null);

    const OutsideClickHandlerWrapped = useCallback(
        (wrapperProps: { children: ReactNode }) => (
            // If UseCapture is set to false (default event bubbling), the disadvantage is that we will not
            // get notified of click events with preventDefault or stopPropagation methods called on them. On the
            // other hand it greatly simplifies event handling with toggler elements, for example if we have
            // opened menu and we used useCapture=true, and somebody clicked toggler element, OutsideClickHandler
            // would get notified, he would set opened state from true to false, and then toggler element click
            // handler would get notified, that would toggle it back to true, so menu would stay opened. This
            // is be solved by OutsideClickHandler ignoring clicks that are inside of togglerWrapped.
            <OutsideClickHandler onOutsideClick={outsideClick} useCapture toggler={togglerRef.current}>
                {wrapperProps.children}
            </OutsideClickHandler>
        ),
        [outsideClick, togglerRef],
    );

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
