// (C) 2007-2024 GoodData Corporation
import React from "react";
import isFunction from "lodash/isFunction.js";

import { ISubMenuProps } from "./SubMenu.js";
import { MenuState } from "./MenuState.js";
import { ControlledMenu } from "./ControlledMenu.js";
import { MenuAlignment } from "./MenuSharedTypes.js";

/**
 * @internal
 */
export interface IMenuProps extends ISubMenuProps {
    closeOnScroll?: boolean;
    portalTarget?: Element;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
}

const DEFAULT_ALIGNMENT: MenuAlignment = ["bottom", "right"];

/**
 * @internal
 */
export const Menu: React.FC<IMenuProps> = ({
    alignment = DEFAULT_ALIGNMENT,
    children,
    closeOnScroll = false,
    defaultOpened,
    offset,
    onOpenedChange,
    openAction = "click",
    opened,
    portalTarget,
    spacing,
    toggler,
    togglerWrapperClassName,
}: IMenuProps) => (
    <MenuState opened={opened} defaultOpened={defaultOpened} onOpenedChange={onOpenedChange}>
        {(controlledProps) => (
            <ControlledMenu
                opened={controlledProps.opened}
                onOpenedChange={controlledProps.onOpenedChange}
                openAction={openAction}
                alignment={alignment}
                spacing={spacing}
                offset={offset}
                toggler={toggler}
                togglerWrapperClassName={togglerWrapperClassName}
                portalTarget={portalTarget}
                closeOnScroll={closeOnScroll}
            >
                {isFunction(children)
                    ? children({
                          closeMenu: () =>
                              controlledProps.onOpenedChange({
                                  opened: false,
                                  source: "CLOSE_MENU_RENDER_PROP",
                              }),
                      })
                    : children}
            </ControlledMenu>
        )}
    </MenuState>
);
