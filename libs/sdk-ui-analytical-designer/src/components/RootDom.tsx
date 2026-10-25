// (C) 2007-2026 GoodData Corporation

import { type CSSProperties } from "react";

import { useSelector } from "react-redux";

import { UiResizableSidebarProvider, useElementSize } from "@gooddata/sdk-ui-kit";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";

import { MainLoading, renderSlot, useAdSlots } from "../embedding/slots.js";
import { enableCollapsibleLeftSidebar } from "../selectors/feature_flag_selector.js";

import { useCatalogSidebarState } from "./catalogSidebar/useCatalogSidebarState.js";
import { CustomDragLayer } from "./CustomDragLayer.js";
import { Dialogs } from "./Dialogs.js";
import { Editor } from "./Editor.js";
import { Messages } from "./Messages.js";

export interface IRootDomProps {
    isReady: boolean;
}

export function RootDom({ isReady }: IRootDomProps) {
    const themeIsLoading = useThemeIsLoading();
    const slots = useAdSlots();

    const isLoaded = isReady && !themeIsLoading;

    // the flag alone decides, so a viewport too narrow to resize does not remount the catalog
    const hasCatalogSidebar = useSelector(enableCollapsibleLeftSidebar);
    // the host can take part of the window (e.g. an open chat panel); 0 means not measured yet
    const appRoot = useElementSize<HTMLDivElement>([isLoaded]);
    const catalogSidebar = useCatalogSidebarState(appRoot.width || undefined);

    if (!isLoaded) {
        return renderSlot(slots.Loading, MainLoading, {});
    }

    // Set on the root so that the dialogs, siblings of the editor, follow the catalog width too.
    const style = hasCatalogSidebar
        ? ({
              "--adi-catalog-width": `${catalogSidebar.width}px`,
              "--adi-catalog-expanded-width": `${catalogSidebar.expandedWidth}px`,
          } as CSSProperties)
        : undefined;

    return (
        <UiResizableSidebarProvider value={catalogSidebar}>
            <div ref={appRoot.ref} className="app-root app-root--pluggable" style={style}>
                <Dialogs />
                <CustomDragLayer />
                <Messages />
                <Editor hasCatalogSidebar={hasCatalogSidebar} />
            </div>
        </UiResizableSidebarProvider>
    );
}
