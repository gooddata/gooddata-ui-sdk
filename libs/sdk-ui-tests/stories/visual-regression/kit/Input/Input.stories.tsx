// (C) 2020-2025 GoodData Corporation
import React from "react";
import { Input } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

class AutofocsExamples extends React.PureComponent {
    public state = {
        autofocus1: false,
    };

    render() {
        return (
            <div className="library-component">
                <h4>Input without autofocus</h4>

                <Input
                    onChange={(val) => console.log(val)} // eslint-disable-line no-console
                    placeholder="Search attributes..."
                    autofocus={this.state.autofocus1}
                />
                <button onClick={() => this.setState({ autofocus1: !this.state.autofocus1 })}>
                    {this.state.autofocus1 ? "Turn off autofocus" : "Turn on autofocus"}
                </button>

                <h4>Input with autofocus</h4>
                <Input
                    onChange={(val) => console.log(val)} // eslint-disable-line no-console
                    placeholder="Search attributes..."
                    autofocus
                />

                <h4>Hidden input with autofocus</h4>
                <p>
                    This show <code>console.warn</code> messsage after some time because autofocus is not
                    possible!
                </p>
                <div style={{ display: "none" }}>
                    <Input
                        onChange={(val) => console.log(val)} // eslint-disable-line no-console
                        placeholder="Search attributes..."
                        autofocus
                    />
                </div>
            </div>
        );
    }
}

export default {
    title: "12 UI Kit/Input",
};

export const Autofocus = () => <AutofocsExamples />;
Autofocus.parameters = { kind: "autofocus" };
