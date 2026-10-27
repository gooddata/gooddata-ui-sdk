// (C) 2026 GoodData Corporation

import { type Decorator } from "@storybook/react-vite";
import { action } from "storybook/actions";

import { HostIntlProvider, type ILanguageDialogProps, LanguageDialog } from "@gooddata/sdk-ui-pluggable-host";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import "../themeWrapper.scss";

const requiredProps = {
    currentLanguage: undefined,
    defaultLanguage: "en-US",
    languages: ["en-US", "de-DE"],
    setLanguage: () => Promise.resolve(),
    deleteLanguage: () => Promise.resolve(),
    onClose: action("onClose"),
} satisfies ILanguageDialogProps;

export default {
    title: "19 Host/LanguageDialog",
    decorators: [
        (Story) => (
            <div className="no-animations">
                <HostIntlProvider locale="en-US">
                    <Story />
                </HostIntlProvider>
            </div>
        ),
    ] satisfies Decorator[],
};

export function Default() {
    return <LanguageDialog {...requiredProps} />;
}
Default.parameters = {
    kind: "default",
    screenshot: {
        readySelector: { selector: '[role="dialog"]', state: State.Visible },
        /**
         * UiModalDialog focuses first interactive element after opening. In normal app the focus visible algorithm
         * determines that it should not display focus ring. In storybook it does. Therefore click on heading to
         * get rid of focus ring.
         */
        clickSelector: '[role="dialog"] h2',
    },
} satisfies IStoryParameters;
