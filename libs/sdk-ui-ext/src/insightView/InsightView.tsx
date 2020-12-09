// (C) 2019 GoodData Corporation
import React from "react";
import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IInsight, IColorPalette, idRef } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    ILocale,
    withContexts,
    DefaultLocale,
    LoadingComponent,
    ErrorComponent,
    IErrorDescriptors,
    IntlWrapper,
    newErrorMapping,
    isGoodDataSdkError,
    UnexpectedSdkError,
    OnLoadingChanged,
} from "@gooddata/sdk-ui";
import { IInsightViewDataLoader, getInsightViewDataLoader } from "./dataLoaders";
import { IInsightViewProps } from "./types";
import { InsightRenderer } from "./InsightRenderer";

interface IInsightViewState {
    isDataLoading: boolean;
    isVisualizationLoading: boolean;
    error: GoodDataSdkError | undefined;
    insight: IInsight | undefined;
    locale: ILocale | undefined;
    colorPalette: IColorPalette | undefined;
    settings: IUserWorkspaceSettings | undefined;
}

class InsightViewCore extends React.Component<IInsightViewProps & WrappedComponentProps, IInsightViewState> {
    private errorMap: IErrorDescriptors;

    public static defaultProps: Partial<IInsightViewProps & WrappedComponentProps> = {
        ErrorComponent,
        filters: [],
        drillableItems: [],
        LoadingComponent,
        pushData: noop,
    };

    constructor(props: IInsightViewProps & WrappedComponentProps) {
        super(props);

        this.errorMap = newErrorMapping(props.intl);

        this.state = {
            isDataLoading: false,
            isVisualizationLoading: false,
            error: undefined,
            insight: undefined,
            locale: DefaultLocale,
            colorPalette: undefined,
            settings: undefined,
        };
    }

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
        resourceObtainer: (loader: IInsightViewDataLoader) => Promise<T>,
    ) => {
        try {
            return await resourceObtainer(getInsightViewDataLoader(this.props.workspace));
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

        const insight = await this.getRemoteResource((loader) => loader.getInsight(this.props.backend, ref));

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
        return this.getRemoteResource((loader) => loader.getColorPalette(this.props.backend));
    };

    private getUserWorkspaceSettings = (): Promise<IUserWorkspaceSettings> => {
        return this.getRemoteResource((loader) => loader.getUserWorkspaceSettings(this.props.backend));
    };

    private getUserProfileLocale = (): Promise<ILocale> => {
        return this.getRemoteResource((loader) => loader.getLocale(this.props.backend)) as Promise<ILocale>;
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

        this.setState({ insight });
    };

    private updateLocale = async () => {
        if (this.props.locale) {
            return;
        }

        const locale = await this.getUserProfileLocale();

        if (!locale || locale === this.state.locale) {
            return;
        }

        this.setState({ locale });
    };

    private componentDidMountInner = async () => {
        this.startDataLoading();
        await Promise.all([
            this.updateColorPalette(),
            this.updateUserWorkspaceSettings(),
            this.updateInsight(),
            this.updateLocale(),
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

        if (needsNewSetup || needsNewColorPalette) {
            this.startDataLoading();
            await Promise.all(
                compact([
                    needsNewSetup && this.updateInsight(),
                    needsNewSetup && this.updateLocale(),
                    needsNewColorPalette && this.updateColorPalette(),
                ]),
            );
            this.stopDataLoading();
        }
    };

    public componentDidUpdate(prevProps: IInsightViewProps & WrappedComponentProps): void {
        const { intl } = this.props;

        this.componentDidUpdateInner(prevProps);

        if (!isEqual(prevProps.intl, intl)) {
            this.errorMap = newErrorMapping(intl);
        }
    }

    private handleLoadingChanged: OnLoadingChanged = ({ isLoading }): void => {
        this.setState({ isVisualizationLoading: isLoading });
        this.props.onLoadingChanged?.({ isLoading });
    };

    public render(): React.ReactNode {
        const { ErrorComponent, LoadingComponent } = this.props;
        const { error, isDataLoading, isVisualizationLoading } = this.state;
        const errorProps = this.errorMap[error ? error.getMessage() : undefined] ?? {
            message: error?.message,
        };

        return (
            <>
                {(isDataLoading || isVisualizationLoading) && <LoadingComponent />}
                {error && !isDataLoading && <ErrorComponent {...errorProps} />}
                <InsightRenderer
                    {...this.props}
                    colorPalette={this.props.colorPalette ?? this.state.colorPalette}
                    insight={this.state.insight}
                    locale={this.props.locale || this.state.locale || DefaultLocale}
                    settings={this.state.settings}
                    onLoadingChanged={this.handleLoadingChanged}
                />
            </>
        );
    }
}

export const IntlInsightView = withContexts(injectIntl(InsightViewCore));

/**
 * Renders insight which was previously created and saved in the Analytical Designer.
 *
 * @public
 */
export class InsightView extends React.Component<IInsightViewProps, IInsightViewState> {
    public render(): React.ReactNode {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlInsightView {...this.props} />
            </IntlWrapper>
        );
    }
}
