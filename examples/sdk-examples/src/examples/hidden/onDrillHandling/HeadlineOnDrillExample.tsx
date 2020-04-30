// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { newMeasure } from "@gooddata/sdk-model";

import { franchiseFeesIdentifier, franchiseFeesAdRoyaltyIdentifier } from "../../../constants/fixtures";
import { useOnDrillExample } from "./useOnDrillExample";

const primaryMeasure = newMeasure(franchiseFeesIdentifier, m => m.format("#,##0").localId("m1"));

const secondaryMeasure = newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0").localId("m2"));

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
                                identifier: franchiseFeesIdentifier,
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
