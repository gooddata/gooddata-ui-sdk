// (C) 2007-2019 GoodData Corporation
import React from "react";
import sumBy from "lodash/sumBy.js";

/**
 * Ready resolver function is called to determine whether the screenshot div has
 * all content ready ⇒ image can be captured.
 */
export type ReadyResolverFunction = (element: HTMLElement) => boolean;

export interface IScreenshotReadyWrapperProps {
    resolver: ReadyResolverFunction;
    interval?: number;
    className?: string;
    children?: React.ReactNode;
}

export interface IScreenshotReadyWrapperState {
    ready: boolean;
}

export class ScreenshotReadyWrapper extends React.Component<
    IScreenshotReadyWrapperProps,
    IScreenshotReadyWrapperState
> {
    public static OnReadyClassName = "screenshot-ready-wrapper-done";
    public static RenderingClassName = "screenshot-ready-wrapper-processing";

    public static defaultProps = {
        interval: 200,
    };

    private timer: any = null;
    private componentRef: any = null;

    constructor(props: IScreenshotReadyWrapperProps) {
        super(props);

        this.state = { ready: false };
        this.componentRef = React.createRef();
    }

    public componentDidMount() {
        if (this.componentRef) {
            this.timer = setInterval(this.onTimeTick, this.props.interval);
        }
    }

    public componentWillUnmount() {
        this.clearTimer();
    }

    public render() {
        const statusClassName = this.getStatusClassName();
        const { className = "" } = this.props;

        return (
            <div ref={this.componentRef} className={`${statusClassName} ${className}`}>
                {this.props.children}
            </div>
        );
    }

    public onTimeTick = () => {
        const element = this.componentRef.current;
        const result = this.props.resolver(element);

        if (result) {
            this.clearTimer();
            this.setState({ ready: true });
        }
    };

    private clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private getStatusClassName() {
        return this.state.ready
            ? ScreenshotReadyWrapper.OnReadyClassName
            : ScreenshotReadyWrapper.RenderingClassName;
    }
}

//
// Different ready selector implementations
//

export function createHighChartResolver(numOfCharts: number) {
    return (element: HTMLElement) => {
        return element.getElementsByClassName("highcharts-container").length === numOfCharts;
    };
}

export type ElementCountSelectorFun = (element: HTMLElement) => number;
export type ElementCountSelector = string | ElementCountSelectorFun;

/**
 * This is a specialized element count selector, which returns number of pivot tables that are already
 * loaded == the s-loading indicator is no longer present.
 */
function loadedPivotTableSelector(element: HTMLElement): number {
    const tables = element.querySelectorAll<HTMLElement>(".s-pivot-table");

    return sumBy(tables, (table) => (table.getElementsByClassName("s-loading").length === 0 ? 1 : 0));
}

const DefaultSelectors = ["highcharts-container", "s-headline-value", "s-error", loadedPivotTableSelector];

/**
 * Creates resolver which returns true if specified element contains at least `numOfElements` number of elements
 * that match the provided element count selectors. These selectors can be of two types:
 *
 * -  string: this is then used as input to getElementsByClassName
 * -  function (HTMLElement) ⇒ number: this will be called to obtain element count using whatever intricate way
 *    is needed
 *
 * @param numOfElements - number of elements that must be found before
 * @param selectors - list of classes; default is list of usual suspects that we use (pivot, highcharts, headline)
 */
export function createElementCountResolver(
    numOfElements: number,
    selectors: ElementCountSelector[] = DefaultSelectors,
) {
    return (element: HTMLElement) => {
        const totalCount = sumBy(selectors, (selector) => {
            if (typeof selector === "string") {
                return element.getElementsByClassName(selector).length;
            }

            return selector(element);
        });

        return totalCount >= numOfElements;
    };
}

/**
 * Composes multiple resolvers using AND operand == all resolvers must match.
 *
 * @param resolvers - resolvers to compose from
 */
export function andResolver(...resolvers: ReadyResolverFunction[]): ReadyResolverFunction {
    return (element: HTMLElement) => {
        return resolvers.every((resolver) => resolver(element));
    };
}
