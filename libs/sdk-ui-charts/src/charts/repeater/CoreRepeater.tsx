// (C) 2024 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { WrappedComponentProps, injectIntl, useIntl } from "react-intl";
import {
    LoadingComponent as SDKLoadingComponent,
    ErrorComponent as SDKErrorComponent,
    useCancelablePromise,
    DataViewFacade,
    newErrorMapping,
    IntlWrapper,
    convertError,
    ErrorCodes,
    BucketNames,
} from "@gooddata/sdk-ui";
import { ITheme, bucketsFind } from "@gooddata/sdk-model";
import { ThemeContextProvider, useTheme, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { IChartConfig, ICoreChartProps } from "../../interfaces/index.js";
import { RepeaterChart } from "./internal/RepeaterChart.js";
import { RepeaterColumnResizedCallback } from "./publicTypes.js";
import { ColorFactory, getValidColorPalette } from "../../highcharts/index.js";

export * from "./publicTypes.js";
export * from "./columnWidths.js";

/**
 * @internal
 */
export interface ICoreRepeaterChartProps extends ICoreChartProps, WrappedComponentProps {
    theme?: ITheme;

    /**
     * Specify function to call when user manually resizes a table column.
     *
     * @param columnWidths - new widths for columns
     */
    onColumnResized?: RepeaterColumnResizedCallback;
}

export const CoreRepeaterImpl: React.FC<ICoreRepeaterChartProps> = (props) => {
    const {
        execution,
        ErrorComponent = SDKErrorComponent,
        LoadingComponent = SDKLoadingComponent,
        onLoadingChanged,
        pushData,
        onError,
        onColumnResized,
        config,
    } = props;

    const intl = useIntl();

    const { result, error } = useCancelablePromise(
        {
            promise: async () => {
                const isTwoDim = execution.definition.dimensions.length === 2;
                const offset = isTwoDim ? [0, 0] : [0];
                const size = isTwoDim ? [1, 1] : [1];

                const executionResult = await execution.execute();
                const dataWindow = await executionResult.readWindow(offset, size);
                return DataViewFacade.for(dataWindow);
            },
            onLoading: () => {
                onLoadingChanged?.({ isLoading: true });
            },
            onSuccess: (dataView) => {
                onLoadingChanged?.({ isLoading: false });
                pushData?.({ dataView: dataView.dataView });
            },
            onError: (error) => {
                onLoadingChanged?.({ isLoading: false });
                onError?.(convertError(error));
            },
        },
        [execution.fingerprint()],
    );

    const configWithColorPalette = useMemo<IChartConfig>(() => {
        const colorPalette = getValidColorPalette(config);
        return {
            ...config,
            colorPalette,
        };
    }, [config]);

    const theme = useTheme();
    useEffect(() => {
        if (result) {
            const colorStrategy = ColorFactory.getColorStrategy(
                configWithColorPalette.colorPalette,
                configWithColorPalette.colorMapping,
                null,
                null,
                null,
                result,
                "repeater",
                theme,
            );

            const colorAssignment = colorStrategy.getColorAssignment();

            pushData?.({
                colors: {
                    colorAssignments: colorAssignment,
                    colorPalette: configWithColorPalette.colorPalette,
                },
            });
        }
    }, [theme, configWithColorPalette.colorPalette, configWithColorPalette.colorMapping, pushData, result]);

    if (error) {
        const convertedError = convertError(error);
        const errorMessage = convertedError.getMessage();
        const errorMap = newErrorMapping(intl);
        const errorProps =
            errorMap[
                Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR
            ];

        return <ErrorComponent code={errorMessage} {...errorProps} />;
    }

    if (!result) {
        return <LoadingComponent />;
    }

    const columns = bucketsFind(result.definition.buckets, BucketNames.COLUMNS);
    if (!columns || columns.items.length === 0) {
        const err = new Error("Repeater chart requires at least one column") as any;
        const convertedError = convertError(err);
        const errorMessage = convertedError.getMessage();
        const errorMap = newErrorMapping(intl);
        const errorProps =
            errorMap[Object.prototype.hasOwnProperty.call(errorMap, err) ? err : ErrorCodes.UNKNOWN_ERROR];

        return <ErrorComponent code={errorMessage} {...errorProps} />;
    }

    return (
        <RepeaterChart
            dataView={result}
            config={configWithColorPalette}
            onError={onError}
            onColumnResized={onColumnResized}
        />
    );
};

const CoreRepeaterWithIntl = injectIntl(withTheme(CoreRepeaterImpl));

/**
 * @internal
 */
export const CoreRepeater: React.FC<ICoreRepeaterChartProps> = (props) => (
    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
        <IntlWrapper locale={props.locale}>
            <CoreRepeaterWithIntl {...props} />
        </IntlWrapper>
    </ThemeContextProvider>
);
