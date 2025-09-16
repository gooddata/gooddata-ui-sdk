// (C) 2022-2025 GoodData Corporation

import { Hyperlink } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

function HyperlinkTest() {
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
}

export default {
    title: "12 UI Kit/Hyperlink",
};

export function FullFeatured() {
    return <HyperlinkTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<HyperlinkTest />);
Themed.parameters = { kind: "themed", screenshot: true };
