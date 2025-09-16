// (C) 2020-2025 GoodData Corporation

import { ComponentType } from "react";

import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    IExecutionConfig,
    IFilter,
    IInsight,
    IInsightWidget,
    ISeparators,
} from "@gooddata/sdk-model";
import {
    ExplicitDrill,
    IDrillEventIntersectionElement,
    IErrorProps,
    ILoadingProps,
    ILocale,
    IPushData,
    IVisualizationCallbacks,
    OnError,
    OnExportReady,
    OnLoadingChanged,
} from "@gooddata/sdk-ui";

import {
    DrillStep,
    OnDrillDownSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToInsightSuccess,
    OnWidgetDrill,
} from "../../drill/types.js";
import { WidgetExportDataAttributes } from "../../export/index.js";

///
/// Component props
///

/**
 * Insight widget props.
 *
 * @remarks
 * IMPORTANT: this interface is marked as public but not all properties in it are suitable for public consumption
 * yet. Please heed the per-property API maturity annotations; the alpha level APIs may change in a breaking way
 * in the next release.
 *
 * @public
 */
export interface IDashboardInsightProps {
    /**
     * Backend to work with.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     *
     * @alpha
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the Insight widget exists.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     *
     * @alpha
     */
    workspace?: string;

    /**
     * Definition of insight widget to render.
     *
     * @public
     */
    widget: IInsightWidget;

    /**
     * An insight to render.
     *
     * @remarks
     * Note: the insight object provided here represents the insight as it is stored on the backend. It does
     * not reflect dashboard filters that should be applied when computing data for this insight.
     *
     * Use the `useWidgetFilters()` to obtain filters to use on this insight. Use those filters to replace
     * all insight filters using `insightSetFilters()` function available in `@gooddata/sdk-model`.
     *
     * @public
     */
    insight: IInsight;

    /**
     * Error component to use when insight rendering fails for any reason.
     *
     * @alpha
     */
    ErrorComponent: ComponentType<IErrorProps>;

    /**
     * Loading component to use while loading and preparing data to render.
     *
     * @alpha
     */
    LoadingComponent: ComponentType<ILoadingProps>;

    /**
     * @alpha
     */
    clientHeight?: number;

    /**
     * @alpha
     */
    clientWidth?: number;

    /**
     * @alpha
     */
    onDrill?: OnWidgetDrill;

    /**
     * @alpha
     */
    onDrillDown?: OnDrillDownSuccess;

    /**
     * @alpha
     */
    onDrillToInsight?: OnDrillToInsightSuccess;

    /**
     * @alpha
     */
    onDrillToDashboard?: OnDrillToDashboardSuccess;

    /**
     * @alpha
     */
    onDrillToAttributeUrl?: OnDrillToAttributeUrlSuccess;

    /**
     * @alpha
     */
    onDrillToCustomUrl?: OnDrillToCustomUrlSuccess;

    /**
     * @internal
     */
    onWidgetFiltersReady?: (filters?: IFilter[]) => void;

    /**
     * @alpha
     */
    onError?: OnError;

    /**
     * @alpha
     */
    onLoadingChanged?: OnLoadingChanged;

    /**
     * @alpha
     */
    onExportReady?: OnExportReady;

    /**
     * @internal
     */
    pushData?: (data: IPushData) => void;

    /**
     * @alpha
     */
    exportData?: WidgetExportDataAttributes;

    /**
     * @internal
     */
    afterRender?: () => void;

    /**
     * @internal
     */
    minimalHeight?: number;

    /**
     * @internal
     */
    minimalWidth?: number;

    /**
     * This property contains current drill step context.
     *
     * It is undefined if rendered insight is placed directly in the dashboard.
     * It is defined when the insight is rendered in a drill dialog.
     */
    drillStep?: DrillStep;

    /**
     * @internal
     */
    isWidgetAsTable?: boolean;
}

/**
 * Insight body props.
 *
 * @public
 */
export interface IInsightBodyProps extends Partial<IVisualizationCallbacks> {
    /**
     * Backend to work with.
     */
    backend: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     */
    workspace: string;

    /**
     * The insight to render.
     */
    insight: IInsight;

    /**
     * Definition of insight widget to render.
     */
    widget: IInsightWidget;

    /**
     * Configure chart drillability; e.g. which parts of the charts can be clicked.
     */
    drillableItems: ExplicitDrill[] | undefined;

    /**
     * Configure color palette to use for the chart. If you do not specify this, then the palette will be
     * obtained from style settings stored on the backend.
     */
    colorPalette: IColorPalette | undefined;

    /**
     * Additional config that should be passed to the underlying visualization.
     */
    config: {
        mapboxToken?: string;
        agGridToken?: string;
        separators?: ISeparators;
        forceDisableDrillOnAxes?: boolean;
        isExportMode?: boolean;
        selectedPoints?: IDrillEventIntersectionElement[][];
    };

    /**
     * Locale to use for localization of texts appearing in the chart.
     *
     * Note: text values coming from the data itself are not localized.
     */
    locale: ILocale;

    /**
     * Component to render if embedding fails.
     */
    ErrorComponent: ComponentType<IErrorProps>;

    /**
     * Component to render while the insight is loading.
     */
    LoadingComponent: ComponentType<ILoadingProps>;

    /**
     * The current user settings.
     */
    settings: IUserWorkspaceSettings | undefined;

    /**
     * Contains configuration that should be part of insight execution
     */
    execConfig?: IExecutionConfig;

    /**
     * This property contains current drill step context.
     *
     * It is undefined if rendered insight is placed directly in the dashboard.
     * It is defined when the insight is rendered in a drill dialog.
     */
    drillStep?: DrillStep;
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardInsightComponent = ComponentType<IDashboardInsightProps>;

/**
 * @remarks
 * When implementing this using GoodData-provided components, make sure that you pass as many of the props
 * as possible to the component (especially the drill-related props and members of the {@link @gooddata/sdk-ui#IVisualizationCallbacks}).
 * This will ensure the integration with the rest of the widget is as complete as possible.
 *
 * @public
 */
export type CustomInsightBodyComponent = ComponentType<IInsightBodyProps>;
