// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiLabelsChecklistItem, UiGranteeRowControls } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

// Inline mock of a grantee row body — not part of the audited component;
// used here only to visualize how the controls render in real row context.
// The real row chrome lands in UiObjectShareDialog.
function MockRow({ name, email, children }: { name: string; email?: string; children: React.ReactNode }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 50,
                paddingLeft: 12,
                paddingRight: 12,
                fontFamily: "var(--gd-font-family)",
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: "var(--gd-palette-complementary-2)",
                    flexShrink: 0,
                }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 14,
                        lineHeight: "20px",
                        fontWeight: 700,
                        color: "var(--gd-palette-complementary-8)",
                    }}
                >
                    {name}
                </div>
                {email ? (
                    <div
                        style={{
                            fontSize: 14,
                            lineHeight: "20px",
                            color: "var(--gd-palette-complementary-6)",
                        }}
                    >
                        {email}
                    </div>
                ) : null}
            </div>
            {children}
        </div>
    );
}

function UiGranteeRowControlsExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ width: 560 }}>
                <MockRow name="Marek Stránský" email="marek.stransky@gooddata.com">
                    <UiGranteeRowControls
                        labels={LABELS}
                        selectedLabelIds={["id", "name", "email", "ssn"]}
                        permissionLevel="VIEW"
                        onLabelsChange={action("Marek → labels change")}
                        onPermissionChange={action("Marek → permission change")}
                        onTransferOwnership={action("Marek → transfer")}
                    />
                </MockRow>
                <MockRow name="Admin">
                    <UiGranteeRowControls
                        labels={LABELS}
                        selectedLabelIds={["id", "name", "email", "ssn"]}
                        permissionLevel="VIEW"
                        onLabelsChange={action("Admin → labels change")}
                        onPermissionChange={action("Admin → permission change")}
                        onRemoveAccess={action("Admin → remove")}
                    />
                </MockRow>
                <MockRow name="Jana Dvořák" email="jana.dvorak@gooddata.com">
                    <UiGranteeRowControls
                        labels={LABELS}
                        selectedLabelIds={["id", "name"]}
                        permissionLevel="SHARE"
                        onLabelsChange={action("Jana → labels change")}
                        onPermissionChange={action("Jana → permission change")}
                        onRemoveAccess={action("Jana → remove")}
                    />
                </MockRow>
                <MockRow name="Petra Králová" email="petra.kralova@gooddata.com">
                    <UiGranteeRowControls
                        labels={LABELS}
                        selectedLabelIds={["id", "name", "email", "ssn"]}
                        permissionLevel="EDIT"
                        onLabelsChange={action("Petra → labels change")}
                        onPermissionChange={action("Petra → permission change")}
                        onRemoveAccess={action("Petra → remove")}
                    />
                </MockRow>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiGranteeRowControls",
};

export function Default() {
    return <UiGranteeRowControlsExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiGranteeRowControlsExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
