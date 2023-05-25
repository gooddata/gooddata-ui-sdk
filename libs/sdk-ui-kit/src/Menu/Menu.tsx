// (C) 2007-2018 GoodData Corporation
import React from "react";
import isFunction from "lodash/isFunction.js";

import { ISubMenuProps } from "./SubMenu.js";
import { MenuState } from "./MenuState.js";
import { ControlledMenu } from "./ControlledMenu.js";

/**
 * @internal
 */
export interface IMenuProps extends ISubMenuProps {
    closeOnScroll?: boolean;
    portalTarget?: Element;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
}

/**
 * @internal
 */
export const Menu: React.FC<IMenuProps> = (props: IMenuProps) => (
    <MenuState
        opened={props.opened}
        defaultOpened={props.defaultOpened}
        onOpenedChange={props.onOpenedChange}
    >
        {(controlledProps) => (
            <ControlledMenu
                opened={controlledProps.opened}
                onOpenedChange={controlledProps.onOpenedChange}
                openAction={props.openAction}
                alignment={props.alignment}
                spacing={props.spacing}
                offset={props.offset}
                toggler={props.toggler}
                togglerWrapperClassName={props.togglerWrapperClassName}
                portalTarget={props.portalTarget}
                closeOnScroll={props.closeOnScroll!}
            >
                {isFunction(props.children)
                    ? props.children({
                          closeMenu: () =>
                              controlledProps.onOpenedChange({
                                  opened: false,
                                  source: "CLOSE_MENU_RENDER_PROP",
                              }),
                      })
                    : props.children}
            </ControlledMenu>
        )}
    </MenuState>
);

Menu.defaultProps = {
    openAction: "click",
    alignment: ["bottom", "right"],
    closeOnScroll: false,
};
