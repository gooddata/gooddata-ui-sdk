// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IInsight, type ObjRef } from "@gooddata/sdk-model";
import {
    type IInsightPickerItem,
    type IInsightPickerRenderItemProps,
    InsightPicker,
    type InsightPickerSortBy,
    type InsightPickerSortDirection,
} from "@gooddata/sdk-ui-ext";
import { Dialog } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectBackendCapabilities } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableVisualizationFilteringByTags,
    selectObjectAvailabilityConfig,
    selectSettings,
} from "../../../model/store/config/configSelectors.js";
import { selectCurrentUser } from "../../../model/store/user/userSelectors.js";
import { getAuthor } from "../../../model/utils/author.js";
import { InsightPickerListItem } from "./InsightPickerListItem.js";
import { useInsertInsightToLayout } from "./useInsertInsightToLayout.js";

function useAuthor() {
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const currentUser = useDashboardSelector(selectCurrentUser);
    return getAuthor(capabilities, currentUser);
}

/**
 * @internal
 */
export interface IInsightPickerPanelProps {
    onClose: () => void;

    // Controlled state — managed by FloatingToolbar so it persists across open/close
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: InsightPickerSortBy;
    sortDirection: InsightPickerSortDirection;
    onSortChange: (sortBy: InsightPickerSortBy, sortDirection: InsightPickerSortDirection) => void;
    authorFilter: string[];
    onAuthorFilterChange: (authorIds: string[]) => void;
    tagFilter: string[];
    onTagFilterChange: (tagIds: string[]) => void;
}

/**
 * @internal
 */
export function InsightPickerPanel({
    onClose,
    searchQuery,
    onSearchChange,
    sortBy,
    sortDirection,
    onSortChange,
    authorFilter,
    onAuthorFilterChange,
    tagFilter,
    onTagFilterChange,
}: IInsightPickerPanelProps) {
    const settings = useDashboardSelector(selectSettings);
    const author = useAuthor();
    const objectAvailability = useDashboardSelector(selectObjectAvailabilityConfig);
    const isFilteringByTagsEnabled = useDashboardSelector(selectEnableVisualizationFilteringByTags);
    const insertInsight = useInsertInsightToLayout();

    const includeTags = isFilteringByTagsEnabled ? objectAvailability?.includeObjectsWithTags : undefined;
    const excludeTags = isFilteringByTagsEnabled ? objectAvailability?.excludeObjectsWithTags : undefined;

    const handleSelect = useCallback((_ref: ObjRef, _item: IInsightPickerItem) => {
        // no-op — selection handled via drag-and-drop or keyboard activate
    }, []);

    const handleInsightActivate = useCallback(
        (insight: IInsight) => {
            onClose();
            insertInsight(insight);
        },
        [onClose, insertInsight],
    );

    const renderItem = useCallback(
        (renderProps: IInsightPickerRenderItemProps) => (
            <InsightPickerListItem
                item={renderProps.item}
                type={renderProps.type}
                sourceInsight={renderProps.sourceInsight}
                metadataTimeZone={settings?.metadataTimeZone}
                onActivate={handleInsightActivate}
                onDropped={onClose}
            />
        ),
        [settings?.metadataTimeZone, handleInsightActivate, onClose],
    );

    return (
        <Dialog
            className="gd-insight-picker-panel s-insight-picker-panel"
            containerClassName="gd-insight-picker-panel-overlay"
            isModal={false}
            shouldCloseOnClick={() => true}
            closeOnEscape
            onClose={onClose}
            alignPoints={[{ align: "bc bc" }]}
        >
            <InsightPicker
                author={author}
                includeTags={includeTags}
                excludeTags={excludeTags}
                metadataTimeZone={settings?.metadataTimeZone}
                enableDescriptions={settings?.enableDescriptions}
                enableSemanticSearch={false}
                maxHeight={350}
                width={718}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                authorFilter={authorFilter}
                onAuthorFilterChange={onAuthorFilterChange}
                tagFilter={tagFilter}
                onTagFilterChange={onTagFilterChange}
                onSelect={handleSelect}
                onItemActivate={(_item: IInsightPickerItem, sourceInsight?: IInsight) => {
                    if (sourceInsight) {
                        handleInsightActivate(sourceInsight);
                    }
                }}
                renderItem={renderItem}
            />
        </Dialog>
    );
}
