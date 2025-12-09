// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IntlShape } from "react-intl";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette, IExecutionConfig } from "@gooddata/sdk-model";
import {
    DataTooLargeToDisplaySdkError,
    DefaultColorPalette,
    GoodDataSdkError,
    UseCancelablePromiseStatus,
} from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { IGeoChartNextConfig } from "../../types/config/unified.js";
import { ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";
import { getDataPointsLimit, validateLayersDataSize } from "../../utils/dataValidation.js";
import { useLayersData } from "../layers/useLayersData.js";
import { ILayerPreparedData, ILayersPrepareContext, useLayersPrepare } from "../layers/useLayersPrepare.js";

export interface IGeoChartDataResult {
    layerOutputs: Map<string, ILayerPreparedData>;
    status: UseCancelablePromiseStatus;
    error?: GoodDataSdkError;
    colorPalette: IColorPalette;
    colorMapping: IColorMapping[];
}

/**
 * Status priority for combining multiple statuses.
 * Lower number = higher priority (takes precedence).
 */
const STATUS_PRIORITY: Record<UseCancelablePromiseStatus, number> = {
    error: 0,
    loading: 1,
    pending: 2,
    success: 3,
};

/**
 * Combines multiple statuses into a single status using priority-based resolution.
 * The status with the highest priority (lowest number) wins.
 */
function combineStatus(...statuses: UseCancelablePromiseStatus[]): UseCancelablePromiseStatus {
    return statuses.reduce((a, b) => (STATUS_PRIORITY[a] < STATUS_PRIORITY[b] ? a : b));
}

export function useGeoChartData(params: {
    layerExecutions: ILayerExecutionRecord[];
    backend: IAnalyticalBackend;
    workspace: string;
    config?: IGeoChartNextConfig;
    execConfig?: IExecutionConfig;
    intl: IntlShape;
}): IGeoChartDataResult {
    const { layerExecutions, backend, workspace, config, execConfig, intl } = params;

    const colorPalette = useMemo<IColorPalette>(
        () => config?.colorPalette ?? DefaultColorPalette,
        [config?.colorPalette],
    );

    const colorMapping = useMemo<IColorMapping[]>(() => config?.colorMapping ?? [], [config?.colorMapping]);

    const {
        layerDataViews,
        status: dataStatus,
        error: dataError,
    } = useLayersData(layerExecutions, backend, workspace);

    const prepareContext: ILayersPrepareContext = {
        backend,
        workspace,
        config,
        execConfig,
        colorPalette,
        colorMapping,
        intl,
    };

    const {
        layerOutputs,
        status: prepareStatus,
        error: prepareError,
    } = useLayersPrepare(layerExecutions, layerDataViews, dataStatus, prepareContext);

    const combinedStatus = combineStatus(dataStatus, prepareStatus);
    const pipelineError = dataError ?? prepareError;

    const dataSizeValidation = useMemo(() => {
        if (combinedStatus !== "success") {
            return null;
        }
        const limit = getDataPointsLimit(config);
        return validateLayersDataSize(layerExecutions, layerOutputs, limit);
    }, [combinedStatus, config, layerExecutions, layerOutputs]);

    const dataTooLargeError = useMemo(() => {
        if (!dataSizeValidation) {
            return undefined;
        }
        return new DataTooLargeToDisplaySdkError(
            `Data limit: ${dataSizeValidation.limit}, actual: ${dataSizeValidation.actualCount}`,
        );
    }, [dataSizeValidation]);

    const status: UseCancelablePromiseStatus = dataTooLargeError ? "error" : combinedStatus;
    const error = pipelineError ?? dataTooLargeError;

    return {
        layerOutputs,
        status,
        error,
        colorPalette,
        colorMapping,
    };
}
