import * as React from 'react';
import { colors2Object, numberFormat } from '@gooddata/numberjs';
import noop = require('lodash/noop');
import { AFM, Execution } from '@gooddata/typings';
import { Filters, Uri } from '@gooddata/data-layer';

import { Execute, IExecuteChildrenProps } from '../../execution/Execute';
import { IEvents } from '../../interfaces/Events';
import { KpiPropTypes, Requireable } from '../../proptypes/Kpi';
import { isEmptyResult } from '../../helpers/errorHandlers';

export { Requireable };

export interface IKpiProps extends IEvents {
    measure: string;
    projectId: string;
    filters?: AFM.FilterItem[];
    format?: string;
    ExecuteComponent?: any;
}

function buildAFM(measure: string, filters: AFM.FilterItem[] = []): AFM.IAfm {
    const item = Uri.isUri(measure) ? { uri: measure } : { identifier: measure };

    return {
        measures: [
            {
                localIdentifier: 'm1',
                definition: {
                    measure: {
                        item
                    }
                }
            }
        ],
        filters: filters.filter(Filters.isNotEmptyFilter)
    };
}

const defaultErrorHandler = (error: object) => {
    console.error(error); // tslint:disable-line:no-console
};

const resultSpec: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: ['measureGroup']
        }
    ]
};

export class Kpi extends React.Component<IKpiProps, null> {
    public static defaultProps: Partial<IKpiProps> = {
        format: '#,#.##',
        filters: [],
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        ExecuteComponent: Execute
    };

    public static propTypes = KpiPropTypes;

    public render() {
        const { ExecuteComponent, measure, filters, projectId, onError, onLoadingChanged } = this.props;
        const afm = buildAFM(measure, filters);
        return (
            <ExecuteComponent
                afm={afm}
                resultSpec={resultSpec}
                projectId={projectId}
                onError={onError}
                onLoadingChanged={onLoadingChanged}
            >
                {(execProps: IExecuteChildrenProps) =>
                    <span className="gdc-kpi">
                        {this.getFormattedResult(this.extractNumber(execProps.result))}
                    </span>
                }
            </ExecuteComponent>
        );
    }

    private getFormattedResult(num: number | string) {
        const formattedNumber = numberFormat(num, this.props.format);
        const { label, color } = colors2Object(formattedNumber);
        return color ? <span style={{ color }}>{label}</span> : label;
    }

    private extractNumber(result: Execution.IExecutionResponses) {
        if (isEmptyResult(result)) {
            return '';
        }
        return parseFloat(result.executionResult.executionResult.data[0].toString());
    }
}
