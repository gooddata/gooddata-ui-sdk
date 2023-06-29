// (C) 2007-2022 GoodData Corporation
import React from "react";

import { MenuPosition } from "../positioning/MenuPosition.js";

import { IMenuOpenedBySharedProps } from "./MenuOpenedBySharedProps.js";

export class MenuOpenedByHover extends React.Component<IMenuOpenedBySharedProps> {
    private static openCloseDelayMs = 200;

    private timerCloseDelay: number | null = null;

    public componentWillUnmount(): void {
        this.clearCloseDelayTimer();
    }

    public render() {
        return (
            <MenuPosition
                toggler={
                    <div onMouseEnter={this.hoverStart} onMouseLeave={this.hoverEnd}>
                        {this.props.toggler}
                    </div>
                }
                togglerWrapperClassName={this.props.togglerWrapperClassName}
                opened={this.props.opened}
                topLevelMenu={this.props.topLevelMenu}
                alignment={this.props.alignment}
                spacing={this.props.spacing}
                offset={this.props.offset}
                portalTarget={this.props.portalTarget}
            >
                <div onMouseEnter={this.hoverStart} onMouseLeave={this.hoverEnd}>
                    {this.props.children}
                </div>
            </MenuPosition>
        );
    }

    private clearCloseDelayTimer = (): void => {
        if (this.timerCloseDelay) {
            window.clearTimeout(this.timerCloseDelay);
        }
    };

    private hoverStart = (): void => {
        this.clearCloseDelayTimer();
        this.timerCloseDelay = window.setTimeout(() => {
            this.props.onOpenedChange({ opened: true, source: "HOVER_TIMEOUT" });
        }, MenuOpenedByHover.openCloseDelayMs);
    };

    private hoverEnd = (): void => {
        this.clearCloseDelayTimer();
        this.timerCloseDelay = window.setTimeout(() => {
            this.props.onOpenedChange({ opened: false, source: "HOVER_TIMEOUT" });
        }, MenuOpenedByHover.openCloseDelayMs);
    };
}
