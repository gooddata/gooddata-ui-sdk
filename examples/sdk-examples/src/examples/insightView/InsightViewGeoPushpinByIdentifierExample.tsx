// (C) 2007-2018 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";

import { Ldm } from "../../md";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

export const InsightViewGeoPushpinByIdentifierExample: React.FC = () => {
    return (
        <div style={{ height: 600, position: "relative" }} className="s-insightView-geo">
            <InsightView
                insight={Ldm.Insights.GeoPushpinChart}
                config={{
                    mapboxToken: MAPBOX_TOKEN,
                }}
            />
        </div>
    );
};
