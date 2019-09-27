// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { useState } from "react";
import { Executor, LoadingComponent, ErrorComponent, Model } from "@gooddata/sdk-ui";
import get from "lodash/get";

import { totalSalesIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../backend";

interface IExecuteExampleState {
    executionNumber: number;
    willFail: boolean;
}

const resultStyle = {
    maxHeight: 200,
    maxWidth: "100%",
    overflow: "auto",
    padding: "1rem",
    backgroundColor: "#EEE",
};

export const ExecuteExample: React.FC = () => {
    const backend = useBackend();
    const [{ willFail, executionNumber }, setState] = useState<IExecuteExampleState>({
        executionNumber: 0,
        willFail: true,
    });

    const measure = Model.measure(willFail ? totalSalesIdentifier : null).localIdentifier("measure");

    const execution = backend
        .workspace(projectId)
        .execution()
        .forItems([measure]);

    return (
        <div>
            <Executor execution={execution}>
                {({ error, fetch, isLoading, result }) => {
                    const retry = () => {
                        fetch();
                        setState({
                            executionNumber: executionNumber + 1,
                            willFail: executionNumber % 2 ? true : false,
                        });
                    };

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
                    if (isLoading || !result) {
                        return (
                            <div>
                                <div className="gd-message progress">
                                    <div className="gd-message-text">Loading…</div>
                                </div>
                                <LoadingComponent />
                            </div>
                        );
                    }

                    const data = get(result.data(), [0, 0]);
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
                            <p className="kpi s-execute-kpi">{data}</p>
                            <p>Full execution response and result as JSON:</p>
                            <pre style={resultStyle}>
                                {JSON.stringify({ result, isLoading, error }, null, 2)}
                            </pre>
                        </div>
                    );
                }}
            </Executor>
        </div>
    );
};
