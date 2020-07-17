// (C) 2007-2018 GoodData Corporation
import React from "react";

export interface IOutsideClickHandlerProps {
    onOutsideClick: (e: MouseEvent) => void;
    useCapture?: boolean;
}

export default class OutsideClickHandler extends React.Component<IOutsideClickHandlerProps> {
    public static defaultProps = {
        // Set to true by default so that a `stopPropagation` in the
        // children will not prevent all outside click handlers from firing
        useCapture: true,
    };

    private wrapperEl: HTMLElement = null;

    public componentDidUpdate(prevProps: IOutsideClickHandlerProps) {
        if (
            prevProps.onOutsideClick !== this.props.onOutsideClick ||
            prevProps.useCapture !== this.props.useCapture
        ) {
            this.removeListeners();
            this.addListeners();
        }
    }

    public componentDidMount() {
        this.addListeners();
    }

    public componentWillUnmount() {
        this.removeListeners();
    }

    public render() {
        return <div ref={this.setWrapperEl}>{this.props.children}</div>;
    }

    private setWrapperEl = (el: HTMLElement) => {
        this.wrapperEl = el;
    };

    private handleClick = (e: MouseEvent) => {
        if (!this.wrapperEl) {
            // In IE11 the wrapperEl is not initialized for some reason.
            return;
        }

        if (this.wrapperEl.contains(e.target as HTMLElement)) {
            return;
        }

        if (this.props.onOutsideClick) {
            this.props.onOutsideClick(e);
        }
    };

    private addListeners = () => {
        document.addEventListener("click", this.handleClick, this.props.useCapture);
    };

    private removeListeners = () => {
        document.removeEventListener("click", this.handleClick, this.props.useCapture);
    };
}
