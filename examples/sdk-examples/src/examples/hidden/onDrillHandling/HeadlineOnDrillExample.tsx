// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { measureIdentifier, modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../../md/full";
import { useOnDrillExample } from "./useOnDrillExample";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

export const HeadlineOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-headline-on-drill">
            <div className="s-headline" style={{ display: "flex" }}>
                <style jsx>
                    {`
                        .column {
                            flex: "1 1 50%";
                        }
                    `}
                </style>
                <div className="column">
                    <Headline
                        primaryMeasure={FranchiseFees}
                        secondaryMeasure={FranchiseFeesAdRoyalty}
                        onDrill={onDrill}
                        drillableItems={[
                            {
                                identifier: measureIdentifier(FranchisedSales)!,
                            },
                        ]}
                    />
                </div>
            </div>
            {renderDrillEvent}
        </div>
    );
};

export default HeadlineOnDrillExample;
