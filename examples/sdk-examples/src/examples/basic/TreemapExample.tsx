// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Treemap } from "@gooddata/sdk-ui-charts";
import { Md, MdExt } from "../../md";

const style = { height: 300 };

export const TreemapExample: React.FC = () => {
    return (
        <div style={style} className="s-tree-map">
            <Treemap
                measures={[MdExt.numberOfChecks]}
                viewBy={Md.LocationState}
                segmentBy={Md.LocationCity}
            />
        </div>
    );
};
