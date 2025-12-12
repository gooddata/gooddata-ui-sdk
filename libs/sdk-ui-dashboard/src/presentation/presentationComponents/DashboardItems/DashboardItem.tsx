// (C) 2020-2025 GoodData Corporation

import { type HTMLAttributes, type Ref, forwardRef } from "react";

import cx from "classnames";

import { type ScreenSize } from "@gooddata/sdk-model";
import { useId } from "@gooddata/sdk-ui-kit";

import { type CommonExportDataAttributes } from "../../export/index.js";
interface IDashboardItemProps extends HTMLAttributes<HTMLDivElement> {
    screen: ScreenSize;
    description?: string;
    titleId?: string;
    ref?: Ref<HTMLDivElement>;
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

export const DashboardItem = forwardRef<HTMLDivElement, IDashboardItemProps>(
    ({ className, screen, description, exportData, titleId, ...props }, ref) => {
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
                )}
                ref={ref}
                role="figure"
                aria-describedby={description && exportData ? itemFigureId : undefined}
                aria-labelledby={titleId || undefined}
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
