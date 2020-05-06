// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui";
import { Ldm } from "../../ldm";

export class AttributeFilterComponentExample extends Component {
    onApply(...params) {
        console.log("AttributeFilterComponentExample onApply", ...params);
    }

    render() {
        return (
            <div>
                <AttributeFilter
                    identifier={Ldm.EmployeeName.Default}
                    fullscreenOnMobile={false}
                    onApply={this.onApply}
                />
            </div>
        );
    }
}

export default AttributeFilterComponentExample;
