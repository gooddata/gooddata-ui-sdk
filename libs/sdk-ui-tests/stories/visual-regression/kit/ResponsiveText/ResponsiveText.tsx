// (C) 2019-2020 GoodData Corporation
import React from "react";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { withScreenshot } from "../../../_infra/backstopWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./ResponsiveText.css";

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

storiesOf(`${UiKit}/ResponsiveText`, module).add("full-featured", () =>
    withScreenshot(<ResponsiveTextExamples />),
);
storiesOf(`${UiKit}/ResponsiveText`, module).add("themed", () =>
    withScreenshot(wrapWithTheme(<ResponsiveTextExamples />)),
);
