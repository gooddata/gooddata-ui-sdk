// (C) 2020 GoodData Corporation
import React from "react";
import { Input, InputWithNumberFormat } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

class FormExamples extends React.PureComponent {
    public state = {
        dots: "",
        inputWithNumberFormat: "",
    };
    private interval: number | undefined = undefined;

    componentDidMount() {
        this.interval = window.setInterval(() => {
            this.setState({
                dots: this.state.dots.length >= 15 ? "" : `${this.state.dots}...`,
            });
        }, 3000);
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    render() {
        return (
            <div className="library-component screenshot-target">
                <h4>Textfield with clear icon</h4>
                <p>
                    You can also clear the field by <code>Escape</code>
                </p>

                <Input value="Hello!" clearOnEsc />

                <h4>Searchfield with placeholder and autofocus</h4>

                <Input
                    onChange={(val) => console.log(val)} // eslint-disable-line no-console
                    placeholder="Search attributes..."
                    clearOnEsc
                    isSearch
                    autofocus
                />

                <h4>Controlled input</h4>

                <Input value={this.state.dots} />

                <h4>Small input</h4>

                <Input isSmall maxlength={5} />

                <h4>ReadOnly input</h4>

                <Input value="Read only!" readonly />

                <h4>Disabled input</h4>

                <Input disabled />

                <h4>Text field with label</h4>
                <Input label="Input with label on top" labelPositionTop />

                <Input label="Input with default label" />

                <h4>Text field with prefix and/or suffix</h4>
                <p>Just a simple textfield with prefix and/or suffix</p>

                <Input prefix="+420" />

                <Input suffix="@gooddata.com" />

                <Input prefix="$" suffix="M" />

                <h4>Input with number formating</h4>
                <div>value: {this.state.inputWithNumberFormat}</div>
                <InputWithNumberFormat
                    value={this.state.inputWithNumberFormat}
                    onChange={(value) => this.setState({ inputWithNumberFormat: value })}
                />

                <h4>Radios and checkboxes</h4>

                <label className="input-radio-label">
                    <input type="radio" className="input-radio" />
                    <span className="input-label-text">Radio</span>
                </label>

                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox" />
                    <span className="input-label-text">Checkbox</span>
                </label>

                <br />

                <label className="input-radio-label">
                    <input type="radio" className="input-radio" defaultChecked />
                    <span className="input-label-text">Radio checked</span>
                </label>

                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox" defaultChecked />
                    <span className="input-label-text">Checkbox checked</span>
                </label>

                <br />

                <label className="input-radio-label">
                    <input type="radio" className="input-radio" disabled />
                    <span className="input-label-text">Radio disabled</span>
                </label>

                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox" disabled />
                    <span className="input-label-text">Checkbox disabled</span>
                </label>

                <br />

                <label className="input-radio-label">
                    <input type="radio" className="input-radio" disabled checked />
                    <span className="input-label-text">Radio checked disabled</span>
                </label>

                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox" disabled checked />
                    <span className="input-label-text">Checkbox checked disabled</span>
                </label>

                <br />

                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox checkbox-indefinite" />
                    <span className="input-label-text">Checkbox indefinite</span>
                </label>

                <label className="input-checkbox-label">
                    <input type="checkbox" className="input-checkbox checkbox-indefinite" disabled checked />
                    <span className="input-label-text">Checkbox indefinite disabled</span>
                </label>

                <h4>Toggle</h4>
                <label className="input-checkbox-toggle">
                    <input type="checkbox" />
                    <span className="input-label-text">Toggle</span>
                </label>

                <br />

                <label className="input-checkbox-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="input-label-text">Toggle checked</span>
                </label>

                <br />

                <label className="input-checkbox-toggle">
                    <input type="checkbox" disabled />
                    <span className="input-label-text">Disabled toggle</span>
                </label>

                <br />

                <label className="input-checkbox-toggle">
                    <input type="checkbox" disabled checked />
                    <span className="input-label-text">Disabled checked toggle</span>
                </label>
            </div>
        );
    }
}

storiesOf(`${UiKit}/Form`)
    .add("full-featured", () => <FormExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<FormExamples />), { screenshot: true });
