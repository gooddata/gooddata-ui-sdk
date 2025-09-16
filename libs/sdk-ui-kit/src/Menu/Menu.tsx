// (C) 2007-2025 GoodData Corporation

import { ReactNode } from "react";

import isFunction from "lodash/isFunction.js";

import { ControlledMenu } from "./ControlledMenu.js";
import { MenuAlignment } from "./MenuSharedTypes.js";
import { MenuState } from "./MenuState.js";
import { ISubMenuProps } from "./SubMenu.js";

/**
 * @internal
 */
export interface IMenuProps extends ISubMenuProps {
    closeOnScroll?: boolean;
    portalTarget?: Element;
    togglerWrapperClassName?: string;
    children: ReactNode;
}

const DEFAULT_ALIGNMENT: MenuAlignment = ["bottom", "right"];

/**
 * @internal
 */
export function Menu({
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
}: IMenuProps) {
    return (
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
}
