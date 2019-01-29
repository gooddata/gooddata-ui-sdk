// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { isFunction } from 'lodash';
import { ISubMenuProps } from './SubMenu';
import MenuState from './MenuState';
import ControlledMenu from './ControlledMenu';

export interface IMenuProps extends ISubMenuProps {
    closeOnScroll?: boolean;
    portalTarget?: Element;
    children: ((props: { closeMenu: () => void }) => React.ReactNode) | React.ReactNode;
}

const Menu: React.SFC<IMenuProps> = (props: IMenuProps) => (
    <MenuState opened={props.opened} defaultOpened={props.defaultOpened} onOpenedChange={props.onOpenedChange}>
        {controlledProps => (
            <ControlledMenu
                opened={controlledProps.opened}
                onOpenedChange={controlledProps.onOpenedChange}
                openAction={props.openAction}
                alignment={props.alignment}
                spacing={props.spacing}
                offset={props.offset}
                toggler={props.toggler}
                portalTarget={props.portalTarget}
                closeOnScroll={props.closeOnScroll}
            >
                {isFunction(props.children)
                    ? props.children({
                          closeMenu: () => controlledProps.onOpenedChange(false)
                      })
                    : props.children}
            </ControlledMenu>
        )}
    </MenuState>
);
Menu.defaultProps = {
    openAction: 'click',
    alignment: ['bottom', 'right'],
    closeOnScroll: false
};

export default Menu;
