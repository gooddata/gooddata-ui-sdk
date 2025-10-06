// (C) 2025 GoodData Corporation

import { action } from "storybook/actions";

import { UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

export default {
    title: "15 Ui/UiSubmenuHeader",
};

export function FullFeatured() {
    const containerStyle = { width: 250 } as const;
    const wrapStyle = { display: "grid", gap: 12, padding: 8 } as const;
    return (
        <div className="screenshot-target" style={wrapStyle}>
            <div style={containerStyle}>
                <UiSubmenuHeader
                    title="Medium – with buttons"
                    height="large"
                    onBack={action("onBack")}
                    onClose={action("onClose")}
                    backAriaLabel="Back"
                    closeAriaLabel="Close"
                />
            </div>
            <div style={containerStyle}>
                <UiSubmenuHeader title="Medium – no buttons" height="large" />
            </div>
            <div style={containerStyle}>
                <UiSubmenuHeader
                    title="Large – with buttons"
                    height="large"
                    onBack={action("onBack")}
                    onClose={action("onClose")}
                    backAriaLabel="Back"
                    closeAriaLabel="Close"
                />
            </div>
            <div style={containerStyle}>
                <UiSubmenuHeader
                    title="Large – color customization"
                    height="large"
                    onBack={action("onBack")}
                    onClose={action("onClose")}
                    backAriaLabel="Back"
                    closeAriaLabel="Close"
                    textColor="red"
                    backgroundColor="blue"
                />
            </div>
            <div style={containerStyle}>
                <UiSubmenuHeader
                    title="Large – with shortened very long title"
                    height="large"
                    onBack={action("onBack")}
                    onClose={action("onClose")}
                    backAriaLabel="Back"
                    closeAriaLabel="Close"
                    useShortenedTitle={true}
                />
            </div>
        </div>
    );
}
FullFeatured.parameters = { kind: "Full featured", screenshot: true };
