// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { AttributeFilterV2 } from "@gooddata/sdk-ui-filters";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const staticElements = [
    { title: "Cat", uri: "/cat" },
    { title: "Dog", uri: "/dog" },
    { title: "Horse", uri: "/horse" },
    { title: "Duck", uri: "/duck" },
    { title: "Mouse", uri: "/mouse" },
];

export class AttributeFilterStaticElementsExample extends Component {
    public onApply = (...params: any[]): void => {
        // eslint-disable-next-line no-console
        console.log("AttributeFilterStaticElementsExample onApply", ...params);
    };

    public render() {
        return (
            <div>
                <div>Attribute filter with static elements</div>
                <AttributeFilterV2
                    filter={newPositiveAttributeFilter(Md.EmployeeName.Default, { values: ["Dog"] })}
                    staticElements={staticElements}
                    onApply={this.onApply}
                />
            </div>
        );
    }
}

export default AttributeFilterStaticElementsExample;
