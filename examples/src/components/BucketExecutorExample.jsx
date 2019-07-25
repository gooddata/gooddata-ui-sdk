// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from "react";
import propTypes from "prop-types";
import { BucketExecutor, ErrorComponent, Model } from "@gooddata/react-components";

import { totalSalesIdentifier, projectId, locationStateDisplayFormIdentifier } from "../utils/fixtures";

const commonStyles = {
    minHeight: 60,
    margin: "10px 0",
    fontSize: 30,
    lineHeight: "1em",
    verticalAlign: "bottom",
    fontWeight: 700,
};

const CustomErrorComponent = ({ code, message, getPage }) => {
    return (
        <div>
            <ErrorComponent code={code} message={message} />
            <p>
                Code: {code} | Message: {message}
            </p>
            <p>
                <button
                    onClick={() => getPage({ offset: [0, 0], limit: [1, 1] })}
                    className="button button-action s-retry-button"
                >
                    Retry
                </button>
            </p>
        </div>
    );
};
CustomErrorComponent.defaultProps = {
    code: null,
};
CustomErrorComponent.propTypes = {
    code: propTypes.string,
    message: propTypes.string.isRequired,
    getPage: propTypes.func.isRequired,
};

const presets = {
    kpi: {
        props: {
            dimensions: [[Model.measure(totalSalesIdentifier)]],
        },
        label: "KPI",
        // eslint-disable-next-line react/prop-types
        DataComponent: ({ result }) => {
            return (
                <p
                    className="s-bucket-executor-kpi"
                    style={{
                        ...commonStyles,
                        whiteSpace: "nowrap",
                    }}
                >
                    {result.data[0]}
                </p>
            );
        },
    },
    attributeValueList: {
        props: {
            dimensions: [[Model.attribute(locationStateDisplayFormIdentifier)]],
        },
        label: "List of States",
        // eslint-disable-next-line react/prop-types
        DataComponent: ({ result }) => {
            return (
                <p className="s-bucket-executor-kpi" style={commonStyles}>
                    {result.headerItems[0][0].map(header => header.attributeHeaderItem.name).join(", ")}
                </p>
            );
        },
    },
    pagedExecution: {
        props: {
            dimensions: [
                [Model.attribute(locationStateDisplayFormIdentifier)],
                [Model.measure(totalSalesIdentifier)],
            ],
            initialPaging: {
                offset: [0, 0],
                limit: [1, 1],
            },
        },
        label: "Paged execution",
        // eslint-disable-next-line react/prop-types
        DataComponent: ({ result, getPage }) => {
            const isLastPage = result.paging.offset[0] + result.paging.count[0] >= result.paging.total[0];
            const isFirstPage = result.paging.offset[0] === 0;
            const prevOffset = [result.paging.offset[0] - result.paging.count[0], 0];
            const nextOffset = [result.paging.offset[0] + result.paging.count[0], 0];
            const oneRowOneColumnLimit = [1, 1];
            return (
                <div
                    className="s-bucket-executor-kpi"
                    style={{
                        ...commonStyles,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        minHeight: "3em",
                    }}
                >
                    {result.headerItems[0][0].map(header => header.attributeHeaderItem.name).join(", ")}
                    <br />
                    {result.data[0][0]}
                    <div>
                        <button
                            disabled={isFirstPage}
                            onClick={() => getPage({ offset: prevOffset, limit: oneRowOneColumnLimit })}
                            className={`button button-action s-retry-button ${isFirstPage ? "disabled" : ""}`}
                        >
                            Previous
                        </button>
                        <button
                            disabled={isLastPage}
                            onClick={() => getPage({ offset: nextOffset, limit: oneRowOneColumnLimit })}
                            className={`button button-action s-retry-button ${isLastPage ? "disabled" : ""}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            );
        },
    },
    onDemandExecution: {
        props: {
            dimensions: [[Model.measure(totalSalesIdentifier)]],
            autoLoadFirstPage: false,
            ErrorComponent: CustomErrorComponent,
        },
        label: "On Demand Execution",
        // eslint-disable-next-line react/prop-types
        DataComponent: ({ result, getPage }) => {
            return (
                <div
                    className="s-bucket-executor-kpi"
                    style={{
                        ...commonStyles,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        minHeight: "3em",
                    }}
                >
                    {result ? result.data[0] : <p>No data</p>}
                    <div>
                        <button
                            onClick={() => getPage({ offset: [0, 0], limit: [1, 1] })}
                            className="button button-action s-retry-button"
                        >
                            Get Data
                        </button>
                        <button
                            // This paging settings is invalid and will cause an error
                            onClick={() => getPage({ offset: [-10, -10], limit: [-1, -1] })}
                            className="button button-action s-retry-button"
                        >
                            Get Error
                        </button>
                    </div>
                </div>
            );
        },
    },
    error: {
        props: {
            // Invalid measure identifier will cause an error
            dimensions: [[Model.measure("invalid")]],
            ErrorComponent: CustomErrorComponent,
        },
        label: "Error",
        DataComponent: () => null,
    },
};

export class BucketExecutorExample extends Component {
    state = { selectedPresetKey: Object.keys(presets)[0] };

    setPreset = selectedPresetKey => {
        this.setState({
            selectedPresetKey,
        });
    };

    render() {
        const { selectedPresetKey } = this.state;
        const { props: presetProps, DataComponent } = presets[selectedPresetKey];

        return (
            <div>
                {/*
                    We need to render the Execute component even in loading
                    otherwise the ongoing request is cancelled
                */}
                <p>
                    {Object.keys(presets).map(presetKey => {
                        const preset = presets[presetKey];
                        return (
                            <button
                                key={presetKey}
                                onClick={() => this.setPreset(presetKey)}
                                className="button button-action s-retry-button"
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </p>
                <BucketExecutor projectId={projectId} {...presetProps}>
                    {childrenProps => {
                        const { result, response, isLoading, error } = childrenProps;
                        return (
                            <div>
                                {<DataComponent {...childrenProps} />}
                                <p>Full execution response and result as JSON:</p>
                                <div
                                    style={{
                                        padding: "1rem",
                                        backgroundColor: "#EEE",
                                    }}
                                >
                                    <pre
                                        style={{
                                            maxHeight: 200,
                                            overflow: "auto",
                                            padding: "1rem",
                                        }}
                                    >
                                        {JSON.stringify({ response, result, isLoading, error }, null, "  ")}
                                    </pre>
                                </div>
                            </div>
                        );
                    }}
                </BucketExecutor>
            </div>
        );
    }
}

export default BucketExecutorExample;
