// (C) 2026 GoodData Corporation

import { useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiAddGranteeDialog, UiGranteeRow } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function EmptyExample() {
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ padding: 24, background: "rgba(20,56,93,0.08)" }}>
                <UiAddGranteeDialog
                    objectTitle="Customer"
                    searchQuery={searchQuery}
                    onSearchQueryChange={(next) => {
                        action("search change")(next);
                        setSearchQuery(next);
                    }}
                    onBack={action("back")}
                    onClose={action("close")}
                    onCancel={action("cancel")}
                    onAdd={action("add")}
                    isAddDisabled
                />
            </div>
        </IntlProvider>
    );
}

function WithGranteeExample() {
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ padding: 24, background: "rgba(20,56,93,0.08)" }}>
                <UiAddGranteeDialog
                    objectTitle="Customer"
                    searchQuery={searchQuery}
                    onSearchQueryChange={(next) => {
                        action("search change")(next);
                        setSearchQuery(next);
                    }}
                    onBack={action("back")}
                    onClose={action("close")}
                    onCancel={action("cancel")}
                    onAdd={action("add")}
                    selectedGrantee={
                        <UiGranteeRow
                            kind="user"
                            name="Julie Better"
                            email="julie.better@company.com"
                            controls={
                                <span style={{ color: "var(--gd-palette-complementary-6)" }}>Can view</span>
                            }
                        />
                    }
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiAddGranteeDialog",
};

export function Empty() {
    return <EmptyExample />;
}
Empty.parameters = {
    kind: "empty",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function WithGrantee() {
    return <WithGranteeExample />;
}
WithGrantee.parameters = {
    kind: "with-grantee",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const EmptyThemed = () => wrapWithTheme(<EmptyExample />);
EmptyThemed.parameters = {
    kind: "themed-empty",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
