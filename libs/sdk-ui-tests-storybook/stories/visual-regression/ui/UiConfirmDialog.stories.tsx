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
        <UiConfirmDialog
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            confirmVariant={confirmVariant}
            onClose={action(`${label} → close`)}
            onCancel={action(`${label} → cancel`)}
            onConfirm={action(`${label} → confirm`)}
        />
    );
}

function Frame({ children }: { children: React.ReactNode }) {
    // One dialog per story keeps autofocus deterministic — multiple modal dialogs in a
    // single screenshot race for focus and produce flaky pixel diffs.
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ padding: 24, background: "rgba(20,56,93,0.08)", width: 500 }}
            >
                {children}
            </div>
        </IntlProvider>
    );
}

function PrimaryExample() {
    return (
        <ConfirmExample
            label="primary"
            title="Apply changes?"
            description="The selected changes will be applied to this object."
            confirmLabel="Apply"
        />
    );
}

function DangerExample() {
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

function LongDescriptionExample() {
    return (
        <ConfirmExample
            label="long-description"
            title="Move to archive?"
            description="Archived objects are hidden from the workspace and removed from any dashboards that reference them. Members will still be able to restore the object from the archive within 30 days."
            confirmLabel="Archive"
        />
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
        <Frame>
            <PrimaryExample />
        </Frame>
    );
}
Primary.parameters = { kind: "primary", ...screenshotParams } satisfies IStoryParameters;

export function Danger() {
    return (
        <Frame>
            <DangerExample />
        </Frame>
    );
}
Danger.parameters = { kind: "danger", ...screenshotParams } satisfies IStoryParameters;

export function LongDescription() {
    return (
        <Frame>
            <LongDescriptionExample />
        </Frame>
    );
}
LongDescription.parameters = { kind: "long-description", ...screenshotParams } satisfies IStoryParameters;

export const Themed = () =>
    wrapWithTheme(
        <Frame>
            <PrimaryExample />
        </Frame>,
    );
Themed.parameters = { kind: "themed", ...screenshotParams } satisfies IStoryParameters;
