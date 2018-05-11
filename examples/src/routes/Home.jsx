// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { Link } from 'react-router-dom';

import { version } from '../../../package.json';
import { projectId, backendUrlForInfo } from '../utils/fixtures';

import KpiExample from '../components/KpiExample';
import VisualizationTable from '../components/VisualizationTableExample';
import ColumnChartExample from '../components/ColumnChartExample';
import DynamicMeasuresExample from '../components/DynamicMeasuresExample';

export const Home = () => (
    <div>
        <h1>GoodData examples for React Components v{version}</h1>
        <p style={{ color: '#AAA', marginTop: -10 }}>Connected to &quot;{backendUrlForInfo}&quot; backend. Project id: {projectId}</p>

        <p>Here are the examples of <a href="https://github.com/gooddata/gooddata-react-components">GoodData React Components UI SDK</a>.</p>
        <p>Explore the top menu to see different use cases that feature sample code and interactive examples.</p>

        <hr className="separator" />

        <div className="showcase" >
            {/* language=CSS */}
            <style jsx>{`
                .showcase {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    grid-column-gap: 40px;
                    grid-row-gap: 40px;
                    justify-content: flex-start;
                }
                .span-line {
                    grid-column-start: 1;
                    grid-column-end: -1;
                }
            `}</style>
            <div>
                <h2><Link to="/kpi" >KPI</Link></h2>
                <KpiExample />
            </div>
            <div>
                <h2><Link to="/basic-components#column-chart" >Column Chart</Link></h2>
                <ColumnChartExample />
                <p><Link to="/basic-components">All basic component examples</Link></p>
            </div>
            <div>
                <h2><Link to="/visualization#table" >Table</Link></h2>
                <VisualizationTable />
                <p><Link to="/visualization">All visualization examples</Link></p>
            </div>
            <div className="span-line">
                <h2><Link to="/advanced/dynamic-measures" >Dynamic Measures (Advanced Use Case)</Link></h2>
                <DynamicMeasuresExample />
                <p><Link to="/advanced">More advanced use cases</Link></p>
            </div>
        </div>

        <hr className="separator" />
    </div>
);

export default Home;
