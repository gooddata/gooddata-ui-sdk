// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { Execute, LoadingComponent, ErrorComponent, IExecuteErrorComponentProps } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

interface IExecuteExampleState {
    executionNumber: number;
    willFail: boolean;
}

const CustomErrorComponent = ({ error }: IExecuteErrorComponentProps) => (
    <div>
        <div className="gd-message error">
            <div className="gd-message-text">Oops, simulated error! Retry?</div>
        </div>
        <ErrorComponent
            message="There was an error getting your execution"
            description={JSON.stringify(error, null, 2)}
        />
    </div>
);

const CustomLoadingComponent = () => (
    <div>
        <div className="gd-message progress">
            <div className="gd-message-text">Loading…</div>
        </div>
        <LoadingComponent />
    </div>
);

const ExecuteExample: React.FC = () => {
    const [{ willFail }, setState] = useState<IExecuteExampleState>({
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

    return (
        <div>
            <p>
                <button onClick={retry} className="gd-button gd-button-action s-retry-button">
                    Retry
                </button>
                &ensp;(fails every second attempt)
            </p>
            <Execute
                seriesBy={[measure]}
                ErrorComponent={CustomErrorComponent}
                LoadingComponent={CustomLoadingComponent}
            >
                {({ result }) => {
                    const measureSeries = result!.data().series().firstForMeasure(measure);
                    const measureResult = measureSeries?.dataPoints()[0].formattedValue();

                    return (
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
                            <p className="kpi s-execute-kpi">{measureResult}</p>
                        </div>
                    );
                }}
            </Execute>
        </div>
    );
};

export default ExecuteExample;
