// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAutomationsContext } from "./AutomationsContext.js";

describe("useAutomationsContext", () => {
    it("throws when used outside provider", () => {
        expect(() => renderHook(() => useAutomationsContext())).toThrow(
            "useAutomationsContext must be used within an AutomationsContextProvider",
        );
    });
});
