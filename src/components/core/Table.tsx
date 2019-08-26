// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { PureTable, ITableProps } from "./PureTable";
import { SortableTable } from "./SortableTable";
import { IDataSourceProviderInjectedProps } from "../afm/DataSourceProvider";

export class Table extends React.PureComponent<ITableProps & IDataSourceProviderInjectedProps, null> {
    public render() {
        if (this.props.environment === "dashboards") {
            return <SortableTable {...this.props} />;
        }

        return <PureTable {...this.props} />;
    }
}
