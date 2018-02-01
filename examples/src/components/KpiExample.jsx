import React, { Component } from 'react';
import { Kpi } from '@gooddata/react-components';
import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, projectId } from '../utils/fixtures';

export class KpiExample extends Component {
    render() {
        return (
            <div className="kpi">
                <style jsx>{`
                    height: 60px;
                    margin: 10px 0;
                    font-size: 50px;
                    line-height: 60px;
                    white-space: nowrap;
                    vertical-align: bottom;
                    font-weight: 700;
                `}</style>
                <span className="kpi-value">
                    <Kpi
                        projectId={projectId}
                        measure={totalSalesIdentifier}
                    />
                </span>
            </div>
        );
    }
}

export default KpiExample;
