// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { extendedReferencePointChanged } from "../../actions/report_actions.js";
import { applyMetricPostponedShortcut } from "../../actions/shortcuts_actions.js";
import { ATTRIBUTE, MEASURES, METRIC } from "../../constants/bucket.js";
import { runBucketsTrigger } from "../../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IRawBuckets } from "../../typings/buckets.js";
import { BucketsOperationActionTypeKeys } from "../buckets/buckets_operation_events.js";
import { type IAppState } from "../types.js";

import { watchDispatchPostponedAction } from "./postponed_action_sagas.js";
import { getPostponedAction } from "./postponed_action_selectors.js";
import { ShortcutsOperationActionTypeKeys } from "./shortcuts_operation_events.js";

/**
 * THE REPLAY MUST LAND ON THE APPLIED REFERENCE POINT, not under it.
 *
 * `EXTENDED_REFERENCE_POINT_CHANGED` is an operation that commits in a LATER dispatch. If the
 * replayed shortcut ran before that commit, it would add its measure and then have
 * `extendedReferencePointApplied` overwrite `data.buckets` with the plug viz's answer, which does not
 * contain it — leaving the measures bucket EMPTY.
 *
 * It lives in its own file because `postponed_action_sagas.test.ts` runs in the `node` environment and
 * the real reducer chain this drives needs a DOM.
 *
 * The co-watcher is registered FIRST, which is the adversarial order and was the production order. The
 * guarantee has to hold without depending on the position of an entry in `sagas/sagas.ts`.
 */
describe("the postponed replay against the buckets operations", () => {
    const catalogItem = { identifier: "metric.amount", type: METRIC, title: "Amount", id: "metric.amount" };

    /** The bucket skeleton of a freshly picked column chart — the shape, with nothing in it yet. */
    const emptyBuckets = (): IRawBuckets => [
        { localIdentifier: MEASURES, items: [] },
        { localIdentifier: ATTRIBUTE, items: [] },
    ];

    function parkedState(): IAppState {
        const withBuckets = withData(getInitializedState(), { buckets: emptyBuckets() });

        return withData(withBuckets, {
            postponedAction: applyMetricPostponedShortcut(catalogItem),
        }) as IAppState;
    }

    /**
     * The plug viz answering for the freshly picked column chart. Its buckets are the SKELETON and carry
     * no measure — which is the whole point: this value overwriting the replay is what dropped the item.
     */
    const plugVizAnswered = extendedReferencePointChanged({
        buckets: emptyBuckets(),
        filters: { localIdentifier: "filters", items: [] },
    } as never);

    it("commits the reference point BEFORE it replays the parked shortcut", () => {
        const { dispatched } = runBucketsTrigger(parkedState(), plugVizAnswered as never, [
            watchDispatchPostponedAction,
        ]);

        expect(dispatched.map((action) => action.type)).toEqual([
            "EXTENDED_REFERENCE_POINT_CHANGED",
            BucketsOperationActionTypeKeys.STORE_EXTENDED_REFERENCE_POINT_APPLIED,
            "SHORTCUT_APPLY_METRIC_POSTPONED",
            // the replayed trigger writes nothing either — its own operation commits the
            // add AFTER the applied reference point, which is the ordering this suite exists to pin
            ShortcutsOperationActionTypeKeys.STORE_METRIC_SHORTCUT_APPLIED,
        ]);
    });

    it("leaves the replayed measure in the bucket", () => {
        const { state } = runBucketsTrigger(parkedState(), plugVizAnswered as never, [
            watchDispatchPostponedAction,
        ]);

        expect(state.data.buckets[0].items).toHaveLength(1);
        // ...and the replay consumed its own parked action
        expect(getPostponedAction(state)).toBeUndefined();
    });
});
