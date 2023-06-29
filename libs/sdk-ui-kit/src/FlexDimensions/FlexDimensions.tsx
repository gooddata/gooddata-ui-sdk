// (C) 2007-2020 GoodData Corporation
import React, { Component, createRef, ReactNode, RefObject } from "react";
import cx from "classnames";
import throttle from "lodash/throttle.js";
import pickBy from "lodash/pickBy.js";

import { elementRegion } from "../utils/domUtilities.js";

import { IFlexDimensionsProps, IFlexDimensionsState } from "./typings.js";

/**
 * @internal
 */
export class FlexDimensions extends Component<IFlexDimensionsProps, IFlexDimensionsState> {
    static defaultProps = {
        children: false,
        className: "",
        measureWidth: true,
        measureHeight: true,
    };
    private wrapperRef: RefObject<HTMLDivElement> = createRef();
    private readonly throttledUpdateSize: ReturnType<typeof throttle>;

    constructor(props: IFlexDimensionsProps) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
        };

        this.throttledUpdateSize = throttle(this.updateSize, 250, { leading: false });
    }

    componentDidMount(): void {
        window.addEventListener("resize", this.throttledUpdateSize);
        this.throttledUpdateSize();
    }

    componentWillUnmount(): void {
        this.throttledUpdateSize.cancel();
        window.removeEventListener("resize", this.throttledUpdateSize);
    }

    getChildrenDimensions(): Partial<IFlexDimensionsState> {
        return pickBy(this.state, (_, key) => {
            const setWidth = this.props.measureWidth && key === "width";
            const setHeight = this.props.measureHeight && key === "height";

            return setWidth || setHeight;
        });
    }

    updateSize = (): void => {
        const { width, height } = elementRegion(this.wrapperRef.current);

        this.setState({
            width,
            height,
        });
    };

    renderChildren(): ReactNode {
        const child = React.Children.only(this.props.children);

        return React.cloneElement(child as React.ReactElement<unknown>, this.getChildrenDimensions());
    }

    render(): ReactNode {
        const classNames = cx(this.props.className);

        return (
            <div ref={this.wrapperRef} className={classNames}>
                {this.renderChildren()}
            </div>
        );
    }
}
