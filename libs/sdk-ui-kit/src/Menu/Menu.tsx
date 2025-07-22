// (C) 2007-2025 GoodData Corporation
import { ReactNode } from "react";
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
    console.log("UI-KIT Menu: Rendering Menu component");
    console.log("UI-KIT Menu: opened:", opened, "closeOnScroll:", closeOnScroll);

    return (
        <MenuState opened={opened} defaultOpened={defaultOpened} onOpenedChange={onOpenedChange}>
            {(controlledProps) => {
                console.log("UI-KIT Menu: MenuState render prop called with:", controlledProps);
                return (
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
                );
            }}
        </MenuState>
    );
}
