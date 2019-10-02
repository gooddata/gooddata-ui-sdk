// (C) 2019 GoodData Corporation
import React, { useState } from "react";
import { InsightView } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

const InsightViewDemo: React.FC<{
    backend: IAnalyticalBackend;
    workspace: string;
}> = props => {
    const [visId, setVisId] = useState("abgkddfHcFon");

    return (
        <div style={{ height: 450 }}>
            <label htmlFor="insight-identifier">Insight identifier: </label>
            <input id="insight-identifier" value={visId} onChange={e => setVisId(e.target.value)} />
            <InsightView
                backend={props.backend}
                id={visId}
                workspace={props.workspace}
                visualizationProps={{
                    custom: {
                        drillableItems: [
                            {
                                identifier: "label.method.method",
                            },
                        ],
                    },
                    dimensions: {
                        height: 300,
                    },
                }}
                onDrill={e => {
                    console.log("Drilled", e);
                }}
            />
        </div>
    );
};

export default InsightViewDemo;
