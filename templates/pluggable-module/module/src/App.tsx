// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IPluggableAppEvent } from "@gooddata/sdk-pluggable-application-model";
import { useWorkspace } from "@gooddata/sdk-ui";
import { usePlatformContextStrict, usePluggableAppTelemetry } from "@gooddata/sdk-ui-pluggable-application";

interface IAppProps {
    onEvent?: (e: IPluggableAppEvent) => void;
}

export function App({ onEvent: _onEvent }: IAppProps) {
    const ctx = usePlatformContextStrict();
    const workspaceId = useWorkspace();
    const { trackEvent: _trackEvent } = usePluggableAppTelemetry();

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: "4rem" }}>
            <h1>
                <FormattedMessage id="gdc-app-template-name.title" />
            </h1>
            <p>Your pluggable application is running.</p>
            <ul>
                <li>User: {ctx.user.login}</li>
                <li>Organization: {ctx.organization?.title ?? ctx.organization?.id ?? "n/a"}</li>
                {workspaceId ? <li>Workspace: {workspaceId}</li> : null}
            </ul>
        </div>
    );
}
