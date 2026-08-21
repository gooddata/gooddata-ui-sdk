// (C) 2026 GoodData Corporation

import { type EnhancedStore } from "@reduxjs/toolkit";
// (C) 2024-2026 GoodData Corporation
import { useDispatch } from "react-redux";

/**
 * Hook to retrieve the GenAI dispatcher.
 *
 * @remarks
 * This hook must be used within a GenAiStore component.
 *
 * @public
 */
export function useGenAiDispatcher(): EnhancedStore["dispatch"] {
    return useDispatch();
}
