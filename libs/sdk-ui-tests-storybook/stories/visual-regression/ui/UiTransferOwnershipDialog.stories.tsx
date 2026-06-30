// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiGranteeAsyncOption, UiTransferOwnershipDialog } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { loadOptions } from "./_helpers/granteeTestData.js";

function Example({
    initialOwner,
    initialAlsoRemove = false,
}: {
    initialOwner?: IUiGranteeAsyncOption;
    initialAlsoRemove?: boolean;
}) {
    const [owner, setOwner] = useState<IUiGranteeAsyncOption | undefined>(initialOwner);
    const [alsoRemove, setAlsoRemove] = useState(initialAlsoRemove);
    const handleOwnerChange = useCallback((next: IUiGranteeAsyncOption) => {
        action("selected owner change")(next);
        setOwner(next);
    }, []);
    const handleAlsoRemoveChange = useCallback((next: boolean) => {
        action("also remove my access change")(next);
        setAlsoRemove(next);
    }, []);

    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {/* Visible placeholder so the screenshot capture has a target in
                the page DOM — the modal itself renders through `FloatingPortal`. */}
            <div className="screenshot-target" style={{ minHeight: 400 }}>
                <UiTransferOwnershipDialog
                    isOpen
                    objectTitle="Customer"
                    loadOptions={loadOptions}
                    selectedOwner={owner}
                    onSelectedOwnerChange={handleOwnerChange}
                    alsoRemoveMyAccess={alsoRemove}
                    onAlsoRemoveMyAccessChange={handleAlsoRemoveChange}
                    onBack={action("back")}
                    onClose={action("close")}
                    onCancel={action("cancel")}
                    onTransfer={action("transfer")}
                />
            </div>
        </IntlProvider>
    );
}

const OWNER: IUiGranteeAsyncOption = {
    id: "u:jane",
    kind: "user",
    name: "Jane Good",
    email: "jane.good@company.com",
};

export default {
    title: "15 Ui/UiTransferOwnershipDialog",
};

const screenshotParams = {
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} as const;

export function Empty() {
    return <Example />;
}
Empty.parameters = { kind: "empty", ...screenshotParams } satisfies IStoryParameters;

export function WithOwner() {
    return <Example initialOwner={OWNER} />;
}
WithOwner.parameters = { kind: "with-owner", ...screenshotParams } satisfies IStoryParameters;

export function WithOwnerRemoveSelf() {
    return <Example initialOwner={OWNER} initialAlsoRemove />;
}
WithOwnerRemoveSelf.parameters = {
    kind: "with-owner-remove-self",
    ...screenshotParams,
} satisfies IStoryParameters;

export const EmptyThemed = () => wrapWithTheme(<Example />);
EmptyThemed.parameters = { kind: "themed-empty", ...screenshotParams } satisfies IStoryParameters;
