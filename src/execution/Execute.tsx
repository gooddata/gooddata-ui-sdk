import * as React from 'react';
import * as GoodData from 'gooddata';
import isEqual = require('lodash/isEqual');
import { AFM, Execution } from '@gooddata/typings';
import { DataTable, ExecuteAfmAdapter, ErrorCodes } from '@gooddata/data-layer';

import { ErrorStates } from '../constants/errorStates';
import { IEvents } from '../interfaces/Events';

export type IDataTableFactory = (projectId: string) => DataTable<Execution.IExecutionResponses>;

export interface IExecuteProps extends IEvents {
    afm: AFM.IAfm;
    resultSpec?: AFM.IResultSpec;
    projectId: string;
    children?: any;
    dataTableFactory?: IDataTableFactory; // only for tests
}

export interface IExecuteState {
    result: Execution.IExecutionResponses;
}

function dataTableFactory(projectId: string): DataTable<Execution.IExecutionResponses> {
    return new DataTable(new ExecuteAfmAdapter(GoodData, projectId));
}

function isEmptyResult(response: Execution.IExecutionResponses): boolean {
    return response.executionResult === null;
}

export interface IExecuteChildrenProps {
    result: Execution.IExecutionResponses;
}

export class Execute extends React.Component<IExecuteProps, IExecuteState> {
    public static defaultProps: Partial<IExecuteProps> = {
        dataTableFactory
    };

    private dataTable: DataTable<Execution.IExecutionResponses>;

    public constructor(props: IExecuteProps) {
        super(props);

        this.state = {
            result: null
        };

        const { onError, onLoadingChanged } = props;

        this.dataTable = props.dataTableFactory(props.projectId);
        this.dataTable.onData((result: Execution.IExecutionResponses) => {
            if (isEmptyResult(result)) {
                onError({ status: ErrorStates.NO_DATA });
            } else {
                this.setState({ result });
            }
            onLoadingChanged({ isLoading: false });
        });

        this.dataTable.onError((error: Execution.IError) => {
            const { status } = error.response;
            if (status === ErrorCodes.HTTP_TOO_LARGE) {
                onLoadingChanged({ isLoading: false });
                return onError({ status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE, error });
            }
            if (status === ErrorCodes.HTTP_BAD_REQUEST) {
                onLoadingChanged({ isLoading: false });
                return onError({ status: ErrorStates.BAD_REQUEST, error });
            }
            onLoadingChanged({ isLoading: false });
            onError({ status: ErrorStates.UNKNOWN_ERROR, error });
        });
    }

    public componentDidMount() {
        this.runExecution(this.props);
    }

    public componentWillReceiveProps(nextProps: IExecuteProps) {
        if (this.hasPropsChanged(nextProps, ['afm', 'resultSpec'])) {
            this.runExecution(nextProps);
        }
    }

    public shouldComponentUpdate(nextProps: IExecuteProps, nextState: IExecuteState) {
        return !isEqual(this.state.result, nextState.result) ||
            this.hasPropsChanged(nextProps, ['afm', 'resultSpec', 'children']);
    }

    public render() {
        const { result } = this.state;
        if (!result) {
            return null;
        }
        return this.props.children({ result });
    }

    private isPropChanged(nextProps: IExecuteProps, propName: string) {
        if (propName === 'children') {
            return nextProps.children !== this.props.children;
        }

        return !isEqual(nextProps[propName], this.props[propName]);
    }

    private hasPropsChanged(nextProps: IExecuteProps, propNames: string[]) {
        return propNames.some(propName => this.isPropChanged(nextProps, propName));
    }

    private runExecution(props: IExecuteProps) {
        const { afm, resultSpec, onLoadingChanged } = props;

        onLoadingChanged({ isLoading: true });

        this.dataTable.getData(afm, resultSpec);
    }
}
