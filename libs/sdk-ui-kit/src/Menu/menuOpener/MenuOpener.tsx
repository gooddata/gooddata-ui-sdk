// (C) 2007-2022 GoodData Corporation
import React from "react";

import { OpenAction, IMenuPositionConfig, OnOpenedChange } from "../MenuSharedTypes.js";

import { MenuOpenedByClick } from "./MenuOpenedByClick.js";
import { MenuOpenedByHover } from "./MenuOpenedByHover.js";

export interface IMenuOpenerProps extends Partial<IMenuPositionConfig> {
    topLevelMenu: boolean;
    opened: boolean;
    onOpenedChange: OnOpenedChange;
    openAction?: OpenAction;
    portalTarget?: Element | null;
    toggler: React.ReactNode;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
}

export class MenuOpener extends React.Component<IMenuOpenerProps> {
    public static defaultProps: Pick<
        IMenuOpenerProps,
        "openAction" | "alignment" | "spacing" | "offset" | "portalTarget"
    > = {
        openAction: "hover",

        alignment: ["right", "bottom"],
        spacing: 0,
        offset: 0,

        portalTarget: document.querySelector("body"),
    };

    public render() {
        const Component = this.getComponentByOpenAction() as React.ElementType;

        return (
            <Component
                opened={this.props.opened}
                onOpenedChange={this.props.onOpenedChange}
                topLevelMenu={this.props.topLevelMenu}
                alignment={this.props.alignment}
                spacing={this.props.spacing}
                offset={this.props.offset}
                toggler={this.props.toggler}
                togglerWrapperClassName={this.props.togglerWrapperClassName}
                portalTarget={this.props.portalTarget}
            >
                <div className="gd-menuOpener">{this.props.children}</div>
            </Component>
        );
    }

    private getComponentByOpenAction = () => {
        switch (this.props.openAction) {
            case "click":
                return MenuOpenedByClick;
            case "hover":
                return MenuOpenedByHover;
        }
    };
}
