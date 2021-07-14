// (C) 2019 GoodData Corporation
import React from "react";
import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IInsight, IColorPalette, idRef, insightTitle } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    ILocale,
    withContexts,
    DefaultLocale,
    LoadingComponent as DefaultLoading,
    ErrorComponent as DefaultError,
    IntlWrapper,
    isGoodDataSdkError,
    UnexpectedSdkError,
    OnLoadingChanged,
    OnError,
} from "@gooddata/sdk-ui";
import { IInsightViewProps } from "./types";
import InsightTitle from "./InsightTitle";
import { InsightRenderer } from "./InsightRenderer";
import { InsightError } from "./InsightError";
import {
    colorPaletteDataLoaderFactory,
    insightDataLoaderFactory,
    userWorkspaceSettingsDataLoaderFactory,
} from "../dataLoaders";

interface IInsightViewState {
    isDataLoading: boolean;
    isVisualizationLoading: boolean;
    error: GoodDataSdkError | undefined;
    insight: IInsight | undefined;
    colorPalette: IColorPalette | undefined;
    settings: IUserWorkspaceSettings | undefined;
}

class InsightViewCore extends React.Component<IInsightViewProps & WrappedComponentProps, IInsightViewState> {
    public static defaultProps: Partial<IInsightViewProps & WrappedComponentProps> = {
        ErrorComponent: DefaultError,
        filters: [],
        drillableItems: [],
        LoadingComponent: DefaultLoading,
        TitleComponent: InsightTitle,
        pushData: noop,
    };

    state: IInsightViewState = {
        isDataLoading: false,
        isVisualizationLoading: false,
        error: undefined,
        insight: undefined,
        colorPalette: undefined,
        settings: undefined,
    };

    private startDataLoading = () => {
        this.setIsDataLoading(true);
        this.setError(undefined);
    };

    private stopDataLoading = () => {
        this.setIsDataLoading(false);
    };

    private setIsDataLoading = (isLoading: boolean) => {
        if (this.state.isDataLoading !== isLoading) {
            this.setState({ isDataLoading: isLoading });
        }
    };

    private setError = (error: GoodDataSdkError | undefined) => {
        if (this.state.error !== error) {
            this.setState({ error });
        }
    };

    private getRemoteResource = async <T extends any>(
        resourceObtainer: (backend: IAnalyticalBackend, workspace: string) => Promise<T>,
    ) => {
        try {
            return await resourceObtainer(this.props.backend, this.props.workspace);
        } catch (e) {
            if (isGoodDataSdkError(e)) {
                this.setError(e);
            } else {
                this.setError(new UnexpectedSdkError(e));
            }

            this.stopDataLoading();
            return undefined;
        }
    };

    private getInsight = async (): Promise<IInsight> => {
        const ref =
            typeof this.props.insight === "string"
                ? idRef(this.props.insight, "insight")
                : this.props.insight;

        const insight = await this.getRemoteResource((backend, workspace) =>
            insightDataLoaderFactory.forWorkspace(workspace).getInsight(backend, ref),
        );

        if (this.props.executeByReference) {
            /*
             * In execute-by-reference, filter merging happens on the server
             */
            return insight;
        }

        /*
         * In freeform execution, frontend is responsible for filter merging. Code defers the merging to the
         * implementation of analytical backend because the merging may first need to unify how the different
         * filter entities are referenced (id vs uri).
         */
        return this.props
            .backend!.workspace(this.props.workspace!)
            .insights()
            .getInsightWithAddedFilters(insight, this.props.filters ?? []);
    };

    private getColorPalette = (): Promise<IColorPalette> => {
        return this.getRemoteResource((backend, workspace) =>
            colorPaletteDataLoaderFactory.forWorkspace(workspace).getColorPalette(backend),
        );
    };

    private getUserWorkspaceSettings = (): Promise<IUserWorkspaceSettings> => {
        return this.getRemoteResource((backend, workspace) =>
            userWorkspaceSettingsDataLoaderFactory.forWorkspace(workspace).getUserWorkspaceSettings(backend),
        );
    };

    private updateUserWorkspaceSettings = async () => {
        const settings = await this.getUserWorkspaceSettings();

        if (!settings || isEqual(settings, this.state.settings)) {
            return;
        }

        this.setState({ settings });
    };

    private updateColorPalette = async () => {
        if (this.props.colorPalette) {
            return;
        }

        const colorPalette = await this.getColorPalette();

        if (!colorPalette || isEqual(colorPalette, this.state.colorPalette)) {
            return;
        }

        this.setState({ colorPalette });
    };

