// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ScreenSize } from "@gooddata/sdk-model";
import { CommonExportDataAttributes } from "../../export/index.js";
import { useId } from "@gooddata/sdk-ui-kit";
import { selectEnableFlexibleLayout, useDashboardSelector } from "../../../model/index.js";
interface IDashboardItemProps extends React.HTMLAttributes<HTMLDivElement> {
    screen: ScreenSize;
    description?: string;
    titleId?: string;
    ref?: React.Ref<HTMLDivElement>;
    exportData?: CommonExportDataAttributes;
}

// done like this instead of a template string so that the code is greppable for the individual classes
const screenClasses: { [S in ScreenSize]: string } = {
    xs: "layout-xs",
    sm: "layout-sm",
    md: "layout-md",
    lg: "layout-lg",
    xl: "layout-xl",
};

export const DashboardItem = React.forwardRef<HTMLDivElement, IDashboardItemProps>(
    ({ className, screen, description, exportData, titleId, ...props }, ref) => {
        const enableFlexibleLayout = useDashboardSelector(selectEnableFlexibleLayout);
        const id = useId();
        const itemFigureId = `dashboard-item-${id}`;
        return (
            <figure
                {...props}
                {...exportData}
                className={cx(
                    className,
                    "highcharts-description",
                    "s-dash-item",
                    "dash-item",
                    screenClasses[screen],
                    {
                        "dash-item-height": !enableFlexibleLayout,
                    },
                )}
                tabIndex={0}
                ref={ref}
                role="figure"
                aria-describedby={description ? itemFigureId : undefined}
                aria-labelledby={titleId ? titleId : undefined}
            >
                {description ? (
                    <span className={"sr-only"} id={itemFigureId}>
                        {description}
                    </span>
                ) : null}
                {props.children}
            </figure>
        );
    },
);

DashboardItem.displayName = "DashboardItem";
