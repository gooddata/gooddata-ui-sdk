// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { idRef, newPositiveAttributeFilter, newNegativeAttributeFilter, uriRef } from "@gooddata/sdk-model";
import * as Md from "../../md/full";
import { workspace } from "../../constants/fixtures";

const EmployeeNameIdentifier = "label.employee.employeename";
const employeeNameDisplayFormUri = `/gdc/md/${workspace}/obj/2201`;
export class AttributeFilterComponentExample extends Component {
    public onApply = (...params: any[]): void => {
        // eslint-disable-next-line no-console
        console.log("AttributeFilterComponentExample onApply", ...params);
    };

    public render() {
        return (
            <div>
                <div>attribute defined by identifier</div>
                <AttributeFilter
                    filter={newPositiveAttributeFilter(idRef(EmployeeNameIdentifier), [])}
                    fullscreenOnMobile={false}
                    onApply={this.onApply}
                />
                <br />
                <div>attribute defined by display form uri</div>
                <AttributeFilter
                    filter={newNegativeAttributeFilter(uriRef(employeeNameDisplayFormUri), [])}
                    onApply={this.onApply}
                />
                <br />
                <div>attribute defined by filter definition, including selection</div>
                <AttributeFilter
                    filter={newPositiveAttributeFilter(Md.EmployeeName.Default, ["Abbie Adams"])}
                    onApply={this.onApply}
                />
            </div>
        );
    }
}

export default AttributeFilterComponentExample;
