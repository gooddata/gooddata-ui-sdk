// (C) 2024 GoodData Corporation
import React from "react";
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
} from "@gooddata/sdk-ui";
import { ITheme } from "@gooddata/sdk-model";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { ICoreChartProps } from "../../interfaces/index.js";
import { RepeaterChart } from "./internal/RepeaterChart.js";

/**
 * @internal
 */
export interface ICoreRepeterChartProps extends ICoreChartProps, WrappedComponentProps {
    theme?: ITheme;
}

export const CoreRepeaterImpl: React.FC<ICoreRepeterChartProps> = (props) => {
    const {
        execution,
        ErrorComponent = SDKErrorComponent,
        LoadingComponent = SDKLoadingComponent,
        onLoadingChanged,
        pushData,
        onError,
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

    return <RepeaterChart dataView={result} config={config} onError={onError} />;
};

const CoreRepeaterWithIntl = injectIntl(withTheme(CoreRepeaterImpl));

/**
 * @internal
 */
export const CoreRepeater: React.FC<ICoreRepeterChartProps> = (props) => (
    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
        <IntlWrapper locale={props.locale}>
            <CoreRepeaterWithIntl {...props} />
        </IntlWrapper>
    </ThemeContextProvider>
);
