// (C) 2007-2022 GoodData Corporation
import React from "react";

import { OpenAction, IMenuPositionConfig, OnOpenedChange } from "./MenuSharedTypes.js";
import { MenuOpener } from "./menuOpener/MenuOpener.js";

export interface IControlledMenuProps extends Partial<IMenuPositionConfig> {
    opened: boolean;
    openAction?: OpenAction;
    closeOnScroll: boolean;
    portalTarget: Element | undefined;
    onOpenedChange: OnOpenedChange;
    toggler: React.ReactNode;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
}

export class ControlledMenu extends React.Component<IControlledMenuProps> {
    public componentDidMount(): void {
        if (this.props.closeOnScroll) {
            this.addScrollListeners();
        }
    }

    public componentWillUnmount(): void {
        if (this.props.closeOnScroll) {
            this.removeScrollListeners();
        }
    }

    public componentDidUpdate(prevProps: IControlledMenuProps): void {
        if (prevProps.closeOnScroll !== this.props.closeOnScroll) {
            if (this.props.closeOnScroll) {
                this.addScrollListeners();
            } else {
                this.removeScrollListeners();
            }
        }
    }

    public render() {
        return (
            <MenuOpener
                opened={this.props.opened}
                onOpenedChange={this.props.onOpenedChange}
                openAction={this.props.openAction}
                alignment={this.props.alignment}
                spacing={this.props.spacing}
                offset={this.props.offset}
                portalTarget={this.props.portalTarget}
                toggler={this.props.toggler}
                togglerWrapperClassName={this.props.togglerWrapperClassName}
                topLevelMenu={true}
            >
                {this.props.children}
            </MenuOpener>
        );
    }

    private closeMenu = () => {
        this.props.onOpenedChange({ opened: false, source: "SCROLL" });
    };

    private addScrollListeners = () => {
        window.addEventListener("scroll", this.closeMenu, true);
    };

    private removeScrollListeners = () => {
        window.removeEventListener("scroll", this.closeMenu, true);
    };
}
