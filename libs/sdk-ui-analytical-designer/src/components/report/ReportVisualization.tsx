// (C) 2007-2026 GoodData Corporation

import {
    type ComponentProps,
    type ComponentType,
    type LegacyRef,
    useCallback,
    useRef,
    useState,
} from "react";

import classNames from "classnames";
import { isEmpty } from "lodash-es";
import { defineMessage } from "react-intl";
// NodeNext types react-measure's default as the module namespace; cast restores the component type.
import MeasureRaw, { type ContentRect, type MeasureProps } from "react-measure";
import { useDispatch } from "react-redux";

import { type AppDispatch } from "../../store/types.js";

const Measure = MeasureRaw as unknown as ComponentType<MeasureProps>;
import { v4 as uuid } from "uuid";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { visClassUrl } from "@gooddata/sdk-model";
import {
    ErrorCodes,
    type IDrillEvent,
    type IExportFunction,
    type IPushData,
    isClusteringNotReceived,
    isForecastNotReceived,
    isGoodDataSdkError,
    useAutoupdateRef,
} from "@gooddata/sdk-ui";
import {
    type IConfigurationPanelRenderers,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type ISortConfig,
    PluggableVisualizationErrorCodes,
} from "@gooddata/sdk-ui-ext/internal";

import { createDrillPerformedAction } from "../../actions/drill_actions.js";
import { exportResultReady } from "../../actions/export_report_actions.js";
import { showErrorMessage } from "../../actions/messages_actions.js";
import {
    openAsReportToggled,
    visualizationPropertiesChanged,
    visualizationPropertiesInitialized,
    visualizationPropertiesMetaChanged,
} from "../../actions/properties_actions.js";
import {
    newDerivedBucketItemsPlaced,
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
    reportExecutionWarning,
    uiExtendedReferencePointChanged,
} from "../../actions/report_actions.js";
import { updateChartSortConfig } from "../../sagas/chart_sort/chart_sort_ui_actions.js";
import { reportVisualizationSelector } from "../../selectors/report_visualization_selector.js";
import { useAppSelector } from "../../store/hooks.js";
import { getCssClass } from "../../utils/css_class.js";
import { getTime } from "../../utils/timers.js";
import { areSameVisualizationProperties } from "../../utils/visualization_properties.js";

import { DrillDownList } from "./drillDown/DrillDownList.js";
import { PluggableVisualization } from "./PluggableVisualization.js";
import { extractErrorResponseData } from "./reportUtils.js";

const knownErrorCodes = [
    ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
    ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
    ErrorCodes.NO_DATA,
    ErrorCodes.NEGATIVE_VALUES,
    ErrorCodes.BAD_REQUEST,
    ErrorCodes.PROTECTED_REPORT,
    ErrorCodes.GEO_LOCATION_MISSING,
    ErrorCodes.GEO_AREA_MISSING,
    PluggableVisualizationErrorCodes.INVALID_BUCKETS,
    PluggableVisualizationErrorCodes.INVALID_COLUMNS,
    PluggableVisualizationErrorCodes.EMPTY_AFM,
];

export interface IReportVisualizationProps {
    projectId: string;
    appSessionId: string;
    messages?: Record<string, string>;
    visualizationGenericComponent?: typeof PluggableVisualization;
}

type PlugVizProps = ComponentProps<typeof PluggableVisualization>;

