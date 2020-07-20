// (C) 2007-2018 GoodData Corporation
import React from "react";
import { OpenAction, IMenuPositionConfig } from "./MenuSharedTypes";
import MenuState, { IMenuStateConfig } from "./MenuState";
import MenuOpener from "./menuOpener/MenuOpener";

export interface ISubMenuProps extends IMenuStateConfig, Partial<IMenuPositionConfig> {
    openAction?: OpenAction;

    toggler: React.ReactNode;
    children: React.ReactNode;
}

const SubMenu: React.SFC<ISubMenuProps> = (props: ISubMenuProps) => (
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
export default SubMenu;
