// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type ConfirmDialogVariant, UiConfirmDialog } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

interface IConfirmExampleProps {
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    confirmVariant?: ConfirmDialogVariant;
    label: string;
}

function ConfirmExample({ title, description, confirmLabel, confirmVariant, label }: IConfirmExampleProps) {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {/* Visible placeholder so the screenshot capture has a target in the
                page DOM — the modal itself renders through `FloatingPortal`. */}
            <div className="screenshot-target" style={{ minHeight: 400 }}>
                <UiConfirmDialog
                    isOpen
                    title={title}
                    description={description}
                    confirmLabel={confirmLabel}
                    confirmVariant={confirmVariant}
                    onClose={action(`${label} → close`)}
                    onCancel={action(`${label} → cancel`)}
                    onConfirm={action(`${label} → confirm`)}
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiConfirmDialog",
};

const screenshotParams = {
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} as const;

export function Primary() {
    return (
        <ConfirmExample
            label="primary"
            title="Apply changes?"
            description="The selected changes will be applied to this object."
            confirmLabel="Apply"
        />
    );
}
Primary.parameters = { kind: "primary", ...screenshotParams } satisfies IStoryParameters;

export function Danger() {
    return (
        <ConfirmExample
            label="danger"
            title="Delete object?"
            description='Delete "Customer"? This action cannot be undone.'
            confirmLabel="Delete"
            confirmVariant="danger"
        />
    );
}
Danger.parameters = { kind: "danger", ...screenshotParams } satisfies IStoryParameters;

export function LongDescription() {
    return (
        <ConfirmExample
            label="long-description"
            title="Move to archive?"
            description="Archived objects are hidden from the workspace and removed from any dashboards that reference them. Members will still be able to restore the object from the archive within 30 days."
            confirmLabel="Archive"
        />
    );
}
LongDescription.parameters = { kind: "long-description", ...screenshotParams } satisfies IStoryParameters;

export const Themed = () =>
    wrapWithTheme(
        <ConfirmExample
            label="themed"
            title="Apply changes?"
            description="The selected changes will be applied to this object."
            confirmLabel="Apply"
        />,
    );
Themed.parameters = { kind: "themed", ...screenshotParams } satisfies IStoryParameters;
