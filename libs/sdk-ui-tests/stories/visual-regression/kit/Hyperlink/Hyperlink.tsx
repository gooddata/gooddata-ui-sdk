// (C) 2022 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { Hyperlink } from "@gooddata/sdk-ui-kit";

const HyperlinkTest = () => {
    return (
        <div
            className="library-component screenshot-target"
            style={{ maxWidth: "500px", overflow: "hidden" }}
        >
            <h4>Full featured</h4>
            <Hyperlink text="Documentation link." href="" iconClass="gd-icon-rain" />

            <h4>Text only</h4>
            <Hyperlink text="Hyperlink." href="" />

            <h4>Icon only</h4>
            <Hyperlink href="" iconClass="gd-icon-ghost" />

            <h4>Responsiveness</h4>
            <Hyperlink
                text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse efficitur nisi."
                href=""
                iconClass="gd-icon-file"
            />
        </div>
    );
};

storiesOf(`${UiKit}/Hyperlink`)
    .add("full-featured", () => <HyperlinkTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<HyperlinkTest />), { screenshot: true });
