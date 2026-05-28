// (C) 2026 GoodData Corporation

import { UiAvatar } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiAvatarExample() {
    return (
        <div className="screenshot-target" style={{ display: "flex", gap: 16, padding: 16 }}>
            <UiAvatar icon="user" accessibilityConfig={{ ariaLabel: "User" }} />
            <UiAvatar icon="users" accessibilityConfig={{ ariaLabel: "User group" }} />
            <UiAvatar icon="user" size={24} accessibilityConfig={{ ariaLabel: "Small user" }} />
            <UiAvatar icon="user" size={48} accessibilityConfig={{ ariaLabel: "Large user" }} />
            <UiAvatar
                icon="user"
                backgroundColor="primary"
                iconColor="complementary-0"
                accessibilityConfig={{ ariaLabel: "Primary user" }}
            />
            <UiAvatar
                icon="user"
                backgroundColor="success"
                iconColor="complementary-0"
                accessibilityConfig={{ ariaLabel: "Success user" }}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiAvatar",
};

export function Default() {
    return <UiAvatarExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiAvatarExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
