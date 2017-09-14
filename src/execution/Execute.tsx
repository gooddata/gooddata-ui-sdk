import * as React from 'react';
import * as GoodData from 'gooddata';
import get = require('lodash/get');
import isEqual = require('lodash/isEqual');
import { Afm, DataTable, SimpleExecutorAdapter, Transformation } from '@gooddata/data-layer';

import { ErrorStates } from '../constants/errorStates';
import { IEvents } from '../interfaces/Events';

export type IDataTableFactory = (projectId: string) => DataTable<GoodData.ISimpleExecutorResult>;

export interface IExecuteProps extends IEvents {
    afm: Afm.IAfm;
    transformation?: Transformation.ITransformation;
    projectId: string;
    children?: any;
    dataTableFactory?: IDataTableFactory; // only for tests
}

export interface IExecuteState {
    result: GoodData.ISimpleExecutorResult;
}

function dataTableFactory(projectId: string): DataTable<GoodData.ISimpleExecutorResult> {
    return new DataTable(new SimpleExecutorAdapter(GoodData, projectId));
}

export class Execute extends React.Component<IExecuteProps, IExecuteState> {
    public static defaultProps: Partial<IExecuteProps> = {
        dataTableFactory
    };

    private dataTable: DataTable<GoodData.ISimpleExecutorResult>;

    public constructor(props: IExecuteProps) {
        super(props);

        this.state = {
            result: null
        };

        const { onError, onLoadingChanged } = props;

        this.dataTable = props.dataTableFactory(props.projectId);
        this.dataTable.onData((result) => {
            if (result && (result as GoodData.ISimpleExecutorResult).isEmpty) {
                onError({ status: ErrorStates.NO_DATA });
            } else {
                this.setState({ result });
            }
            onLoadingChanged({ isLoading: false });
        });

        this.dataTable.onError((error) => {
            const status = get(error, 'response.status');
            if (status === 413) {
                onLoadingChanged({ isLoading: false });
                return onError({ status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE, error });
            }
            if (status === 400) {
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
        if (this.hasPropsChanged(nextProps, ['afm', 'transformation'])) {
            this.runExecution(nextProps);
        }
    }

    public shouldComponentUpdate(nextProps: IExecuteProps, nextState: IExecuteState) {
        return !isEqual(this.state.result, nextState.result) ||
            this.hasPropsChanged(nextProps, ['afm', 'transformation', 'children']);
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
        const { afm, transformation, onLoadingChanged } = props;

        onLoadingChanged({ isLoading: true });

        this.dataTable.getData(afm, transformation);
    }
}
