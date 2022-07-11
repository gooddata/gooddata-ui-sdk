// (C) 2007-2022 GoodData Corporation
import React, { createRef } from "react";

export interface IOutsideClickHandlerProps {
    onOutsideClick: (e: MouseEvent) => void;
    toggler: HTMLDivElement;
    useCapture?: boolean;
}

export class OutsideClickHandler extends React.Component<IOutsideClickHandlerProps> {
    public static defaultProps = {
        // Set to true by default so that a `stopPropagation` in the
        // children will not prevent all outside click handlers from firing
        useCapture: true,
    };

    private wrapperElRef = createRef<HTMLDivElement>();

    public componentDidUpdate(prevProps: IOutsideClickHandlerProps): void {
        if (
            prevProps.onOutsideClick !== this.props.onOutsideClick ||
            prevProps.useCapture !== this.props.useCapture
        ) {
            this.removeListeners();
            this.addListeners();
        }
    }

    public componentDidMount(): void {
        this.addListeners();
    }

    public componentWillUnmount(): void {
        this.removeListeners();
    }

    public render() {
        return <div ref={this.wrapperElRef}>{this.props.children}</div>;
    }

    private handleClick = (e: MouseEvent) => {
        if (!this.wrapperElRef.current) {
            // In IE11 the wrapperEl is not initialized for some reason.
            return;
        }

        const target = e.target as HTMLElement;

        if (this.wrapperElRef.current.contains(target) || this.props.toggler?.contains(target)) {
            return;
        }

        if (this.props.onOutsideClick) {
            this.props.onOutsideClick(e);
        }
    };

    private addListeners = () => {
        document.addEventListener("mousedown", this.handleClick, this.props.useCapture);
    };

    private removeListeners = () => {
        document.removeEventListener("mousedown", this.handleClick, this.props.useCapture);
    };
}
