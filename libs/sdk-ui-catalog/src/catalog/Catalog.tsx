// (C) 2025 GoodData Corporation

import { type MouseEvent, useState } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { LoadingMask, type UiTab } from "@gooddata/sdk-ui-kit";

import { Layout } from "./Layout.js";
import type { OpenHandlerEvent } from "../catalogDetail/CatalogDetailContent.js";
import type { ICatalogItemRef } from "../catalogItem/index.js";
import { Header } from "../header/Header.js";
import { Main } from "../main/Main.js";
import { MemoryMain } from "../memory/MemoryMain.js";
import { PermissionsGate, usePermissionsState } from "../permission/index.js";
import { Search } from "../search/Search.js";

type TabId = "catalog" | "memory";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    openCatalogItemRef?: ICatalogItemRef;
    onCatalogItemOpenClick?: (e: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
    onCatalogDetailOpened?: (ref: ICatalogItemRef) => void;
    onCatalogDetailClosed?: () => void;
    initialTab?: TabId;
    onTabChange?: (tabId: TabId) => void;
};

export function Catalog({
    openCatalogItemRef,
    backend,
    workspace,
    onCatalogItemOpenClick,
    onCatalogDetailOpened,
    onCatalogDetailClosed,
    initialTab = "catalog",
    onTabChange,
}: Props) {
    const intl = useIntl();
    const { result } = usePermissionsState();
    const tabs: UiTab[] = [
        { id: "catalog", label: intl.formatMessage({ id: "analyticsCatalog.tabs.catalog" }) },
        { id: "memory", label: intl.formatMessage({ id: "analyticsCatalog.tabs.memory" }) },
    ];

    const [selectedTabId, setSelectedTabId] = useState<TabId>(initialTab);
    const enableGenAIMemory = result?.settings?.enableGenAIMemory;

    return (
        <Layout>
            <PermissionsGate
                loadingNode={<LoadingMask />}
                errorNode={
                    <ErrorComponent
                        message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                        description={intl.formatMessage({
                            id: "analyticsCatalog.error.unknown.description",
                        })}
                    />
                }
                unauthorizedNode={
                    <ErrorComponent
                        message={intl.formatMessage({ id: "analyticsCatalog.error.unauthorized.message" })}
                        description={intl.formatMessage({
                            id: "analyticsCatalog.error.unauthorized.description",
                        })}
                    />
                }
            >
                <Header
                    tabs={enableGenAIMemory ? tabs : undefined}
                    selectedTabId={selectedTabId}
                    onTabSelect={(tab) => {
                        const id = tab.id as TabId;
                        setSelectedTabId(id);
                        onTabChange?.(id);
                    }}
                    searchNode={
                        selectedTabId === "catalog" ? (
                            <Search backend={backend} workspace={workspace} />
                        ) : undefined
                    }
                />
                {selectedTabId === "catalog" ? (
                    <Main
                        openCatalogItemRef={openCatalogItemRef}
                        workspace={workspace}
                        backend={backend}
                        onCatalogItemOpenClick={onCatalogItemOpenClick}
                        onCatalogDetailOpened={onCatalogDetailOpened}
                        onCatalogDetailClosed={onCatalogDetailClosed}
                    />
                ) : (
                    <MemoryMain backend={backend} workspace={workspace} />
                )}
            </PermissionsGate>
        </Layout>
    );
}
