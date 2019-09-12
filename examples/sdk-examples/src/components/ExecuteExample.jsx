// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from "react";
import { Execute, LoadingComponent, ErrorComponent } from "@gooddata/react-components";

import { totalSalesIdentifier, projectId } from "../utils/fixtures";

export class ExecuteExample extends Component {
    constructor(props) {
        super(props);

        // We need to track error and isLoading states, executionNumber to force remount of execution component
        this.state = {
            executionNumber: 0,
            willFail: true,
        };
        this.onLoadingChanged = this.onLoadingChanged.bind(this);
        this.onError = this.onError.bind(this);
        this.retry = this.retry.bind(this);
    }

    onLoadingChanged({ isLoading }) {
        // eslint-disable-next-line no-console
        console.log("isLoading", isLoading);
    }

    onError(error) {
        // eslint-disable-next-line no-console
        console.log("onError", error);
    }

    retry() {
        // eslint-disable-next-line no-console
        console.log("retry");
        // We need to track executionNumber so that we can remount Execute component
        // In order to showcase error states, here we also decide if the next execution will fail or not
        this.setState({
            executionNumber: this.state.executionNumber + 1,
            willFail: this.state.executionNumber % 2,
        });
    }

    executeChildrenFunction = retry => ({ result, isLoading, error }) => {
        const retryButton = (
            <p>
                <button onClick={retry} className="gd-button gd-button-action s-retry-button">
                    Retry
                </button>
                &ensp;(fails every second attempt)
            </p>
        );

        if (error) {
            return (
                <div>
                    {retryButton}
                    <div className="gd-message error">
                        <div className="gd-message-text">Oops, simulated error! Retry?</div>
                    </div>
                    <ErrorComponent
                        message="There was an error getting your execution"
                        description={JSON.stringify(error, null, "  ")}
                    />
                </div>
            );
        }
        if (isLoading) {
            return (
                <div>
                    <div className="gd-message progress">
                        <div className="gd-message-text">Loading…</div>
                    </div>
                    <LoadingComponent />
                </div>
            );
        }
        return (
            <div>
                <style jsx>{`
                    .kpi {
                        height: 60px;
                        margin: 10px 0;
                        font-size: 50px;
                        line-height: 60px;
                        white-space: nowrap;
                        vertical-align: bottom;
                        font-weight: 700;
                    }
                `}</style>
                {retryButton}
                <p className="kpi s-execute-kpi">{result.executionResult.data[0]}</p>
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
                        {JSON.stringify({ result, isLoading, error }, null, "  ")}
                    </pre>
                </div>
            </div>
        );
    };

    render() {
        const { executionNumber, willFail } = this.state;
        const afm = {
            measures: [
                {
                    localIdentifier: "measure",
                    definition: {
                        measure: {
                            item: {
                                // In order to showcase the fail state, we send invalid measure uri
                                identifier: willFail ? totalSalesIdentifier : null,
                            },
                        },
                    },
                },
            ],
        };

        return (
            <div>
                {/*
                    We need to render the Execute component even in loading
                    otherwise the ongoing request is cancelled
                */}
                <Execute
                    key={executionNumber}
                    afm={afm}
                    projectId={projectId}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                >
                    {this.executeChildrenFunction(this.retry)}
                </Execute>
            </div>
        );
    }
}

export default ExecuteExample;
