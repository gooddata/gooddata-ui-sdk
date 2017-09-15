import * as React from 'react';
import * as sdk from 'gooddata';
import get = require('lodash/get');
import identity = require('lodash/identity');
import isEqual = require('lodash/isEqual');
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';
import { Afm, DataTable, SimpleExecutorAdapter, Transformation, ExecutorResult } from '@gooddata/data-layer';

import { IDataTable } from '../interfaces/DataTable';
import { ErrorStates } from '../constants/errorStates';
import { IEvents } from '../interfaces/Events';

export type IDataTableFactory = (projectId: string) => IDataTable;

export interface IExecuteProps extends IEvents {
    afm: Afm.IAfm;
    transformation?: Transformation.ITransformation;
    projectId: string;
    children?: any;
    dataTableFactory?: IDataTableFactory; // only for tests
}

export interface IExecuteState {
    result: ExecutorResult.ISimpleExecutorResult;
}

function execute(
    dataTable: IDataTable,
    afm: Afm.IAfm,
    transformation: Transformation.ITransformation = {}
): Promise<Object> {
    return dataTable.execute(afm, transformation);
}

function dataTableFactory(projectId): IDataTable {
    const adapter = new SimpleExecutorAdapter(sdk, projectId);
    return new DataTable(adapter);
}

export class Execute extends React.Component<IExecuteProps, IExecuteState> {
    public static defaultProps: Partial<IExecuteProps> = {
        dataTableFactory
    };

    private dataTable: IDataTable;
    private subscription: Subscription;
    private subject: Subject<Promise<Object>>;

    public constructor(props) {
        super(props);

        this.state = {
            result: null
        };

        const { onError, onLoadingChanged } = props;

        this.subject = new Subject();
        this.subscription = this.subject
        // Unwraps values from promise and ensures that the latest result is returned
        // Used to be called `flatMapLatest`
            .switchMap<Promise<Object>, Object>(identity)

            .subscribe(
                (result) => {
                    if (result && (result as ExecutorResult.ISimpleExecutorResult).isEmpty) {
                        onError({ status: ErrorStates.NO_DATA });
                    } else {
                        this.setState({ result });
                    }
                    onLoadingChanged({ isLoading: false });
                },
                (error) => {
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
                }
            );

        this.dataTable = props.dataTableFactory(props.projectId);
    }

    public componentDidMount() {
        this.runExecution(this.props);
    }

    public componentWillReceiveProps(nextProps) {
        if (this.hasPropsChanged(nextProps, ['afm', 'transformation'])) {
            this.runExecution(nextProps);
        }
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
        this.subject.unsubscribe();
    }

    public shouldComponentUpdate(nextProps, nextState) {
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

    private isPropChanged(nextProps, propName) {
        if (propName === 'children') {
            return nextProps.children !== this.props.children;
        }

        return !isEqual(nextProps[propName], this.props[propName]);
    }

    private hasPropsChanged(nextProps, propNames) {
        return propNames.some(propName => this.isPropChanged(nextProps, propName));
    }

    private runExecution(props: IExecuteProps) {
        const { afm, transformation, onLoadingChanged } = props;

        onLoadingChanged({ isLoading: true });

        const promise = execute(this.dataTable, afm, transformation);

        this.subject.next(promise);
    }
}
