// (C) 2007-2022 GoodData Corporation
import React from "react";
import { OnLoadingChanged, OnError } from "@gooddata/sdk-ui";
import { Headline, IComparison } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));

const comparisonConfig: IComparison = {
    enabled: true,
    format: "$#,##0.00",
    isArrowEnabled: true,
    colorConfig: {
        positive: {
            type: "rgb",
            value: { r: 191, g: 64, b: 191 },
        },
        negative: {
            type: "guid",
            value: "negative",
        },
        equals: {
            type: "guid",
            value: "equals",
        },
    },
};

export const HeadlineExample: React.FC = () => {
    const onLoadingChanged: OnLoadingChanged = () => {
        // handle the callback here
    };

    const onError: OnError = () => {
        // handle the callback here
    };

    return (
        <div className="s-headline" style={{ display: "flex" }}>
            <style jsx>
                {`
                    .headline-container {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-around;
                        align-content: space-around;
                        gap: 10px;
                        width: 100%;
                    }
                    .headline-column {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        align-items: center;
                        padding: 10px;
                        margin: 5px 0;
                        max-width: 100%;
                        min-height: 205px;
                        border: 1px solid #ccd8e2;
                        border-radius: 6px;
                        box-sizing: border-box;
                        box-shadow: 0 2px 10px 0 #0000001a;
                    }
                    .headline-column > span {
                        font-size: 15px;
                        font-weight: 600;
                        margin: 5px;
                        padding: 5px;
                        text-align: center;
                        color: #94a1ad;
                    }
                `}
            </style>

            <div className="headline-container">
                <div className="headline-column">
                    <span>One measure</span>
                    <Headline
                        primaryMeasure={FranchiseFees}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                </div>
                <div className="headline-column">
                    <span>Two measures</span>
                    <Headline
                        primaryMeasure={FranchiseFees}
                        secondaryMeasures={[FranchiseFeesAdRoyalty]}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                </div>
                <div className="headline-column">
                    <span>Three measures</span>
                    <Headline
                        primaryMeasure={FranchiseFees}
                        secondaryMeasures={[FranchiseFeesAdRoyalty, Md.$FranchisedSales]}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                </div>
                <div className="headline-column">
                    <span>Positive comparison</span>
                    <Headline
                        primaryMeasure={FranchiseFees}
                        secondaryMeasures={[FranchiseFeesAdRoyalty]}
                        config={{
                            comparison: comparisonConfig,
                        }}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                </div>
                <div className="headline-column">
                    <span>Negative comparison</span>
                    <Headline
                        primaryMeasure={FranchiseFeesAdRoyalty}
                        secondaryMeasures={[FranchiseFees]}
                        config={{
                            comparison: {
                                ...comparisonConfig,
                                labelConfig: {
                                    unconditionalValue: "Down",
                                },
                            },
                        }}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                </div>
            </div>
        </div>
    );
};

export default HeadlineExample;
