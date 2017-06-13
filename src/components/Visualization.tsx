import * as React from 'react';
import { toAFM, IAttributesMap } from '@gooddata/data-layer/dist/legacy/toAFM';
import { IVisualizationObject } from '@gooddata/data-layer/dist/legacy/model/VisualizationObject';

import { BaseChart, IChartConfig, ChartTypes } from './base/BaseChart';
import { Fetch } from '../fetching/Fetch';
import { Table } from './Table';
import { IEvents } from '../interfaces/Events';
import { getProjectIdByUri } from '../helpers/project';

export interface IVisualizationProps extends IEvents {
    uri: string;
    config?: IChartConfig;
}

export interface IVisualizationState {
    visObj?: IVisualizationObject;
    attributesMap?: IAttributesMap;
}

export class Visualization extends React.Component<IVisualizationProps, IVisualizationState> {
    constructor(props) {
        super(props);

        this.state = {};
        this.onData = this.onData.bind(this);
        this.onError = this.onError.bind(this);
    }

    public render() {
        const { uri } = this.props;

        return (
            <Fetch uri={uri} onData={this.onData} onError={this.onError}>
                {this.renderVisualization()}
            </Fetch>
        );
    }

    private onData({ visObj, attributesMap }) {
        this.setState({
            visObj: (visObj.visualization.content as IVisualizationObject),
            attributesMap
        });
    }

    private onError(error) {
        this.props.onError(error);
    }

    private renderVisualization() {
        if (this.state.visObj) {
            const { visObj, attributesMap } = this.state;

            const { type, afm, transformation } = toAFM(visObj, attributesMap);

            const projectId = getProjectIdByUri(this.props.uri);

            const { onError, onLoadingChanged } = this.props;

            switch (type) {
                case 'table':
                    return (
                        <Table
                            projectId={projectId}
                            afm={afm}
                            transformation={transformation}
                            onError={onError}
                            onLoadingChanged={onLoadingChanged}
                        />
                    );
                default:
                    return (
                        <BaseChart
                            type={type as ChartTypes}
                            projectId={projectId}
                            afm={afm}
                            transformation={transformation}
                            config={this.props.config}
                            onError={onError}
                            onLoadingChanged={onLoadingChanged}
                        />
                    );
            }
        }
    }
}
