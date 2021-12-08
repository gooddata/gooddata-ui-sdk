// (C) 2007-2021 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { measureIdentifier, modifyMeasure } from "@gooddata/sdk-model";

import { Md } from "../../../md";
import { useOnDrillExample } from "./useOnDrillExample";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);

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
