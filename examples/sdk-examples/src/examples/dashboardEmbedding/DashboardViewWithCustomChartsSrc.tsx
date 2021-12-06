// (C) 2007-2018 GoodData Corporation
import React from "react";
import { FilterContextItem, isKpiWidget } from "@gooddata/sdk-backend-spi";
import { DashboardView, useDashboardWidgetExecution } from "@gooddata/sdk-ui-ext";
import { idRef, newPositiveAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { useDataView, IErrorProps, ILoadingProps } from "@gooddata/sdk-ui";
import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { Md } from "../../md";

const dashboardRef = idRef("aeO5PVgShc0T");
const config = { mapboxToken: MAPBOX_TOKEN };
interface CustomWidgetProps {
    widgetRef: ObjRef;
    filters?: FilterContextItem[];
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

const customWidgetContainerStyle: React.CSSProperties = {
    padding: 5,
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
};

const CustomWidgetContainer: React.FC = ({ children }) => (
    <div style={customWidgetContainerStyle}>{children}</div>
);

const customTableHeaderStyle: React.CSSProperties = {
    textAlign: "center",
};
const customTableThStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 20px",
};
const customTableTdStyle: React.CSSProperties = {
    padding: "10px 20px",
};
const CustomTable: React.FC<CustomWidgetProps & { title: string }> = ({
    title: widgetTitle,
    widgetRef,
    filters,
    ErrorComponent,
    LoadingComponent,
}) => {
    const {
        result: execution,
        status: executionStatus,
        error: executionError,
    } = useDashboardWidgetExecution({
        dashboard: dashboardRef,
        widget: widgetRef,
        filters,
    });
    const {
        result: dataView,
        status: dataViewStatus,
        error: dataViewError,
    } = useDataView({ execution }, [execution?.fingerprint()]);

    const error = executionError ?? dataViewError;
    const statuses = [executionStatus, dataViewStatus];

    if (error) {
        return <ErrorComponent message={error.message} />;
    }
    if (statuses.some((status) => status === "loading")) {
        return <LoadingComponent />;
    }

    const measureDescriptors = dataView?.meta().measureDescriptors();
    const attributeDescriptors = dataView?.meta().attributeDescriptors();

    const slices = dataView?.data().slices().toArray();

    return (
        <CustomWidgetContainer>
            <h2 style={customTableHeaderStyle}>{widgetTitle}</h2>
            <table style={{ width: "100%" }}>
                <thead>
                    <tr>
                        {attributeDescriptors?.map((attrDesc) => (
                            <th key={attrDesc.attributeHeader.localIdentifier} style={customTableThStyle}>
                                {attrDesc.attributeHeader.name}
                            </th>
                        ))}
                        {measureDescriptors?.map((measureDesc) => (
                            <th
                                key={measureDesc.measureHeaderItem.localIdentifier}
                                style={customTableThStyle}
                            >
                                {measureDesc.measureHeaderItem.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {slices?.map((slice) => (
                        <tr key={slice.id}>
                            {slice.sliceTitles().map((title, i) => (
                                <td key={i} style={customTableTdStyle}>
                                    {title}
                                </td>
                            ))}
                            {slice.dataPoints().map((dataPoint, i) => (
                                <td key={i} style={customTableTdStyle}>
                                    {dataPoint.formattedValue()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </CustomWidgetContainer>
    );
};

const customKpiContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    fontSize: 17,
    textAlign: "center",
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "black",
    color: "white",
    width: "100%",
};
const customKpiHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 10px",
    width: "100%",
};
const customKpiHeaderTextStyle: React.CSSProperties = {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
};
const customKpiValueContainerStyle: React.CSSProperties = {
    fontSize: 24,
    lineHeight: "initial",
    padding: 7,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    backgroundColor: "#333",
};
const customKpiValueStyle: React.CSSProperties = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
};

const CustomKpi: React.FC<CustomWidgetProps> = ({ widgetRef, filters, ErrorComponent, LoadingComponent }) => {
    const {
        result: execution,
        status: executionStatus,
        error: executionError,
    } = useDashboardWidgetExecution({
        dashboard: dashboardRef,
        widget: widgetRef,
        filters,
    });
    const {
        result: dataView,
        status: dataViewStatus,
        error: dataViewError,
    } = useDataView({ execution }, [execution?.fingerprint()]);

    const error = executionError ?? dataViewError;
    const statuses = [executionStatus, dataViewStatus];
    const isLoading = statuses.some((s) => s === "loading");

    if (error) {
        return <ErrorComponent message={error.message} />;
    }
    if (isLoading) {
        return <LoadingComponent />;
    }

    const kpiMeasure = dataView?.meta().measureDescriptors()[0];
    const kpiValue =
        kpiMeasure &&
        dataView &&
        dataView
            .data()
            .series()
            .firstForMeasure(kpiMeasure.measureHeaderItem.localIdentifier)
            .dataPoints()[0]
            .formattedValue();

    return (
        <CustomWidgetContainer>
            <div style={customKpiContainerStyle}>
                <div style={customKpiHeaderStyle}>
                    <div style={customKpiHeaderTextStyle}>
                        {kpiMeasure &&
                            dataView &&
                            dataView
                                ?.data()
                                .series()
                                .firstForMeasure(kpiMeasure.measureHeaderItem.localIdentifier)
                                .measureTitle()}
                    </div>
                </div>
                <div style={customKpiValueContainerStyle}>
                    <span style={customKpiValueStyle} title={kpiValue ?? undefined}>
                        {kpiValue}
                    </span>
                </div>
            </div>
        </CustomWidgetContainer>
    );
};

const dashboardFilters = [
    newPositiveAttributeFilter(Md.LocationState, {
        uris: ["/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340116"],
    }),
];
const DashboardViewWithCustomCharts: React.FC = () => {
    return (
        <DashboardView
            dashboard={dashboardRef}
            config={config}
            filters={dashboardFilters}
            widgetRenderer={({
                renderedWidget,
                predicates,
                widget,
                filters,
                ErrorComponent,
                LoadingComponent,
            }) => {
                if (isKpiWidget(widget)) {
                    // Render all Kpi components with custom kpi component
                    return (
                        <CustomKpi
                            filters={filters}
                            widgetRef={widget.ref}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                        />
                    );
                } else if (predicates.isWidgetWithInsightType("table")) {
                    // Render all "table" insights with custom table component
                    return (
                        <CustomTable
                            title={widget.title}
                            widgetRef={widget.ref}
                            filters={filters}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                        />
                    );
                }

                // Render all other widgets in a common way, just wrap them with some component
                return <CustomWidgetContainer>{renderedWidget}</CustomWidgetContainer>;
            }}
            isReadOnly
        />
    );
};

export default DashboardViewWithCustomCharts;
