import * as React from 'react';
import noop = require('lodash/noop');
import { Afm, Sorting, Transformation } from '@gooddata/data-layer';
import TableTransformation from '@gooddata/indigo-visualizations/lib/Table/TableTransformation';

import { Execute } from '../execution/Execute';
import { IntlWrapper } from './base/IntlWrapper';
import { generateConfig } from '../helpers/config';
import { IEvents } from '../interfaces/Events';

export interface ITableProps extends IEvents {
    afm: Afm.IAfm;
    projectId: string;
    transformation?: Transformation.ITransformation;
}

export interface ITableState {
    error: boolean;
    result: any;
    isLoading: boolean;
    sorting: Transformation.ISort;
}

const defaultErrorHandler = (error) => {
    console.error(error);
};

export class Table extends React.Component<ITableProps, ITableState> {
    public static defaultProps: Partial<ITableProps> = {
        transformation: {},
        onError: defaultErrorHandler,
        onLoadingChanged: noop
    };

    private isUnmounted = false;

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            result: null,
            isLoading: true,
            sorting: null
        };

        this.onError = this.onError.bind(this);
        this.onExecute = this.onExecute.bind(this);
        this.onLoading = this.onLoading.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
    }

    public onExecute(data) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ result: data, error: false });
    }

    public onError(error) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ error: true });
        this.props.onError(error);
    }

    public onLoading(isLoading: boolean) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ isLoading });
        this.props.onLoadingChanged({ isLoading });
    }

    public onSortChange(change: Sorting.ISortingChange) {
        if (this.isUnmounted) {
            return;
        }

        this.setState({ sorting: Sorting.getSorting(change, this.state.sorting) });
    }

    public getComponent() {
        if (this.state.isLoading) {
            return null;
        }

        const { result } = this.state;

        return (
            <IntlWrapper>
                <TableTransformation
                    data={result}
                    config={generateConfig('table', this.props.afm, this.getTransformation(), {}, result.headers)}
                    onSortChange={this.onSortChange}
                />
            </IntlWrapper>
        );
    }

    public getTransformation(): Transformation.ITransformation {
        const { sorting } = this.state;
        const { transformation } = this.props;

        if (sorting) {
            return { ...transformation, sorting: [sorting] };
        }

        return transformation;
    }

    public componentWillUnmount() {
        this.isUnmounted = true;
    }

    public render() {
        const {
            afm,
            projectId
        } = this.props;

        if (this.state.error) {
            return null;
        }

        return (
            <Execute
                className={`gdc-table-chart`}
                afm={afm}
                transformation={this.getTransformation()}
                onError={this.onError}
                onExecute={this.onExecute}
                onLoading={this.onLoading}
                projectId={projectId}
            >
                {this.getComponent()}
            </Execute>
        );
    }
}
