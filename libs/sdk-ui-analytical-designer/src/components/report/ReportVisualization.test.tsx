// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { omit, pick, set } from "lodash-es";
import { Provider } from "react-redux";
import { type UnknownAction, legacy_createStore as createStore } from "redux";
import { describe, expect, it, vi } from "vitest";

import {
    type IClusteringConfig,
    type IClusteringResult,
    type ICollectionItemsResult,
    type IDataView,
    type IForecastConfig,
    type IForecastResult,
    type IForecastView,
    type IOutliersConfig,
    type IOutliersResult,
    type IOutliersView,
} from "@gooddata/sdk-backend-spi";
import {
    GeoAreaMissingSdkError,
    GeoLocationMissingSdkError,
    type GoodDataSdkError,
    type IExportFunction,
    type ILoadingState,
    type IPushData,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";
import {
    type IExtendedReferencePoint,
    type ISortConfig,
    InvalidBucketsSdkError,
} from "@gooddata/sdk-ui-ext/internal";

import { exportResultReady } from "../../actions/export_report_actions.js";
import {
    openAsReportToggled,
    visualizationPropertiesChanged,
    visualizationPropertiesInitialized,
    visualizationPropertiesMetaChanged,
} from "../../actions/properties_actions.js";
import {
    reportExecutionFailed,
    reportExecutionFinished,
    reportExecutionStarted,
    reportExecutionWarning,
    uiExtendedReferencePointChanged,
} from "../../actions/report_actions.js";
import { updateChartSortConfig } from "../../sagas/chart_sort/chart_sort_ui_actions.js";
import type { reportVisualizationSelector } from "../../selectors/report_visualization_selector.js";
import { type IPropertiesMetaState } from "../../store/properties/properties_meta_state.js";
import { attributeSortConfig } from "../../tests/chart_sort.test.helpers.js";

import { type IPluggableVisualizationProps } from "./PluggableVisualization.js";
import { dummyTableVisualizationClass } from "./report.test.helpers.js";
import { type IReportVisualizationProps, ReportVisualization } from "./ReportVisualization.js";

/**
 * The component reads its whole redux state through reportVisualizationSelector; the tests drive
 * that selector directly instead of assembling an entire root. Values stay loose so each case can
 * hand over just the slice of state it cares about.
 */
type IStateProps = { [K in keyof ReturnType<typeof reportVisualizationSelector>]?: unknown };

let stateProps: IStateProps;

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../selectors/report_visualization_selector.js", () => ({
    reportVisualizationSelector: () => stateProps,
}));

const OWN_PROP_KEYS = ["projectId", "appSessionId", "messages", "visualizationGenericComponent"] as const;

interface IMockCallbackData {
    pushDataMock?: IPushData;
    onExtendedReferencePointChangedMock?: IExtendedReferencePoint;
    onLoadingChangedMock?: ILoadingState;
    onErrorMock?: GoodDataSdkError;
    onExportReadyMock?: IExportFunction;
    onSortingChangedMock?: ISortConfig;
}

interface IDispatchedAction extends UnknownAction {
    payload?: unknown;
}

const actionsOfType = (actions: UnknownAction[], type: string): IDispatchedAction[] =>
    actions.filter((action) => action.type === type);

