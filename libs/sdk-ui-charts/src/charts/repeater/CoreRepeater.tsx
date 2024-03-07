// (C) 2024 GoodData Corporation
import React from "react";
import {
    LoadingComponent as SDKLoadingComponent,
    ErrorComponent as SDKErrorComponent,
    useCancelablePromise,
    DataViewFacade,
} from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces/index.js";
import { RepeaterChart } from "./internal/RepeaterChart.js";

/**
 * @internal
 */
export const CoreRepeater: React.FC<ICoreChartProps> = (props) => {
    const {
        execution,
        ErrorComponent = SDKErrorComponent,
        LoadingComponent = SDKLoadingComponent,
        onLoadingChanged,
        pushData,
    } = props;

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
            onError: () => {
                onLoadingChanged?.({ isLoading: false });
            },
        },
        [execution.fingerprint()],
    );

    if (error) {
        return <ErrorComponent message={error.message} />;
    }
    if (!result) {
        return <LoadingComponent />;
    }

    return <RepeaterChart dataView={result} />;
};
