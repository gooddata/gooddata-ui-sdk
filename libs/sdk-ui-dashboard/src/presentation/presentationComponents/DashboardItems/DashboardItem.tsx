// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ScreenSize } from "@gooddata/sdk-model";
import { CommonExportDataAttributes } from "../../export/index.js";
import { useId } from "@gooddata/sdk-ui-kit";
interface IDashboardItemProps extends React.HTMLAttributes<HTMLDivElement> {
    screen: ScreenSize;
    description?: string;
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

const HiddenDescription = ({ children, id }: { children: React.ReactNode; id: string }) => (
    <span
        id={id}
        style={{
            border: 0,
            clip: "rect(0 0 0 0)",
            height: "1px",
            margin: "-1px",
            overflow: "hidden",
            padding: 0,
            position: "absolute",
            width: "1px",
            whiteSpace: "nowrap",
        }}
    >
        {children}
    </span>
);

export const DashboardItem: React.FC<IDashboardItemProps> = React.forwardRef(
    ({ className, screen, description, exportData, ...props }, ref) => {
        const id = useId();
        const itemFigureId = `dashboard-item-${id}`;
        return (
            <figure
                {...props}
                {...exportData}
                className={cx(
                    className,
                    "highcharts-description",
                    "dash-item",
                    "s-dash-item",
                    screenClasses[screen],
                )}
                tabIndex={0}
                ref={ref}
                role="figure"
                aria-describedby={description ? itemFigureId : undefined}
            >
                {description ? <HiddenDescription id={itemFigureId}>{description}</HiddenDescription> : null}
                {props.children}
            </figure>
        );
    },
);

DashboardItem.displayName = "DashboardItem";
