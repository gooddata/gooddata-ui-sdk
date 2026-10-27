// (C) 2019-2026 GoodData Corporation

import { type ComponentType, useCallback, useRef } from "react";

// NodeNext types react-measure's default as the module namespace; cast restores the component type.
import MeasureRaw, { type ContentRect, type MeasureProps } from "react-measure";

const Measure = MeasureRaw as unknown as ComponentType<MeasureProps>;

import {
    type IExecutionConfig,
    type IInsight,
    type IVisualizationClass,
    type IWorkspacePermissions,
    insightHasDataDefined,
} from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    type ExplicitDrill,
    type ILocale,
    fillMissingTitlesWithMessages,
} from "@gooddata/sdk-ui";
import {
    BaseVisualization,
    ConfigPanelClassName,
    type IBaseVisualizationProps,
    type IConfigurationPanelRenderers,
    type IExtendedReferencePoint,
    type ISortConfig,
    type IVisCallbacks,
    isEmptyAfm,
} from "@gooddata/sdk-ui-ext/internal";
import { useReferenceTheme, useTheme } from "@gooddata/sdk-ui-theme-provider";

import { backend } from "../../backend.js";
import { type IPropertiesMetaState } from "../../store/properties/properties_meta_state.js";
import { logError } from "../../utils/logging/error_logging.js";

// TODO probably replace these types with direct imports or something less "dirty"
type IGdcConfig = IBaseVisualizationProps["config"];
export type IFeatureFlags = IBaseVisualizationProps["featureFlags"];
type IReferencePoint = IBaseVisualizationProps["referencePoint"];
type IBucketItem = NonNullable<IBaseVisualizationProps["newDerivedBucketItems"]>[0];

export interface IPluggableVisualizationProps extends IVisCallbacks {
    projectId: string;
    appSessionId: string;
    locale: ILocale;
    messages: Record<string, string>;
    dateFormat?: string;
    config?: IGdcConfig;
    executionConfig?: IExecutionConfig;
    isMdObjectValid: boolean;
    drillableItems?: ExplicitDrill[];
    containerHeight?: number;
    containerWidth?: number;
    referencePoint?: IReferencePoint;
    newDerivedBucketItems?: IBucketItem[];
    featureFlags?: IFeatureFlags;
    permissions?: IWorkspacePermissions;
    onError?: IVisCallbacks["onError"];
    onExportReady?: IVisCallbacks["onExportReady"];
    onLoadingChanged?: IVisCallbacks["onLoadingChanged"];

    afterRender?(): void;

    onExtendedReferencePointChanged?(extendedReferencePoint: IExtendedReferencePoint): void;

    onNewDerivedBucketItemsPlaced?(referencePoint: IReferencePoint): void;

    insight: IInsight;
    visualizationClass: IVisualizationClass;
    visualizationPropertiesMeta: IPropertiesMetaState;
    lastSavedVisClassUrl?: string;
    sourceInsightId?: string;
    configurationPanelRenderers?: IConfigurationPanelRenderers;

    onSortingChanged?(sortingConfig: ISortConfig): void;
    supportsChartFill?: boolean;
}

/*  ----- Visualization component tree -----
 *
 *  AD:   [ReportVisualization]
 *                |
 *                ▼
 *  UI SDK: [PluggableVisualization]
 *                |
 *                ▼
 *        [BaseVisualization]
 *                |
 *                ▼
 *        <div .gd-vis-{ID}>  +  new IVisualization({ element: .gd-vis-{ID} })
 *
 *       =====  New React tree from here =====
 *       [PluggableBarChart] extends [PluggableBaseChart] implements IVisualization
 *       OR [PluggableTable] implements IVisualization
 *       - render( . ) to prop.element
 *                 |
 *                 ▼    ◣---- [BarChart] and other SDK components
 *            [BaseChart]
 *                 |
 *                 ▼
 *           [Visualization]
 */

