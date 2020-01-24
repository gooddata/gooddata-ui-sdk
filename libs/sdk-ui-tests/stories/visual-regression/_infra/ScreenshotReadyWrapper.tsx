// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import sum = require("lodash/sum");

export interface IScreenshotReadyWrapperProps {
    resolver: (element: HTMLElement) => boolean;
    interval?: number;
    className?: string;
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

type ReadyResolverFunction = (element: HTMLElement) => boolean;

export function createHighChartResolver(numOfCharts: number) {
    return (element: HTMLElement) => {
        return element.getElementsByClassName("highcharts-container").length === numOfCharts;
    };
}

const ClassNames = ["s-pivot-table s-loading-done", "highcharts-container", "s-headline-value"];

/**
 * Creates resolver which returns true if specified element contains at least `numOfElements` number of elements
 * that have _any_ of the classes in the provided list of classes. Each string of the list will be
 * used to call getElementsByClassName, sum of found elements >= than `numOfElements` means a match.
 *
 * @param numOfElements - number of elements that must be found before
 * @param classNames - list of classes; default is list of usual suspects that we use (pivot, highcharts, headline)
 */
export function createAnyMatchResolver(numOfElements: number, classNames: string[] = ClassNames) {
    return (element: HTMLElement) => {
        const totalCount = sum(classNames.map(selector => element.getElementsByClassName(selector).length));

        return totalCount >= numOfElements;
    };
}

export function andResolver(...resolvers: ReadyResolverFunction[]): ReadyResolverFunction {
    return (element: HTMLElement) => {
        return resolvers.every(resolver => resolver(element));
    };
}
