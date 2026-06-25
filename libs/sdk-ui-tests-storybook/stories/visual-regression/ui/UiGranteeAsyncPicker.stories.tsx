// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type IUiGranteeAsyncOption,
    type PermissionMenuLevel,
    UiGranteeAsyncPicker,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { loadOptions } from "./_helpers/granteeTestData.js";

type Picked = IUiGranteeAsyncOption & { permissionLevel: PermissionMenuLevel };

function Example({ initialPicked = [] as Picked[] }) {
    const [picked, setPicked] = useState<Picked[]>(initialPicked);
    const handleSelect = useCallback((option: IUiGranteeAsyncOption) => {
        action("select")(option);
        setPicked((prev) => [...prev, { ...option, permissionLevel: "VIEW" }]);
    }, []);
    const handlePermissionChange = useCallback((grantee: Picked, next: PermissionMenuLevel) => {
        action("permission change")(grantee, next);
        setPicked((prev) => prev.map((p) => (p.id === grantee.id ? { ...p, permissionLevel: next } : p)));
    }, []);
    const handleRemove = useCallback((grantee: Picked) => {
        action("remove")(grantee);
        setPicked((prev) => prev.filter((p) => p.id !== grantee.id));
    }, []);

    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ width: 500, padding: 24, background: "rgba(20,56,93,0.04)" }}
            >
                <UiGranteeAsyncPicker
                    loadOptions={loadOptions}
                    selectedGrantees={picked}
                    onSelect={handleSelect}
                    onPermissionChange={handlePermissionChange}
                    onRemove={handleRemove}
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiGranteeAsyncPicker",
};

const screenshotParams = {
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} as const;

export function Default() {
    return <Example />;
}
Default.parameters = { kind: "default", ...screenshotParams } satisfies IStoryParameters;

export function WithPicked() {
    return (
        <Example
            initialPicked={[
                { id: "g:marketing", kind: "group", name: "Marketing", permissionLevel: "SHARE" },
                {
                    id: "u:jane",
                    kind: "user",
                    name: "Jane Good",
                    email: "jane.good@company.com",
                    permissionLevel: "VIEW",
                },
            ]}
        />
    );
}
WithPicked.parameters = { kind: "with-picked", ...screenshotParams } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<Example />);
Themed.parameters = { kind: "themed", ...screenshotParams } satisfies IStoryParameters;
