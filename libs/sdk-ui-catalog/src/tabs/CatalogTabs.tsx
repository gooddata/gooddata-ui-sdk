// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { type IUiTab, UiTabs } from "@gooddata/sdk-ui-kit";

import { CatalogTabPanel } from "./CatalogTabPanel.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import { useIsCatalogQualityEnabled } from "../quality/gate.js";

const DEFAULT_TAB_ID = "recommended";

type Props = {
    onItemClick?: (item: ICatalogItem) => void;
};

export function CatalogTabs({ onItemClick }: Props) {
    const intl = useIntl();
    const isQualityEnabled = useIsCatalogQualityEnabled();
    const [selectedTabId, setSelectedTabId] = useState(DEFAULT_TAB_ID);

    const tabs: IUiTab[] = useMemo(() => {
        const baseTabs: IUiTab[] = [
            {
                id: "recommended",
                label: intl.formatMessage({ id: "analyticsCatalog.tabs.recommended" }),
            },
            {
                id: "trending",
                label: intl.formatMessage({ id: "analyticsCatalog.tabs.trending" }),
            },
        ];

        if (isQualityEnabled) {
            baseTabs.push({
                id: "quality",
                label: intl.formatMessage({ id: "analyticsCatalog.tabs.quality" }),
            });
        }

        return baseTabs;
    }, [intl, isQualityEnabled]);

    useEffect(() => {
        if (!tabs.some((tab) => tab.id === selectedTabId)) {
            setSelectedTabId(DEFAULT_TAB_ID);
        }
    }, [tabs, selectedTabId]);

    return (
        <section className="gd-analytics-catalog__tabs">
            <UiTabs
                tabs={tabs}
                selectedTabId={selectedTabId}
                onTabSelect={(tab) => setSelectedTabId(tab.id)}
                size="medium"
            />
            <CatalogTabPanel selectedTabId={selectedTabId} onItemClick={onItemClick} />
        </section>
    );
}
