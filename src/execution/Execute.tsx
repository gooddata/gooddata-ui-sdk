import * as React from 'react';
import * as GoodData from 'gooddata';
import isEqual = require('lodash/isEqual');
import noop = require('lodash/noop');
import { AFM, Execution } from '@gooddata/typings';
import { DataTable, ExecuteAfmAdapter, ErrorCodes } from '@gooddata/data-layer';

import { ErrorStates } from '../constants/errorStates';
import { IEvents } from '../interfaces/Events';
import { ExecutePropType, Requireable } from '../proptypes/Execute';

export { Requireable };

export type IDataTableFactory = (projectId: string) => DataTable<Execution.IExecutionResponses>;

export interface ILoadingStateProps {
    error?: object;
    props: object;
}

export interface IExecuteProps extends IEvents {
    afm: AFM.IAfm;
    resultSpec?: AFM.IResultSpec;
    projectId: string;
    children?: any;
    dataTableFactory?: IDataTableFactory; // only for tests
}

export interface IExecuteState {
    result: Execution.IExecutionResponses;
    isLoading: boolean;
    error: {
        status: string;
        response?: object;
    };
}

function dataTableFactory(projectId: string): DataTable<Execution.IExecutionResponses> {
    return new DataTable(new ExecuteAfmAdapter(GoodData, projectId));
}

export interface IExecuteChildrenProps {
    result: Execution.IExecutionResponses;
    error: {
        status: string;
        response?: object;
    };
    isLoading: boolean;
}

export class Execute extends React.Component<IExecuteProps, IExecuteState> {
    public static proptTypes = ExecutePropType;
    public static defaultProps: Partial<IExecuteProps> = {
        dataTableFactory,
        onError: noop,
        onLoadingChanged: noop
    };

    private dataTable: DataTable<Execution.IExecutionResponses>;

    public constructor(props: IExecuteProps) {
        super(props);

        this.state = {
            result: null,
            isLoading: true,
            error: null
        };

        const { onError, onLoadingChanged } = props;

        this.dataTable = props.dataTableFactory(props.projectId);
        this.dataTable.onData((result: Execution.IExecutionResponses) => {
            this.setState({
                result,
                isLoading: false
            });
            onLoadingChanged({ isLoading: false });
        });

        this.dataTable.onError((error: Execution.IError) => {
            const { status } = error.response;
            const newError = {
                status: ErrorStates.UNKNOWN_ERROR,
                error
            };
            if (status === ErrorCodes.HTTP_TOO_LARGE) {
                newError.status = ErrorStates.DATA_TOO_LARGE_TO_COMPUTE;
            } else if (status === ErrorCodes.HTTP_BAD_REQUEST) {
                newError.status = ErrorStates.BAD_REQUEST;
            }

            this.setState({
                result: null,
                isLoading: false,
                error: newError
            });
            onLoadingChanged({ isLoading: false });
            onError(newError);
        });
    }

    public componentWillMount() {
        this.runExecution(this.props);
    }

    public componentWillReceiveProps(nextProps: IExecuteProps) {
        if (this.hasPropsChanged(nextProps, ['afm', 'resultSpec'])) {
            this.runExecution(nextProps);
        }
    }

    public shouldComponentUpdate(nextProps: IExecuteProps, nextState: IExecuteState) {
        return !isEqual(this.state, nextState) ||
            this.hasPropsChanged(nextProps, ['afm', 'resultSpec', 'children']);
    }

    public render() {
        const { result, isLoading, error } = this.state;
        return this.props.children({ result, isLoading, error });
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

        this.setState({
            isLoading: true,
            result: null,
            error: null
        });

        onLoadingChanged({
            isLoading: true
        });

        this.dataTable.getData(afm, resultSpec);
    }
}
