// (C) 2026 GoodData Corporation

import { type Decorator } from "@storybook/react-vite";
import { action } from "storybook/actions";

import { dummyBackend } from "@gooddata/sdk-backend-base";
import {
    HostChromeProviders,
    type ILanguageMobileSelectProps,
    LANGUAGES,
    LanguageMobileSelect,
} from "@gooddata/sdk-ui-pluggable-host";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import "../themeWrapper.scss";

const requiredProps = {
    currentLanguage: "default",
    defaultLanguage: "en-US",
    languages: LANGUAGES,
    changeLanguage: () => Promise.resolve(),
    onClose: action("onClose"),
} satisfies ILanguageMobileSelectProps;

export default {
    title: "19 Host/LanguageMobileSelect",
    decorators: [
        (Story) => (
            <div className="no-animations">
                <HostChromeProviders locale="en-US" backend={dummyBackend()}>
                    <Story />
                </HostChromeProviders>
            </div>
        ),
    ] satisfies Decorator[],
};

export function Default() {
    return <LanguageMobileSelect {...requiredProps} />;
}
Default.parameters = {
    kind: "default",
    screenshot: {
        // The view focuses its search a frame after it opens, so the screenshot waits for the focus
        readySelector: { selector: '[role="combobox"]:focus', state: State.Attached },
        // The viewport matches "mobile2" Storybook viewport
        viewports: [{ label: "mobile", width: 414, height: 896 }],
    },
} satisfies IStoryParameters;
Default.globals = { viewport: { value: "mobile2" } };
