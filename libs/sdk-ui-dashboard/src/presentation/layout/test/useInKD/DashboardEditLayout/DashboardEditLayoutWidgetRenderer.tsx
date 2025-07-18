// (C) 2007-2025 GoodData Corporation
import cx from "classnames";
import { useRef } from "react";

import {
    getDashboardLayoutItemHeightForRatioAndScreen,
    IDashboardLayoutWidgetRenderProps,
} from "../../../DefaultDashboardLayoutRenderer/index.js";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";
import { DashboardEditLayoutWidget } from "./DashboardEditLayoutWidget.js";

type IDashboardEditLayoutWidgetRendererOwnProps =
    IDashboardLayoutWidgetRenderProps<IDashboardEditLayoutContent>;

export type IDashboardEditLayoutWidgetRendererProps = IDashboardEditLayoutWidgetRendererOwnProps;

export function RenderDashboardEditLayoutWidgetRenderer(props: IDashboardEditLayoutWidgetRendererProps) {
    const contentRef = useRef<HTMLDivElement | null>(null);

    const { screen, item, DefaultWidgetRenderer } = props;

    const { isEnableKDWidgetCustomHeight } = {
        isEnableKDWidgetCustomHeight: false,
    };
    const widget = item.widget();
    const currentSize = item.sizeForScreen(screen)!;

    const { heightAsRatio = 100, gridHeight = 12 } = currentSize;

    const isLastInSection = item.isLast();
    const isLastSection = item.section().isLast();
    const isLast = isLastSection && isLastInSection;
    const classNames = cx({
        last: widget?.type === "widget" ? isLast : false,
        "custom-height": isEnableKDWidgetCustomHeight,
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
