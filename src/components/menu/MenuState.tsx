// (C) 2007-2018 GoodData Corporation
import * as React from 'react';

export interface IMenuStateConfig {
    opened?: boolean;
    defaultOpened?: boolean;
    onOpenedChange?: (opened: boolean) => void;
}

export interface IMenuStateProps extends IMenuStateConfig {
    children: (
        props: {
            opened: boolean;
            onOpenedChange: (opened: boolean) => void;
        }
    ) => React.ReactNode;
}

export interface IMenuStateState {
    opened: boolean;
}

export default class MenuState extends React.Component<IMenuStateProps, IMenuStateState> {
    public static defaultProps = {
        defaultOpened: false
    };

    constructor(props: IMenuStateProps) {
        super(props);

        this.state = {
            opened: this.isControlled() ? this.props.opened : this.props.defaultOpened
        };
    }

    public render() {
        return this.props.children({
            opened: this.isControlled() ? this.props.opened : this.state.opened,
            onOpenedChange: this.menuVisibilityChange
        });
    }

    private isControlled = (): boolean => {
        return typeof this.props.opened === 'boolean';
    }

    private menuVisibilityChange = (opened: boolean) => {
        this.setState({ opened }, () => {
            if (this.props.onOpenedChange) {
                this.props.onOpenedChange(opened);
            }
        });
    }
}
