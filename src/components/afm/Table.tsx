// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { SortableTable } from "../core/SortableTable";

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier),
        },
        {
            itemIdentifiers: afm.measures && afm.measures.length > 0 ? ["measureGroup"] : [],
        },
    ];
}

/**
 * AFM Table
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const Table: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider(
    SortableTable,
    generateDefaultDimensions,
    "Table",
);
