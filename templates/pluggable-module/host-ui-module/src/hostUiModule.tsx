// (C) 2026 GoodData Corporation

import { type Root, createRoot } from "react-dom/client";

import {
    type IHostUiModule,
    type IHostUiMountHandle,
    type IHostUiMountOptions,
} from "@gooddata/sdk-pluggable-application-model";

import { HostUi, type IHostUiState } from "./HostUi.js";
import "./HostUi.css";

// vite.config.ts and vitest.config.ts define both values at build time.
declare const __BUILD_TIMESTAMP__: number;
declare const __ALLOWED_ORGANIZATIONS__: string[];

function mountHostUi({
    container,
    ctx,
    resolvedApplications,
    pathname,
    navigate,
    onChatToggleRequested,
    onError,
}: IHostUiMountOptions): IHostUiMountHandle {
    // The host calls getAppContainer() immediately after mount() returns, before React commits.
    // Create the element here and let HostUi move it into its layout.
    const appContainer = document.createElement("div");
    appContainer.className = "gdc-host-ui-template-name__app";

    let root: Root | undefined = createRoot(container);
    let state: IHostUiState = {
        ctx,
        applications: resolvedApplications,
        pathname,
        header: undefined,
        pageTitle: undefined,
        chat: { showChatItem: false, isOpen: false },
        notification: undefined,
    };

    const render = () => {
        root?.render(
            <HostUi
                state={state}
                appContainer={appContainer}
                navigate={navigate}
                onChatToggle={onChatToggleRequested}
                onError={onError}
            />,
        );
    };

    const update = (patch: Partial<IHostUiState>) => {
        state = { ...state, ...patch };
        render();
    };

    render();

    return {
        unmount() {
            root?.unmount();
            root = undefined;
        },
        updateContext: (nextCtx) => update({ ctx: nextCtx }),
        updateApplications: (applications) => update({ applications }),
        updatePathname: (nextPathname) => update({ pathname: nextPathname }),
        updateHeader: (header) => update({ header }),
        updateDocumentTitle: (pageTitle) => update({ pageTitle }),
        updateChatState: (chat) => update({ chat }),
        notify: (notification) => update({ notification }),
        getAppContainer: () => appContainer,
    };
}

export const hostUiModule: IHostUiModule = {
    allowedOrganizations: __ALLOWED_ORGANIZATIONS__,
    buildTimestamp: __BUILD_TIMESTAMP__,
    mount: mountHostUi,
};
