// (C) 2020-2023 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual.js";
import { injectIntl } from "react-intl";

import { IGeoChartInnerProps } from "./GeoChartInner.js";
import { isLocationSet } from "./helpers/geoChart/common.js";
import { IGeoConfig } from "../../GeoChart.js";
import {
    ErrorCodes,
    ErrorComponent as DefaultErrorComponent,
    GeoLocationMissingSdkError,
    GeoTokenMissingSdkError,
    IErrorDescriptors,
    IntlWrapper,
    isGeoTokenMissing,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { IColor } from "@gooddata/sdk-model";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

type IGeoValidatorProps = IGeoChartInnerProps;

interface IGeoValidatorState {
    isMapboxTokenInvalid: boolean;
}

export function geoValidatorHOC<T>(InnerComponent: React.ComponentClass<T>): React.ComponentClass<T> {
    class ValidatorHOCWrapped extends React.Component<T & IGeoValidatorProps, IGeoValidatorState> {
        private readonly errorMap: IErrorDescriptors;

        private isLocationMissing: boolean = false;
        private isMapboxTokenMissing: boolean = false;

        constructor(props: T & IGeoValidatorProps) {
            super(props);
            this.errorMap = newErrorMapping(props.intl);
            this.state = {
                isMapboxTokenInvalid: false,
            };
        }

        public render() {
            this.initError();

            if (this.state.isMapboxTokenInvalid || this.isMapboxTokenMissing) {
                return this.renderErrorComponent(ErrorCodes.GEO_MAPBOX_TOKEN_MISSING);
            }

            if (this.isLocationMissing) {
                return this.renderErrorComponent(ErrorCodes.GEO_LOCATION_MISSING);
            }

            return <InnerComponent {...this.props} onError={this.onError} />;
        }

        public shouldComponentUpdate(nextProps: IGeoValidatorProps, nextState: IGeoValidatorState): boolean {
            const { config, execution, drillableItems } = this.props;
            const {
                config: nextConfig,
                execution: nextExecution,
                drillableItems: nextDrillableItems,
            } = nextProps;

            // check if buckets, filters and config are changed
            const isSameConfig = this.isSameConfig(config, nextConfig);
            const isSameDataSource = this.isSameData(execution, nextExecution);
            const isSameDrillableItems = isEqual(drillableItems, nextDrillableItems);

            return (
                !isSameConfig ||
                !isSameDataSource ||
                !isSameDrillableItems ||
                this.state.isMapboxTokenInvalid !== nextState.isMapboxTokenInvalid
            );
        }

        public componentDidUpdate(prevProps: IGeoValidatorProps): void {
            if (prevProps.config?.mapboxToken !== this.props.config?.mapboxToken) {
                this.setState({
                    isMapboxTokenInvalid: false,
                });
            } else {
                this.handleError();
            }
        }

        public componentDidMount(): void {
            this.handleError();
        }

        private initError() {
            const mapboxToken = this.props.config?.mapboxToken ?? "";
            const { execution } = this.props;

            this.isLocationMissing = !isLocationSet(execution.definition.buckets);
            this.isMapboxTokenMissing = !mapboxToken;
        }

        private handleError() {
            const { onError } = this.props;
            if (this.isLocationMissing) {
                onError?.(new GeoLocationMissingSdkError());
            }
            if (this.state.isMapboxTokenInvalid || this.isMapboxTokenMissing) {
                onError?.(new GeoTokenMissingSdkError());
            }
        }

        private handleInvalidMapboxToken() {
            this.setState({
                isMapboxTokenInvalid: true,
            });
        }

        onError = (e: any) => {
            if (isGeoTokenMissing(e)) {
                this.handleInvalidMapboxToken();
            } else {
                this.props.onError?.(e);
            }
        };

        private renderErrorComponent(errorState: string) {
            const ErrorComponent = this.props.ErrorComponent ?? DefaultErrorComponent;
            // in this case, we show "Sorry, we can't display this insight"
            const errorProps = this.errorMap[errorState] || this.errorMap[ErrorCodes.UNKNOWN_ERROR];

            return <ErrorComponent code={errorState} {...errorProps} />;
        }

        private isSameConfig(config?: IGeoConfig, nextConfig?: IGeoConfig): boolean {
            const colorMapping = (config?.colorMapping || []).map(
                (currentColor: IColorMapping): IColor => currentColor.color,
            );
            const nextColorMapping = (nextConfig?.colorMapping || []).map(
                (newColor: IColorMapping): IColor => newColor.color,
            );
            const configProps = {
                ...config,
                colorMapping,
            };
            const nextConfigProps = {
                ...nextConfig,
                colorMapping: nextColorMapping,
            };

            return isEqual(configProps, nextConfigProps);
        }

        private isSameData(execution?: IPreparedExecution, nextExecution?: IPreparedExecution): boolean {
            if (!execution || !nextExecution) {
                // one of data views is undefined. just test if the other one is also undefined, otherwise
                // data is definitely different
                return execution === nextExecution;
            }

            // we need equals here (not just fingerprint) for cases where measure is moved from one bucket to another
            return execution.equals(nextExecution);
        }
    }

    const IntlValidatorHOC = injectIntl<"intl", T & IGeoValidatorProps>(ValidatorHOCWrapped);

    return class ValidatorHOC extends React.Component<T & IGeoValidatorProps> {
        public render() {
            return (
                <IntlWrapper locale={this.props.locale}>
                    <IntlValidatorHOC {...(this.props as any)} />
                </IntlWrapper>
            );
        }
    } as any;
}
