// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import get = require("lodash/get");
import noop = require("lodash/noop");
import { AFM } from "@gooddata/typings";
import { DataLayer } from "@gooddata/gooddata-js";
import { PureTable, ITableProps } from "./PureTable";
import { IDataSourceProviderInjectedProps } from "../afm/DataSourceProvider";
import { IPushData } from "../../interfaces/PushData";

export interface ISortableTableState {
    sortItems: AFM.SortItem[];
}

export class SortableTable extends React.Component<
    ITableProps & IDataSourceProviderInjectedProps,
    ISortableTableState
> {
    public static defaultProps: Partial<ITableProps> = {
        pushData: noop,
    };

    constructor(props: ITableProps & IDataSourceProviderInjectedProps) {
        super(props);

        this.state = {
            sortItems: [],
        };

        this.handlePushData = this.handlePushData.bind(this);
    }

    public componentWillReceiveProps(nextProps: ITableProps & IDataSourceProviderInjectedProps): void {
        if (!DataLayer.ResultSpecUtils.isSortValid(nextProps.dataSource.getAfm(), this.state.sortItems[0])) {
            this.setState({ sortItems: [] });
        }
    }

    public handlePushData(pushedData: IPushData): void {
        const sortItems = get(pushedData, "properties.sortItems");

        if (sortItems) {
            // TODO save sortItems together with some resultSpec fingerprint
            // GoodData.UI case
            // 1. click on header -> sort
            // 2. change programatically sort in resultSpec
            // 3. Local state overrides new sort in resultSpec -> wrong
            this.setState({
                sortItems,
            });
        }

        this.props.pushData(pushedData);
    }

    public render() {
        return (
            <PureTable
                {...this.props}
                pushData={this.handlePushData}
                resultSpec={DataLayer.ResultSpecUtils.applySorting(
                    this.props.resultSpec,
                    this.state.sortItems,
                )}
            />
        );
    }
}
