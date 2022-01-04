// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { modifyMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import { ExampleWithExport } from "./ExampleWithExport";
import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) => m.format("#,##0"));

const filters = [newAbsoluteDateFilter(Md.DateDatasets.Date, "2017-01-01", "2017-12-31")];

const style = { display: "flex" };

export const HeadlineExportExample: React.FC = () => {
    return (
        <ExampleWithExport filters={filters}>
            {(onExportReady) => (
                <div className="s-headline" style={style}>
                    <Headline
                        primaryMeasure={FranchiseFees}
                        secondaryMeasure={FranchiseFeesAdRoyalty}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};

export default HeadlineExportExample;
