// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { LdmExt } from "../../ldm";

const config = {
    enableCompactSize: true,
};

export const HeadlineResponsiveExample: React.FC = () => {
    const primaryMeasure = LdmExt.FranchiseFees;
    const secondaryMeasure = LdmExt.FranchiseFeesAdRoyalty;

    return (
        <>
            <div className="s-headline" style={{ display: "flex" }}>
                <style jsx>
                    {`
                        .column {
                            flex: "1 1 50%";
                        }
                    `}
                </style>
                <div style={{ height: 120, width: 150 }} className="column">
                    <Headline
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        config={config}
                    />
                </div>

                <div style={{ height: 220, width: 150, marginLeft: "30px" }} className="column">
                    <Headline
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        config={config}
                    />
                </div>

                <div style={{ height: 220, width: 180, marginLeft: "30px" }} className="column">
                    <Headline
                        primaryMeasure={primaryMeasure}
                        secondaryMeasure={secondaryMeasure}
                        config={config}
                    />
                </div>
            </div>
        </>
    );
};
