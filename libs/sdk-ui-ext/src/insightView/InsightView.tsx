// (C) 2019 GoodData Corporation
import * as React from "react";
import * as uuid from "uuid";
import { render } from "react-dom";
import noop = require("lodash/noop");

import { IAnalyticalBackend, IAnalyticalWorkspace, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IInsight, IFilter, insightProperties, IColorPalette, idRef } from "@gooddata/sdk-model";

import { IVisualization, IVisProps, IVisCallbacks, DefaultVisualizationCatalog } from "../internal";
import { ExecutionFactoryWithPresetFilters } from "./ExecutionFactoryWithPresetFilters";
import {
    GoodDataSdkError,
    fillMissingTitles,
    DefaultLocale,
    ILocale,
    withContexts,
    LoadingComponent,
    ILoadingProps,
    ErrorComponent,
    IErrorProps,
} from "@gooddata/sdk-ui";

/**
 * @public
 */
export interface IInsightViewProps extends Partial<IVisCallbacks> {
    backend?: IAnalyticalBackend;
    workspace?: string;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    filters?: IFilter[];
    id: string;
    locale?: ILocale;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    visualizationProps?: IVisProps;
}

interface IInsightViewState {
    isLoading: boolean;
    error: GoodDataSdkError | undefined;
}

const getElementId = () => `gd-vis-${uuid.v4()}`;

class RenderInsightView extends React.Component<IInsightViewProps, IInsightViewState> {
    private elementId = getElementId();
    private visualization: IVisualization | undefined;
    private insight: IInsight | undefined;
    private colorPalette: IColorPalette | undefined;
    private settings: IWorkspaceSettings | undefined;

    public static defaultProps: Partial<IInsightViewProps> = {
        ErrorComponent,
        filters: [],
        locale: DefaultLocale,
        LoadingComponent,
        pushData: noop,
    };

    public state: IInsightViewState = {
        isLoading: false,
        error: undefined,
    };

    private startLoading = () => {
        this.setIsLoading(true);
        this.setError(undefined);
    };

    private stopLoading = () => {
        this.setIsLoading(false);
    };

    private setIsLoading = (isLoading: boolean) => {
        if (this.state.isLoading !== isLoading) {
            this.setState({ isLoading });
        }
    };

    private setError = (error: GoodDataSdkError | undefined) => {
        if (this.state.error !== error) {
            this.setState({ error });
        }
    };

    private unmountVisualization = () => {
        if (this.visualization) {
            this.visualization.unmount();
        }
        this.visualization = undefined;
    };

    private updateVisualization = () => {
        if (!this.visualization) {
            return;
        }

        this.visualization.update(
            {
                ...this.props.visualizationProps,
                config: {
                    ...(this.props.visualizationProps && this.props.visualizationProps.config),
                    colorPalette: this.colorPalette,
                },
            },
            fillMissingTitles(this.insight, this.props.locale),
            this.getExecutionFactory(),
        );
    };

    private setupVisualization = async () => {
        this.startLoading();

        // the visualization we may have from earlier is no longer valid -> get rid of it
        this.unmountVisualization();

        this.insight = await this.getInsight();

        if (!this.insight) {
            return;
        }

        const visualizationFactory = DefaultVisualizationCatalog.forInsight(this.insight);

        this.visualization = visualizationFactory({
            backend: this.props.backend,
            callbacks: {
                onError: error => {
                    this.setError(error);
                    if (this.props.onError) {
                        this.props.onError(error);
                    }
                },
                onLoadingChanged: ({ isLoading }) => {
                    if (isLoading) {
                        this.startLoading();
                    } else {
                        this.stopLoading();
                    }

                    if (this.props.onLoadingChanged) {
                        this.props.onLoadingChanged({ isLoading });
                    }
                },
                pushData: this.props.pushData,
                onDrill: this.props.onDrill,
                onExportReady: this.props.onExportReady,
            },
            configPanelElement: ".gd-configuration-panel-content", // this is apparently a well-know constant (see BaseVisualization)
            element: `#${this.elementId}`,
            environment: "dashboards", // TODO get rid of this
            locale: this.props.visualizationProps ? this.props.visualizationProps.locale : undefined,
            projectId: this.props.workspace,
            visualizationProperties: insightProperties(this.insight),
            featureFlags: this.settings,
            renderFun: render,
        });
    };

    private getRemoteResource = async <T extends {}>(
        resourceObtainer: (workspace: IAnalyticalWorkspace) => Promise<T>,
    ) => {
        try {
            return await resourceObtainer(this.props.backend.workspace(this.props.workspace));
        } catch (e) {
            this.setError(new GoodDataSdkError(e.message, e));
            this.stopLoading();
            return undefined;
        }
    };

    private getInsight = () => {
        return this.getRemoteResource<IInsight>(workspace =>
            workspace.metadata().getInsight(idRef(this.props.id)),
        );
    };

    private getColorPaletteFromProject = () => {
        return this.getRemoteResource<IColorPalette>(workspace => workspace.styling().colorPalette());
    };

    private getWorkspaceSettings = () => {
        return this.getRemoteResource<IWorkspaceSettings>(workspace => workspace.settings().query());
    };

    private updateWorkspaceSettings = async () => {
        this.settings = await this.getWorkspaceSettings();
    };

    private updateColorPalette = async () => {
        if (
            this.props.visualizationProps &&
            this.props.visualizationProps.config &&
            this.props.visualizationProps.config.colorPalette
        ) {
            this.colorPalette = this.props.visualizationProps.config.colorPalette;
            return;
        }

        this.colorPalette = await this.getColorPaletteFromProject();
    };

    private getExecutionFactory = () => {
        return new ExecutionFactoryWithPresetFilters(
            this.props.backend.workspace(this.props.workspace).execution(),
            this.props.filters,
        );
    };

    private componentDidMountInner = async () => {
        await this.setupVisualization();
        await this.updateColorPalette();
        await this.updateWorkspaceSettings();

        return this.updateVisualization();
    };

    public componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IInsightViewProps) => {
        const needsNewSetup = this.props.id !== prevProps.id || this.props.workspace !== prevProps.workspace;
        if (needsNewSetup) {
            await this.setupVisualization();
        }

        const needsNewColorPalette = this.props.workspace !== prevProps.workspace;
        if (needsNewColorPalette) {
            await this.updateColorPalette();
        }

        return this.updateVisualization();
    };

    public componentDidUpdate(prevProps: IInsightViewProps): void {
        this.componentDidUpdateInner(prevProps);
    }

    public componentWillUnmount() {
        this.unmountVisualization();
    }

    public render(): React.ReactNode {
        const { ErrorComponent, LoadingComponent } = this.props;
        return (
            <>
                {this.state.isLoading && <LoadingComponent />}
                {this.state.error && <ErrorComponent message={this.state.error.message} />}
                <div className="visualization-uri-root" id={this.elementId} />
            </>
        );
    }
}

/**
 * @public
 */
export const InsightView = withContexts(RenderInsightView);
