// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from "react";
import { Kpi } from "@gooddata/react-components";
import "@gooddata/react-components/styles/css/main.css";

import { totalSalesIdentifier, projectId } from "../utils/fixtures";

export class KpiExample extends Component {
    render() {
        return (
            <div className="kpi">
                <style jsx>{`
                    .kpi {
                        margin: 10px 0;
                        font-size: 50px;
                        white-space: nowrap;
                        vertical-align: bottom;
                        text-align: center;
                        min-width: 300px;
                        line-height: 1.2em;
                        font-weight: 700;
                        width: 300px;
                    }
                `}</style>
                <Kpi projectId={projectId} measure={totalSalesIdentifier} />
            </div>
        );
    }
}

export default KpiExample;
