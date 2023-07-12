// (C) 2019-2022 GoodData Corporation

import {
    IFluidLayoutColSize,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSize,
    IVisualization,
    IVisualizationClassWrapped,
    Layout,
    isFluidLayout,
    isLayoutWidget,
    isObjectUriQualifier,
    isVisualization,
} from "@gooddata/api-model-bear";
import {
    uriRef,
    idRef,
    UriRef,
    areObjRefsEqual,
    IWidget,
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
    ScreenSize,
} from "@gooddata/sdk-model";
import { BearDashboardDependency } from "./types.js";

// Default layout column size for the kpi widget, when generating implicit layout
const KPI_SIZE = 2;
// Default layout column size for the visualization widget, when generating implicit layout
const VISUALIZATION_SIZE = 12;

/**
 * @internal
 */
export const convertLayoutSize = (size: IFluidLayoutSize): IDashboardLayoutSize => {
    const converted: IDashboardLayoutSize = {
        gridWidth: size.width,
    };

    if (size.height) {
        converted.gridHeight = size.height;
    }

    if (size.heightAsRatio) {
        converted.heightAsRatio = size.heightAsRatio;
    }

    return converted;
};

/**
 * @internal
 */
export const convertLayoutItemSize = (column: IFluidLayoutColSize): IDashboardLayoutSizeByScreenSize => {
    const allScreens: ScreenSize[] = ["xl", "md", "lg", "sm", "xs"];

    return allScreens.reduce((acc: IDashboardLayoutSizeByScreenSize, el) => {
        const size = column[el];
        if (size) {
            acc[el] = convertLayoutSize(size);
        }

        return acc;
    }, {} as IDashboardLayoutSizeByScreenSize);
};

const convertLayoutItem = (
    column: IFluidLayoutColumn,
    widgetDependencies: IWidget[],
): IDashboardLayoutItem => {
    const { content } = column;
    if (isLayoutWidget(content)) {
        const widget = widgetDependencies.find((dep) => {
            const { qualifier } = content.widget;
            if (isObjectUriQualifier(qualifier)) {
                return areObjRefsEqual(uriRef(qualifier.uri), dep.ref);
            }

            return areObjRefsEqual(idRef(qualifier.identifier), dep.ref);
        }) as IWidget;

        return {
            type: "IDashboardLayoutItem",
            size: convertLayoutItemSize(column.size),
            widget,
        };
    } else if (isFluidLayout(content)) {
        return {
            type: "IDashboardLayoutItem",
            widget: convertLayout(content, widgetDependencies),
            size: convertLayoutItemSize(column.size),
        };
    }

    return {
        type: "IDashboardLayoutItem",
        size: convertLayoutItemSize(column.size),
    };
};

const convertLayoutSection = (
    row: IFluidLayoutRow,
    widgetDependencies: IWidget[],
): IDashboardLayoutSection => {
    const section: IDashboardLayoutSection = {
        type: "IDashboardLayoutSection",
        items: row.columns.map((column) => convertLayoutItem(column, widgetDependencies)),
    };
    if (row.header) {
        section.header = row.header;
    }
    return section;
};

/**
 * @internal
 */
export const convertLayout = (layout: Layout, widgetDependencies: IWidget[]): IDashboardLayout => {
    const {
        fluidLayout: { rows },
        fluidLayout,
    } = layout;
    const convertedLayout: IDashboardLayout = {
        type: "IDashboardLayout",
        sections: rows.map((row) => convertLayoutSection(row, widgetDependencies)),
    };
    if (fluidLayout.size) {
        convertedLayout.size = convertLayoutSize(fluidLayout.size);
    }

    return convertedLayout;
};

/**
 * Create {@link ILegacyDashboardLayout} from {@link IWidget} items. As widgets do not contain any layout information,
 * implicit layout with a single row will be generated.
 *
 * @returns fluid layout created from the widgets
 */
export function createImplicitDashboardLayout(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: IVisualizationClassWrapped[],
): IDashboardLayout | undefined {
    if (widgets.length < 1) {
        return undefined;
    }
    const sections = createLayoutSections(widgets, dependencies, visualizationClasses);

    return {
        type: "IDashboardLayout",
        sections,
    };
}

function createLayoutSections(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: IVisualizationClassWrapped[],
): IDashboardLayoutSection[] {
    return [
        {
            type: "IDashboardLayoutSection",
            items: createLayoutItems(widgets, dependencies, visualizationClasses),
        },
    ];
}

function createLayoutItems(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: IVisualizationClassWrapped[],
): IDashboardLayoutItem[] {
    return widgets.map((widget) => createLayoutItem(widget, dependencies, visualizationClasses));
}

function createLayoutItem(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: IVisualizationClassWrapped[],
): IDashboardLayoutItem {
    return {
        type: "IDashboardLayoutItem",
        widget,
        size: {
            xl: {
                gridWidth: implicitWidgetWidth(widget, dependencies, visualizationClasses),
            },
        },
    };
}

function implicitWidgetWidth(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: IVisualizationClassWrapped[],
) {
    if (widget.type === "kpi") {
        return KPI_SIZE;
    }

    const visualizationUri = (widget.insight as UriRef).uri;
    const vis = dependencies.find(
        (v) => isVisualization(v) && v.visualizationObject.meta.uri === visualizationUri,
    ) as IVisualization;
    const visualizationClassUri = vis.visualizationObject.content.visualizationClass.uri;
    const visualizationClass = visualizationClasses.find(
        (visClass) => visClass.visualizationClass.meta.uri === visualizationClassUri,
    );
    return implicitInsightWidth(visualizationClass!);
}

function implicitInsightWidth(visualizationClass: IVisualizationClassWrapped) {
    const visualizationType = visualizationClass.visualizationClass.content.url.split(":")[1];
    return visualizationType === "headline" ? KPI_SIZE : VISUALIZATION_SIZE;
}
