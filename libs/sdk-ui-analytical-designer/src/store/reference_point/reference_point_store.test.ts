// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { openReportFailed, openReportStarted } from "../../actions/open_actions.js";
import { INITIAL_MODEL } from "../../models/bucket_item.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IApplicationResetCarrier } from "../../typings/application_reset.js";
import { buildOpenReportFailed } from "../../utils/open_report_actions.js";

import { getReferencePoint } from "./reference_point_selectors.js";
import { referencePointSliceReducer } from "./reference_point_slice.js";
import { referencePointInitialState } from "./reference_point_state.js";

/**
 * The referencePoint store. Every spec drives the REAL root reducer, because that is where the
 * contract lives: OPEN_REPORT_FAILED is one of the application resets, and the slice COMPOSES the
 * not-found flag with the reset in its own matcher case — reset first, flag on top.
 */
const testCarrier: IApplicationResetCarrier = { sessionId: "fresh", defaultVisualizationClass: null };
describe("referencePoint store", () => {
    it("seeds the subtree with the domain's own initial state", () => {
        const state = getInitializedState();

        expect(getReferencePoint(state)).toEqual(referencePointInitialState);
        // the buckets leaf shares the buckets slice's frozen INITIAL_MODEL identity
        expect(getReferencePoint(state).buckets).toBe(INITIAL_MODEL);
    });

    describe("OPEN_REPORT_STARTED", () => {
        it("drops everything the previous insight put here and keeps an empty buckets model", () => {
            // an empty buckets model and nothing else
            // pair in openReportApplyReducer produced, before the write moved into the slice
            const dirty = withData(getInitializedState(), {
                referencePoint: {
                    buckets: [{ localIdentifier: "measures", items: [{ localIdentifier: "m1" }] }],
                    reportNotFound: true,
                    firstRender: true,
                },
            });

            const next = rootReducer(dirty, openReportStarted("projectId", "reportId"));

            expect(getReferencePoint(next)).toEqual({ buckets: INITIAL_MODEL });
            expect(getReferencePoint(next).buckets).toBe(INITIAL_MODEL);
        });
    });

    describe("OPEN_REPORT_FAILED", () => {
        it("sets reportNotFound on the reset reference point when there is no reason", () => {
            const state = getInitializedState();
            const next = rootReducer(state, buildOpenReportFailed(state));

            // the reset and the flag are ONE composed case now — the pristine reference point
            // plus the flag on top
            expect(getReferencePoint(next)).toEqual({ ...referencePointInitialState, reportNotFound: true });
        });

        it("resets the reference point without the flag when a reason is present (the report domain owns the error)", () => {
            const state = getInitializedState();
            const next = rootReducer(state, buildOpenReportFailed(state, false, "incorrectMetadata"));

            expect(getReferencePoint(next)).toEqual(referencePointInitialState);
        });

        it("is a no-op on a repeated failure — the composed reset value is ONE module constant", () => {
            const failed = referencePointSliceReducer(
                referencePointInitialState,
                openReportFailed(testCarrier),
            );
            const failedAgain = referencePointSliceReducer(failed, openReportFailed(testCarrier));

            expect(failed.reportNotFound).toBe(true);
            expect(failedAgain).toBe(failed);
        });

        it("answers the initial state by IDENTITY when a reason-carrying failure hits a pristine reference point", () => {
            const next = referencePointSliceReducer(
                referencePointInitialState,
                openReportFailed(testCarrier, false, "incorrectMetadata"),
            );

            expect(next).toBe(referencePointInitialState);
        });
    });
});
