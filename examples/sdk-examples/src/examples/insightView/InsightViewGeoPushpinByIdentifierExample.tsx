// (C) 2007-2021 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";

import * as Md from "../../md/full";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

export const InsightViewGeoPushpinByIdentifierExample: React.FC = () => {
    return (
        <div style={{ height: 600, position: "relative" }} className="s-insightView-geo">
            <InsightView
                insight={Md.Insights.GeoPushpinChart}
                config={{
                    mapboxToken: MAPBOX_TOKEN,
                }}
            />
        </div>
    );
};