const renderComponent = (
    customProps: Partial<IReportVisualizationProps> & IStateProps = {},
    callbackMocks: IMockCallbackData = {},
) => {
    // mock that allows the test to simulate pushing of the data from wrapped visualization to
    // tested component that wraps it
    function VisualizationMock({
        pushData,
        onExtendedReferencePointChanged,
        onLoadingChanged,
        onError,
        onExportReady,
        onSortingChanged,
        featureFlags,
        dateFormat,
        newDerivedBucketItems,
    }: IPluggableVisualizationProps) {
        const {
            pushDataMock,
            onExtendedReferencePointChangedMock,
            onLoadingChangedMock,
            onErrorMock,
            onExportReadyMock,
            onSortingChangedMock,
        } = callbackMocks;
        return (
            <div className="s-visualization-mock">
                <button onClick={() => pushData(pushDataMock)}>push</button>
                <button onClick={() => onExtendedReferencePointChanged(onExtendedReferencePointChangedMock)}>
                    refPoint
                </button>
                <button onClick={() => onLoadingChanged(onLoadingChangedMock)}>loading</button>
                <button onClick={() => onError(onErrorMock)}>error</button>
                <button onClick={() => onExportReady(onExportReadyMock)}>export</button>
                <button onClick={() => onSortingChanged(onSortingChangedMock)}>sorting</button>
                <pre id="feature-flags">{JSON.stringify(featureFlags)}</pre>
                <pre id="date-format">{dateFormat}</pre>
                <pre id="new-derived-bucket-items">{JSON.stringify(newDerivedBucketItems)}</pre>
            </div>
        );
    }

    stateProps = {
        isNarrow: true,
        isMdObjectValid: true,
        featureFlags: {},
        drillableItems: [],
        newDerivedBucketItems: [],
        visualizationProperties: {},
        locale: "en-US",
        visualizationClass: dummyTableVisualizationClass,
        ...omit(customProps, OWN_PROP_KEYS),
    };

    const props: IReportVisualizationProps = {
        projectId: "id",
        appSessionId: "session",
        messages: { "some.message": "Some message" },
        visualizationGenericComponent: VisualizationMock,
        ...pick(customProps, OWN_PROP_KEYS),
    };

    const store = createStore((state: null = null) => state);
    const dispatchSpy = vi.spyOn(store, "dispatch");

    const renderResult = render(
        <Provider store={store}>
            <ReportVisualization {...props} />
        </Provider>,
    );

    return {
        ...renderResult,
        dispatched: () => dispatchSpy.mock.calls.map(([action]) => action),
    };
};

