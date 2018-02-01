import React, { Component } from 'react';
import '@gooddata/react-components/styles/css/main.css';
import { Visualization } from '@gooddata/react-components';

import { projectId, columnVisualizationIdentifier } from '../utils/fixtures';

export class VisualizationColumnChart extends Component {
    render() {
        return (
            <div style={{ height: 300 }} >
                <Visualization
                    projectId={projectId}
                    identifier={columnVisualizationIdentifier}
                />
            </div>
        );
    }
}

export default VisualizationColumnChart;
