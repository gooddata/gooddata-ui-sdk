import * as React from 'react';
import * as numeral from 'numeral';
import get = require('lodash/get');
import noop = require('lodash/noop');
import { Afm, Filters } from '@gooddata/data-layer';

import { Execute } from '../../execution/Execute';
import { IEvents } from '../../interfaces/Events';
import { kpiPropTypes } from '../../proptypes/Kpi';

export type URIString = string;

export interface IKpiProps extends IEvents {
    measure: URIString;
    projectId: string;
    filters?: Afm.IFilter[];
    format?: string;
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

export class Kpi extends React.Component<IKpiProps, null> {
    public static defaultProps: Partial<IKpiProps> = {
        format: '$0,0.00',
        filters: [],
        onError: defaultErrorHandler,
        onLoadingChanged: noop
    };

    static propTypes = kpiPropTypes;

    public getFormattedResult(result): string {
        return numeral(result).format(this.props.format);
    }

    public render() {
        const afm = buildAFM(this.props.measure, this.props.filters);

        return (
            <Execute
                afm={afm}
                projectId={this.props.projectId}
                onError={this.props.onError}
                onLoadingChanged={this.props.onLoadingChanged}
            >
                {result =>
                    <span className="gdc-kpi">{this.getFormattedResult(get(result, 'result.rawData.0.0'))}</span>
                }
            </Execute>
        );
    }
}
