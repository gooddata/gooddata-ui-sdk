// (C) 2007-2022 GoodData Corporation
import React, { Component, createRef } from "react";
import throttle from "lodash/throttle.js";
import { elementRegion } from "../utils/domUtilities.js";

/**
 * @internal
 */
export interface IAutoSizeChildren {
    width: number;
    height: number;
}

/**
 * @internal
 */
export interface IAutoSizeProps {
    children: ({ width, height }: IAutoSizeChildren) => React.ReactNode;
}

/**
 * @internal
 */
export class AutoSize extends Component<IAutoSizeProps> {
    public state = {
        width: 0,
        height: 0,
    };

    private updateSize = () => {
        const { width, height } = elementRegion(this.wrapperRef.current);

        this.setState({
            width,
            height,
        });
    };

    private throttledUpdateSize = throttle(this.updateSize, 250, { leading: false });
    private wrapperRef = createRef<HTMLDivElement>();

    public render() {
        const { children } = this.props;
        const { width, height } = this.state;
        return (
            <div ref={this.wrapperRef} style={{ height: "100%", width: "100%" }}>
                {children({ width, height })}
            </div>
        );
    }

    public componentDidMount(): void {
        window.addEventListener("resize", this.throttledUpdateSize);
        this.throttledUpdateSize();
    }

    public componentWillUnmount(): void {
        this.throttledUpdateSize.cancel();
        window.removeEventListener("resize", this.throttledUpdateSize);
    }
}