function PluggableVisualizationPure({
    appSessionId,
    visualizationClass,
    afterRender = () => {},
    onExportReady = () => {},
    onLoadingChanged = () => {},
    locale,
    messages,
    dateFormat,
    pushData = () => {},
    drillableItems = [],
    containerHeight,
    referencePoint = undefined,
    onExtendedReferencePointChanged = () => {},
    config,
    isMdObjectValid,
    featureFlags = {},
    permissions,
    newDerivedBucketItems = [],
    onNewDerivedBucketItemsPlaced = () => {},
    projectId,
    onDrill,
    insight,
    visualizationPropertiesMeta,
    executionConfig,
    onSortingChanged,
    lastSavedVisClassUrl,
    sourceInsightId,
    configurationPanelRenderers,
    onError = (e) => {
        console.error(e);
    },
    supportsChartFill,
}: IPluggableVisualizationProps) {
    const theme = useTheme();

    /*
     * Previously, when AD was preparing data sources, the plug viz update() could find itself in two
     * different states when nothing would be rendered:
     *
     * 1. no data source was provided => plug viz did nothing, no error raised
     * 2. 'fake' data source was provided, this was throwing the desired errors (EMPTY_AFM, INVALID_BUCKETS)
     *
     * The AD code & tests relied on this behavior - that no errors are raised for instance when insight
     * does not exist on backend.
     *
     * Now, since AD is no longer managing the data source, and the pluggable visualization always raises EMPTY_AFM,
     * the AD would work differently, incorrectly.
     *
     * At the same time, it is not possible to 'just disable' rendering of the entire plug viz, because AD needs
     * various pieces of information from it - the extended ref point, the configuration properties etc.
     *
     * Proper fix to this 'missing state' problem is non-trivial - it requires larger changes in the plug viz
     * interface and contracts to support this lifecycle.
     *
     * What you see here is the simple fix, imitating how the dataSource was previously managed in this code. How was
     * it set to null or not null:
     *
     * -  when this plug viz adapter is initialized and the insight it is initialized with is empty, it
     *    is switched to 'sinkError' mode; errors from plug viz will not be propagated => everything same as before
     *
     * -  the adapter gets out of the 'sinkError' mode if it is about to render a non-empty insight
     *
     * -  the adapter cannot re-enter the 'sinkError' mode
     */
    const sinkErrorRef = useRef<boolean>(!insightHasDataDefined(insight));

    sinkErrorRef.current = !insightHasDataDefined(insight);

    const handleError = useCallback(
        (err: GoodDataSdkError) => {
            if (!isEmptyAfm(err)) {
                logError("An error has occurred during execution", err);
            }

            if (sinkErrorRef.current) {
                return;
            }

            onError(err);
        },
        [onError],
    );

    const effectiveInsight = fillMissingTitlesWithMessages(insight, locale, messages, undefined);

    // the pluggable visualization renders charts into a separate React root, so the
    // reference theme cannot travel via context and must be passed as a prop
    const referenceTheme = useReferenceTheme();

    return (
        <BaseVisualization
            backend={backend}
            configPanelClassName={`${ConfigPanelClassName}-${appSessionId}`}
            insight={effectiveInsight}
            insightPropertiesMeta={visualizationPropertiesMeta}
            isMdObjectValid={isMdObjectValid}
            config={config}
            environment="analyticalDesigner"
            drillableItems={drillableItems}
            totalsEditAllowed
            featureFlags={featureFlags}
            permissions={permissions}
            afterRender={afterRender}
            height={containerHeight}
            onError={handleError}
            onExportReady={onExportReady}
            onLoadingChanged={onLoadingChanged}
            pushData={pushData}
            visualizationClass={visualizationClass}
            locale={locale}
            messages={messages}
            dateFormat={dateFormat}
            projectId={projectId}
            referencePoint={referencePoint}
            newDerivedBucketItems={newDerivedBucketItems}
            onExtendedReferencePointChanged={onExtendedReferencePointChanged}
            onNewDerivedBucketItemsPlaced={
                // sdk-ui-ext declares the callback WITHOUT the argument BaseVisualization actually
                // passes (the reference point addNewDerivedBucketItems resolves with)
                onNewDerivedBucketItemsPlaced as () => void
            }
            onDrill={onDrill}
            executionConfig={executionConfig}
            onSortingChanged={onSortingChanged}
            lastSavedVisClassUrl={lastSavedVisClassUrl}
            sourceInsightId={sourceInsightId}
            theme={theme}
            referenceTheme={referenceTheme}
            configurationPanelRenderers={configurationPanelRenderers}
            supportsChartFill={supportsChartFill}
        />
    );
}

export function PluggableVisualization(props: IPluggableVisualizationProps) {
    return (
        <Measure margin={false}>
            {({ contentRect }: { contentRect: ContentRect }) => {
                return (
                    <div>
                        <PluggableVisualizationPure
                            {...props}
                            containerHeight={Math.floor(contentRect.client.height)}
                            containerWidth={Math.floor(contentRect.client.width)}
                        />
                    </div>
                );
            }}
        </Measure>
    );
}
