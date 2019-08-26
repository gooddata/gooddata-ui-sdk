// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { ErrorComponent } from "@gooddata/react-components";

export class ErrorComponentExample extends Component {
    render() {
        return (
            <ErrorComponent
                icon="icon-ghost"
                className="s-default-Error"
                message="This is an Custom Error"
                description="…with description."
                height={200}
            />
        );
    }
}

export default ErrorComponentExample;
