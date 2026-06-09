// (C) 2026 GoodData Corporation

import { action } from "storybook/actions";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { WidgetNotice, type WidgetNoticeType } from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const noticeTypes: WidgetNoticeType[] = ["info", "success", "warning", "error"];

function WidgetNoticeTest() {
    return (
        <InternalIntlWrapper>
            <div
                className="screenshot-target"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: 16,
                }}
            >
                {noticeTypes.map((type) => (
                    <WidgetNotice
                        key={type}
                        type={type}
                        message={`${type.charAt(0).toUpperCase()}${type.slice(1)} widget notice`}
                        action={<a>Action</a>}
                        onClose={action(`${type} notice close`)}
                    />
                ))}
                <WidgetNotice
                    type="warning"
                    message="Partial results only."
                    detail="The result exceeds the row limit. Export the full result to continue working with all data."
                    detailAction={<a>Export full result as Raw (.csv)</a>}
                    expandLabel="Show details"
                    collapseLabel="Hide details"
                    defaultExpanded
                    onClose={action("expanded notice close")}
                />
            </div>
        </InternalIntlWrapper>
    );
}

export default {
    title: "12 UI Kit/WidgetNotice",
};

export function FullFeatured() {
    return <WidgetNoticeTest />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<WidgetNoticeTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
