// (C) 2022 GoodData Corporation
import React, { CSSProperties } from "react";
import { DescriptionPanel, DescriptionPanelContent, IDescriptionPanelProps } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const TITLE = "Revenue and Customer Distribution in the US";
const DESC =
    "The distribution of income in the United States continues to hold ... Consumer Price Index for All Urban Consumers (CPI-U), and is scaled.";
const LOREM =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sagittis odio ultricies hendrerit varius. Cras id tellus eu leo blandit congue et sit amet lacus. Duis condimentum vestibulum metus, a gravida mi pellentesque ut. Mauris accumsan elementum sem, ut pellentesque purus lacinia at. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent efficitur ante fringilla ipsum interdum ullamcorper. Cras gravida vulputate libero sed semper. Pellentesque a justo sollicitudin, pellentesque metus quis, ornare risus. Fusce porta sem nulla, at malesuada enim suscipit nec. Sed fringilla leo et odio convallis ullamcorper. Nullam semper nunc a neque maximus, vitae consectetur lectus fringilla. Suspendisse et faucibus nisl.";
const PROPS_1: IDescriptionPanelProps = {
    title: TITLE,
    description: DESC,
};
const PROPS_2: IDescriptionPanelProps = {
    description: LOREM,
};

const DescriptionPanelTest: React.FC = () => {
    const style: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        maxWidth: "220px",
    };
    return (
        <div className="library-component screenshot-target">
            <h4>Description panel</h4>
            <div style={style}>
                <div style={{ marginRight: "32px", marginLeft: "auto" }}>
                    <DescriptionPanel {...PROPS_1} />
                </div>
                <DescriptionPanelContent {...PROPS_1} />
            </div>

            <h4>Description panel with text only</h4>
            <div style={style}>
                <div style={{ marginRight: "32px", marginLeft: "auto" }}>
                    <DescriptionPanel {...PROPS_2} />
                </div>
                <DescriptionPanelContent {...PROPS_2} />
            </div>
        </div>
    );
};

storiesOf(`${UiKit}/DescriptionPanel`)
    .add("full-featured", () => <DescriptionPanelTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<DescriptionPanelTest />), { screenshot: true });
