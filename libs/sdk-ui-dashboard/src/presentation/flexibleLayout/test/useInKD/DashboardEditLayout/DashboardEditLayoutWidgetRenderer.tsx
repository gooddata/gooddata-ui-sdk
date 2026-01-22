// (C) 2007-2026 GoodData Corporation

import { useRef } from "react";

import cx from "classnames";

import { type IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";
import { DashboardEditLayoutWidget } from "./DashboardEditLayoutWidget.js";
import { type IDashboardLayoutWidgetRenderProps } from "../../../DefaultDashboardLayoutRenderer/interfaces.js";
import { getDashboardLayoutItemHeightForRatioAndScreen } from "../../../DefaultDashboardLayoutRenderer/utils/sizing.js";

type IDashboardEditLayoutWidgetRendererOwnProps =
    IDashboardLayoutWidgetRenderProps<IDashboardEditLayoutContent>;

export type IDashboardEditLayoutWidgetRendererProps = IDashboardEditLayoutWidgetRendererOwnProps;

const screen = "xl"; // Todo: figure out what this was supposed to be?

export function RenderDashboardEditLayoutWidgetRenderer(props: IDashboardEditLayoutWidgetRendererProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    const { item, DefaultWidgetRenderer } = props;

    const widget = item.widget();
    const currentSize = item.sizeForScreen(screen)!;

    const { heightAsRatio = 100, gridHeight = 12 } = currentSize;

    const isLastSection = item.section().isLast();
    const isLast = isLastSection && item.isLastInSection();
    const classNames = cx({
        last: widget?.type === "widget" ? isLast : false,
    });

    let height: number | undefined;
    if (heightAsRatio) {
        height = getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen);
    } else if (gridHeight) {
        height = undefined;
    }

    return (
        <DefaultWidgetRenderer
            {...props}
            height={height}
            minHeight={20}
            allowOverflow={!!heightAsRatio}
            className={classNames}
            contentRef={contentRef}
        >
            <DashboardEditLayoutWidget contentRef={contentRef} item={item} screen={screen} />
        </DefaultWidgetRenderer>
    );
}

export const DashboardEditLayoutWidgetRenderer = RenderDashboardEditLayoutWidgetRenderer;