    private updateInsight = async () => {
        const insight = await this.getInsight();

        if (!insight || isEqual(insight, this.state.insight)) {
            return;
        }
        this.props.onInsightLoaded?.(insight);
        this.setState({ insight });
    };

    private componentDidMountInner = async () => {
        this.startDataLoading();
        await Promise.all([
            this.updateColorPalette(),
            this.updateUserWorkspaceSettings(),
            this.updateInsight(),
        ]);
        this.stopDataLoading();
    };

    public componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IInsightViewProps) => {
        const needsNewSetup =
            !isEqual(this.props.insight, prevProps.insight) ||
            !isEqual(this.props.filters, prevProps.filters) ||
            this.props.workspace !== prevProps.workspace;

        const needsNewColorPalette = this.props.workspace !== prevProps.workspace;

        if (this.props.workspace !== prevProps.workspace) {
            // if workspace changed, clear the insight as it is definitely wrong
            // this prevents wrong renders with mismatching insight and workspace
            // (as workspace changes immediately, but insight change is async)
            this.setState({ insight: undefined });
        }

        if (needsNewSetup || needsNewColorPalette) {
            this.startDataLoading();
            await Promise.all(
                compact([
                    needsNewSetup && this.updateInsight(),
                    needsNewSetup && this.updateUserWorkspaceSettings(),
                    needsNewColorPalette && this.updateColorPalette(),
                ]),
            );
            this.stopDataLoading();
        }
    };

    public componentDidUpdate(prevProps: IInsightViewProps & WrappedComponentProps): void {
        this.componentDidUpdateInner(prevProps);
    }

    private handleLoadingChanged: OnLoadingChanged = ({ isLoading }): void => {
        this.setState({ isVisualizationLoading: isLoading });
        this.props.onLoadingChanged?.({ isLoading });
    };

    private handleError: OnError = (error): void => {
        this.setError(error);
        this.props.onError?.(error);
    };

    private resolveInsightTitle = (insight: IInsight | undefined): string | undefined => {
        switch (typeof this.props.showTitle) {
            case "string":
                return this.props.showTitle;
            case "boolean":
                return !this.state.isDataLoading && this.props.showTitle && insight
                    ? insightTitle(insight)
                    : undefined;
            case "function":
                return !this.state.isDataLoading && insight && this.props.showTitle(insight);
            default:
                return undefined;
        }
    };

    public render(): React.ReactNode {
        const { LoadingComponent, TitleComponent } = this.props;
        const { error, isDataLoading, isVisualizationLoading } = this.state;

        const resolvedTitle = this.resolveInsightTitle(this.state.insight);
        const isLoadingShown = isDataLoading || isVisualizationLoading;

        return (
            <div className="insight-view-container">
                {resolvedTitle && <TitleComponent title={resolvedTitle} />}
                {isLoadingShown && <LoadingComponent className="insight-view-loader" />}
                {error && !isDataLoading && (
                    <InsightError error={error} ErrorComponent={this.props.ErrorComponent} />
                )}
                <div
                    className="insight-view-visualization"
                    // make the visualization div 0 height so that the loading component can take up the whole area
                    style={isLoadingShown ? { height: 0 } : undefined}
                >
                    <InsightRenderer
                        insight={this.state.insight}
                        workspace={this.props.workspace}
                        backend={this.props.backend}
                        colorPalette={this.props.colorPalette ?? this.state.colorPalette}
                        config={this.props.config}
                        execConfig={this.props.execConfig}
                        drillableItems={this.props.drillableItems}
                        executeByReference={this.props.executeByReference}
                        filters={this.props.filters}
                        locale={
                            this.props.locale || (this.state.settings?.locale as ILocale) || DefaultLocale
                        }
                        settings={this.state.settings}
                        ErrorComponent={this.props.ErrorComponent}
                        LoadingComponent={this.props.LoadingComponent}
                        onDrill={this.props.onDrill}
                        onError={this.handleError}
                        onExportReady={this.props.onExportReady}
                        onLoadingChanged={this.handleLoadingChanged}
                        pushData={this.props.pushData}
                    />
                </div>
            </div>
        );
    }
}

export const IntlInsightView = withContexts(injectIntl(InsightViewCore));

/**
 * Renders insight which was previously created and saved in the Analytical Designer.
 *
 * @public
 */
export class InsightView extends React.Component<IInsightViewProps> {
    public render(): React.ReactNode {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlInsightView {...this.props} />
            </IntlWrapper>
        );
    }
}