describe("ReportVisualization", () => {
    it("should add correct class", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".adi-report-visualization").length).toEqual(1);
    });

    it.each([[{}], [undefined]])(
        "should not render the visualization until locale messages are loaded (messages=%s)",
        (messages: Record<string, string> | undefined) => {
            const { container } = renderComponent({ messages });
            expect(container.querySelectorAll(".s-visualization-mock").length).toEqual(0);
        },
    );

    it("should render the visualization once locale messages are available", () => {
        const { container } = renderComponent({ messages: { "some.message": "Some message" } });
        expect(container.querySelectorAll(".s-visualization-mock").length).toEqual(1);
    });

    it("should dispatch visualization properties changed from pushData", () => {
        const pushDataMock = { properties: { bucketType: "abc" } };
        const { dispatched } = renderComponent({}, { pushDataMock });

        fireEvent.click(screen.getByText("push"));

        expect(dispatched()).toEqual([visualizationPropertiesChanged({ bucketType: "abc" }, false)]);
    });

    it("should dispatch visualization properties initialized from pushData", () => {
        const pushDataMock = { initialProperties: { supportedProperties: { foo: "bar" } } };
        const { dispatched } = renderComponent({}, { pushDataMock });

        fireEvent.click(screen.getByText("push"));

        expect(dispatched()).toEqual([
            visualizationPropertiesInitialized({ supportedProperties: { foo: "bar" } }),
        ]);
    });

    it("should dispatch visualization properties meta changed from pushData", () => {
        // an opaque token: the component passes propertiesMeta through without reading it
        const propertiesMeta = "abc" as unknown as IPropertiesMetaState;
        const pushDataMock = { propertiesMeta };
        const { dispatched } = renderComponent({}, { pushDataMock });

        fireEvent.click(screen.getByText("push"));

        expect(dispatched()).toEqual([visualizationPropertiesMetaChanged(propertiesMeta)]);
    });

    it("should dispatch openAsReportToggled", () => {
        const pushDataMock: IPushData = {
            openAsReport: {
                supported: true,
            },
        };
        const { dispatched } = renderComponent({}, { pushDataMock });

        fireEvent.click(screen.getByText("push"));

        expect(dispatched()).toEqual([openAsReportToggled({ supported: true })]);
    });

    it("should dispatch visualizationPropertiesChanged when extended reference point changed", () => {
        const onExtendedReferencePointChangedMock: IExtendedReferencePoint = {
            properties: { abc: 1 },
            buckets: [],
            filters: {
                localIdentifier: "filters",
                items: [],
            },
            uiConfig: null,
        };
        const { dispatched } = renderComponent({}, { onExtendedReferencePointChangedMock });

        fireEvent.click(screen.getByText("refPoint"));

        expect(dispatched()).toEqual([
            visualizationPropertiesChanged({ abc: 1 }, true),
            uiExtendedReferencePointChanged(onExtendedReferencePointChangedMock, undefined),
        ]);
    });

    it("should dispatch reportExecutionFinished and reportExecutionWarning", () => {
        const pushDataMock: IPushData = {
            dataView: {
                data: null,
                offset: [],
                count: [],
                totalCount: [],
                headerItems: null,
                definition: null,
                result: null,
                equals: vi.fn(),
                fingerprint: vi.fn(),
                metadata: {
                    dataSourceMessages: [],
                    limitBreaks: [{ limitType: "xtab-rows", limit: 60000, value: 70000 }],
                },
                forecast(): IForecastView {
                    return {
                        headerItems: [],
                        low: [],
                        high: [],
                        prediction: [],
                    } as IForecastView;
                },
                clustering(): IClusteringResult {
                    return {
                        attribute: [],
                        clusters: [],
                        xcoord: [],
                        ycoord: [],
                    };
                },
                outliers(): IOutliersView {
                    return {
                        headerItems: [],
                        anomalies: [],
                        loading: false,
                    };
                },
                withOutliers(_config: IOutliersConfig, _result?: IOutliersResult): IDataView {
                    return this;
                },
                withClustering(_config: IClusteringConfig, _result: IClusteringResult): IDataView {
                    return this;
                },
                withForecast(_config: IForecastConfig, _result?: IForecastResult): IDataView {
                    return this;
                },
                readCollectionItems(): Promise<ICollectionItemsResult> {
                    return Promise.resolve({
                        type: "FeatureCollection",
                        features: [],
                        bbox: undefined,
                    });
                },
            },
        };
        const { dispatched } = renderComponent({}, { pushDataMock });

        fireEvent.click(screen.getByText("push"));

        const finished = actionsOfType(dispatched(), reportExecutionFinished.type);
        expect(finished).toHaveLength(1);
        expect(finished[0].payload).toEqual(pushDataMock.dataView.result);

        const warnings = actionsOfType(dispatched(), reportExecutionWarning.type);
        expect(warnings).toHaveLength(1);
        expect(warnings[0].payload).toEqual({
            limitBreaks: [{ limitType: "xtab-rows", limit: 60000, value: 70000 }],
        });
    });

    it("should not dispatch reportExecutionWarning when dataView has no limit breaks", () => {
        const pushDataMock: IPushData = {
            dataView: {
                result: null,
                metadata: {
                    dataSourceMessages: [],
                },
            } as unknown as IDataView,
        };
        const { dispatched } = renderComponent({}, { pushDataMock });

        fireEvent.click(screen.getByText("push"));

        expect(actionsOfType(dispatched(), reportExecutionWarning.type)).toHaveLength(0);
    });

    it("should dispatch reportExecutionStarted", () => {
        const { dispatched } = renderComponent({}, { onLoadingChangedMock: { isLoading: true } });

        fireEvent.click(screen.getByText("loading"));

        expect(actionsOfType(dispatched(), reportExecutionStarted.type)).toHaveLength(1);
    });

    it("should not dispatch reportExecutionStarted", () => {
        const { dispatched } = renderComponent({}, { onLoadingChangedMock: { isLoading: false } });

        fireEvent.click(screen.getByText("loading"));

        expect(actionsOfType(dispatched(), reportExecutionStarted.type)).toHaveLength(0);
    });

    it("should dispatch reportExecutionFailed when error occurs", () => {
        const onErrorMock = new InvalidBucketsSdkError();
        const { dispatched } = renderComponent({}, { onErrorMock });

        fireEvent.click(screen.getByText("error"));

        const failed = actionsOfType(dispatched(), reportExecutionFailed.type);
        expect(failed).toHaveLength(1);
        expect(failed[0].payload).toEqual({
            responseData: null,
            status: "INVALID_BUCKETS",
        });
    });

    it.each([[new UnexpectedSdkError()], [new GeoLocationMissingSdkError()], [new GeoAreaMissingSdkError()]])(
        "should dispatch reportExecutionFailed with %s",
        (onErrorMock: GoodDataSdkError) => {
            const { dispatched } = renderComponent({}, { onErrorMock });

            fireEvent.click(screen.getByText("error"));

            const failed = actionsOfType(dispatched(), reportExecutionFailed.type);
            expect(failed).toHaveLength(1);
            expect(failed[0].payload).toEqual({
                responseData: null,
                status: onErrorMock.seType,
            });
        },
    );

    it("should propagate feature flags into VisualizationGeneric instance", () => {
        const expectedFeatureFlags = {
            testFeatureFlag: true,
            disabledFeatureFlag: false,
        };
        const { container } = renderComponent({ featureFlags: expectedFeatureFlags });
        const featureFlags = JSON.parse(container.querySelector("#feature-flags").textContent);
        expect(featureFlags).toEqual(expectedFeatureFlags);
    });

    it("should propagate dateFormat into VisualizationGeneric instance", () => {
        const { container } = renderComponent({ dateFormat: "MM/dd/yyyy" });
        const dateFormat = container.querySelector("#date-format").textContent;
        expect(dateFormat).toEqual("MM/dd/yyyy");
    });

    it("should propagate newDerivedBucketItems into VisualizationGeneric instance", () => {
        const newDerivedBucketItem = {
            localIdentifier: "m1",
            masterLocalIdentifier: "m2",
        };

        const { container } = renderComponent({
            newDerivedBucketItems: [newDerivedBucketItem],
        });

        const newDerivedBucketItems = JSON.parse(
            container.querySelector("#new-derived-bucket-items").textContent,
        );
        expect(newDerivedBucketItems).toEqual([newDerivedBucketItem]);
    });

    it("should set empty default newDerivedBucketItems into VisGeneric instance when prop is undefined", () => {
        const { container } = renderComponent();
        const newDerivedBucketItems = JSON.parse(
            container.querySelector("#new-derived-bucket-items").textContent,
        );
        expect(newDerivedBucketItems).toEqual([]);
    });

    it("should dispatch exportResultReady", () => {
        const exportResultFunction: IExportFunction = vi.fn();
        const { dispatched } = renderComponent({}, { onExportReadyMock: exportResultFunction });

        fireEvent.click(screen.getByText("export"));

        expect(dispatched()).toEqual([exportResultReady(exportResultFunction)]);
    });

    it("should dispatch onSortingChanged", () => {
        const { dispatched } = renderComponent({}, { onSortingChangedMock: attributeSortConfig });

        fireEvent.click(screen.getByText("sorting"));

        expect(dispatched()).toEqual([updateChartSortConfig(attributeSortConfig)]);
    });

    it("should hand the visualization a COPY of the stored properties meta", () => {
        // sdk-ui-ext's controlsHelper does `set(propertiesMeta, "undoApplied", false)` on the prop
        // before pushing it back, and the stored value is frozen by immer — passing it straight
        // through would throw.
        const storedMeta = Object.freeze({ undoApplied: true });
        let received: IPluggableVisualizationProps["visualizationPropertiesMeta"];
        function CaptureMock({ visualizationPropertiesMeta }: IPluggableVisualizationProps) {
            received = visualizationPropertiesMeta;
            return <div />;
        }

        renderComponent({
            visualizationPropertiesMeta: storedMeta,
            visualizationGenericComponent: CaptureMock,
        });

        expect(received).toEqual({ undoApplied: true });
        expect(received).not.toBe(storedMeta);
        expect(() => set(received, "undoApplied", false)).not.toThrow();
        expect(storedMeta.undoApplied).toBe(true);
    });
});
