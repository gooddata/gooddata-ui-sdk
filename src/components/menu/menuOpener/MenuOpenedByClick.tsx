// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { IMenuOpenedBySharedProps } from './MenuOpenedBySharedProps';
import OutsideClickHandler from '../utils/OutsideClickHandler';
import MenuPosition from '../positioning/MenuPosition';

const MenuOpenedByClick = (props: IMenuOpenedBySharedProps) => {
    const closeMenu = () => props.onOpenedChange(false);
    const toggleMenu = () => props.onOpenedChange(!props.opened);

    const OutsideClickHandlerWrapped = (props: { children: React.ReactNode }) => (
        <OutsideClickHandler onOutsideClick={closeMenu} useCapture={false}>
            {props.children}
        </OutsideClickHandler>
    );

    const togglerWrapped = <div onClick={toggleMenu}>{props.toggler}</div>;

    return (
        <MenuPosition
            opened={props.opened}
            toggler={togglerWrapped}
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

export default MenuOpenedByClick;
