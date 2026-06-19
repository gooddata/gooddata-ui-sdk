// (C) 2026 GoodData Corporation

import { useWidgetAutomationFilters as useWidgetAutomationFiltersCanonical } from "../../connectors/hooks/useWidgetAutomationFilters.js";

// Delegates to the canonical implementation in connectors.
// This file will be removed in the scheduled-email separation PR.
export const useWidgetAutomationFilters = useWidgetAutomationFiltersCanonical;
