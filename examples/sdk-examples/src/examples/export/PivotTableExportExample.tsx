// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttributeSort, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { ExampleWithExport } from "./ExampleWithExport";
import { Md, MdExt } from "../../md";

const measures = [
    MdExt.FranchiseFees,
    MdExt.FranchiseFeesAdRoyalty,
    MdExt.FranchiseFeesInitialFranchiseFee,
    MdExt.FranchiseFeesOngoingRoyalty,
];

const attributes = [Md.LocationState, Md.LocationName.Default, MdExt.MenuCategory];

const columns = [Md.DateQuarter, Md.DateMonth.Short];

const sortBy = [newAttributeSort("menu", "asc")];

const filters = [newAbsoluteDateFilter(Md.DateDatasets.Date, "2017-01-01", "2017-12-31")];

const style = { height: 300 };

export const PivotTableExportExample: React.FC = () => {
    return (
        <ExampleWithExport filters={filters}>
            {(onExportReady) => (
                <div style={style} className="s-pivot-table-sorting">
                    <PivotTable
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        pageSize={20}
                        sortBy={sortBy}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};
