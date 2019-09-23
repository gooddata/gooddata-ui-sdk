// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { LoadingComponent } from "@gooddata/react-components";

export class CustomisedLoadingComponentExample extends Component {
    render() {
        return (
            <LoadingComponent
                className="s-customised-loading"
                color="tomato"
                height={300}
                imageHeight={16}
                speed={2}
            />
        );
    }
}

export default CustomisedLoadingComponentExample;
