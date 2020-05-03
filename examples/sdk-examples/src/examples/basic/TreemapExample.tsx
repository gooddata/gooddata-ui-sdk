// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Treemap } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const style = { height: 300 };

export const TreemapExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-tree-map">
            <Treemap
                backend={backend}
                workspace={workspace}
                measures={[LdmExt.numberOfChecks]}
                viewBy={Ldm.LocationState}
                segmentBy={Ldm.LocationCity}
            />
        </div>
    );
};
