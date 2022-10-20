// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import {
    idRef,
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    uriRef,
    IAttributeFilter,
} from "@gooddata/sdk-model";
import * as Md from "../../../md/full";
import { workspace } from "../../../constants/fixtures";

const employeeNameDisplayFormIdentifier = "label.employee.employeename";

export const AttributeFilterDefinedByIdentifier = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(idRef(employeeNameDisplayFormIdentifier), []),
    );

    return (
        <div>
            <h4>Attribute filter defined by the display form identifier</h4>
            <AttributeFilterButton
                filter={filter}
                onApply={(filter, isInverted) => {
                    // eslint-disable-next-line no-console
                    console.log("Applying selection...", { filter, isInverted });
                    setFilter(filter);
                }}
            />
        </div>
    );
};

// Note: Specifying the attribute display form by its uri
// is supported by GoodData Platform only (not GoodData Cloud or GoodData.CN).
// Uris can also differ across different workspaces,
// so using the attribute display form identifier should be always the preferred way.
const employeeNameDisplayFormUri = `/gdc/md/${workspace}/obj/2201`;

export const AttributeFilterDefinedByUri = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(uriRef(employeeNameDisplayFormUri), []),
    );

    return (
        <div>
            <h4>Attribute filter defined by the display form uri</h4>
            <AttributeFilterButton
                filter={filter}
                onApply={(filter, isInverted) => {
                    // eslint-disable-next-line no-console
                    console.log("Applying selection...", { filter, isInverted });
                    setFilter(filter);
                }}
            />
        </div>
    );
};

export const AttributeFilterDefinedByCatalogMd = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(Md.EmployeeName.Default, { values: ["Abbie Adams"] }),
    );

    return (
        <div>
            <h4>Attribute filter defined by the exported catalog attribute, with preselected elements</h4>
            <AttributeFilterButton
                filter={filter}
                onApply={(filter, isInverted) => {
                    // eslint-disable-next-line no-console
                    console.log("Applying selection...", { filter, isInverted });
                    setFilter(filter);
                }}
            />
        </div>
    );
};

export const AttributeFilterButtonBasicUsage = () => {
    return (
        <div>
            <AttributeFilterDefinedByIdentifier />
            <AttributeFilterDefinedByUri />
            <AttributeFilterDefinedByCatalogMd />
        </div>
    );
};

export default AttributeFilterButtonBasicUsage;
