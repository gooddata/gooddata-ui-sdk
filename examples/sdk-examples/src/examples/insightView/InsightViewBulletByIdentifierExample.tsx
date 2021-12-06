// (C) 2007-2018 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { Ldm } from "../../md";

const style = { height: 300 };

export const InsightViewBulletByIdentifierExample: React.FC = () => {
    return (
        <div style={style} className="s-insightView-bubble">
            <InsightView insight={Ldm.Insights.BulletChart} />
        </div>
    );
};
