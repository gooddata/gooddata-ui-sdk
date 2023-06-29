// (C) 2007-2022 GoodData Corporation
import React, { createRef } from "react";

import { IMenuPositionConfig } from "../MenuSharedTypes.js";

import {
    getViewportDimensionsAndCoords,
    getElementDimensions,
    getElementDimensionsAndCoords,
    calculateMenuPosition,
} from "./positioningCalculations.js";

export interface IPositionedMenuContentProps extends IMenuPositionConfig {
    topLevelMenu: boolean;
    togglerEl: HTMLElement | null;
    children: React.ReactNode;
}

export interface IPositionedMenuContentState {
    left: number;
    top: number;
}

export class PositionedMenuContent extends React.Component<
    IPositionedMenuContentProps,
    IPositionedMenuContentState
> {
    public state: IPositionedMenuContentState = {
        left: 0,
        top: 0,
    };

    private menuElRef = createRef<HTMLDivElement>();

    public componentDidUpdate(prevProps: IPositionedMenuContentProps): void {
        if (
            prevProps.alignment !== this.props.alignment ||
            prevProps.spacing !== this.props.spacing ||
            prevProps.offset !== this.props.offset ||
            prevProps.topLevelMenu !== this.props.topLevelMenu ||
            prevProps.togglerEl !== this.props.togglerEl ||
            prevProps.children !== this.props.children
        ) {
            this.positionMenu();
        }
    }

    public componentDidMount(): void {
        this.positionMenu();
        this.addEventListeners();
    }

    public componentWillUnmount(): void {
        this.removeEventListeners();
    }

    public render() {
        return (
            <div
                style={{
                    position: "absolute",
                    left: this.state.left,
                    top: this.state.top,
                }}
                ref={this.menuElRef}
            >
                {this.props.children}
            </div>
        );
    }

    private addEventListeners() {
        window.addEventListener("resize", this.positionMenu);
        window.addEventListener("scroll", this.positionMenu, true);
    }

    private removeEventListeners() {
        window.removeEventListener("resize", this.positionMenu);
        window.removeEventListener("scroll", this.positionMenu, true);
    }

    private positionMenu = () => {
        if (!this.props.togglerEl || !this.menuElRef.current) {
            return;
        }

        const { left, top } = calculateMenuPosition({
            toggler: getElementDimensionsAndCoords(this.props.togglerEl),
            menu: getElementDimensions(this.menuElRef.current),
            viewport: getViewportDimensionsAndCoords(),
            alignment: this.props.alignment,
            spacing: this.props.spacing,
            offset: this.props.offset,
            topLevelMenu: this.props.topLevelMenu,
        });

        this.setState({ left, top });
    };
}
