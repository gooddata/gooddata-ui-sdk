// (C) 2007-2022 GoodData Corporation
import React from "react";

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
    children: (props: { opened: boolean; onOpenedChange: OnOpenedChange }) => React.ReactNode;
}

export interface IMenuStateState {
    opened?: boolean;
}

export class MenuState extends React.Component<IMenuStateProps, IMenuStateState> {
    public static defaultProps = {
        defaultOpened: false,
    };

    constructor(props: IMenuStateProps) {
        super(props);

        this.state = {
            opened: this.isControlled() ? this.props.opened : this.props.defaultOpened!,
        };
    }

    public render() {
        return this.props.children({
            opened: (this.isControlled() ? this.props.opened : this.state.opened) ?? false,
            onOpenedChange: this.onOpenedChange,
        });
    }

    private isControlled = (): boolean => {
        return typeof this.props.opened === "boolean";
    };

    private onOpenedChange = (openedChangeParams: IOnOpenedChangeParams) => {
        this.setState({ opened: openedChangeParams.opened }, () => {
            if (this.props.onOpenedChange) {
                this.props.onOpenedChange(openedChangeParams);
            }
        });
    };
}
