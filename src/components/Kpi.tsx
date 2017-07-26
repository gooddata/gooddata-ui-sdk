import * as React from 'react';
import * as numeral from 'numeral';
import get = require('lodash/get');
import noop = require('lodash/noop');
import { Afm, Filters } from '@gooddata/data-layer';

import { Execute } from '../execution/Execute';
import { IEvents } from '../interfaces/Events';
import { kpiPropTypes } from '../proptypes/Kpi';

export type URIString = string;

export interface IKpiProps extends IEvents {
    measure: URIString;
    projectId: string;
    filters?: Afm.IFilter[];
    format?: string;
}

export interface IKpiState {
    error: boolean;
    result: any;
    isLoading: boolean;
}

function buildAFM(measureUri: string, filters: Afm.IFilter[] = []): Afm.IAfm {
    return {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: measureUri
                    }
                }
            }
        ],

        filters: filters.filter(Filters.isNotEmptyFilter)
    };
}

const defaultErrorHandler = (error) => {
    console.error(error);
};

export class Kpi extends React.Component<IKpiProps, IKpiState> {
    public static defaultProps: Partial<IKpiProps> = {
        format: '$0,0.00',
        filters: [],
        onError: defaultErrorHandler,
        onLoadingChanged: noop
    };

    static propTypes = kpiPropTypes;

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            result: null,
            isLoading: true
        };

        this.onError = this.onError.bind(this);
        this.onExecute = this.onExecute.bind(this);
        this.onLoading = this.onLoading.bind(this);
    }

    public onExecute(data) {
        const result = get(data, 'rawData.0.0');

        this.setState({ result, error: false });
    }

    public onError(error) {
        this.setState({ error: true });
        this.props.onError(error);
    }

    public onLoading(isLoading: boolean) {
        this.setState({ isLoading });
        this.props.onLoadingChanged({ isLoading });
    }

    public getFormattedResult(): string {
        return numeral(this.state.result).format(this.props.format);
    }

    public render() {
        if (this.state.error) {
            return null;
        }

        const afm = buildAFM(this.props.measure, this.props.filters);

        return (
            <Execute
                className="gdc-kpi"
                afm={afm}
                onError={this.onError}
                onExecute={this.onExecute}
                onLoading={this.onLoading}
                projectId={this.props.projectId}
            >
                {this.state.isLoading || this.getFormattedResult()}
            </Execute>
        );
    }
}
