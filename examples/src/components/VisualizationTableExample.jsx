import React, { Component } from 'react';
import '@gooddata/react-components/styles/css/main.css';
import { Visualization } from '@gooddata/react-components';

import { projectId, tableVisualizationIdentifier } from '../utils/fixtures';
import { Loading } from './utils/Loading';
import { Error } from './utils/Error';

export class VisualizationTableExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-visualization-table">
                <Visualization
                    projectId={projectId}
                    identifier={tableVisualizationIdentifier}
                    LoadingComponent={Loading}
                    ErrorComponent={Error}
                />
            </div>
        );
    }
}

export default VisualizationTableExample;
