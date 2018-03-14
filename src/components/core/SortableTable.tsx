// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import get = require('lodash/get');
import noop = require('lodash/noop');
import { AFM } from '@gooddata/typings';
import { ResultSpecUtils } from '@gooddata/data-layer';
import { PureTable, ITableProps } from './PureTable';

export interface ISortableTableState {
    sortItems: AFM.SortItem[];
}

export interface IPushData {
    properties?: {
        sotItems?: AFM.SortItem[];
    };
}

export class SortableTable extends React.Component<ITableProps, ISortableTableState> {
    public static defaultProps: Partial<ITableProps> = {
        pushData: noop
    };

    constructor(props: ITableProps) {
        super(props);

        this.state = {
            sortItems: []
        };

        this.handlePushData = this.handlePushData.bind(this);
    }

    public componentWillReceiveProps(nextProps: ITableProps): void {
        if (!ResultSpecUtils.isSortValid(nextProps.dataSource.getAfm(), this.state.sortItems[0])) {
            this.setState({ sortItems: [] });
        }
    }

    public handlePushData(pushedData: IPushData): void {
        const sortItems = get<IPushData, AFM.SortItem[]>(pushedData, 'properties.sortItems');

        if (sortItems) {
            // TODO save sortItems together with some resultSpec fingerprint
            // SDK case
            // 1. click on header -> sort
            // 2. change programatically sort in resultSpec
            // 3. Local state overrides new sort in resultSpec -> wrong
            this.setState({
                sortItems
            });
        }

        this.props.pushData(pushedData);
    }

    public render() {
        return (
            <PureTable
                {...this.props}
                pushData={this.handlePushData}
                resultSpec={ResultSpecUtils.applySorting(this.props.resultSpec, this.state.sortItems)}
            />
        );
    }
}
