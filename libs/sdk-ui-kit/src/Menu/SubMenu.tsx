// (C) 2007-2018 GoodData Corporation
import React from "react";

import { OpenAction, IMenuPositionConfig } from "./MenuSharedTypes.js";
import { MenuState, IMenuStateConfig } from "./MenuState.js";
import { MenuOpener } from "./menuOpener/MenuOpener.js";

/**
 * @internal
 */
export interface ISubMenuProps extends IMenuStateConfig, Partial<IMenuPositionConfig> {
    openAction?: OpenAction;
    toggler: React.ReactNode;
    children: React.ReactNode;
}

/**
 * @internal
 */
export const SubMenu: React.FC<ISubMenuProps> = (props: ISubMenuProps) => (
    <MenuState
        opened={props.opened}
        defaultOpened={props.defaultOpened}
        onOpenedChange={props.onOpenedChange}
    >
        {({ opened, onOpenedChange }) => (
            <MenuOpener
                opened={opened}
                onOpenedChange={onOpenedChange}
                topLevelMenu={false}
                openAction={props.openAction}
                toggler={props.toggler}
                alignment={props.alignment}
                spacing={props.spacing}
                offset={props.offset}
            >
                {props.children}
            </MenuOpener>
        )}
    </MenuState>
);
