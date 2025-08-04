// (C) 2020-2025 GoodData Corporation
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
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

// Helper functions moved outside the component
const isSameConfig = (config?: IGeoConfig, nextConfig?: IGeoConfig): boolean => {
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
};

const isSameData = (execution?: IPreparedExecution, nextExecution?: IPreparedExecution): boolean => {
    if (!execution || !nextExecution) {
        return execution === nextExecution;
    }
    return execution.equals(nextExecution);
};

export function geoValidatorHOC<T>(
    InnerComponent: React.ComponentClass<T>,
): React.ComponentType<T & IGeoValidatorProps> {
    const ValidatorHOCWrapped = memo<T & IGeoValidatorProps>(
        function ValidatorHOCWrapped(props) {
            const [isMapboxTokenInvalid, setIsMapboxTokenInvalid] = useState(false);
            const errorMap = useRef<IErrorDescriptors>(newErrorMapping(props.intl));
            const prevMapboxTokenRef = useRef<string | undefined>(props.config?.mapboxToken);

            const mapboxToken = props.config?.mapboxToken ?? "";
            const { execution } = props;
            const isLocationMissing = !isLocationSet(execution.definition.buckets);
            const isMapboxTokenMissing = !mapboxToken;

            const handleError = useCallback(() => {
                const { onError } = props;
                if (isLocationMissing) {
                    onError?.(new GeoLocationMissingSdkError());
                }
                if (isMapboxTokenInvalid || isMapboxTokenMissing) {
                    onError?.(new GeoTokenMissingSdkError());
                }
            }, [isLocationMissing, isMapboxTokenInvalid, isMapboxTokenMissing, props]);

            const handleInvalidMapboxToken = useCallback(() => {
                setIsMapboxTokenInvalid(true);
            }, []);

            const onError = useCallback(
                (e: any) => {
                    if (isGeoTokenMissing(e)) {
                        handleInvalidMapboxToken();
                    } else {
                        props.onError?.(e);
                    }
                },
                [handleInvalidMapboxToken, props],
            );

            const renderErrorComponent = useCallback(
                (errorState: string) => {
                    const ErrorComponent = props.ErrorComponent ?? DefaultErrorComponent;
                    // in this case, we show "Sorry, we can't display this insight"
                    const errorProps =
                        errorMap.current[errorState] || errorMap.current[ErrorCodes.UNKNOWN_ERROR];

                    return <ErrorComponent code={errorState} {...errorProps} />;
                },
                [props.ErrorComponent],
            );

            useEffect(() => {
                if (prevMapboxTokenRef.current !== props.config?.mapboxToken) {
                    setIsMapboxTokenInvalid(false);
                    prevMapboxTokenRef.current = props.config?.mapboxToken;
                }
                handleError();
            }, [handleError, props.config?.mapboxToken]);

            if (isMapboxTokenInvalid || isMapboxTokenMissing) {
                return renderErrorComponent(ErrorCodes.GEO_MAPBOX_TOKEN_MISSING);
            }

            if (isLocationMissing) {
                return renderErrorComponent(ErrorCodes.GEO_LOCATION_MISSING);
            }

            return <InnerComponent {...props} onError={onError} />;
        },
        (prevProps, nextProps) => {
            const { config, execution, drillableItems } = prevProps;
            const {
                config: nextConfig,
                execution: nextExecution,
                drillableItems: nextDrillableItems,
            } = nextProps;

            // check if buckets, filters and config are changed
            const isSameConfigResult = isSameConfig(config, nextConfig);
            const isSameDataSource = isSameData(execution, nextExecution);
            const isSameDrillableItems = isEqual(drillableItems, nextDrillableItems);

            // Return true if props are equal (should NOT re-render)
            // This is the opposite of shouldComponentUpdate
            return isSameConfigResult && isSameDataSource && isSameDrillableItems;
        },
    );

    const IntlValidatorHOC = injectIntl<"intl", T & IGeoValidatorProps>(ValidatorHOCWrapped);

    function ValidatorHOC(props: T & IGeoValidatorProps) {
        return (
            <IntlWrapper locale={props.locale}>
                <IntlValidatorHOC {...(props as any)} />
            </IntlWrapper>
        );
    }

    return ValidatorHOC;
}
