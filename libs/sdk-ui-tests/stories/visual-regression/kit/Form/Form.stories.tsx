// (C) 2020-2025 GoodData Corporation

import { memo, useEffect, useState } from "react";

import { Input, InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

import { IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const FormExamples = memo(function FormExamples() {
    const [dots, setDots] = useState("");
    const [inputWithNumberFormat, setInputWithNumberFormat] = useState("");

    useEffect(() => {
        const interval = window.setInterval(() => {
            setDots((prevDots) => (prevDots.length >= 15 ? "" : `${prevDots}...`));
        }, 3000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    return (
        <div className="library-component screenshot-target">
            <h4>Textfield with clear icon</h4>
            <p>
                You can also clear the field by <code>Escape</code>
            </p>

            <Input value="Hello!" clearOnEsc />

            <h4>Search field with placeholder and autofocus</h4>

            <Input
                onChange={(val) => console.log(val)} // eslint-disable-line no-console
                placeholder="Search attributes..."
                clearOnEsc
                isSearch
                autofocus
            />

            <h4>Controlled input</h4>

            <Input value={dots} />

            <h4>Small input</h4>

            <Input isSmall maxlength={5} />

            <h4>ReadOnly input</h4>

            <Input value="Read only!" readonly />

            <h4>Disabled input</h4>

            <Input disabled />

            <h4>Input with error</h4>

            <Input hasError />

            <h4>Input with warning</h4>

            <Input hasWarning />

            <h4>Text field with label</h4>
            <Input label="Input with label on top" labelPositionTop />

            <Input label="Input with default label" />

            <h4>Text field with prefix and/or suffix</h4>
            <p>Just a simple textfield with prefix and/or suffix</p>

            <Input prefix="+420" />

            <Input suffix="@gooddata.com" />

            <Input prefix="$" suffix="M" />

            <h4>Input with number formating</h4>
            <div>value: {inputWithNumberFormat}</div>
            <InputWithNumberFormat
                value={inputWithNumberFormat}
                onChange={(value) => setInputWithNumberFormat(String(value))}
            />

            <h4>Large text field</h4>

            <label className="gd-input">
                <textarea className="gd-input-field" rows={3} />
            </label>

            <h4>Large text with error</h4>
            <label className="gd-input has-error">
                <textarea className="gd-input-field" rows={3} />
            </label>

            <h4>Large text with warning</h4>
            <label className="gd-input has-warning">
                <textarea className="gd-input-field" rows={3} />
            </label>

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
});

export default {
    title: "12 UI Kit/Form",
};

export function FullFeatured() {
    return <FormExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<FormExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