export function ReportVisualization({
    projectId,
    appSessionId,
    messages,
    visualizationGenericComponent = PluggableVisualization,
}: IReportVisualizationProps) {
    const dispatch = useDispatch<AppDispatch>();

    const {
        isNarrow,
        featureFlags,
        permissions,
        isMdObjectValid,
        drillableItems,
        visualizationProperties,
        visualizationPropertiesMeta,
        referencePoint,
        newDerivedBucketItems,
        locale,
        dateFormat,
        config,
        executionConfig,
        insight,
        visualizationClass,
        lastSavedVisClassUrl,
        sourceInsightId,
        supportsChartFill,
    } = useAppSelector(reportVisualizationSelector);

    const [containerHeight, setContainerHeight] = useState<number | null>(null);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    // not on state to keep it synchronous between callbacks from pl. vis
    const executionIdRef = useRef<string | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const endTimeRef = useRef<number | null>(null);

    const visualizationPropertiesRef = useAutoupdateRef(visualizationProperties);

    const parseErrorReason = (reason: string) => {
        return reason
            .split(/\n/)
            .map((str) => {
                const index = str.indexOf("Limit:");
                if (index === -1) {
                    return "";
                }
                const cutStr = str.substring(index).replace(/_/g, "").replace(/\./g, "").toLowerCase();
                if (str.indexOf("dimension with metrics") !== -1) {
                    return `DimensionWithMetrics ${cutStr}.`;
                }
                if (str.indexOf("dimension without metrics") !== -1) {
                    return `DimensionWithoutMetrics ${cutStr}.`;
                }
                if (str.indexOf("cells") !== -1) {
                    return `Cells ${cutStr}.`;
                }
                return "";
            })
            .filter((str) => str !== "")
            .join(" ")
            .trim();
    };

    const extractSupportedErrorCode = (error: unknown): string => {
        let errorCode: string;

        if (isGoodDataSdkError(error)) {
            return error.getErrorCode();
        } else {
            errorCode = ErrorCodes.UNKNOWN_ERROR;
        }

        return knownErrorCodes.includes(errorCode) ? errorCode : ErrorCodes.UNKNOWN_ERROR;
    };

    const onError = (error: unknown) => {
        const executionId = executionIdRef.current;
        const startTime = startTimeRef.current;
        const endTime = endTimeRef.current;
        const errorCode = extractSupportedErrorCode(error);
        const errorResponseData = extractErrorResponseData(error);

        let message = "";
        // the caught error is probed for the response reason the toast shows
        const reason = (error as { cause?: { responseBody?: { reason?: string } } } | undefined)?.cause
            ?.responseBody?.reason;
        if (typeof reason === "string") {
            message = parseErrorReason(reason);
        }
        if (errorCode === ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY) {
            message = (error as { message?: string }).message;
        }

        if (isForecastNotReceived(error)) {
            dispatch(
                showErrorMessage(
                    defineMessage({ id: "messages.visualizations.forecast.error" }).id,
                    error.message,
                ),
            );
        }

        if (isClusteringNotReceived(error)) {
            dispatch(
                showErrorMessage(
                    defineMessage({ id: "messages.visualizations.clustering.error" }).id,
                    error.message,
                ),
            );
        }

        dispatch(
            reportExecutionFailed(
                {
                    status: errorCode,
                    responseData: errorResponseData,
                    message: message === "" ? undefined : message.replace(/\s/g, "_"),
                },
                executionId,
                startTime,
                endTime,
            ),
        );
    };

    const onLoadingChanged = ({ isLoading }: { isLoading: boolean }) => {
        if (isLoading) {
            executionIdRef.current = uuid();
            startTimeRef.current = getTime();
            dispatch(reportExecutionStarted(executionIdRef.current, startTimeRef.current));
        }
    };

    const onExtendedReferencePointChanged = (
        referencePoint: IExtendedReferencePoint,
        sortConfig?: ISortConfig,
    ) => {
        const { properties } = referencePoint;

        handlePropertiesChange(properties, true);

        dispatch(uiExtendedReferencePointChanged(referencePoint, sortConfig));
    };

    const pushData = (data: IPushData) => {
        const {
            properties,
            propertiesMeta,
            initialProperties,
            openAsReport,
            ignoreUndoRedo = false,
            dataView,
        } = data;

        if (initialProperties) {
            dispatch(visualizationPropertiesInitialized(initialProperties));
        }

        if (propertiesMeta) {
            dispatch(visualizationPropertiesMetaChanged(propertiesMeta));
        }

        handlePropertiesChange(properties, ignoreUndoRedo);

        if (openAsReport !== undefined) {
            dispatch(openAsReportToggled(openAsReport));
        }

        if (dataView) {
            const typedDataView: IDataView = dataView;
            endTimeRef.current = getTime();
            const executionId = executionIdRef.current;
            const startTime = startTimeRef.current;
            // TODO we don't want to save the execution result anymore
            dispatch(
                reportExecutionFinished(typedDataView.result, executionId, startTime, endTimeRef.current),
            );

            const limitBreaks = typedDataView.metadata?.limitBreaks ?? [];
            if (limitBreaks.length > 0) {
                dispatch(
                    reportExecutionWarning(
                        {
                            limitBreaks,
                        },
                        executionId,
                        startTime,
                        endTimeRef.current,
                    ),
                );
            }
        }
    };

    const onExportReady = (exportResultFunction: IExportFunction) => {
        dispatch(exportResultReady(exportResultFunction));
    };

    const handlePropertiesChange = (
        properties: Parameters<typeof visualizationPropertiesChanged>[0],
        ignoreUndoRedo: boolean,
    ) => {
        if (properties) {
            const currentProperties = visualizationPropertiesRef.current;
            if (!areSameVisualizationProperties(currentProperties, properties)) {
                dispatch(visualizationPropertiesChanged(properties, ignoreUndoRedo));
            }
        }
    };

    const onSortingChanged = (sortConfig: ISortConfig) => {
        dispatch(updateChartSortConfig(sortConfig));
    };

    const onResize = (contentRect: ContentRect): void => {
        setContainerHeight(contentRect.bounds.height);
        setContainerWidth(contentRect.bounds.width);
    };

    const onDrill = (drillEvent: IDrillEvent) => {
        dispatch(createDrillPerformedAction(drillEvent));
    };

    // the one visualization prop that needs a stable identity across renders
    const onNewDerivedBucketItemsPlaced = useCallback(
        (referencePoint: IReferencePoint) => {
            dispatch(newDerivedBucketItemsPlaced(referencePoint));
        },
        [dispatch],
    );

    if (!visualizationClass) {
        return false;
    }

    const type = visClassUrl(visualizationClass).split(":")[1];
    const className = classNames([
        "adi-report-visualization",
        getCssClass(type, "s-visualization-"),
        getCssClass(type, "gd-visualization-"),
    ]);

    const containerClassNames = classNames("adi-chart-container", {
        "adi-chart-container-narrow": isNarrow,
    });

    const VisualizationGeneric = visualizationGenericComponent;

    const extendedConfig = {
        ...config,
        maxHeight: containerHeight,
        maxWidth: containerWidth,
    };

    const configurationPanelRenderers: IConfigurationPanelRenderers = {
        InteractionsDetailRenderer: () => <DrillDownList />,
    };

    // Localization bundles are loaded asynchronously; only en-US is seeded synchronously.
    // The pluggable visualization bakes the messages it is constructed with into the extended
    // reference point (bucket titles, subtitles, ...) and never picks up later message updates.
    // Mounting it before the active locale's messages arrive would therefore freeze raw i18n
    // keys (e.g. "dashboard.bucket.measures_title.column") into the bucket panel. Wait for the
    // messages to be available so the very first reference point is computed with real strings.

    if (isEmpty(messages)) {
        return null;
    }

    return (
        <div className={className}>
            <Measure onResize={onResize} bounds>
                {({ measureRef }: { measureRef: LegacyRef<HTMLDivElement> }) => (
                    <div className={containerClassNames} ref={measureRef}>
                        <VisualizationGeneric
                            appSessionId={appSessionId}
                            // the state currencies ARE what the plug viz consumes at runtime; the
                            // SDK prop types describe the same shapes from its side of the boundary
                            newDerivedBucketItems={
                                newDerivedBucketItems as unknown as PlugVizProps["newDerivedBucketItems"]
                            }
                            referencePoint={referencePoint as unknown as PlugVizProps["referencePoint"]}
                            onExtendedReferencePointChanged={onExtendedReferencePointChanged}
                            onNewDerivedBucketItemsPlaced={onNewDerivedBucketItemsPlaced}
                            projectId={projectId}
                            visualizationClass={visualizationClass}
                            isMdObjectValid={isMdObjectValid}
                            onError={onError}
                            onExportReady={onExportReady}
                            onLoadingChanged={onLoadingChanged}
                            pushData={pushData}
                            drillableItems={drillableItems}
                            locale={locale}
                            messages={messages}
                            dateFormat={dateFormat}
                            featureFlags={featureFlags}
                            permissions={permissions}
                            config={extendedConfig}
                            onDrill={onDrill}
                            insight={insight as unknown as PlugVizProps["insight"]}
                            // A COPY, not the stored object: sdk-ui-ext's controlsHelper mutates
                            // the meta it receives (`set(propertiesMeta, "undoApplied", false)`)
                            // before pushing it back, and the slice state is frozen by immer.
                            visualizationPropertiesMeta={
                                visualizationPropertiesMeta ? { ...visualizationPropertiesMeta } : null
                            }
                            executionConfig={executionConfig}
                            onSortingChanged={onSortingChanged}
                            lastSavedVisClassUrl={lastSavedVisClassUrl}
                            sourceInsightId={sourceInsightId}
                            configurationPanelRenderers={configurationPanelRenderers}
                            supportsChartFill={supportsChartFill}
                        />
                    </div>
                )}
            </Measure>
        </div>
    );
}
