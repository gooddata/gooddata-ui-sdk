// (C) 2020 GoodData Corporation
import React from "react";
import uuid from "uuid";
import { render } from "react-dom";
import noop from "lodash/noop";
import isEqual from "lodash/isEqual";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IExecutionFactory, IExportResult, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IInsightDefinition, insightProperties, IColorPalette, insightTitle } from "@gooddata/sdk-model";

import { IVisualization, IVisProps } from "../internal/interfaces/Visualization";
import { FullVisualizationCatalog } from "../internal/components/VisualizationCatalog";
import {
    GoodDataSdkError,
    fillMissingTitles,
    ignoreTitlesForSimpleMeasures,
    ILocale,
    withContexts,
    DefaultLocale,
    LoadingComponent,
    ErrorComponent,
    IExportFunction,
    IExtendedExportConfig,
    IntlWrapper,
} from "@gooddata/sdk-ui";
import {
    ExecutionFactoryUpgradingToExecByReference,
    ExecutionFactoryWithFixedFilters,
} from "@gooddata/sdk-backend-base";
import { IInsightViewProps } from "./types";

/**
 * @internal
 */
export interface IInsightRendererProps extends Omit<IInsightViewProps, "insight"> {
    insight: IInsightDefinition | undefined;
    locale: ILocale;
    settings: IUserWorkspaceSettings | undefined;
    colorPalette: IColorPalette | undefined;
    onError?: (error: GoodDataSdkError | undefined) => void;
}

const getElementId = () => `gd-vis-${uuid.v4()}`;

const visualizationUriRootStyle = {
    height: "100%",
};

class InsightRendererCore extends React.Component<IInsightRendererProps & WrappedComponentProps> {
    private elementId = getElementId();
    private visualization: IVisualization | undefined;
    private containerRef = React.createRef<HTMLDivElement>();

    public static defaultProps: Partial<IInsightRendererProps & WrappedComponentProps> = {
        ErrorComponent,
        filters: [],
        drillableItems: [],
        LoadingComponent,
        pushData: noop,
        locale: DefaultLocale,
    };

    private unmountVisualization = () => {
        if (this.visualization) {
            this.visualization.unmount();
        }
        this.visualization = undefined;
    };

    private updateVisualization = () => {
        // if the container no longer exists, update was called after unmount -> do nothing
        if (!this.visualization || !this.containerRef.current) {
            return;
        }

        const { config = {} } = this.props;
        const { responsiveUiDateFormat } = this.props.settings ?? {};

        const visProps: IVisProps = {
            locale: this.props.locale,
            dateFormat: responsiveUiDateFormat,
            custom: {
                drillableItems: this.props.drillableItems,
            },
            config: {
                separators: config.separators,
                colorPalette: this.props.colorPalette,
                mapboxToken: config.mapboxToken,
                forceDisableDrillOnAxes: config.forceDisableDrillOnAxes,
                isInEditMode: false,
            },
            customVisualizationConfig: config,
        };

        this.visualization.update(
            visProps,
            ignoreTitlesForSimpleMeasures(fillMissingTitles(this.props.insight, this.props.locale)),
            {},
            this.getExecutionFactory(),
        );
    };

    private setupVisualization = async () => {
        if (!this.props.insight) {
            return;
        }

        this.props.onLoadingChanged?.({ isLoading: true });

        // the visualization we may have from earlier is no longer valid -> get rid of it
        this.unmountVisualization();

        const visualizationFactory = FullVisualizationCatalog.forInsight(this.props.insight);

        this.visualization = visualizationFactory({
            backend: this.props.backend,
            callbacks: {
                onError: (error) => {
                    this.props.onError?.(error);
                    this.props.onLoadingChanged?.({ isLoading: false });
                },
                onLoadingChanged: ({ isLoading }) => {
                    this.props.onLoadingChanged?.({ isLoading });
                },
                pushData: this.props.pushData,
                onDrill: this.props.onDrill,
                onExportReady: this.onExportReadyDecorator,
            },
            configPanelElement: ".gd-configuration-panel-content", // this is apparently a well-know constant (see BaseVisualization)
            element: `#${this.elementId}`,
            environment: "dashboards", // TODO get rid of this
            locale: this.props.locale,
            projectId: this.props.workspace,
            visualizationProperties: insightProperties(this.props.insight),
            featureFlags: this.props.settings,
            renderFun: render,
        });
    };

    private onExportReadyDecorator = (exportFunction: IExportFunction): void => {
        if (!this.props.onExportReady) {
            return;
        }

        const decorator = (exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
            if (exportConfig.title || !this.props.insight) {
                return exportFunction(exportConfig);
            }

            return exportFunction({
                ...exportConfig,
                title: insightTitle(this.props.insight),
            });
        };

        this.props.onExportReady(decorator);
    };

    private getExecutionFactory = (): IExecutionFactory => {
        const factory = this.props.backend.workspace(this.props.workspace).execution();

        if (this.props.executeByReference) {
            /*
             * When executing by reference, decorate the original execution factory so that it
             * transparently routes `forInsight` to `forInsightByRef` AND adds the filters
             * from InsightView props.
             *
             * Code will pass this factory over to the pluggable visualizations - they will do execution
             * `forInsight` and under the covers things will be routed and done differently without the
             * plug viz knowing.
             */
            return new ExecutionFactoryUpgradingToExecByReference(
                new ExecutionFactoryWithFixedFilters(factory, this.props.filters),
            );
        }

        return factory;
    };

    private componentDidMountInner = async () => {
        await this.setupVisualization();
        return this.updateVisualization();
    };

    public componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IInsightRendererProps) => {
        const needsNewSetup =
            !isEqual(this.props.insight, prevProps.insight) ||
            !isEqual(this.props.filters, prevProps.filters) ||
            this.props.workspace !== prevProps.workspace;

        if (needsNewSetup) {
            await this.setupVisualization();
        }

        return this.updateVisualization();
    };

    public componentDidUpdate(prevProps: IInsightRendererProps & WrappedComponentProps): void {
        this.componentDidUpdateInner(prevProps);
    }

    public componentWillUnmount() {
        this.unmountVisualization();
    }

    public render(): React.ReactNode {
        return (
            <div
                className="visualization-uri-root"
                id={this.elementId}
                ref={this.containerRef}
                style={visualizationUriRootStyle}
            />
        );
    }
}

export const IntlInsightRenderer = withContexts(injectIntl(InsightRendererCore));

/**
 * Renders insight passed as a parameter.
 *
 * @internal
 */
export class InsightRenderer extends React.Component<IInsightRendererProps> {
    public render(): React.ReactNode {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlInsightRenderer {...this.props} />
            </IntlWrapper>
        );
    }
}
