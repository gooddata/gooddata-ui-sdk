import React, { Component } from 'react';
import '@gooddata/react-components/styles/css/main.css';
import { Visualization } from '@gooddata/react-components';

import { projectId, columnVisualizationIdentifier } from '../utils/fixtures';
import { Loading } from './Loading';
import { Error } from './Error';

export class VisualizationColumnChart extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-visualization-chart" >
                <Visualization
                    projectId={projectId}
                    identifier={columnVisualizationIdentifier}
                    LoadingComponent={Loading}
                    ErrorComponent={Error}
                />
            </div>
        );
    }
}

export default VisualizationColumnChart;
