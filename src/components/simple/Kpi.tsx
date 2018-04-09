// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { colors2Object, numberFormat } from '@gooddata/numberjs';
import noop = require('lodash/noop');
import { AFM, Execution } from '@gooddata/typings';
import { Filters, Uri } from '@gooddata/data-layer';

import { Execute, IExecuteChildrenProps, IExecuteProps, ILoadingStateProps } from '../../execution/Execute';
import { IEvents } from '../../interfaces/Events';
import { KpiPropTypes, Requireable } from '../../proptypes/Kpi';
import { isEmptyResult } from '../../helpers/errorHandlers';
import { ErrorStates } from '../../constants/errorStates';
export { Requireable };

export interface IKpiProps extends IEvents {
    measure: string;
    projectId: string;
    filters?: AFM.FilterItem[];
    format?: string;
    ExecuteComponent?: React.ComponentType<IExecuteProps>;
    LoadingComponent?: React.ComponentType<ILoadingStateProps>;
    ErrorComponent?: React.ComponentType<ILoadingStateProps>;
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

export class Kpi extends React.PureComponent<IKpiProps> {
    public static defaultProps: Partial<IKpiProps> = {
        format: '#,#.##',
        filters: [],
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        ExecuteComponent: Execute,
        LoadingComponent: null,
        ErrorComponent: null
    };

    public static propTypes = KpiPropTypes;

    public render() {
        const { ExecuteComponent, measure, filters, LoadingComponent, ErrorComponent, ...executeProps } = this.props;
        const afm = buildAFM(measure, filters);
        return (
            <ExecuteComponent
                afm={afm}
                resultSpec={resultSpec}
                {...executeProps}
            >
                {({ result, error, isLoading }: IExecuteChildrenProps) => {
                    if (error && error.status !== ErrorStates.OK) {
                        return ErrorComponent ? <ErrorComponent error={error} props={this.props} /> : null;
                    }
                    if (isLoading || !result) {
                        return LoadingComponent ? <LoadingComponent props={this.props} /> : null;
                    }
                    return (<span className="gdc-kpi">
                        {this.getFormattedResult(this.extractNumber(result))}
                    </span>);
                }}
            </ExecuteComponent>
        );
    }

    private getFormattedResult(num: number | string) {
        const formattedNumber = numberFormat(num, this.props.format);
        const { label, color, backgroundColor } = colors2Object(formattedNumber);
        return color ? <span style={{ color, backgroundColor }}>{label}</span> : label;
    }

    private extractNumber(result: Execution.IExecutionResponses) {
        if (isEmptyResult(result)) {
            return '';
        }
        return parseFloat(result.executionResult.executionResult.data[0].toString());
    }
}
