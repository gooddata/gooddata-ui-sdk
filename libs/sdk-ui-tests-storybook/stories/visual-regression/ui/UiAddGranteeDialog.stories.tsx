// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiPickedGrantee, UiAddGranteeDialog } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { loadOptions } from "./_helpers/granteeTestData.js";

function Example({ initialPicked = [] as IUiPickedGrantee[] }) {
    const [picked, setPicked] = useState<IUiPickedGrantee[]>(initialPicked);
    const handleChange = useCallback((next: IUiPickedGrantee[]) => {
        action("selected grantees change")(next);
        setPicked(next);
    }, []);

    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {/* Visible placeholder so the screenshot capture has a target in
                the page DOM — the modal itself renders through `FloatingPortal`. */}
            <div className="screenshot-target" style={{ minHeight: 400 }}>
                <UiAddGranteeDialog
                    isOpen
                    objectTitle="Customer"
                    loadOptions={loadOptions}
                    selectedGrantees={picked}
                    onSelectedGranteesChange={handleChange}
                    onBack={action("back")}
                    onClose={action("close")}
                    onCancel={action("cancel")}
                    onShare={action("share")}
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiAddGranteeDialog",
};

const screenshotParams = {
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} as const;

export function Empty() {
    return <Example />;
}
Empty.parameters = { kind: "empty", ...screenshotParams } satisfies IStoryParameters;

export function WithGrantee() {
    return (
        <Example
            initialPicked={[
                {
                    id: "u:julie",
                    kind: "user",
                    name: "Julie Better",
                    email: "julie.better@company.com",
                    permissionLevel: "VIEW",
                },
            ]}
        />
    );
}
WithGrantee.parameters = { kind: "with-grantee", ...screenshotParams } satisfies IStoryParameters;

export const EmptyThemed = () => wrapWithTheme(<Example />);
EmptyThemed.parameters = { kind: "themed-empty", ...screenshotParams } satisfies IStoryParameters;
