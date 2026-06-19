// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

export const useCommonDateFilterTitle = (intl: IntlShape) => {
    const { dateFilterContextConfig } = useAutomationsContext();

    return dateFilterContextConfig?.filterName ?? intl.formatMessage({ id: "dateFilterDropdown.title" });
};
