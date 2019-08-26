// (C) 2007-2019 GoodData Corporation
import * as React from "react";

export interface IScreenshotReadyWrapperProps {
    resolver: (element: Element) => boolean;
    interval?: number;
}

export interface IScreenshotReadyWrapperState {
    ready: boolean;
}

export class ScreenshotReadyWrapper extends React.Component<
    IScreenshotReadyWrapperProps,
    IScreenshotReadyWrapperState
> {
    public static defaultProps = {
        interval: 200,
    };

    private timer: any = null;
    private componentRef: any = null;

    constructor(props: IScreenshotReadyWrapperProps) {
        super(props);

        this.state = { ready: false };
        this.componentRef = (React as any).createRef();
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
        const style = this.getReadyClass();
        return (
            <div ref={this.componentRef} className={style}>
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

    private getReadyClass() {
        return this.state.ready ? "screenshot-ready-wrapper-done" : "screenshot-ready-wrapper-processing";
    }
}

export function createHighChartResolver(numOfCharts: number) {
    return (element: HTMLElement) => {
        return element.getElementsByClassName("highcharts-container").length === numOfCharts;
    };
}

export function createTableResolver(numOfTables: number) {
    return (element: HTMLElement) => {
        return element.getElementsByClassName("viz-table-wrap").length === numOfTables;
    };
}
