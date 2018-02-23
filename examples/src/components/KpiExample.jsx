import React, { Component } from 'react';
import { Kpi } from '@gooddata/react-components';
import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, projectId } from '../utils/fixtures';
import { Loading } from './Loading';
import { Error } from './Error';

export class KpiExample extends Component {
    render() {
        return (
            <div className="kpi">
                <style jsx>
                    {`
                    height: 60px;
                    margin: 10px 0;
                    font-size: 50px;
                    white-space: nowrap;
                    vertical-align: bottom;
                    font-weight: 700;
                    `}
                </style>
                <span className="kpi-value">
                    <Kpi
                        projectId={projectId}
                        measure={totalSalesIdentifier}
                        LoadingComponent={Loading}
                        ErrorComponent={Error}
                    />
                </span>
            </div>
        );
    }
}

export default KpiExample;
