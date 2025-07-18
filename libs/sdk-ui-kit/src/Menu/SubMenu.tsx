// (C) 2007-2025 GoodData Corporation
import { ReactNode } from "react";

import { OpenAction, IMenuPositionConfig } from "./MenuSharedTypes.js";
import { MenuState, IMenuStateConfig } from "./MenuState.js";
import { MenuOpener } from "./menuOpener/MenuOpener.js";

/**
 * @internal
 */
export interface ISubMenuProps extends IMenuStateConfig, Partial<IMenuPositionConfig> {
    openAction?: OpenAction;
    toggler: ReactNode;
    children: ReactNode;
}

/**
 * @internal
 */
export function SubMenu(props: ISubMenuProps) {
    return (
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
}
