// (C) 2007-2026 GoodData Corporation

import { call } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { canManageProject } from "../../selectors/permissions_selector.js";
import {
    logPoweredByGDClickedAdmin,
    logPoweredByGDClickedNonAdmin,
} from "../../services/telemetry/tracking_events.js";

import { handlePoweredByGDCClicked } from "./powered_by_gdc_saga.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../selectors/permissions_selector", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("../../selectors/permissions_selector.js")>();
    return {
        ...actual,
        canManageProject: vi.fn(),
    };
});

describe("Powered by GoodData logger", () => {
    it('should yield "logPoweredByGDClickedAdmin" is user is an "admin"', () => {
        vi.mocked(canManageProject).mockImplementation(() => true);

        const saga = handlePoweredByGDCClicked();
        saga.next();
        expect(saga.next().value).toEqual(call(logPoweredByGDClickedAdmin, expect.anything()));
    });
    it('should yield "logPoweredByGDClickedNonAdmin" is user is not an "admin"', () => {
        vi.mocked(canManageProject).mockImplementation(() => false);

        const saga = handlePoweredByGDCClicked();
        saga.next();
        expect(saga.next().value).toEqual(call(logPoweredByGDClickedNonAdmin, expect.anything()));
    });
});
