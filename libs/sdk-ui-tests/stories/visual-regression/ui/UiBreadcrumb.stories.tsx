// (C) 2020-2026 GoodData Corporation

import { action } from "storybook/actions";

import { type IAccessibilityConfigBase, UiBreadcrumb } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const accessibilityConfig: IAccessibilityConfigBase = {};
const items = [
    { label: "Home", id: "home", tooltip: "Home page" },
    { label: "Insights", id: "insights" },
    { label: "Insight 1", id: "insight-1" },
];

function UiBreadcrumbTest(_: { showCode?: boolean }) {
    return (
        <div className="screenshot-target" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <UiBreadcrumb
                accessibilityConfig={accessibilityConfig}
                label="Breadcrumb"
                items={items}
                id="breadcrumb2"
                onSelect={action("onSelect")}
            />
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiBreadcrumb",
};

export function FullFeaturedBreadcrumb() {
    return <UiBreadcrumbTest />;
}
FullFeaturedBreadcrumb.parameters = {
    kind: "full-featured breadcrumb",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiBreadcrumbTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
