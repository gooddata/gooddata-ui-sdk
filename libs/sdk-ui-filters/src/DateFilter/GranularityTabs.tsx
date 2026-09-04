// (C) 2019-2026 GoodData Corporation

import { sortBy } from "lodash-es";
import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity, getGranularityDescriptor } from "@gooddata/sdk-model";
import { type IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";

import { granularityIntlCodesFull } from "./constants/i18n.js";
import { Tab, TabsWrapper } from "./Tabs/Tabs.js";

// Canonical coarse→fine order from the registry (fiscal ranked next to its standard sibling).
const sortGranularities = (granularities: DateFilterGranularity[]): DateFilterGranularity[] =>
    sortBy(
        granularities,
        (granularity) => getGranularityDescriptor(granularity)?.order ?? Number.MAX_SAFE_INTEGER,
    );

export interface IGranularityTabsProps {
    availableGranularities: DateFilterGranularity[];
    selectedGranularity: DateFilterGranularity;
    accessibilityConfig?: IAccessibilityConfigBase;
    onSelectedGranularityChange: (granularity: DateFilterGranularity) => void;
    /**
     * Class names applied to the tabs' wrapper element. Caller-supplied - there is no default, since
     * this component is shared by multiple, independent tab groups (relative form, absolute form).
     */
    className: string;
    /**
     * DOM id applied to the selected tab; see {@link ITabProps.selectedTabId}. Caller-supplied - there
     * is no default.
     */
    selectedTabId: string;
}

export function GranularityTabs({
    availableGranularities,
    selectedGranularity,
    accessibilityConfig,
    onSelectedGranularityChange,
    className,
    selectedTabId,
}: IGranularityTabsProps) {
    return (
        <TabsWrapper className={className}>
            {sortGranularities(availableGranularities)
                .map((granularity) => {
                    const intlGranularity = granularityIntlCodesFull[granularity];
                    if (intlGranularity === undefined) {
                        return null;
                    }
                    return (
                        <Tab
                            key={granularity}
                            selected={granularity === selectedGranularity}
                            onClick={() => onSelectedGranularityChange(granularity)}
                            className={`s-granularity-${intlGranularity}`}
                            accessibilityConfig={accessibilityConfig}
                            selectedTabId={selectedTabId}
                        >
                            <FormattedMessage id={messages[intlGranularity].id} />
                        </Tab>
                    );
                })
                .filter(Boolean)}
        </TabsWrapper>
    );
}
