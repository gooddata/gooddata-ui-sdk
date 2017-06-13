import * as React from 'react';
import * as sdk from 'gooddata';
import isEqual = require('lodash/isEqual');
import get = require('lodash/get');
import { Afm, DataTable, SimpleExecutorAdapter, Transformation } from '@gooddata/data-layer';

import { IDataTable } from '../interfaces/DataTable';
import { ISimpleExecutorResult } from '../interfaces/SimpleExecutorResult';
import {
    DATA_TOO_LARGE_TO_COMPUTE,
    BAD_REQUEST,
    UNKNOWN_ERROR,
    NO_DATA
} from '../constants/errorStates';

export interface IExecuteProps {
    afm: Afm.IAfm;
    transformation?: Transformation.ITransformation;
    projectId: string;
    // TODO: Use proper interface
    onExecute: (result: Object) => void;
    onError: (error: Object) => void;
    onLoading: (state: boolean) => void;
    dataTableFactory?: IDataTableFactory;
    className?: string;
}

export type IDataTableFactory = (projectId: string) => IDataTable;

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

export class Execute extends React.Component<IExecuteProps, undefined> {
    public static defaultProps: Partial<IExecuteProps> = {
        dataTableFactory
    };

    private dataTable: IDataTable;

    public constructor(props) {
        super(props);

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

    public shouldComponentUpdate(nextProps) {
        return this.hasPropsChanged(nextProps, ['afm', 'transformation', 'children']);
    }

    public render() {
        return (
            <span className={this.props.className}>{this.props.children}</span>
        );
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

    private runExecution(props) {
        const { afm, transformation, onExecute, onError, onLoading } = props;

        this.props.onLoading(true);

        execute(this.dataTable, afm, transformation)
            .then((data) => {
                if ((data as ISimpleExecutorResult).isEmpty) {
                    onError({ status: NO_DATA });
                } else {
                    onExecute(data);
                }
            })
            .catch((error) => {
                const status = get(error, 'response.status');
                if (status === 413) {
                    return onError({ status: DATA_TOO_LARGE_TO_COMPUTE, error });
                }
                if (status === 400) {
                    return onError({ status: BAD_REQUEST, error });
                }
                onError({ status: UNKNOWN_ERROR, error });
            })
            .then(() => onLoading(false));
    }
}
