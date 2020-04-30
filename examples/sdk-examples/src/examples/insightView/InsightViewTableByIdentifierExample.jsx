// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";

import { workspace, tableInsightViewIdentifier } from "../../constants/fixtures";

export class InsightViewTable extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-insightView-table">
                <InsightView
                    workspace={workspace}
                    identifier={tableInsightViewIdentifier}
                    // TODO: SDK8 Decide whether add dimesion prop to InsightView
                    // config={{
                    //     menu: {
                    //         aggregations: true,
                    //     },
                    // }}
                />
            </div>
        );
    }
}

export default InsightViewTable;
