import * as React from 'react';
import * as numeral from 'numeral';
import get = require('lodash/get');
import noop = require('lodash/noop');
import { Afm, Filters } from '@gooddata/data-layer';

import { Execute } from '../../execution/Execute';
import { IEvents } from '../../interfaces/Events';
import { KpiPropTypes, Requireable } from '../../proptypes/Kpi';

export { Requireable };

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

const defaultErrorHandler = (error: Object) => {
    console.error(error); // tslint:disable-line:no-console
};

export class Kpi extends React.Component<IKpiProps, null> {
    public static defaultProps: Partial<IKpiProps> = {
        format: '$0,0.00',
        filters: [],
        onError: defaultErrorHandler,
        onLoadingChanged: noop
    };

    public static propTypes = KpiPropTypes;

    public getFormattedResult(result: any): string {
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
                {
                    (result: any) =>
                        <span className="gdc-kpi">{this.getFormattedResult(get(result, 'result.rawData.0.0'))}</span>
                }
            </Execute>
        );
    }
}
