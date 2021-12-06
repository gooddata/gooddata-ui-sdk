// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { measureIdentifier } from "@gooddata/sdk-model";

import { MdExt } from "../../../md";
import { useOnDrillExample } from "./useOnDrillExample";

const primaryMeasure = MdExt.FranchiseFees;

const secondaryMeasure = MdExt.FranchiseFeesAdRoyalty;

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
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        onDrill={onDrill}
                        drillableItems={[
                            {
                                identifier: measureIdentifier(MdExt.FranchisedSales)!,
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
