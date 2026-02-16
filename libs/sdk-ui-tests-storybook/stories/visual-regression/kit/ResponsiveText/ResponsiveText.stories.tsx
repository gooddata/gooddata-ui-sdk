// (C) 2019-2026 GoodData Corporation

import { useState } from "react";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./ResponsiveText.css";

const shortText = "Short text fits the container 75% window width + default(max) from parent";
const longText =
    "Text that must fit the container that is set to be 75% wide of the window width and respect the default(max) font size from parent";

function ResponsiveTextExamples() {
    const widths = [300, 400, 500];

    return (
        <div className="screenshot-target">
            {widths.map((width) => (
                <div key={width} className="responsive-text-wrapper" style={{ width }}>
                    <ResponsiveText>
                        Pretty long text that must change its size to fit the {width}px container.
                    </ResponsiveText>
                </div>
            ))}

            <div className="responsive-text-wrapper responsive-text-relative-wrapper">
                <ResponsiveText
                    tagName="p"
                    tagClassName="responsive-text-purple"
                    title="Some helpful text, for example, the same text that is displayed by the component for
                            better readability in the case the text would be rendered too small."
                    windowResizeRefreshDelay={10}
                >
                    Text that must fit the container that is set to be 75% wide of the window width.
                </ResponsiveText>
            </div>
        </div>
    );
}

function ResponsiveTextDynamicExamples() {
    const [className, setClassName] = useState("responsive-text-purple");

    const [text, setText] = useState(shortText);

    return (
        <div className="screenshot-target">
            <button
                className="s-change-class"
                onClick={() =>
                    className === "responsive-text-purple"
                        ? setClassName("responsive-text-small")
                        : setClassName("responsive-text-purple")
                }
            >
                Change Class
            </button>
            <button
                className="s-change-text"
                onClick={() => (text === shortText ? setText(longText) : setText(shortText))}
            >
                Change Text
            </button>
            <div className="responsive-text-wrapper responsive-text-relative-wrapper">
                <ResponsiveText
                    tagName="p"
                    tagClassName={className}
                    title="Some helpful text, for example, the same text that is displayed by the component for
                            better readability in the case the text would be rendered too small."
                    windowResizeRefreshDelay={10}
                >
                    {text}
                </ResponsiveText>
            </div>
        </div>
    );
}

export default {
    title: "12 UI Kit/ResponsiveText",
};

export function FullFeatured() {
    return <ResponsiveTextExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Dynamic() {
    return <ResponsiveTextDynamicExamples />;
}
Dynamic.parameters = {
    kind: "dynamic",
    screenshots: {
        default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        "tagClassName prop change": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-change-class" }],
            delay: {
                postOperation: 200,
            },
        },
        "children prop change": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-change-text" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<ResponsiveTextExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
