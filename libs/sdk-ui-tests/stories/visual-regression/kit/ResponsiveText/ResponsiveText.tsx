// (C) 2019-2020 GoodData Corporation
import React, { useState } from "react";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./ResponsiveText.css";

const shortText = "Short text fits the container 75% window width + default(max) from parent";
const longText =
    "Text that must fit the container that is set to be 75% wide of the window width and respect the default(max) font size from parent";

const ResponsiveTextExamples: React.FC = () => {
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
};

const ResponsiveTextDynamicExamples: React.FC = () => {
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
};

storiesOf(`${UiKit}/ResponsiveText`)
    .add("full-featured", () => <ResponsiveTextExamples />, { screenshot: true })
    .add("dynamic", () => <ResponsiveTextDynamicExamples />, {
        screenshots: {
            default: {},
            "tagClassName prop change": {
                clickSelectors: [".s-change-class"],
                postInteractionWait: 200,
            },
            "children prop change": {
                clickSelectors: [".s-change-text"],
                postInteractionWait: 200,
            },
        },
    })
    .add("themed", () => wrapWithTheme(<ResponsiveTextExamples />), { screenshot: true });
