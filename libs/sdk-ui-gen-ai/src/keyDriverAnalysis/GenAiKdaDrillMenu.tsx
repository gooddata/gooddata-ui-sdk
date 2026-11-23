// (C) 2026 GoodData Corporation

import { type IDashboardKeyDriverCombinationItem } from "@gooddata/sdk-ui-dashboard";

import { DrillSelectDropdownMenu } from "../components/messages/contents/drill/DrillSelectDropdownMenu.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";

/**
 * Props for the Key Driver Analysis comparison menu.
 *
 * @internal
 */
export type GenAiKdaDrillMenuProps = {
    /** Comparisons returned by {@link getKdaDrillCombinations}. */
    combinations: IDashboardKeyDriverCombinationItem[];
    /** Called with the comparison selected by the user. */
    onSelect: (comparison: IDashboardKeyDriverCombinationItem) => void;
    /** Called when the menu requests closing, including after selection. */
    onClose: () => void;
    /** Locale for the menu labels. Defaults to en-US. */
    locale?: string;
};

/**
 * Renders the AI Assistant's localized Explain comparison menu for a custom chart.
 *
 * @remarks
 * This is the menu body only. The caller controls its visibility, placement, and trigger's expanded state.
 * No surrounding internationalization provider is required.
 *
 * @param props - Comparisons, locale, and selection and close handlers.
 * @internal
 */
export function GenAiKdaDrillMenu({ combinations, onSelect, onClose, locale }: GenAiKdaDrillMenuProps) {
    return (
        <IntlWrapper locale={locale}>
            <DrillSelectDropdownMenu
                drillState={{ keyDriverData: combinations }}
                onSelect={(item) => onSelect(item.data.context as IDashboardKeyDriverCombinationItem)}
                onClose={onClose}
            />
        </IntlWrapper>
    );
}
