// (C) 2007-2026 GoodData Corporation

import "@formatjs/intl-pluralrules";
// Fully-specified (.js) so strict-ESM consumers (webpack fullySpecified, e.g. the dashboards app
// loading the direct-AD-embedding chunk) can resolve these extensionless-unfriendly packages.
import "@formatjs/intl-pluralrules/polyfill-locales.js";
import { useRef } from "react";

import { DndProvider } from "@evil-internetmann/react-dnd";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

import { isHostedComponentSelector } from "./appMode/appMode.js";
import { BackendProvider } from "./BackendProvider.js";
import { Root as InnerRoot } from "./components/Root.js";
import { DetectLocationChange } from "./DetectLocationChange.js";
import { HostedLocation } from "./embedding/HostedLocation.js";
import { store } from "./reduxStore.js";
import { type IAppState } from "./store/types.js";
import { createCustomMouseBackend } from "./utils/custom_mouse_backend.js";
import { TranslationsWrapper } from "./utils/with_connected_intl.js";

const dndBackend = createCustomMouseBackend();

interface IRootProps {
    // Host-allocated path under which AD is mounted in pluggable mode
    // (e.g. "/workspace/<id>/analyze"). Scopes AD's BrowserRouter so internal
    // hash routing operates beneath the host's owned path.
    basename?: string;
    // Initial virtual location for hosted-component mode — the embedded hash route anchored at
    // "/" (e.g. "/#/reportId/edit?..."). Only the mount-time entry; later navigation flows through
    // the virtual-navigate registration.
    initialLocation?: string;
}

export function Root({ basename, initialLocation }: IRootProps = {}) {
    const isHostedComponent = isHostedComponentSelector(store.getState() as unknown as IAppState);

    // Pluggable mode mounts in a separate React root from the host shell —
    // the shell's router context doesn't propagate across createRoot boundaries.
    // Provide a fresh BrowserRouter scoped to the host-allocated basename.
    //
    // useTransitions={false}: React Router v7 wraps location-state updates in
    // React.startTransition by default (the v6 `v7_startTransition` future flag,
    // which this app never opted into). AD's location changes drive redux/sagas
    // synchronously via DetectLocationChange; deferring them as concurrent
    // transitions breaks the ordering of that flow. Opting out restores v6 timing.
    let content;
    if (isHostedComponent) {
        // No router in hosted-component mode: a host's own react-router tree rejects a nested one.
        content = (
            <HostedLocation initialLocation={initialLocation}>
                <InnerRoot />
            </HostedLocation>
        );
    } else {
        content = (
            <BrowserRouter basename={basename} useTransitions={false}>
                <DetectLocationChange>
                    <InnerRoot />
                </DetectLocationChange>
            </BrowserRouter>
        );
    }

    // @evil-internetmann/react-dnd stores a single DnD manager on a global (window) under a shared
    // Symbol.for(), keyed only by the DndProvider `context` prop. AD and its host (sdk-ui-dashboard)
    // depend on the same react-dnd copy, so in hosted-component mode the host's HTML5-backend
    // DndProvider mounts first and owns that global instance; AD's provider would reuse it and never
    // create its own custom mouse backend, leaving catalog drag-and-drop dead. Passing AD its own
    // context object gives it a separate manager + mouse backend, isolated from the host. Pluggable
    // mode keeps the global instance (undefined context) unchanged.
    const dndContext = useRef<Record<PropertyKey, unknown>>({}).current;

    return (
        <DndProvider backend={dndBackend} context={isHostedComponent ? dndContext : undefined}>
            <Provider store={store}>
                <BackendProvider>
                    <TranslationsWrapper>{content}</TranslationsWrapper>
                </BackendProvider>
            </Provider>
        </DndProvider>
    );
}
