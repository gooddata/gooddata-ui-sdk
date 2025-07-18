// (C) 2007-2025 GoodData Corporation
import { ReactNode, useRef, useState, useEffect } from "react";
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
    children?: ReactNode;
}

function ScreenshotReadyWrapper({
    resolver,
    interval = 200,
    className = "",
    children,
}: IScreenshotReadyWrapperProps) {
    const [ready, setReady] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<any>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const onTimeTick = () => {
        const element = componentRef.current;
        if (element) {
            const result = resolver(element);

            if (result) {
                clearTimer();
                setReady(true);
            }
        }
    };

    useEffect(() => {
        if (componentRef.current) {
            timerRef.current = setInterval(onTimeTick, interval);
        }

        return () => {
            clearTimer();
        };
    }, [resolver, interval]);

    const getStatusClassName = () => {
        return ready ? ScreenshotReadyWrapper.OnReadyClassName : ScreenshotReadyWrapper.RenderingClassName;
    };

    const statusClassName = getStatusClassName();

    return (
        <div ref={componentRef} className={`${statusClassName} ${className}`}>
            {children}
        </div>
    );
}

ScreenshotReadyWrapper.OnReadyClassName = "screenshot-ready-wrapper-done";
ScreenshotReadyWrapper.RenderingClassName = "screenshot-ready-wrapper-processing";

export { ScreenshotReadyWrapper };

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

/**
 * This is a specialized element count selector, which returns number of repeater table that are already
 * loaded == the s-loading indicator is no longer present.
 */
function loadedRepeaterSelector(element: HTMLElement): number {
    const tables = element.querySelectorAll<HTMLElement>(".s-repeater");

    return sumBy(tables, (table) => (table.getElementsByClassName("s-loading").length === 0 ? 1 : 0));
}

const DefaultSelectors = [
    "highcharts-container",
    "s-headline-value",
    "s-error",
    loadedPivotTableSelector,
    loadedRepeaterSelector,
];

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
