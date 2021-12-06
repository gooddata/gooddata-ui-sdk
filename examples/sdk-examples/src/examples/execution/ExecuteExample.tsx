// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { Execute, LoadingComponent, ErrorComponent } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";
import { MdExt } from "../../md";

interface IExecuteExampleState {
    executionNumber: number;
    willFail: boolean;
}

const CustomErrorComponent = ({ error }: { error: any }) => (
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

export const ExecuteExample: React.FC = () => {
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

    const retryButton = (
        <p>
            <button onClick={retry} className="gd-button gd-button-action s-retry-button">
                Retry
            </button>
            &ensp;(fails every second attempt)
        </p>
    );

    const measure = newMeasure(willFail ? "thisDoesNotExits" : MdExt.totalSalesIdentifier);
    const measureArray = [measure];

    return (
        <div>
            {retryButton}
            <Execute
                seriesBy={measureArray}
                ErrorComponent={CustomErrorComponent}
                LoadingComponent={CustomLoadingComponent}
            >
                {({ result }) => {
                    const measureSeries = result!.data().series().firstForMeasure(measure);

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
                            <p className="kpi s-execute-kpi">
                                {measureSeries?.dataPoints()[0].formattedValue()}
                            </p>
                        </div>
                    );
                }}
            </Execute>
        </div>
    );
};
