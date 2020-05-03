// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Heatmap } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const style = { height: 300 };

export const HeatmapExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-heat-map">
            <Heatmap
                backend={backend}
                workspace={workspace}
                measure={LdmExt.TotalSales1}
                rows={Ldm.LocationState}
                columns={Ldm.MenuCategory}
            />
        </div>
    );
};
