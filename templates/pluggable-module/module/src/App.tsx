// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import {
    type IPluggableAppEvent,
    type IPluggableAppTelemetryCallbacks,
} from "@gooddata/sdk-pluggable-application-model";
import { useWorkspace } from "@gooddata/sdk-ui";
import { usePlatformContextStrict } from "@gooddata/sdk-ui-pluggable-application";

interface IAppProps {
    onEvent?: (e: IPluggableAppEvent) => void;
    onTelemetryEvent?: IPluggableAppTelemetryCallbacks;
}

export function App({ onEvent: _onEvent, onTelemetryEvent: _onTelemetryEvent }: IAppProps) {
    const ctx = usePlatformContextStrict();
    const workspaceId = useWorkspace();

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
