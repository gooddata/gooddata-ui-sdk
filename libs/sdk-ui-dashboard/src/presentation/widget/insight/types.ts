// (C) 2020-2022 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette, IInsight, IInsightWidget, ISeparators } from "@gooddata/sdk-model";
import {
    ExplicitDrill,
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
    OnDrillDownSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToInsightSuccess,
    OnWidgetDrill,
} from "../../drill/types.js";

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
}

/**
 * Insight body props.
 *
 * @alpha
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
        separators?: ISeparators;
        forceDisableDrillOnAxes?: boolean;
        isExportMode?: boolean;
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
    ErrorComponent: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the insight is loading.
     */
    LoadingComponent: React.ComponentType<ILoadingProps>;

    /**
     * The current user settings.
     */
    settings: IUserWorkspaceSettings | undefined;
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
 * @alpha
 */
export type CustomInsightBodyComponent = ComponentType<IInsightBodyProps>;
