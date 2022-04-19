// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { LoadingComponent, ErrorComponent, useExecutionDataView } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

interface IUseDataViewExample {
    executionNumber: number;
    willFail: boolean;
}

const UseExecutionDataViewExample: React.FC = () => {
    const [{ willFail }, setState] = useState<IUseDataViewExample>({
        executionNumber: 0,
        willFail: false,
    });

    const retry = () => {
        setState(({ executionNumber }) => {
            const nextExecutionNumber = executionNumber + 1;
            return {
                executionNumber: nextExecutionNumber,
                willFail: nextExecutionNumber % 2 !== 0,
            };
        });
    };

    const measure = willFail ? newMeasure("thisDoesNotExits") : Md.$TotalSales;
    const seriesBy = [measure];
    const { result, error, status } = useExecutionDataView({ execution: { seriesBy } });

    const measureSeries = result?.data().series().firstForMeasure(measure);

    const retryButton = (
        <p>
            <button onClick={retry} className="gd-button gd-button-action s-retry-button">
                Retry
            </button>
            &ensp;(fails every second attempt)
        </p>
    );

    return (
        <div>
            {status === "error" && (
                <div>
                    {retryButton}
                    <div className="gd-message error">
                        <div className="gd-message-text">Oops, simulated error! Retry?</div>
                    </div>
                    <ErrorComponent
                        message="There was an error getting your execution"
                        description={JSON.stringify(error, null, 2)}
                    />
                </div>
            )}
            {status === "loading" && (
                <div>
                    <div className="gd-message progress">
                        <div className="gd-message-text">Loading…</div>
                    </div>
                    <LoadingComponent />
                </div>
            )}
            {status === "success" && (
                <div>
                    <style jsx>
                        {`
                            .kpi {
                                height: 60px;
                                margin: 10px 0;
                                font-size: 50px;
                                line-height: 60px;
                                white-space: nowrap;
                                vertical-align: bottom;
                                font-weight: 700;
                            }
                        `}
                    </style>
                    {retryButton}
                    <p className="kpi s-execute-kpi">{measureSeries?.dataPoints()[0].formattedValue()}</p>
                </div>
            )}
        </div>
    );
};

export default UseExecutionDataViewExample;
