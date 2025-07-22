// (C) 2007-2025 GoodData Corporation
import { Component, ReactNode } from "react";

import { OnOpenedChange, IOnOpenedChangeParams } from "./MenuSharedTypes.js";

/**
 * @internal
 */
export interface IMenuStateConfig {
    opened?: boolean;
    defaultOpened?: boolean;
    onOpenedChange?: OnOpenedChange;
}

/**
 * @internal
 */
export interface IMenuStateProps extends IMenuStateConfig {
    children: (props: IMenuStateRenderProp) => ReactNode;
}

interface IMenuStateState {
    opened: boolean;
}

export interface IMenuStateRenderProp {
    opened: boolean;
    onOpenedChange: OnOpenedChange;
}

export class MenuState extends Component<IMenuStateProps, IMenuStateState> {
    public static defaultProps = {
        defaultOpened: false,
    };

    constructor(props: IMenuStateProps) {
        super(props);
        console.log("UI-KIT MenuState: Constructor called");
        console.log("UI-KIT MenuState: props.opened:", props.opened, "defaultOpened:", props.defaultOpened);

        this.state = {
            opened: this.isControlled() ? this.props.opened : this.props.defaultOpened!,
        };
        console.log("UI-KIT MenuState: Initial state.opened:", this.state.opened);
    }

    public render() {
        console.log("UI-KIT MenuState: render called");
        const opened = (this.isControlled() ? this.props.opened : this.state.opened) ?? false;
        console.log("UI-KIT MenuState: rendering with opened:", opened);

        return this.props.children({
            opened: opened,
            onOpenedChange: this.onOpenedChange,
        });
    }

    private isControlled = (): boolean => {
        return typeof this.props.opened === "boolean";
    };

    private onOpenedChange = (openedChangeParams: IOnOpenedChangeParams) => {
        console.log("UI-KIT MenuState: onOpenedChange called with:", openedChangeParams);
        this.setState({ opened: openedChangeParams.opened }, () => {
            if (this.props.onOpenedChange) {
                this.props.onOpenedChange(openedChangeParams);
            }
        });
    };
}
