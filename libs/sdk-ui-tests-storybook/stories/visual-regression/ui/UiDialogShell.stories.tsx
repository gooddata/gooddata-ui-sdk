// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiButton, UiDialogFooter, UiDialogHeader, UiDialogShell, UiIconButton } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function DefaultExample() {
    return (
        <UiDialogShell>
            <UiDialogHeader title='Share "Customer"' onClose={action("close")} />
            <p style={{ margin: "0 0 20px", color: "var(--gd-palette-complementary-7)" }}>
                Default (540px) shell with a 18/26 title.
            </p>
            <UiDialogFooter divider>
                <UiButton label="Cancel" variant="secondary" size="medium" onClick={action("cancel")} />
                <UiButton label="Save" variant="primary" size="medium" onClick={action("save")} />
            </UiDialogFooter>
        </UiDialogShell>
    );
}

function LargeTitleExample() {
    return (
        <UiDialogShell>
            <UiDialogHeader
                title='Share "Customer"'
                titleSize="large"
                onClose={action("close")}
                leading={
                    <UiIconButton
                        icon="chevronLeft"
                        variant="tertiary"
                        size="small"
                        onClick={action("back")}
                        accessibilityConfig={{ ariaLabel: "Back" }}
                    />
                }
            />
            <p style={{ margin: "0 0 20px", color: "var(--gd-palette-complementary-7)" }}>
                Large title (20/26) + leading back button. Used by AddGranteeScreen.
            </p>
            <UiDialogFooter divider>
                <UiButton label="Cancel" variant="secondary" size="medium" onClick={action("cancel")} />
                <UiButton label="Add" variant="primary" size="medium" onClick={action("add")} />
            </UiDialogFooter>
        </UiDialogShell>
    );
}

function CompactConfirmExample() {
    return (
        <UiDialogShell width={420}>
            <UiDialogHeader title="Remove access?" onClose={action("close")} />
            <p style={{ margin: "0 0 20px", color: "var(--gd-palette-complementary-7)" }}>
                Remove access to "Customer"? They will no longer be able to view this object.
            </p>
            <UiDialogFooter>
                <UiButton label="Cancel" variant="secondary" size="medium" onClick={action("cancel")} />
                <UiButton label="Remove" variant="danger" size="medium" onClick={action("remove")} />
            </UiDialogFooter>
        </UiDialogShell>
    );
}

function AllExamples() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 24,
                    padding: 24,
                    background: "rgba(20,56,93,0.08)",
                }}
            >
                <DefaultExample />
                <LargeTitleExample />
                <CompactConfirmExample />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiDialogShell",
};

export function Default() {
    return <AllExamples />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AllExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
