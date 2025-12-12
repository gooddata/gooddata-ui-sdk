// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { IntlProvider } from "react-intl";

import { type IAccessibilityConfigBase, UiButton, UiPopover } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

// Default aria attributes for the menu
const defaultAriaAttributes: IAccessibilityConfigBase = {
    ariaLabelledBy: "test-tags-label",
};

function UiPopoverExamples() {
    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <Example title="Basic popover with default content, default footer">
                    <div style={{ width: 300 }}>
                        <UiPopover
                            accessibilityConfig={defaultAriaAttributes}
                            anchor={<UiButton size="small" variant="tertiary" label="Open popover" />}
                            title="Popover title"
                            content="Popover content"
                            footer="Popover footer"
                            closeVisible
                            closeText="Close"
                        />
                    </div>
                </Example>
            </div>
        </IntlProvider>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiPopover",
};

export function Default() {
    return <UiPopoverExamples />;
}
Default.parameters = { kind: "default", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiPopoverExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
