# AD Runtime State Management Migration: Immutable.js → Redux Toolkit

> **Status:** IN PROGRESS.
> **Scope:** `libs/gdc-analytical-designer` (all AD redux state lives here; `modules/gdc-analytical-designer/module` is a thin shell).
> **Delivery:** sequential, individually revertible PRs to production. Every PR leaves the app fully functional.
> **This file is the single source of truth for the migration.** Every migration PR updates the checklists below.

## 📌 Starting the next PR? Read this first

This file is the **plan**: what to do, in what order, and the gates to pass. What each delivered PR
actually _found_ lives in its companion — **[MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md)**.
Every phase section below links its own note.

Before writing any code for the next phase, read, in this order:

1. **§0** — where the migration stands and what "next up" says.
2. **§4.8 — the definition of done.** Non-negotiable, and short. It exists because the Phase 10.9
   prototype passed every phase gate and still shipped the wrong architecture: whole-root
   `State → State` transformers invoked from a saga, addressing domain state by path.
3. **The §5 row for your phase**, plus §3 (frozen action strings, dual-mode shim) and §4.3 (services
   dissolution rule).
4. **§7** — the slice recipe and the "gate before calling a domain done" checklist. Do not skip the
   gate list; every entry on it is there because a previous phase paid for it.
5. **The delivery notes** for (a) every phase that touched the domain or cluster you are about to
   touch — §6 tells you which — and (b) the two or three phases immediately before yours.

Step 5 is the one that is tempting to skip and the one that has cost the most. Each of the
migration's expensive surprises was discovered in one phase and was only avoidable in the next
because someone wrote it down: the mixed-container critical that shipped as #11767 (Analyze would
not load at all), the main-thread freeze that timed out 24 e2e specs, the `setIn` idempotence
premise that turned out to be false. §7 is the short form of those lessons; the notes are the
reasoning, the reproduction and the blast radius.

---

## 0. Progress

**57 / 57 plan items done (100 %) — THE MIGRATION IS COMPLETE.** Row 12.4 landed the finish line;
row 12.5 is the follow-up it exposed. Phase 9 (saga batching, 3 items) is **WON'T DO** — dropped
after investigation, reasoning in its §5 section; the work it was implicitly carrying moved to
Phase 11 (rows 11.1–11.7) and Phase 12 (row 12.2), so it cost the total nothing (3 out, 3 in).

**ROW 12.5 — THERE IS ONE ACTION IDIOM, AND DISPATCH IS TYPE-CHECKED AGAIN.** 148 hand-written
action creators became `createAction`s (242 → 390 in the package), across 34 modules the earlier
rows had left alone, and every hand-written per-action interface became
`ReturnType<typeof creator>`:

- **`AnyAction` is out of the package, and that was the whole point.** `create_store.ts`'s
  `as unknown as Store<IAppState, AnyAction>` is deleted — `configureStore` INFERS the store — and
  `store/types.ts#AppDispatch` is `Dispatch<UnknownAction>`, the store's real dispatch.
  `AnyAction`'s `[key: string]: any` meant **`dispatch()` accepted any object with a `type`**, so
  none of the ~60 typed call sites were checked at all. Two compile-time pins in
  `create_store.test.ts` hold it: `AppDispatch` and `typeof store.dispatch` must stay mutually
  assignable (a middleware that widens dispatch has to be reflected, not silently absorbed), and a
  hand-written interface action must stay UNassignable — the pin is a `@ts-expect-error`, so if
  dispatch ever goes permissive again the unused directive fails the build.
- **The cause was a TypeScript rule, not a preference.** An `interface` never gets an implicit index
  signature, so a hand-written `{ type: X; payload: … }` interface is not assignable to redux 5's
  `UnknownAction`; RTK's `PayloadAction` is a type ALIAS over an object literal, so it is. That one
  asymmetry is why the permissive dispatch existed, and why converting the creators is what removes
  it — there was no way to keep both idioms and check dispatch.
- **The dispatch call sites are one idiom.** 8 `useDispatch<Dispatch<SomeUnion>>()` (per-domain
  narrow dispatches — a workaround with no rule behind it) and 25 bare `useDispatch()` became
  `useDispatch<AppDispatch>()`, joining the 25 that already were: **68 identical sites**.
  Deliberately react-redux's hook directly and NOT a `useAppDispatch` re-exported from
  `store/hooks.ts` — that indirection is incompatible with this suite and the reason is in §7
  (`isolate: false` + 25 files that mock react-redux; it cost three suites intermittent failures
  before it was diagnosed).
- **25 `addCase(ActionTypeKeys.X, (state, action: IFooAction) => …)` became
  `addCase(creator, …)`** in the messages and dialogs slices, so the payload type comes from the
  creator and the manual annotations are gone. The 9 in `intl_slice.ts` /
  `app_context_slices.ts` deliberately STAY on the string form: a value import of
  `actions/app_context_actions.js` would drag jquery (a `window` read at import time) into the
  reducer graph and break node-env consumers. Their type-only `ReturnType<typeof creator>`
  annotations are exactly as safe.
- **Two traps found, both documented in §7.** `createAction<P>(TYPE)` — supplying only the payload
  generic makes TypeScript default the second one to `string`, which ERASES the literal `type` and
  silently breaks every discriminated-union `switch`; it cost three reducers their narrowing, and
  the 33 Phase-11 operation-event creators were already written that way. And **a module that
  re-exports a react-redux hook cannot be shared under `isolate: false`** — it links to whichever
  `react-redux` the worker's registry held when it was first evaluated, which produced flaky
  "dispatch was never called" failures in the suites that spy on a real store instead of mocking.
- **Deleted:** `typings/action.ts` (`IAction { type: any; payload: any; [key: string]: any }` — the
  loosest action type in the package, zero importers, slated for deletion by §4.7 since the flip)
  and four dead report action interfaces with no creator and no dispatcher. Net **−982 lines**.

**ROW 12.4 — THE TRANSITION INFRASTRUCTURE IS GONE, AND THE GATE REPLACED IT.** There is no path
shim, no path module and no loose root type left in the package:

- `constants/state_paths.ts` and **all eleven domain `*_paths.ts` modules** are DELETED (146 path
  constants). `utils/state_access.ts` is DELETED. `store/_infra/slice_selector.ts` is DELETED — its
  43 domain input selectors are typed property reads (`(state: IAppState) => state.data.buckets`).
- `typings/state.ts` is DELETED, and with it the `State` alias whose `appState`/`data`/`report` were
  `Record<string, any>`. **`store/types.ts#IAppState` is now the only root type**: closed at every
  level (no index signature anywhere), every branch naming its owning domain's state type, **zero
  `any`**. `reducers/combined_root_reducer.ts` asserts it and the reducer-inferred
  `ICombinedRootState` are mutually assignable, so the hand-written shape cannot drift from the
  mount table — a reducer key with no declaration, or a declaration nothing owns, fails
  `build-check`.
- ~1,900 call sites converted: 513 + 236 path reads to property access, 719 root writes to typed
  writes, 44 `sliceSelector` mounts, and every value-level `getIn` re-pointed at
  `utils/value_access.ts` (the legitimate deep-addressing-inside-a-domain-value utility §4.8.4's
  last paragraph allows to survive — now with its callers named and its module scope enforced).
- **`scripts/audit-immutable-provenance.mjs` and its ratchet baseline are DELETED** and
  `scripts/audit-state-architecture.mjs` took their place in `validate`. Every provenance detector
  ([A]–[I]) described an Immutable/plain collision, and 12.3 removed the last container that could
  produce one — a gate that can no longer fail teaches nobody anything. The new gate enforces §4.8
  instead (R1–R6: root→root functions, the root type in value modules, path-addressed root access,
  path modules, the banned cluster/change-set vocabulary, reducer ownership) and runs at **0
  findings**. Four of the rules also went into `.dependency-cruiser.js`, where the import-graph half
  is checkable structurally.
- What the closed type FOUND, none of which any previous gate could see: `IUndoableState` claimed an
  `appState` that `captureSnapshot` had always stripped `messages` from; a fixture seeding
  `data.dateDatasets.dateDataset`, a key no reducer owns; `OverTimeComparisonType` vs
  `overTimeComparisonType` in a log-formatter fixture; `loadingError: "some-loading-error"` against
  a leaf whose only legal value is `"incorrectMetadata"`; and **eight fixtures still seeding
  `visualizationClass` in the pre-tiger `{ meta, content }` MD-object shape** production has not
  produced since the leaf went plain. Each is the "fixture seeds the old container" class the §7
  gate list has warned about since 4.5 — this time caught by the compiler rather than by a customer.

**Rows 12.2 + 12.3 REMOVED THE `immutable` DEPENDENCY (ONE PR).** `redux-batched-actions` and its
inert `enableBatching` wrap came out first (12.2 — added in 1.1 for the Phase 9 that is WON'T DO;
nothing ever dispatched a batch). Then 12.3: `immutable` + `immutable-devtools` are out of
package.json, **nothing imports `immutable`** — not production, not a test, not a mock — and the
provenance audit gates at ZERO findings. What physically went: `immutable-compat.d.ts`,
`typings/immutable_map.ts`, `utils/reducers.ts` (`compose`), `_infra/lift_slice.ts`,
`_infra/plain_subtree.ts`, the 22 test-era per-domain `<domain>_reducer.ts` lift mounts (their
store suites drive `combinedRootReducer` now — which surfaced that a stubbed open-report result no
longer suffices once EVERY owning slice consumes the payload, and that root-identity pins must
scope to the owning branch because e.g. a re-save legitimately pushes a fresh toast), the
Immutable branches of `utils/value_access.ts` / `utils/collection_access.ts` (semantics kept
verbatim — negative-index wrap, identity-preserving map/filter; `toPlain` survives as a named
identity seam until 12.4), every model/selector/component `isImmutable`/`fromJS`/`List`/`Map`
normalization, and the dialog apply payload's Immutable `List` (`IUpdateAttributeFilterPayload.
selectedElements` is a plain array now). `mixed_root_contract.test.ts` was DELETED — it pinned
immutable.js library behavior that no longer has a subject. **One deviation from the row as
written: `typings/state.ts` is NOT deleted.** The row's file list predates the file's rewrite —
the Immutable `State = Map<string, any>` alias it targeted died long ago; today the module is the
PLAIN transitional root alias (253 importers) plus the time-travel types, and its own doc says it
dies with the shim at 12.4, which is where it now belongs. Test assertions that pin "the state is
not Immutable" kept their teeth through the duck-typed `utils/immutable.ts#isImmutable` (no
package dependency).

**Row 11.7 EMPTIED THE WRAPPER STACK.** The five remaining transitional whole-root transformers are
DELETED — the appContext reset/sessionId transformer, the router wrapper, `openReportApplyReducer`,
`deleteReportApplyReducer` and `executionApplyReducer` — and `reducers/root_reducer.ts` is the
combined core plus the two sanctioned infrastructure wrappers (§4.8.1: time travel and the
pluggable-mount reset). The application resets are SEMANTIC EVENTS the owning slices honor in their
own extraReducers (`store/app_context/application_reset_events.ts` is the single inventory, with a
key-set pinning test); the recomputed values (fresh sessionId, re-defaulted visualization class)
ride ON the events as a carrier built at the dispatch boundary, so every reducer stays pure.
LOCATION_CHANGED is a pure trigger — the router saga computes the route pair, commits it with ONE
`routeChanged` event (the action carries the previous route, so `route`/`previousRoute` are
independent leaves) and decides the whole-application reset; OPEN_REPORT_FINISHED carries the
open-report OPERATION's fused result (store/report/open_report_operation.ts) consumed by twelve
owning slices in the same single dispatch the legacy chain committed in; the delete saga attaches
the reset carrier exactly when the deleted report is the open one; and the id-guarded
`report.nowOpen` close is the execution domain's coordination event. `appState.sessionId`,
`appState.locationRedirectLock`, `route` and `previousRoute` all have real owners — the only
`holdSubtree` key left is `timeTravel`, whose only writer is the infrastructure wrapper by design.

**Row 11.6 CLOSED THE BUCKETS CLUSTER.** `store/bucket_filters/bucket_filters_reducer.ts` — the last
cluster wrapper — is DELETED, and with it all six buckets-cluster wrappers are gone from
`reducers/root_reducer.ts`; what remains in the wrapper stack is the report family's two entries
(row 11.7). Its eleven triggers split as §2.3 of the architecture notes predicted: both
display-form triggers are one plain filter-bar case, the nine cascade triggers are saga operations
committing nine semantic events. The 11.4-mandated put-trigger-then-select audit found TWO genuine
hazards (`control_filtering_saga`'s command follow-up, `sagas/date_datasets`' `isPoPSetup` read),
both fixed with a `take` of an ALWAYS-FIRED event. The stored bucket-item metric filter got its own
type and the family's last `any`s and its last `isImmutable` branch died with the wrapper.

**Row 11.5 DISSOLVED THE FOUR SMALL FAMILIES.** The properties / arithmetic-measures /
recommendations / shortcuts wrappers left the chain the same way — one operation module, one events
module, one saga per family; three triggers turned out to be plain leaf cases; the audit found the
properties too-long-push undo tail and moved it INTO the operation handler. The full record is the
§5 row and its delivery note.

**Row 11.4 IS THE ARCHITECTURE ARRIVING.** `store/buckets/buckets_apply_reducer.ts` is DELETED and out of
`reducers/root_reducer.ts`; `store/buckets/buckets_reducer.ts` went with the fake dispatch it existed for.
Its 24 triggers write NOTHING now — each is answered by a saga that selects the typed domain values it
needs, calls narrow pure operations and commits ONE semantic event, which the owning slices and leaves
consume as ordinary cases. So a gesture is one write to `data`, and the intermediate state the legacy
chain exposed (buckets already changed, reference point not yet) does not exist. `data.referencePoint`
finally owns the SYNC it has been waiting for since 11.1, `data.bucketsMeta` is a slice, and the extended
reference point / md-object flag / derived-measure queue stopped being `holdSubtree` leaves. Three
findings the code forced on the design notes are recorded in §5's row and in the delivery note — the add
commits nine domains rather than six, the reorder never ran the removal chain, and DUAL AXIS needed an
event of its own because it decides two domains. What is left of the buckets cluster is rows 11.5–11.7.

**Row 11.3 finished `services/buckets_service.ts`.** Nothing in the buckets cluster's computations
takes the root state anymore: the derived reads, the totals and date rules, the add/remove/swap item
writers, the sort-item validation and the two genuinely wide cross-domain calculations
(`removeBucketItemsWithDependencies`, `setBucketItemOverTimeComparison` — each with an explicit named
input AND result) are narrow pure helpers over domain values, and the service is adapters. The eight
private `(state) => State` sanitizers under the removal chain are gone with it, and one more whole-root
facade is deleted (`BucketsMetaService`). The addressing boundary is now clean in both directions: the
cluster's value-level helpers import `utils/value_access.ts`, and `utils/state_access.ts` is left with
only the ROOT-facing receivers — the adapters and the not-yet-dissolved selectors — which is what makes
it answerable at 12.4 whether that module can go. What is left of the buckets cluster is the
ORCHESTRATION — rows 11.4–11.6.

**Row 11.2 turned the five small services into NARROW PURE HELPERS.** Every operation over the
filter bar, the reference-point sync, the derived-measure queue, the over-time-comparison rules and
the measure-date-dataset selection now takes ONE domain value plus explicit arguments and answers a
domain value (§4.8.2); each whole-root entry point is a three-line adapter that reads with the shim,
calls the helper and writes back, so nothing above them changed and they die with their callers at
rows 11.4–11.7. One whole-root facade is already gone (`MeasureDateDatasetsService`), and the
`isVisualizationMdObjectValid` flag is named for what it is: an OUTPUT of the mutating operation,
not reference-point state.

**Row 11.1 landed the LAST CONTAINER FLIP.** `data.referencePoint`,
`data.extendedReferencePoint` and `data.postponedAction` are plain, `referencePoint` is a real
slice, and **no Immutable collection is left anywhere in the state tree** — which retires two
transition-era mechanisms at once: `create_store.ts`'s ignore list is down to its one permanent
performance entry (and is renamed `DEV_CHECK_IGNORED_PATHS`, because it no longer has anything to
do with Immutability), and the provenance audit's IMMUTABLE classification is empty. What remains
of the migration is architecture and cleaning, not containers.

**The total grew 44 → 49 after PR 10.1–10.2, and the percentage went DOWN from 89 % to 80 %.** That
is a correction, not a regression: five container flips (Phase 10 rows 10.3–10.7) were promised in
code comments rather than plan rows and were therefore never counted — see the note above the Phase
10 table. Everything previously ticked is still delivered.

**Phase 10 is CLOSED at 10.8, and its four unstarted rows are re-planned as Phases 11 and 12.**
The total grew 49 → 56 and the percentage went DOWN from 92 % to 80 % — the same kind of correction
as the 44 → 49 one above, and again because work that existed only inside a row description got its
own row. What happened, in order:

1. Row 10.9 was written as ONE row for "cascades out of the reducer chain + the last flip". It was
   PROTOTYPED on branch `imj-stl-3150-p10-9-experiment` (NOT merged, NOT part of this PR) and the
   prototype is what exposed the problem: it satisfied every phase gate — suite green, `validate`
   green, provenance audit at 0, atomicity preserved — while keeping the exact architecture the
   migration exists to remove. The six cascades stayed whole-root `State → State` transformers,
   just invoked from a saga; slice ownership was recovered by DIFFING the computed root over an
   array of path constants and shipping a path-keyed write map in one fused event. **A whole-root
   transformer is not migrated by being called from a saga, and a path-keyed write map is not typed
   domain state.** §4.8 now says so, and it is required reading before any Phase 11 row.
2. The prototype's real findings are kept — as EVIDENCE, not as code: the three flip landmines the
   compiler could not see, the `cloneDeep` verification at the plug-viz boundary, the one-dispatch
   atomicity argument, the take-audit and its two re-pointed watchers, and the identity/idempotence
   behavior of every cluster writer. They are written up in the delivery notes as an experiment note
   and drive the Phase 11 rows.
3. The remaining work turned out to be six architecture rows, not one, plus the four cleanup rows —
   too much for a phase whose subject was "cleanup". So Phase 10 ends at 10.8 (its subject was the
   container flips and the consistency pass, and both are done), **Phase 11** carries the
   architecture (the last flip, the service dissolution into narrow pure helpers, the saga
   orchestration with semantic fused events, the remaining root transformers) and **Phase 12**
   carries the cleaning (strict composition, batching residue, Immutable removal, and the
   `state_paths`/`state_access` deletion audit with the architecture gates).

Nothing previously delivered was un-delivered. The re-plan PR contained **only the plan** — no
production code — which was deliberate: the architecture is the decision, and the migration had by
then paid twice for letting code get ahead of an undocumented finish line. Row 11.1 is the first
row executed against it.

**The container inventory is EMPTY as of row 11.1, and that is what closes the axis.** It was
`create_store.ts`'s `IMMUTABLE_FAMILY_PATHS` — the AUTHORITATIVE list of what was still Immutable at
runtime, because RTK's dev `serializableCheck` / `immutableCheck` fire on anything Immutable that is
NOT on it, which a grep of `*_state.ts` can never tell you (four of its paths were `holdSubtree`
leaves with no state module at all — precisely how the first draft of 10.3–10.7 missed them). Every
entry mapped to a row via §6's **Container plain** column; 11.1 removed the last three. The one
surviving entry is `timeTravel`, a PERFORMANCE exclusion and not an Immutability one (row 12.3), so
the constant is named `DEV_CHECK_IGNORED_PATHS` now — **a new entry there is a regression, not a
worklist item.**

| Delivery               | Plan items | PR                                                           |
| ---------------------- | ---------- | ------------------------------------------------------------ |
| Phase 0 (0.1–0.4)      | 4          | #11424 (merged)                                              |
| Phase 1 (1.1 + 1.2)    | 2          | #11425 (merged)                                              |
| Phase 2 (2.1–2.4)      | 4          | #11426 (merged)                                              |
| Phase 3 (3.1–3.3)      | 3          | #11477 (merged)                                              |
| Phase 3 (3.4)          | 1          | #11481 (merged)                                              |
| Phase 4 (4.1–4.3)      | 3          | #11647 (merged)                                              |
| Phase 4 (4.4)          | 1          | #11662 (merged)                                              |
| Phase 4 (4.5)          | 1          | #11738 (merged)                                              |
| Phase 4 (4.6)          | 1          | #11748 (merged)                                              |
| Phase 4 (4.7)          | 1          | #11756 (merged)                                              |
| Phase 4 (4.8a + 4.8b)  | 2          | #11786 (merged)                                              |
| Phase 4 (4.9)          | 1          | #11851 (merged)                                              |
| Phase 4 (4.10)         | 1          | #11863 (merged)                                              |
| Phase 4 (4.11)         | 1          | #11879 (merged)                                              |
| Phase 5 (5.1 + 5.2)    | 2          | #12111 (merged)                                              |
| Phase 6 (6.1–6.4)      | 4          | #12122 (merged)                                              |
| Phase 7 (7.1)          | 1          | #12125 (merged)                                              |
| Phase 7 (7.2 + 7.3)    | 2          | #12188 (merged)                                              |
| Phase 8 (8.1 + 8.2)    | 2          | #12241 (merged)                                              |
| Phase 9 (dropped)      | 0          | #12250 (merged)                                              |
| Phase 10 (10.1 + 10.2) | 2          | #12261 (merged)                                              |
| Phase 10 (10.3)        | 1          | #12272 (merged)                                              |
| Phase 10 (10.4)        | 1          | #12274 (merged)                                              |
| Phase 10 (10.5)        | 1          | #12281 (merged)                                              |
| Phase 10 (10.6)        | 1          | #12306 (merged)                                              |
| Phase 10 (10.7)        | 1          | #12312 (merged)                                              |
| Phase 10 (10.8)        | 1          | #12472 (merged)                                              |
| Phase 11 (the plan)    | 0          | #12476 (merged)                                              |
| Phase 11 (11.1)        | 1          | #12481 (merged)                                              |
| Phase 11 (11.2)        | 1          | #12487 (merged)                                              |
| Phase 11 (11.3)        | 1          | #12494 + #12497 (merged; the second branch is named `p11-4`) |
| Phase 11 (11.4)        | 1          | #12557 (merged)                                              |
| Phase 11 (11.5)        | 1          | #12725 (merged)                                              |
| Phase 11 (11.6)        | 1          | #12797 (merged)                                              |
| Phase 11 (11.7)        | 1          | #12979 (merged)                                              |
| Phase 12 (12.1)        | 2          | #12988 + #12991 (12.1b, the comment-only companion)          |
| Phase 12 (12.2 + 12.3) | 2          | #12997                                                       |

**Phase 7.2 + 7.3 — the combined root & initial-state dissolution (ONE PR).** Production
dispatch is `wrappers(combineBranch(...))`: every subtree key has an owning reducer at its
legacy path (`reducers/combined_root_reducer.ts`), the former `liftSlice` mounts unwrapped to
bare slice reducers, and the transitional cross-domain apply reducers run as ordered PRE/POST
wrappers around the core (`reducers/root_reducer.ts` documents why the order is load-bearing).
`combineBranch` is deliberately NOT redux's `combineReducers` while wrappers still write foreign
keys: it preserves unknown keys, permits `undefined` values and keeps the identity short-circuit
(swap for the strict one at Phase 10). `initial_state.ts` dissolved — the pristine state IS the
reducer's own default build (pristine == initialized; the dead `header`/`brandTitle` seeds are
gone), `RESET_FOR_PLUGGABLE_MOUNT` short-circuits to a fresh build, and the extended reference
point stays ABSENT until a plug viz reports one — its three formerly-unguarded deep writers now
materialize the Immutable container first (`ensureExtendedReferencePointContainer`; the 7.1
lesson applied at branch scope). 7.3: `serializableCheck`/`immutableCheck` enabled narrowed
(Immutable families ignored, actions ignored until Phases 8–10), `redux-validate-fsa` dropped,
`redux-watch` → `_infra/observe_store.ts`.

**Phase 8.1 + 8.2 — the time-travel redesign (ONE PR).** The undo/redo history moved from two
module-level arrays mutated in place inside a reducer into ordinary state at the root key
`timeTravel`, written by a higher-order reducer (`store/_infra/time_travel.ts`) wrapping the whole
wrapper stack. A snapshot is the UNDOABLE PROJECTION of the root, not the whole root — `report`,
`timezoneOverride`, `appState.messages` and `timeTravel` itself are excluded — which deletes the
`copyMessages` / `copyLastSavedReportIfAny` / `copyTimezoneOverride` restore fixups AND both
`updateHistory` callers (8.2, folded in: with `report` out of the snapshot they had nothing left to
rewrite). `appState.undo` / `appState.redo` are gone: both are derived from the stack lengths, so
the flags cannot drift out of sync with the stacks. Two latent bugs died with the singleton — a
project switch left pre-switch snapshots reachable, and two stores on one page shared a history.
Batch-awareness (§4.5) was deferred to 9.1 — which is now WON'T DO, so it is simply not needed:
nothing dispatches a batch. Deviations from the plan rows, with reasons, in the delivery note.

**Phase 10.1 + 10.2 — the shim-removal codemod (ONE PR).** `constants/state_paths.ts` is no
longer AD's state schema: it is the MOUNT TABLE, 63 exports down from 171, one entry per
`combined_root_reducer` mount. Where a subtree is plain and typed, its deep leaves are gone and
the domain's own selectors read them by property — `store/router/router_selectors.ts` (32 route
leaves deleted) is the reference. Where the value is still Immutable and cannot be read by
property yet, the leaves moved into the OWNING domain next to its selectors
(`store/reference_point/{,extended_}reference_point_paths.ts`, `store/properties/properties_paths.ts`,
plus `*_paths.ts` for execution / report / embedding / intl / date_datasets / shortcut date
datasets), and every read goes through a NAMED accessor that pins its `notSetValue` — so the
11.1 ERP/RP flip is a change inside one directory instead of a hunt across 40 files. Two type
lies the codemod exposed by typing the route query: `IHashFragments["query"]` was missing four
params the selectors read, and `ICustomRouteParams.showEmbedButton`/`apiTokenAuthentication` were
declared `boolean` while their only producer copies URL strings into them.

This PR also found that the plan was **missing an entire axis** — five container flips were promised
in code comments rather than plan rows and were therefore never counted. Phase 10 gained rows
10.3–10.7 for them and the item total went 44 → 49; the note above the Phase 10 table has the
mechanism. Removing the `immutable` dependency is now row 12.3, the last one, because 10.3–10.7
are its real precondition.

**Phase 10.3 — the itemCache flip.** `data.itemCache` is a plain object of plain entries, and the
three names its currency used to carry are ONE plain interface:
`typings/state_objects.ts#ICatalogEntry` (was `IImmutableCacheItem`, `IImmutableCatalogItem` and the
decorated item's `attribute: unknown`). §3.4's Immutable-in/Immutable-out contract for
`getAttribute` / `getAttributeByIdentifier` is retired — it existed BECAUSE this container did. The
flip DELETED its scaffolding rather than converting it: the `Map.isMap` invariant in
`models/item_cache.ts`, the three `fromJS` wraps in `getAttribute`'s merge (the 4.11 geo/raw-export
class — plain-into-plain cannot mix provenances), `createDateItem`'s `fromJS`, and the `fromJS(item)`
producers in `CatalogList` / `MeasureAttributeListItemOrganized` / `MeasureDateFilter` that existed
only so shared consumers could stay Immutable-idiom. **The buckets state family is renamed with it**
(`IImmutableBucket*` → `IRawBucket*`): that family has been plain since 4.11 and 4.11's note
promised this sweep.

**Phase 10.4 — the dateDatasets flip.** `data.dateDatasets.available` / `allItems` are plain
arrays of plain `IDateDataset`s — the flags were plain since 4.5, so this closes the domain
(`IDateDatasetsState extends IDateDatasets`; the stored value IS the plain read shape, and
`getPlainDateDatasets` hands out the state instead of a memoized `fromJS(...).toJS()` copy). The
three `IImmutable*` aliases the family carried are DELETED, and with them the scaffolding:
`DecoratedDateDatasets.createFromImmutable`'s `getIn(...).map(...).toArray()`,
`DecoratedDateDataset.createFromImmutable` (collapsed into `createDecorated`),
`date_dataset.ts#toItemList`, the `fromJS` in the slice / `fromMeta` / both apply-reducer writers /
`buckets_service`'s `{used}` builders, and the retired `getDateDatasets` accessor whose
`as unknown as` cast is what §10's latent-reader class hid behind. All four §10 latent
mixed-container readers are fixed (three `.size` sites read `.length`, the meta selectors'
`?? fallback` is a KIND check) and the §10 block that filed them is deleted — PR #12274 was its
scheduled owner.

**Phase 10.5 — the visualizationClass(es) flip.** `data.visualizationClasses` is the plain
sdk-model payload array stored VERBATIM, `data.visualizationClass` a plain `IVisualizationClass`
(or null) — the first domain whose plain shape needed NO local model at all, so
`typings/visualization_class.ts` and its two `IImmutable*` aliases are simply deleted. Every
Immutable idiom on the values became property access or `visClassUrl`; the two `is()` deep-equality
sites (`isDefaultVisualizationClass`, `VisualizationPicker`) read lodash `isEqual` — identity
usually holds now (the selected class is an element OF the stored list), but the external writers
re-derive the value, so equality stays the contract. The flip fixed a DEAD telemetry read:
`log_formatters#getVisualization` read the bear-era `["content", "url"]` off a payload that has
been SDK-shaped for years, logging `visualization: undefined` in production while a bear-shaped
fixture kept its test green. All three external writers (open_report, app-context reset,
`SELECT_VISUALIZATION_TYPE`) write state-derived values, so they flipped with the state. Next:
**PR 10.6** — `report.lastSavedObject`.

**Phase 10.6 — the lastSavedObject flip.** `report.lastSavedObject` is a plain `IReport`
(`typings/report.ts` — the bear visualization-object shape with a nullable `content`), and the
whole MD-OBJECT family flipped with it: `models/metadata.ts` lost all ~93 Immutable sites in one
pass (`makeImmutable` deleted, both transform directions consume and produce plain values),
`prepareForComparison` is a plain pipeline over `content`, `getNewReportMDObject`/
`getVisualizationForExportFromInsight`/`getMetricMDObject` build plain objects, and
`constructVisualizationMDObj` returns the content verbatim — no `fromJS` boundary anywhere on the
save/compare/open path. The `IImmutableMd*` aliases and `ImmutableReport(Content)` are DELETED;
consumers type against the bear family directly, and the previously untyped
`measureFilterToMd`/`constructVisualizationMDObj` signatures got real types in the same sweep.
The slice keeps the legacy idempotence contract with an EXPLICIT `isEqual` guard over
`current(state)` (§7: the guard is written, not inherited). Two boundaries stay dual-mode by
provenance: decorated-item `original`s can still be ERP-Immutable (reads stay on the shim,
extracted refs `toPlain`), and decoration passes `totals` through raw (normalized entering the
MD object). Next: **PR 10.7** — `data.visualizationProperties`.

**Phase 10.7 — the visualizationProperties flip (the last of the five container flips).**
`data.visualizationProperties` is a plain `IVisualizationProperties` (sdk-ui-ext's own push
currency — no local model needed), and `properties_helpers.ts` is the promised REWRITE: plain
merge with the colorMapping removal-entry semantics pinned by tests against the Immutable
implementation FIRST, then translated 1:1. The pinning found two DEAD branches the rewrite must
not resurrect (empty `thresholdMeasures` / `disableKeyDriveAnalysisOn` never deleted their keys —
`.length` on a List is undefined, `Object.keys` of a Map lists internals). Every helper entry
point normalizes inputs with `toPlain` because the saga still feeds it ERP-Immutable values until
11.1; the same boundary is mirrored at the three writes INTO the still-Immutable cluster
(`report_visualization_selector` per the plan's gate, the apply reducer's ERP write, open_report's
ERP/RP writes) while `syncReferencePoint`'s sortItems joins the RP_BUCKETS plain-by-reference
contract. The slice cases guard idempotence with explicit `isEqual(current(state), next)` (§7,
again). `IImmutableVisualizationProperties` SURVIVES — it now names only the ERP-provenance value,
which really is still an Immutable Map until 11.1. (**11.1 update:** it flipped, so the alias and
all three `toPlain`/`mirrorToContainer` boundaries above are GONE — one plain shape, one type.)
Next: **PR 10.8** — the consistency pass.

**Phase 10.8 — the consistency pass (last hand-written reducers → createSlice; stale-entry audit).**
The row's named list was stale — `ai` died at 4.1 and featureFlags/permissions were slice-ified
at 4.4 — so what actually remained was `data_sampling`, `measure_date_datasets`, and
`timezone_override` (same class as data_sampling, created after the row was written; joined the
pass). `measuresDateDatasets` turned out never to have needed its POST-core wrapper seat: every
write of `MeasureDateDatasetsReducer` landed inside `data.measuresDateDatasets`, so it became the
slice mounted there (`store/measure_date_datasets/`), its `fromJS`-built STATUSES flipped plain
with the RTK-ification, and its subtree mutations live in helpers the two SURVIVING external
writers (bucket_filters → 11.6, open_report → 11.7) share through the trimmed transitional
`MeasureDateDatasetsService` — one set of semantics for both write paths, the 10.3 item_cache
split. (**11.2 update:** the facade is gone; the two writers `updateIn` the subtree and call the
same helpers directly, so the shared semantics survive without a whole-root module.) The two scalar root leaves store `null` where the legacy reducers kept a present-undefined
key (createSlice cannot self-initialize from undefined); their selectors convert back to undefined
so the execution-config JSON shape is unchanged, and the DELETE case's `sessionStorage.removeItem`
side effect moved from the reducer to the domain saga. The stale-entry audit removed THREE
`IMMUTABLE_FAMILY_PATHS` entries — `data.measuresDateDatasets` (flipped here),
`data.shortcut.shortcutDroppedItem` (plain since 10.3; `getDroppedCatalogItem`'s `IRawBucketItem`
fossil retyped to `ICatalogEntry`), and `data.attributeElements` (plain since 3.2 — and its
populate actions are dispatched NOWHERE, the domain looks dead; backlog) — with populated-subtree
pins in `root_flip_contract.test.ts`, because an empty subtree never trips `serializableCheck`.
The 8 already-plain hand-written domains §6 offered to "RTK-ify opportunistically or in 10.8"
stay hand-written on purpose: they hold no Immutable values, so they gate nothing in Phases 11–12
(filed in §10). **Phase 10 is CLOSED with this row** — what was left of it (the cascade
dissolution, the last flip, the remaining root transformers, the cleanups) is re-planned as
Phase 11 (the architecture) and Phase 12 (the cleaning); see §0 and §5.

Tracking convention: every migration PR

1. updates this section — tick the delivered items in §5, bump the count here, fill in the previous
   row's PR number — and the §6 per-domain row;
2. **appends its delivery note** to
   [MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md)
   (add it to that file's Contents table) and links it from its phase section below — the note is
   where conventions locked in, traps hit, deliberate behavior changes and deferred work go, so
   that the plan itself stays a plan;
3. copies a "Migration progress" section with the same numbers into its PR description.

Keep the notes in the companion file, not here. A finding worth writing down is worth writing down
in full, and it will not fit in a plan that stays readable.

---

## 1. Why

The current architecture blocks maintainability and type safety:

- Root state is one Immutable.js `Map` — `fromJS({appState, data, report})` in `src/reducers/initial_state.ts`. `State` is effectively `Map<string, any>`; `src/typings/immutable-compat.d.ts` deliberately re-widens every Immutable read to `any`. Nothing in the state tree is statically checked.
- There is **no `combineReducers`**. `src/reducers/root_reducer.ts` chains 27 reducers via a custom `compose()` (`src/utils/reducers.ts`) — every reducer receives and returns the _whole_ root state. There are no slice boundaries.
- "Services" (`src/services/`, 36 files / ~5,700 LOC; `buckets_service.ts` alone ~2,000 LOC) are `(state: State, ...) => State` root-state transformers called _from_ reducers. They freely reach across domains (e.g. `UNSAFE_bucketsNotificationsSetRemovedItems` called from `buckets_service.ts` and `app_context_reducer.ts`).
- 210 path constants in `src/constants/state_paths.ts` are the de-facto schema; ~1,000 `.getIn(` / ~1,170 `.setIn(` call sites.
- Undo/redo (`src/reducers/time_travel_reducer.ts`) keeps full root-state snapshots in **module-level arrays mutated in place** — only viable because of Immutable structural sharing.
- One reducer (`store/bucket_filters/reducer.ts`) fires telemetry side effects from inside the reducer.

Target: fully typed Redux Toolkit slices, services dissolved into case reducers / pure helpers / sagas, redux-saga kept as orchestration, per-domain co-located directory structure, Immutable.js removed entirely. (Multi-put runs were originally to be **batched** — Phase 9, now WON'T DO: React 19 already coalesces the renders and batching hides actions from saga `take()`. See the Phase 9 section.)

A half-migration already exists and is the proven bridge: 9 of 12 `src/store/<domain>/` domains are plain-JS typed reducers mounted into the Immutable root via `applyReducer(state, PATH, action, reducer)`. The in-repo RTK reference is `sdk/libs/sdk-ui-dashboard` (RTK 2.9.0 + identical `redux@5.0.1` / `redux-saga@1.3.0`, `redux-batched-actions` pattern).

## 2. Scope decisions (agreed)

| Topic      | Decision                                                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components | Only forced changes (selector Immutable→plain return-type fallout per domain). No wholesale `connect()`→hooks campaign — 91 sites stay, filed as backlog.                                                         |
| Typing     | Fully typed `IAppState`/slices/selectors/sagas. Package tsconfig flags (`strictNullChecks:false`, `noImplicitAny:false`) stay as-is; all new code written strict-compatible.                                      |
| Tests      | Migrate tests as their domains migrate; coverage gaps → backlog (§10). One exception: a small undo/redo characterization suite (PR 0.3), because time travel is rewritten twice and has no unit safety net today. |
| Sagas      | redux-saga stays as the orchestration layer.                                                                                                                                                                      |

## 3. Two load-bearing strategy decisions

1. **Action type strings are frozen.** All 362 existing action types keep their exact strings via `createAction("<EXISTING_STRING>")` wired into slices through `extraReducers`. Consumers that match on strings — splunk logger, postMessage embedded protocol, telemetry, the time-travel whitelist — never notice the refactor. RTK's `${name}/${key}` naming is reserved for _new_ actions only.
2. **Dual-mode state access is the flip enabler.** `src/utils/state_access.ts` exports `getIn/setIn/updateIn/deleteIn/hasIn(state, path)` functions that work over Immutable Map, POJO, and mixed trees, honoring the existing `state_paths` constants verbatim (Immutable v5 `getIn` already traverses plain leaves — the 9 migrated islands rely on this today). Residual `state.getIn(P)` method calls are codemodded to `getIn(state, P)` _before_ the root flip (zero behavior change), so the flip PR itself only swaps the root container. **The nested `appState`/`data`/`report` grouping is preserved through the flip** (two-level `combineReducers`); flattening is optional post-cleanup (§10).

## 4. Target architecture

### 4.1 Directory structure (per-domain co-location; snake_case matching package convention)

```
src/store/
  _infra/
    lift_slice.ts        # TRANSITIONAL: mounts an RTK slice reducer into the Immutable root
                         #   (formalizes applyReducer + identity short-circuit: no setIn when unchanged)
    slice_selector.ts    # dual-mode per-domain accessor: Map.isMap(root) ? root.getIn(LEGACY_PATH) : plain access
    plain_subtree.ts     # TRANSITIONAL (4.5): liftPlainSlice/toPlainSubtree — normalize a subtree a
                         #   legacy setIn materialized as an Immutable Map back to a plain object
    time_travel.ts       # (8.1) withTimeTravel higher-order reducer, snapshot projection, in-store history
    app_reset.ts         # withAppReset (RESET_FOR_PLUGGABLE_MOUNT → fresh initial state)
    observe_store.ts     # ~10-line replacement for redux-watch controls subscription
    selectors.ts         # createMemoizedSelector for parametrized selector factories (from sdk-ui-dashboard)
  types.ts               # IAppState (explicit hand-written interface), AppStore, AppDispatch, AppSelector<T>
  hooks.ts               # useAppSelector / useAppDispatch (react-redux 9 .withTypes)
  root_reducer.ts        # (at flip) withAppReset(withTimeTravel(enableBatching(combineReducers({...}))))
  root_saga.ts           # replaces src/sagas/sagas.ts (watchers move here as domains migrate)
  create_store.ts        # configureStore factory (replaces src/create_store.ts)
  <domain>/
    index.ts             # public surface: reducer, actions, selectors, types
    <domain>_state.ts    # I<Domain>State + typed initial state
    <domain>_slice.ts    # createSlice; legacy STORE/* actions wired via extraReducers (string-preserving)
    <domain>_ui_actions.ts # UI-intent creators (ui* prefix) — dispatched by components, watched by sagas
    <domain>_actions.ts  # store-write + SAGA/* coordination creators fired from sagas (see §4.6)
    <domain>_selectors.ts# ONE sliceSelector input accessor; typed createSelector (import from @reduxjs/toolkit)
    <domain>_sagas.ts    # co-located watchers/handlers (large domains: sagas/ subfolder)
    <domain>_helpers.ts  # pure functions absorbed from src/services/ (large domains: helpers/ subfolder)
    <domain>_models.ts   # plain typed models converted from Immutable Records (where relevant)
    test/
```

Slice authoring template = PR 1.2 (`store/highlighting`). Reference shapes: `sdk/libs/sdk-ui-dashboard/src/model/store/loading/` (4-file slice), `dashboardStore.ts` (configureStore/batching/serializableCheck config).

### 4.2 Slice inventory (~35 slices from the 27-reducer chain)

- **appState branch:** `appContext` (+ bootstrap_error/color_palette services), `intl`, `router`, `embedding` (meta/device/theme), `messages`, `dialogs`, `featureFlags`, `permissions`, `drillableItems`, `dataSampling`, `genAi`, `recommendations`
- **data branch:** `catalog`, `itemCache`, `datasets`, `dateDatasets`, `measureDateDatasets`, `visualizationClasses`, `insightUsage`, `properties`, `filterBar` (absorbs the 699-LOC filter_bar_service), `attributeElements`, `chartSort`, `metricEditor`, `highlighting`, `dragAndDrop`, `bucketNotifications`, `arithmeticMeasures`, `bucketFilters`, `shortcuts`, `pluggableVisualization`, `insight` (title/tags/summary/layers + metadata_service), **`buckets`** + **`referencePoint`**
- **report branch:** `report` (save/open/delete + report_service), `execution`
- **root:** `postMessage` (folder stays `src/postMessageApi/`, its `state/` reshaped to slice layout)
- **Not slices:** time travel → `_infra/time_travel.ts` wrapper; `RESET_FOR_PLUGGABLE_MOUNT` → `_infra/app_reset.ts`

**Buckets decomposition** (32KB `buckets_reducer` + 1,996-LOC `buckets_service`): buckets-subtree-only mutations → case reducers; pure computations → `buckets_helpers.ts`; read-style functions → selectors; cross-slice cascades (`sanitizeTotals`, derived-measure removal chains, over-time-comparison) → orchestration sagas that `select` individual typed domain values, call narrow pure helpers and commit ONE semantic event (Phase 11 rows 11.4–11.6; originally "one batch" — see the Phase 9 section for why batching was dropped, and §4.8 for why the saga may not simply call the old whole-root transformer). Decoration stays compute-on-write (deriving on read is a behavior change, out of scope).

### 4.3 Services dissolution rule

Case reducers see **only their slice**. A service function that:

- (a) mutates only its domain's subtree → **case reducer**;
- (b) is a pure computation → **`<domain>_helpers.ts`**;
- (c) reads/writes across domains → **saga** (`select` other slices' public selectors → compute → `put`); a cascade that must stay atomic is fused into ONE domain event action handled via `extraReducers` in every affected slice (see the Phase 9 section for why this replaced batching). §4.8 is the binding form of this rule: the saga selects individual typed values, calls NARROW pure helpers, composes the operation explicitly and emits ONE event named after the operation — it may not hand the root `State` to a domain function, build an aggregate of the domains it touches, or address state by path.

The `UNSAFE_bucketsNotificationsSetRemovedItems` cross-slice writers (`buckets_service.ts:777`, `app_context_reducer.ts:117`) are replaced by proper slice actions dispatched together. Telemetry calls inside `store/bucket_filters/reducer.ts` move to a saga watching the same actions (PR 2.3). `services/telemetry/` relocates to `src/telemetry/` — it is a side-effect library, not a state service.

### 4.4 Store end state (`src/store/create_store.ts`)

`configureStore` with `thunk: false`; middleware `.prepend(splunkLoggerMiddleware).concat(sagaMiddleware)` (+ redux-logger dev-only, **without** `stateTransformer: s.toJS()`); `serializableCheck`/`immutableCheck` **disabled during transition** (Immutable root would explode them), enabled at flip with `ignoredPaths: ["timeTravel", ...]`, `warnAfter: 4096` (the planned `ignoredActions: [BATCH, ...]` entries died with Phase 9 — nothing dispatches a batch); `devTools` option (replaces hand-rolled `__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`) with a `stateSanitizer` collapsing `timeTravel` (both delivered at 8.1 — the history holds whole past states by reference, so without the ignored path the dev checks re-walk every snapshot on every dispatch). `redux-watch` → `_infra/observe_store.ts`; `redux-validate-fsa` dropped at flip (createAction guarantees FSA shape); `src/reduxStore.ts` singleton stays, typed `AppStore` (FET-1260 getStore hook remains future work).

Dependencies — **add:** `@reduxjs/toolkit@2.9.0`, `redux-batched-actions@^0.5.0` (the latter comes back OUT at 12.2 — it was added for Phase 9, which is WON'T DO). **Remove at end:** `immutable`, `immutable-devtools`, `redux-watch`, `redux-validate-fsa`, `redux-batched-actions`, `reselect` + `reselect-v4` (import `createSelector` from RTK), stale `@types/react-redux`.

### 4.5 Undo/redo redesign (Phase 8, after the flip)

**DELIVERED (8.1)** — `store/_infra/time_travel.ts`. The module-level `pastStates`/`futureStates` +
in-place `updateHistory` mutation are replaced by a higher-order root reducer holding
`timeTravel: {past, future}` **inside redux state**; snapshots are captured **by reference**
(`combineBranch` returns the same object when no child changed, so a step costs one shallow object);
same ~50-action whitelist, same reset triggers.

Two details differ from the sketch above, both deliberate:

- the snapshot is a **deny-list projection**, not `pick(state, UNDOABLE_SLICES)`. Undo has always
  restored the whole root, so an allow-list would have had to enumerate every editable key
  correctly on the first try, and a miss is a silently dropped user edit. `IUndoableState`
  (typings/state.ts) omits `report`, `timezoneOverride`, `appState.messages` and `timeTravel`; a
  root key added later is undoable by default, and a unit test pins the exact key set so the
  decision still has to be made consciously. The `copyMessages` / `copyLastSavedReportIfAny` /
  `copyTimezoneOverride` restore fixups disappear by construction as predicted, and so do BOTH
  `updateHistory` callers (plan row 8.2, folded in); only `clearCollapsedBucketsMeta` +
  `setDroppedItem(null)` remain.
- **batch-awareness was deferred to 9.1, which is now WON'T DO.** `enableBatching` wraps OUTSIDE
  the root reducer in `create_store.ts` and nothing dispatches a batch, so the wrapper never sees
  one and "one saga batch = one undo step" has nothing to apply to. Had batching gone ahead this
  would have been mandatory, and for a reason worth recording: a whitelisted action inside a batch
  is invisible to the whitelist test, so the edit would silently produce NO undo step at all.

`appState.undo/redo` flags → `undoPossible = (s) => selectTimeTravel(s).past.length > 0` (incl. the
postMessage availableCommands selector). Wrapper order in production:
`withTimeTravel(preWrappers → combineBranch → postWrappers)`, with `enableBatching` still outermost
in `create_store.ts` (removed at 12.2).

### 4.6 Action naming convention — UI-fired vs saga-fired

The current codebase already encodes intent in type-string prefixes (`UI_*` → saga → `STORE_*`, plus `SAGA_*` and `COMMAND_*`). The migration makes this distinction explicit and enforced at **three levels** — type string, creator name, and file placement:

| Layer                 | Fired by                      | Handled by                                              | Type string (new actions)                                                             | Creator name                                                                                                             | File                     |
| --------------------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| **UI intent**         | React components (`dispatch`) | Sagas (watchers); never a direct state write with logic | `UI/<DOMAIN>/<VERB>` (legacy `UI_*` strings frozen)                                   | `ui`-prefixed: `uiAddFilter`, `uiSelectVisualizationType`                                                                | `<domain>_ui_actions.ts` |
| **Store write**       | Sagas only (`put`)            | Slice case reducers                                     | RTK `<sliceName>/<caseReducer>` (legacy `STORE_*` strings frozen via `extraReducers`) | Accessed only via the domain actions object: `bucketsActions.removeBucketItem(...)` — the container name marks the layer | `<domain>_slice.ts`      |
| **Saga coordination** | Sagas                         | Other sagas (no reducer handles them)                   | `SAGA/<DOMAIN>/<VERB>` (legacy `SAGA_*` frozen)                                       | `saga`-prefixed: `sagaCatalogLoadRequested`                                                                              | `<domain>_actions.ts`    |
| **Protocol command**  | postMessage incoming handlers | Sagas                                                   | `COMMAND/*` (frozen — external protocol)                                              | as-is                                                                                                                    | `postMessageApi/`        |

Rules of thumb, enforceable by grep/review:

1. **Components dispatch only `ui*` creators.** A component never dispatches a slice action directly — if there's no logic in between, the saga is a one-line `takeEvery(uiX.match, function* () { yield put(domainActions.x()); })` or, for genuinely trivial cases, the UI action is added to the slice via `extraReducers` (documented exception, still named `ui*` so the origin stays visible).
2. **Sagas dispatch only store-write / saga-coordination actions** — a saga never `put`s a `ui*` action (that would fake user intent).
3. **Case reducers never handle `SAGA/*`** actions.
4. Legacy strings stay frozen (§3.1); this table governs _creator names and file placement_ during migration and _strings_ only for new actions. Legacy exceptions (e.g. `UI_*` actions currently handled directly by reducers and listed in the time-travel whitelist) are preserved as-is and normalized opportunistically when their domain migrates.

This keeps the redux-devtools/splunk action stream self-describing: every action's origin (user gesture vs saga orchestration) is readable from its type string and its creator's name at the call site.

### 4.7 Typing

Explicit hand-written `IAppState` interface in `store/types.ts` (sdk-ui-dashboard style), growing one key per migrated domain. Legacy `State = Map<...>` alias stays for unmigrated files; deleted at flip along with `immutable-compat.d.ts`, `typings/action.ts` (`IAction{type:any}`), and `state_paths.ts` (its shrinking line count is the migration progress bar). Saga idioms for all touched sagas: `function* h(action: ReturnType<typeof creator>): SagaIterator`, `const x: ReturnType<typeof selectFoo> = yield select(selectFoo)`, `SagaReturnType<typeof fn>` for calls, watchers via `takeLatest(creator.match, handler)`.

**Actions and dispatch — ONE idiom each, closed at row 12.5.** These are rules, not preferences: the
alternative was measured and it makes `dispatch()` unchecked.

|                               | The rule                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| creator                       | `createAction(FROZEN_STRING, prepare?)`. Nothing else creates an action — no function returning a `{ type, payload }` literal, ever ([R7] gates it).                                                                                                                                                                                                                                                                      |
| the prepare form is mandatory | **Never `createAction<Payload>(TYPE)`.** Supplying only the first type argument makes TypeScript fill the second with its default `string`, so the action's `type` loses its LITERAL type and every discriminated-union `switch` over the domain silently stops narrowing. `createAction(TYPE, (x: Payload) => ({ payload: x }))` infers both.                                                                            |
| action type                   | `export type IFooAction = ReturnType<typeof foo>`. A domain union is a union of those. Hand-written per-action interfaces do not exist.                                                                                                                                                                                                                                                                                   |
| two creators, one type string | One `createAction`, and the second creator CALLS it (`displayConfirmUnsavedChangesDialogWithPostMessageAction`, `metricEditorFocusMetric`). One type string means one creator, so `.match` and the devtools stream stay unambiguous.                                                                                                                                                                                      |
| one interface, N type strings | The reverse: one `createAction` per string, and the domain type becomes a union of their `ReturnType`s (the three catalog loading flags, the three filter-dropdown gestures).                                                                                                                                                                                                                                             |
| reducer case                  | `builder.addCase(creator, …)` — the payload type comes from the creator. `addCase(STRING, (state, action: IFooAction) => …)` is allowed ONLY where a value import would break the module graph, and must say so (`intl_slice.ts`, `app_context_slices.ts`: jquery).                                                                                                                                                       |
| `take` / matcher              | `creator.match`, or `isAnyOf(a, b)` for a set. Not a list of type strings.                                                                                                                                                                                                                                                                                                                                                |
| dispatch, in a component      | `useDispatch<AppDispatch>()`, imported from react-redux in that component's own module. Not a bare `useDispatch()`, not a narrow `Dispatch<SomeUnion>`, and **not a `useAppDispatch` re-exported from a shared module** — see §7 for why that is a test-suite constraint and not a style question.                                                                                                                        |
| the dispatch type             | `store/types.ts#AppDispatch` = the store's own inferred dispatch, pinned mutually assignable in `create_store.test.ts`. **`AnyAction` is banned** ([R8]) — deprecated in redux 5, and its `[key: string]: any` index signature is what made dispatch accept anything. A module that must read `payload` off an arbitrary action declares its own reader type and says why (`middleware/log_formatters.ts#ILoggedAction`). |

Why the creator rule and the dispatch rule are the same rule: an `interface` never receives an
implicit index signature, so a hand-written action interface is not assignable to redux 5's
`UnknownAction`; RTK's `PayloadAction` is a type ALIAS over an object literal, so it is. While both
idioms existed, the only way to keep the legacy call sites compiling was `Dispatch<AnyAction>` —
which type-checks nothing.

### 4.8 THE FINISH LINE — what "migrated" means (definition of done)

The deciding rule whenever the migration offers several possible solutions:

> **Model operations, not state trees.**
> **Cross-domain logic is explicit in sagas. Pure helpers have narrow typed inputs and outputs.**
> **Semantic events atomically commit results. Reducers only own and update their slice.**
> **No cluster. No pseudo-root. No paths.**

The target shape of every cross-domain operation:

```text
user/domain intent
  → saga
  → select individual typed domain values
  → call narrow pure value-level helpers
  → explicitly compose the cross-domain operation
  → ONE semantic fused event when atomicity is required
  → slice reducers / extraReducers, each updating only what it owns
```

**The saga is the orchestration layer and it is allowed to be verbose.** Explicit local variables
that thread values through named helpers ARE the design; they make the transaction readable. Do not
hide cross-domain composition behind a new abstraction just to shorten the saga.

#### 4.8.1 Reducers are boring

A reducer owns ONE slice. It receives only its slice, does not inspect another slice, does not call
selectors, never receives the root `State`, does not orchestrate, and uses no state paths. The end
state of a cross-domain consumer is this, and nothing more:

```ts
builder.addCase(bucketItemsRemoved, (_, action) => action.payload.buckets);
```

(or the equivalent local immer mutation). The only sanctioned whole-root higher-order reducers are
APP INFRASTRUCTURE: `store/_infra/time_travel.ts` (a snapshot is by definition a projection of the
whole root) and the app-reset wrapper. A legacy domain reset/apply transformer does not become
infrastructure by being hard to move.

#### 4.8.2 Pure helpers expose their real dependencies

Narrow, typed, one domain value plus explicit arguments. The signature is the documentation:

```ts
syncReferencePoint(referencePoint, buckets, refPointFilters, sortItems)   // ✅
sanitizeTotals(previousBuckets, currentBuckets, { reorderByMeasures })    // ✅
sanitizeFilterBar(filterBar, previousBuckets, nextBuckets)                // ✅

syncReferencePoint(cluster)                                              // ❌
sanitizeTotals(previousState, currentState)                              // ❌
foo(state: State): State                                                 // ❌
```

Cross-domain pure calculations are allowed to take several domain values — with an EXPLICIT input
type named after the operation, and an explicit result type. Different operations having different
contracts is GOOD:

```ts
// as shipped at row 11.3
removeBucketItemsWithDependencies(
    { buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint },
    { localIdentifiers, notifyOnlyAboutRemovedDependencies },
    { catalogMetricRef, bucketItemRef, improvedRankingFilter, reorderByMeasures },
): IRemoveBucketItemsResult
```

Where a helper needs a foreign lookup, it takes a RESOLVER function, kept lazy (the 4.9 pattern:
`CatalogItemTypeResolver`, `BucketItemRefResolver`, a date-dataset-by-ref resolver), never the store.

#### 4.8.3 Semantic fused events, not a generic one

An operation commits through ONE event named after the operation — `bucketItemAdded`,
`bucketItemsRemoved`, `extendedReferencePointApplied`, `metricShortcutApplied`,
`visualizationPropertiesChanged` — whose payload carries exactly the domain values THAT operation
produces. Multiple domain values in one payload are fine: that is what makes the transaction atomic.
One dispatch per logical transaction is required where the legacy code committed in one reducer pass:

```text
select → compute the complete cross-domain result → ONE semantic event → the owning slices
```

and NOT `put(updateBuckets()); put(updateReferencePoint()); put(updateFilterBar())` for what is one
transaction. Render atomicity, undo granularity, `observeStore`/postMessage observers and the splunk
stream all follow from the single dispatch (§5 Phase 9 has the full argument).

#### 4.8.4 Banned shapes (each one was tried or proposed and rejected)

| Banned                                                                                                                   | Why                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `(state: State) => State` in domain/business code                                                                        | the thing the migration exists to remove; moving the call site into a saga changes nothing                        |
| a cluster / working-set / context aggregate (`IBucketsClusterState`, `BucketsContext`, `CascadeState`, … under any name) | replaces `root → root` with `mini-root → mini-root`: the same state-transformer architecture behind a better type |
| a generic change set (`Partial<IClusterState>`) reused by unrelated operations                                           | a universal payload is not a domain event; it hides which operation produced what                                 |
| generic diffing (`collectClusterChanges`, `diffDomainState`, `extractWrites`)                                            | an operation must produce its results explicitly; identity of the returned values is what marks a no-op           |
| changed-field tracking (`changedDomains: Set<Domain>`), write-surface arrays, `pathKey`                                  | ownership expressed outside the type system; a missing entry silently drops a write                               |
| path-addressed Redux access — `state_paths.ts` for domain addressing, `getIn/setIn/updateIn/deleteIn` over the root      | dynamic addressing with no owner and no types                                                                     |

Static typed access — `state.data.buckets`, `state.report.lastSavedObject` — is the read form and is
fine. **The nested `appState / data / report` shape is NOT the problem: do not flatten it** (§10).

A deep immutable-update utility operating INSIDE an explicit plain domain value (a bucket item inside
a bucket inside `IBucketsState`) is a legitimate, separate concern — it must know nothing about
Redux roots or paths, and it must not live in the migration shim.

#### 4.8.5 Identity is the no-op contract

Every helper returns the ORIGINAL domain reference when nothing changed (§7's corrected idempotence
gate — the 4.7 freeze). A semantic event may then carry the value unconditionally: an unchanged
reference reaching a slice is a no-op, `combineBranch`/`combineReducers` short-circuits on identity,
and no subscriber is notified. **This is why no change-set, presence map or diff is needed** — the
returned values already carry the information. Domain suites assert IDENTITY (`toBe`), not values.

---

## 5. Phase plan

Sizes: S <200 / M <600 / L <1500 / XL >1500 diff lines. Every PR: app fully functional, package unit suite, lint/format (no `rush change` — changelogs apply to SDK packages only, not AD). "e2e" = relevant Playwright specs from `modules/gdc-analytical-designer/e2e` (isolated replay mode).

**Process:** JIRA ticket **STL-3150**. Branch naming: `imj-stl-3150-p<phase>-<pr>[-<slug>]` — e.g. `imj-stl-3150-p0-1-plan`, `imj-stl-3150-p2-3-bucket-filters-telemetry`, `imj-stl-3150-p4-8a-open-save-report`. Plain branches off fresh master (no worktrees), one PR in flight at a time, landed strictly in plan order. Commit messages: conventional type + `risk:` trailer + `JIRA: STL-3150` trailer. Each PR updates this document (its §5 checkbox + §6 domain table + §0 Progress) in the same diff, and its PR description carries a "Migration progress" section with the same numbers.

**PR title convention:** every migration PR is titled `feat: AD redux-toolkit migration phase <N> - <short description>` — e.g. `feat: AD redux-toolkit migration phase 2 - store holdouts` (conventional-commit format, ≤70 chars; the phase number makes the PR stream greppable in the merge history).

**PR mechanics (avoid double-running the checks):** every migration PR is opened with the `/pr-create` skill, whose script runs the full `/pre-push` gate (lint, format, impacted tests) before pushing — that gate duplicates several minutes of checks if the same suite was already run locally. So the working sequence is: run the package checks once (`build-check`, `lint`, `format-check`, `test-once` — or `/pre-push`), and immediately after they pass invoke the create script with `--no-verify` to skip the duplicate gate. Only use `--no-verify` when the checks were genuinely just run on the exact commits being pushed.

### Phase 0 — Guardrails & hygiene

Delivered as ONE PR (branch `imj-stl-3150-p0-1-plan`), per team decision.

| PR  | Contents                                                                                                                                                                    | Size | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 0.1 | This document; remove unused `reselect-v4` dep + stale `@types/react-redux`; `rush update`                                                                                  | S    | ☑      |
| 0.2 | Fix duplicate wiring: `highlightingReducer` 2× in `root_reducer.ts` (lines 59+61), `chartSortReducer` 2× in `data_reducer.ts`; uniqueness unit test                         | S    | ☑      |
| 0.3 | Undo/redo characterization suite (snapshot-on-whitelist, future purge, `updateHistory` rewrites, reset triggers, `undoApplied`, copyMessages/copyLastSavedReport semantics) | M    | ☑      |
| 0.4 | Dual-mode shim `src/utils/state_access.ts` + exhaustive tests (Map / POJO / mixed trees)                                                                                    | S/M  | ☑      |

### Phase 1 — Store foundations (RTK arrives)

Delivered as ONE PR (branch `imj-stl-3150-p1-rtk-foundations`), per team decision.

| PR  | Contents                                                                                                                                                                                                                                               | Size | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| 1.1 | Add `@reduxjs/toolkit` + `redux-batched-actions`; `create_store.ts` → `configureStore` (identical middleware order, checks disabled, `devTools` option); wrap root in `enableBatching` (inert); `store/types.ts` IAppState scaffold + `store/hooks.ts` | M    | ☑      |
| 1.2 | Reference slice: `store/highlighting` → `createSlice` (legacy strings via `extraReducers`); `_infra/lift_slice.ts` + `_infra/slice_selector.ts`; recipe documented in §7                                                                               | S/M  | ☑      |

### Phase 2 — Finish `src/store/` (3 Immutable holdouts)

Delivered as ONE PR (branch `imj-stl-3150-p2-store-holdouts`), per team decision.

| PR  | Contents                                                                                            | Size | Status |
| --- | --------------------------------------------------------------------------------------------------- | ---- | ------ |
| 2.1 | `recommendations` → typed slice; tests off `fromJS`                                                 | M    | ☑      |
| 2.2 | `arithmetic_measures` → typed slice                                                                 | M    | ☑      |
| 2.3 | `bucket_filters` telemetry extraction ONLY: reducer-side telemetry → saga listeners on same actions | S/M  | ☑      |
| 2.4 | `bucket_filters` 602-LOC reducer → typed slice (cross-domain reads stay shim-based, documented)     | L    | ☑      |

> **Delivery notes — [Phase 2: `src/store/` holdouts](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-2--srcstore-holdouts)** (#11426): why the three holdouts are cross-domain transformers, not subtree reducers, and what that does to the flip precondition.

### Phase 3 — Immutable Records → typed interfaces (interleaves with Phase 4; each lands just before its consumer domain)

3.1–3.3 delivered as ONE PR (#11477, branch `imj-stl-3150-p3-models`), per team decision. 3.4 delivered
separately (branch `imj-stl-3150-p3-4-decorated-buckets`, stacked on #11477) — pulled forward from its
"immediately before 4.9" slot per team decision; the hard constraint (3.4 merges before 4.9 starts) still holds.

| PR  | Contents                                                                                              | Size | Status |
| --- | ----------------------------------------------------------------------------------------------------- | ---- | ------ |
| 3.1 | `message`, `preset_item`, `date_filter`                                                               | M    | ☑      |
| 3.2 | `decorated_attribute_elements`, `decorated_metric_attribute_filter`                                   | M/L  | ☑      |
| 3.3 | `date_dataset`, `date_datasets_meta` (incl. `initial_state.ts` `new DateDatasetsMeta(...)` → literal) | L    | ☑      |
| 3.4 | `decorated_bucket`, `decorated_bucket_item` — riskiest model PR                                       | XL   | ☑      |

Pattern: `Record({...})` → `interface I<X>` + defaults const + `new<X>(partial)` factory; `List` → array; `.get("x")` → `.x`; convert leaf-first, one model family + **all** its consumers per PR (a half-converted model is worse than none — Immutable and plain duck-type differently on iteration).

> **Delivery notes — [Phase 3 (3.1–3.3): model conversions](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-3-3133--model-conversions)** (#11477): the Record → interface conventions (namespace objects, boundary normalization, the `original` rule) every later model PR follows.

> **Delivery notes — [Phase 3.4: decorated buckets](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-34--decorated-buckets)** (#11481): the riskiest model conversion — what stays Immutable inside a plain decorated item, the `fromJS` deep-conversion traps, the dead code it found.

### Phase 4 — Legacy `src/reducers/` → bridge slices (risk-ordered)

Each domain PR = slice + absorbed services + typed selectors via `sliceSelector` + migrated tests.

| PR   | Domain                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Size | Status |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 4.1  | router + dialogs                                                                                                                                                                                                                                                                                                                                                                                                                                                              | M    | ☑      |
| 4.2  | messages + drillable_items (needs 3.1)                                                                                                                                                                                                                                                                                                                                                                                                                                        | M    | ☑      |
| 4.3  | shortcuts (keep `setDroppedItem` export — time_travel imports it; needs 3.3)                                                                                                                                                                                                                                                                                                                                                                                                  | M    | ☑      |
| 4.4  | app*context (root-level `bootstrapData`/`projectId`/`colorPalette` writes → explicit mini-branch mounts; fix `UNSAFE*`call at`app_context_reducer.ts:117`)                                                                                                                                                                                                                                                                                                                    | L    | ☑      |
| 4.5  | data (itemCache, vis classes, config panel, dateDatasets(+Meta), datasets, insightUsage; needs 3.3)                                                                                                                                                                                                                                                                                                                                                                           | L    | ☑      |
| 4.6  | properties (keep `propertiesMeta.undoApplied` path stable — time travel writes it)                                                                                                                                                                                                                                                                                                                                                                                            | M/L  | ☑      |
| 4.7  | execute_report (keeps calling `updateHistory`; mechanics unchanged)                                                                                                                                                                                                                                                                                                                                                                                                           | M/L  | ☑      |
| 4.8a | open_report + save_report                                                                                                                                                                                                                                                                                                                                                                                                                                                     | L    | ☑      |
| 4.8b | delete_report + remaining report branch (joined with 4.8a in ONE PR)                                                                                                                                                                                                                                                                                                                                                                                                          | M    | ☑      |
| 4.9  | `buckets_service` (1,996 LOC) → typed pure helpers over plain bucket structures behind a thin Immutable-facing wrapper (needs 3.4)                                                                                                                                                                                                                                                                                                                                            | XL   | ☑      |
| 4.10 | buckets write-path slice (Immutable value, 4.5 pattern) + renaming mini-mount; 32KB reducer dissolved into slice + transitional apply reducer; second `UNSAFE_` site resolved; referencePoint sync → domain-owned write (cascades stay in the apply reducer — deferred, now Phase 11)                                                                                                                                                                                         | XL   | ☑      |
| 4.11 | THE BUCKETS FLIP (one PR, delivered as ordered commits — closes Phase 4): reader mechanization (dual-mode collection toolkit + all Immutable-method-on-bucket-value reads → shim/helpers, zero behavior change; fixes two §10 latent `.size` readers) → types-first container flip with §7 idiom grep at zero → bucketsMeta/pluggableVisualization flips + domain selectors + `getBuckets` re-point. ERP stays Immutable; RP slice-hood/cascades→sagas deferred, now Phase 11 | XL   | ☑      |

`3.4 → 4.9 → 4.10 → 4.11` is the one coupled revert group; everything else reverts independently.

> **Delivery notes — [Phase 4.1–4.3: router, dialogs, messages, drillableItems, shortcuts](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-4143--router-dialogs-messages-drillableitems-shortcuts)** (#11647): why router and shortcuts stayed transformers, the dialogs/messages/drillableItems slices, and the `no-barrel-files` / seed-absence gotchas.

> **Delivery notes — [Phase 4.4: app context](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-44--app-context)** (#11662): the mini-branch mount pattern, the jquery import hazard, and the state_paths import cycle that broke 162 test files.

> **Delivery notes — [Phase 4.5: data domains](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-45--data-domains)** (#11738): slice-for-the-write-path with Immutable values, `plain_subtree.ts`, and the three reader-fallout classes that became §7 gates — one of them shipped as critical #11767.

> **Delivery notes — [Phase 4.6: properties](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-46--properties)** (#11748): two mounts + an apply reducer, registration order, and the gate about `.toJS()` being an accidental defensive copy at an SDK boundary.

> **Delivery notes — [Phase 4.7: execute_report](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-47--execute_report)** (#11756): the first fully-plain report domain, the inverted registration order, the undo-snapshot container contract — and the main-thread freeze it shipped and fixed.

> **Delivery notes — [Phase 4.8: report cluster](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-48--report-cluster)** (#11786): the insight + report mini-mounts, the mixed-container fix on tags/layers, `loadingError` null-vs-undefined, and what stays transitional.

> **Delivery notes — [Phase 4.9: buckets_service pure helpers](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-49--buckets_service-pure-helpers)** (#11851): the pure-helper split of the buckets cluster, the no-container-flip rule that kept it safe, and the §7 idempotence-gate correction 4.10 depends on.

> **Delivery notes — [Phase 4.10: buckets write-path slice + cluster split](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-410--buckets-write-path-slice--cluster-split)** (#11863): the no-flip scope correction and why §7 forces the flip into 4.11, the sync-tail atomicity argument that defers cascades→sagas (now Phase 11), the `map` identity refinement, the dual-axis negative-index landmine, and the documented external-writers gate exception.

> **Delivery notes — [Phase 4.11: the buckets flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-411--the-buckets-flip)** (#11879): the mechanize-first strategy and its census, the types-first flip lesson, the negative-index landmine's second axis, the mixed-root contract spec, frozen shared mocks, the silent-failure classes the flip closed, and the Phase-9 deferral scope (ERP/RP).

### Phase 5 — postMessageApi (parallel with 3/4 after Phase 2; protocol frozen)

| PR  | Contents                                                                                                                                    | Size | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 5.1 | postMessage state reducers → typed slice via bridge (all 33 action strings kept); embedded e2e + manual embedded smoke                      | M/L  | ☑      |
| 5.2 | postMessage selectors typed (verify `availableCommandsStateSelector` reference-stability so the controls subscription doesn't storm events) | M    | ☑      |

> **Delivery notes — [Phase 5: postMessage domain](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-5--postmessage-domain)** (#12111): the one-leaf domain behind 33 saga-only strings, the plain flip + equality guard, the controls-subscription stability audit, and the provenance gate's first post-4.11 catch.

### Phase 6 — Pre-flip mechanization (zero behavior change; shim is dual-mode)

Delivered as ONE PR (branch `imj-stl-3150-p6-pre-flip-mechanization`), ordered commits per item.

| PR  | Contents                                                                                                                                                               | Size | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 6.1 | Codemod `selectors/`: `state.getIn(P)` → `getIn(state, P)`; drop dead immutable imports                                                                                | L    | ☑      |
| 6.2 | Codemod `sagas/`, residual `services/`, splunk formatters, **and `time_travel_reducer.ts`** through the shim                                                           | L    | ☑      |
| 6.3 | Test infra dual-mode: `mocks/state_mock.ts`, `test/utils/dispatch_action.ts`, `run_saga.ts`; sweep residual `.getIn(` / root `fromJS` fixtures in tests                | L    | ☑      |
| 6.4 | Flip-readiness CI gate: audit detectors [H]/[I] failing on root-container Immutable idioms outside the machinery allowlist; root-key ownership inventory recorded here | S    | ☑      |

> **Delivery notes — [Phase 6: pre-flip mechanization](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-6--pre-flip-mechanization)**: the checker-driven codemod, the fixture classes the sweep surfaced, the `withMutations`/`mergeIn` rewrite recipes, and the [H]/[I] gate design.

**Root-key ownership inventory (6.4)** — every root key, its writer today, and its 7.2
`combineReducers` disposition. The three branch keys hold the nested slice mounts (§6 tracks
those per domain); the root-level leaves each have exactly one owner:

| Root key                  | Seeded by                                                                           | Written by (today)                                                      | 7.2 disposition                      |
| ------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| `appState`                | `initial_state.ts` literal                                                          | appContext/intl/embedding/messages/dialogs/… mounts + reset transformer | nested `combineReducers` branch      |
| `data`                    | `initial_state.ts` literal (+ plain buckets-cluster seeds via post-literal `setIn`) | `DataReducer` mounts + buckets cluster + insight mounts                 | nested `combineReducers` branch      |
| `report`                  | `initial_state.ts` literal                                                          | report/execution mounts + apply reducers                                | nested `combineReducers` branch      |
| `bootstrapData`           | absent (mini-slice self-initializes)                                                | appContext mini-branch mount (4.4)                                      | plain leaf reducer                   |
| `projectId`               | absent (mini-slice self-initializes)                                                | appContext mini-branch mount (4.4)                                      | plain leaf reducer                   |
| `colorPalette`            | absent (mini-slice self-initializes)                                                | appContext mini-branch mount (4.4)                                      | plain leaf reducer                   |
| `featureFlags`            | absent (mini-slice self-initializes)                                                | `featureFlagsReducer` mount (4.4)                                       | plain leaf reducer                   |
| `workspacePermissions`    | absent (mini-slice self-initializes)                                                | `workspacePermissionsReducer` mount (4.4)                               | plain leaf reducer                   |
| `dataSamplingPercentage`  | absent                                                                              | `DataSamplingReducer` (plain hand-written, 10.8)                        | plain leaf reducer                   |
| `route` / `previousRoute` | absent                                                                              | `routerReducer` transformer (4.1 — route values plain)                  | leaf reducers; transformer dissolves |
| `timezoneOverride`        | absent                                                                              | `TimezoneOverrideReducer` (shim-based since 6.2)                        | plain leaf reducer                   |

Cross-branch writers that survive until their scheduled dissolution (all shim-based since 6.2,
so none of them blocks the flip): the appContext reset/sessionId transformer (PR 11.7), the
open/delete-report reducers (PR 11.7) and the shortcuts/properties/recommendations apply reducers
(4.9–4.11 leftovers → Phase 11). `TimeTravelReducer` + `updateHistory` are GONE (8.1) — the history is a root key written
by the `withTimeTravel` wrapper, which is a pure reducer over its own subtree.

### Phase 7 — THE ROOT FLIP

| PR  | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Size             | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ |
| 7.1 | **The flip**: `initial_state.ts` → plain `buildInitialState()` factory (localStorage read + intl quirk preserved); `RESET_FOR_PLUGGABLE_MOUNT` returns a **fresh** `buildInitialState()` (a shared POJO singleton would be a live bug — the shared Map was only safe because immutable); redux-logger transformer → identity; drop immutable-devtools hookup. Shim stays dual-mode as safety net. Full 130-spec e2e run + manual embedded/undo/save/export smoke | M diff / XL risk | ☑      |
| 7.2 | `compose()` → two-level per-key combination (`combineBranch` — deliberately not redux's `combineReducers`, which drops wrapper-owned keys; see the delivery note) preserving ALL existing paths; `lift_slice` wrappers unwrap to bare slice reducers; time travel remains whole-root wrapper; delete `combine`/`applyReducer` (`compose` survives test-only until 12.3)                                                                                          | M/L              | ☑      |
| 7.3 | Initial-state dissolution: slices self-initialize; `state_mock` reads from real store factory; enable `serializableCheck`/`immutableCheck` (narrowed); drop `redux-validate-fsa`; `redux-watch` → `observeStore`                                                                                                                                                                                                                                                 | M                | ☑      |

> **Delivery notes — [Phase 7.1: THE ROOT FLIP](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-71--the-root-flip)**: the contract-first mechanism, the per-key container decisions, the `toPlain`-identity blind spot, and the two fixture fallout classes with their recipes.

**Flip preconditions (all must be ✓ before 7.1):**

- ☑ Every `root_reducer.ts` entry is a `liftSlice` mount (Phases 2/4/5 done)
- ☑ Zero Immutable Records constructed into state (Phase 3 done)
- ☑ `time_travel_reducer.ts` fully shim-based; characterization suite green (6.2)
- ☑ All selector inputs / splunk formatters / test helpers shim- or sliceSelector-based (6.1–6.3)
- ☑ CI gate green (6.4 — audit detectors [H]/[I] at zero, wired into `validate`)
- ☑ Controls-subscription selector reference-stability verified + pinned dual-mode (5.2); the characterization suite re-runs against the plain root at 7.1
- ☑ Full e2e green on last pre-flip commit (diff baseline — Extended test run 31389911056 on a8529923b58, all AD harness variants green)

### Phase 8 — Time-travel redesign (after flip)

| PR  | Contents                                                                                                                                                                                                                                 | Size | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 8.1 | `store/_infra/time_travel.ts` per §4.5 (in-store history, reference snapshots of the undoable projection, no in-place mutation, undo/redo flags → selectors incl. postMessage availableCommands); characterization suite is the contract | L/XL | ☑      |
| 8.2 | execute_report/delete_report history-rewrite callers → new API; delete legacy helpers — **delivered with 8.1**: excluding `report` from the snapshot left both callers with nothing to rewrite, so they were deleted rather than ported  | M    | ☑      |

### Phase 9 — Saga batching — **WON'T DO** (dropped after investigation, see below)

| PR  | Contents                                                                                                                             | Size | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| 9.1 | `_infra/batching.ts` + cross-saga `take()` audit; batch catalog_saga                                                                 | M    | ✖      |
| 9.2 | open_report, save_report, bootstrap                                                                                                  | M    | ✖      |
| 9.3 | filter_bar, date_datasets, bucket_filters, metric_editor, export_report + runs ≥3 in properties/chart_sort/dnd/confirm_unsaved sagas | M    | ✖      |

The phase was scoped, prototyped (`_infra/batching.ts` + a mechanical take-safety audit) and then
**dropped**. Four findings, in the order they mattered:

1. **The headline benefit is already provided by React.** The phase was costed in puts — "catalog
   45, open_report 18, save_report 15" — with the implied cost being that many render passes. This
   app runs **React 19.1.1 with react-redux 9.2.0**: React 18+ auto-batches ALL updates regardless
   of origin, including redux dispatches from sagas, and react-redux v9 subscribes through
   `useSyncExternalStore`. N sequential puts inside one saga run already coalesce into ONE render
   pass. What remains per dispatch is N reducer passes plus N subscriber-notification loops — real,
   but not the render storm the put counts suggest, and never measured.
2. **The undo-granularity benefit barely applies.** Phase 9 was sequenced after Phase 8 so "one
   saga batch = one undo step" would churn once. But the multi-put runs it targets — catalog load,
   bootstrap, open report, save report — dispatch actions that are NOT in the undo whitelist;
   several are history-RESET triggers. Batching them changes undo granularity very little.
   (The put counts had also gone stale as the migration moved code: the row claims bootstrap has 12
   puts; `sagas/bootstrap/bootstrapData.ts` has 2.)
3. **Two of the named targets would have hung production, silently.** `enableBatching` unwraps a
   batch inside the REDUCER, so the middleware chain — `sagaMiddleware` included — only ever sees
   the batch action. `take` / `takeEvery` / `takeLatest` are blind to the inner actions: batching an
   action a saga waits on throws nothing and logs nothing, the saga just never wakes up. The audit
   found this in the phase's own targets:
    - `open_report_sagas` blocks on `take(SAGA_CATALOG_LOAD_FINISHED)` in **three** places, and that
      action is dispatched by `loadCatalog` — the exact run 9.1 batches. Report opening hangs forever.
    - `bootstrapData` needs BOTH `take(WORKSPACE_PERMISSIONS_SUCCESS)` and
      `take(STORE_FEATURE_FLAGS_DATA)` — an `all([...])` nested inside a `race({...})` against the
      error takes (9.2's target). Batching either action hangs app startup.

    Note the second one also kills the tempting shortcut "only `STORE_*` actions are batchable, since
    sagas watch the `UI/*` / `SAGA/*` / `COMMAND/*` layers" (§4.6): sagas demonstrably watch six
    `STORE_*` types and ~25 `creator.match` predicates. And a plain `yield take(` grep MISSES the
    bootstrap case, because those takes are nested inside a `race({...})`.

4. **Batching would add a second silent-failure class, to undo.** If a batch ever contains a
   whitelisted action, `withTimeTravel` sees only the batch type — which is not in the whitelist —
   so NO undo step is recorded and the user's edit silently becomes un-undoable. Fixable (unwrap in
   the wrapper, the deferred 9.1 item), but it is more surface protecting a thin benefit.

**What would justify revisiting atomicity.** Not throughput — and specifically **undo granularity
in Phase 11**. That is the concrete trigger to watch for: if a cascade moved into a saga turns out
to contain TWO OR MORE whitelisted actions, sequential puts give the user two undo steps for one
gesture. The same applies if a component subscribed to two slices is ever seen rendering on an
inconsistent pair, or if a measured (not assumed) perf problem appears.

**When that trigger fires, the first-choice fix is NOT `batchActions` — it is the pattern this
migration makes native: fuse the cascade into ONE domain event action handled via `extraReducers`
in every affected slice.** The codebase already works this way where it matters: the bootstrap
fan-out dissolved into per-branch `extraReducers` cases on one action, and DELETE_REPORT_STARTED
is handled by cases in more than one slice. One dispatch gives every property batching promised,
by construction — one whitelist entry (one undo step), one render, one `observeStore` pass, one
splunk event — and sagas can `take()` the event, so the silent-hang class above cannot occur. The
constraint is the mirror of §4.3: case reducers see only their own slice, so the saga must
`select` and compute the full cascade result BEFORE dispatching and carry it in the payload (or
the affected slices derive it from shared pure helpers) — the "compute everything first, then put"
rule below, taken to its limit of exactly one put.

**Reach for `batchActions` only if that payload assembly is genuinely impractical.** It then needs
two things together — the batch, plus the batch-awareness `withTimeTravel` never got (unwrap the
batch and test the inner actions against the whitelist), because a batch type is not itself
whitelisted and would otherwise record NO undo step at all — and note that 12.2 removes the
library, so it would have to come back. The shape is "signals stay outside the batch": batch only
the STORE writes and keep the action other sagas wait on as its own `put` after the batch —
`loadCatalog` already has that shape (`catalogLoadFinished()` is a separate action at the end).
This is the rule the take-audit produces anyway, stated constructively.

Note it does NOT make a full Phase 9 cheaper, which is why it did not save the phase: today six
`STORE_*` types and ~25 `creator.match` predicates ARE watched by sagas, so a sweep would first have
to migrate those watchers onto new signal actions — a behavior-touching refactor larger than the
batching it enables. Narrow and reactive is affordable; broad and preemptive is not.

**Consequences for the rest of the plan** — Phase 9 was implicitly carrying work that other rows
deferred to it (PR 4.10: "cascades stay in the apply reducer — sagas need Phase 9 batching"; PR
4.11: "RP slice-hood/cascades deferred to Phase 9"). That work is real and is re-homed into
Phase 11 (rows 11.1–11.6) and Phase 12 (row 12.2) below.

**The atomicity conditions Phase 11 has to satisfy.** 4.10 parked the cascades for a specific reason,
not for effort: nearly every legacy handler ends in `bucketsWereChanged`, a referencePoint sync that
reads THREE other domains in the SAME dispatch as the buckets write. Split across saga `put`s,
components could render fresh buckets against a stale reference point — and the reference point
drives the pluggable visualization, so that is an extendedReferencePoint round-trip trigger, not a
cosmetic glitch. Batching was going to restore that atomicity. Without it, Phase 11 must satisfy the
same requirement by construction, and the requirement is now narrower than "one dispatch":

- **Render atomicity — satisfied, conditionally.** React 18+ coalesces every update scheduled in one
  tick, so consecutive `yield put`s inside ONE synchronous saga run produce a single render and no
  component ever observes the intermediate pair. The condition is that the puts are consecutive:
  **no `yield select` / `yield call` / any other async effect may sit between the writes of one
  cascade.** Compute everything first, then put. A test per cascade should pin that the intermediate
  state is never rendered (assert the subscriber fires once), because this is the property that
  batching would have made structural and that sequential puts only make conventional. A cascade
  fused into one event action (above) has the property structurally.
- **Undo granularity — must be checked, not assumed.** Each whitelisted action is its own undo step.
  A cascade that contains TWO whitelisted actions gives two undo steps where the single legacy
  reducer pass gave one, so one user gesture would need two undos. Per cascade: keep at most one
  whitelisted action in it, fuse the cascade into one event action (`extraReducers` in each
  affected slice, above), or accept and pin the change (the e2e undo specs are the judge).
- **Non-React subscribers are NOT coalesced.** `observeStore` (postMessage `availableCommands`) runs
  per dispatch, so a cascade can emit two events where it emitted one. Harmless where the selector
  output is unchanged — the observer is reference-equality based — but verify for cascades that
  touch the fields `availableCommandsStateSelector` reads.
- **Splunk sees N actions instead of 1.** That is an improvement in fidelity, but the formatters in
  `middleware/log_formatters.ts` may need entries for the newly visible slice actions.

### Phase 10 — Cleanup (CLOSED at 10.8)

**Row order IS execution order.** `10.3`–`10.7` (the container flips) were inserted after
`10.1–10.2` and the former cleanup rows shifted up, so the old `10.3` — remove the `immutable`
dependency — became the finish line. **Phase 10 is now CLOSED at 10.8** and its four unstarted rows
moved out: the cascade work and the remaining root transformers became **Phase 11** (the
architecture), the cleanups became **Phase 12** (the cleaning) — see §0 for why. The ~190
references to Phase 10 numbers in the source comments, the plan and the delivery notes were
renumbered with the first insert and again with this split; **cite a row from code as `PR <n>.<m>`
and keep the citation next to the thing it explains**, so the next renumber can find it.

**10.3–10.7 are the container flips the plan tracked nowhere — CONTAINERS, not models.**
**Phase 3 is COMPLETE and nothing in it reopens here.** 3.1–3.4 converted every model from an
Immutable Record to a plain interface (`message`, `preset_item`, `date_filter`,
`decorated_attribute_elements`, `decorated_metric_attribute_filter`, `date_dataset`,
`date_datasets_meta`, `decorated_bucket`, `decorated_bucket_item` — #11477 and #11481), and every one
of those interfaces is plain today.

What is still in `src/models/` is not an unconverted model, it is **transition scaffolding**: code
that exists only because a container it reads has not flipped, and that a flip DELETES rather than
converts. Three shapes, all of them subtractions:

- a `fromJS` that keeps a plain value container-uniform with the Immutable value it is merged into
  (`decorated_bucket_item`'s `displayForm`/`dfRef`, whose own comment says so);
- a dual-mode guard tolerating both containers (`isImmutable(x) ? toPlain(x) : x` in `bucket_item`);
- an invariant asserting the container (`models/item_cache.ts`'s `Map.isMap`).

So each row below removes the scaffolding for its own container, and there is no model PR to write. Until PR 10.1–10.2 the plan had
ONE axis per domain — "did it become a slice?" — and every one of the 39 delivered items is that
axis. Container shape is a SECOND axis, and it was a plan item exactly once (row 4.11, THE BUCKETS
FLIP, scoped to `data.buckets`/`bucketsMeta`). The other five flips were promised in code comments
instead — _"rides along with the decorated models and the buckets cluster in 4.9–4.11"_ — a sentence
with no checkbox, no owner and no gate, so when 4.11 shipped the buckets flip was the deliverable
and the passengers were never counted. Nothing regressed; they were never scheduled. Row 12.3
(remove the dependency) had assumed its precondition would arrive as a side effect of work that was
never scoped to deliver it. §6 now carries a **Container plain** column so this cannot recur.

| PR        | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Size   | Status |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| 10.1–10.2 | Shim-removal codemods: `getIn(state, PATH)` → typed slice selectors / property access; `state_paths.ts` constants deleted as they hit zero refs (171 → 63 exports, the file is now the mount table). Delivered as ONE PR, ordered commits — the codemod split by DOMAIN, not by directory, because a family's readers and its path constants are what have to move together                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | L each | ☑      |
| 10.3      | **`data.itemCache` → plain — the biggest of the flips.** NOT a "decorated models" PR: Phases 3.1–3.4 already converted every model from an Immutable Record to a plain interface (#11481 for `decorated_bucket`/`decorated_bucket_item`). What remains is not model work at all — it is the REVERSE dependency, transition SCAFFOLDING that exists because this container has not flipped, and flipping it DELETES the scaffolding rather than converting anything: `models/item_cache.ts`'s `invariant(Map.isMap(items))` (an assertion about the container), `decorated_bucket_item`'s `fromJS(displayForm)`/`fromJS(dfRef)` (there only so a plain bucket item's keys stay container-uniform when merged into an Immutable cache entry — the 4.11 geo/raw-export class; delete them and the merge is plain-into-plain), `decorated_metric_attribute_filter`'s `IImmutableCacheItem` reads, and the §3.4 `getAttribute`/`getAttributeByIdentifier` Immutable-in/Immutable-out contract, which was pinned BECAUSE this subtree stayed Immutable. External writer to watch: `store/bucket_filters/bucket_filters_reducer` merges an Immutable Map in. **Payoff for the slice itself:** an Immutable state is non-draftable, so RTK hands the case reducer the raw value and requires a RETURN — which is why `item_cache_slice.ts` reads `(state, action): IItemCacheState => mergeItemsIntoCache(...)`. Once the value is plain, immer drafting works, so the cases COULD become ordinary mutations (`properties_state.ts` documents the same constraint for 10.7) — **delivered they did not, and that is deliberate**: `mergeItemsIntoCache` stayed a pure identity-preserving function whose result is returned, because a mutating deep merge allocates a fresh entry on every dispatch and loses the no-op short-circuit Immutable's `mergeDeep` gave for free (§7's "identity is re-established explicitly, never inherited"). Returning an unmodified draft IS immer's no-change signal, so the root reference survives. Reasons and the two pinned identity specs in the delivery note. **Also renamed the buckets state family** `IImmutableBucket*` → `IRawBucket*` — plain since 4.11, and 4.11's note promised the sweep to Phase 10 | XL     | ☑      |
| 10.4      | **`data.dateDatasets.available` / `allItems` → plain.** The flags have been plain since 4.5; the items were Immutable Lists of Immutable date datasets. Deleted the scaffolding: `models/decorated_date_datasets`' `createFromImmutable` (now `createFromDateDatasets`; its `getIn(...).map(...).toArray()` was one of the four latent readers), `decorated_date_dataset`'s dual-mode `createFromImmutable` (collapsed into `createDecorated`), `date_dataset.ts#toItemList`, the `fromJS` per value in the slice / `fromMeta` / the open-report and shortcuts apply writers / `buckets_service`'s `{used}` builders (now plain `IUsedDateDatasets`), and the `getDateDatasets` accessor whose `as unknown as IImmutableDateDatasets` cast §10 flagged. Fixed all four latent mixed-container readers §10 listed — those fire ONLY on this flip, which is why 4.5 filed them instead of fixing them (the shortcuts one had been hardened with dual-mode `count()` in the meantime; it reads `.length` now). `date_item`'s `fromJS` named by this row was already deleted — it rode along with 10.3, whose delivery note says so                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | L      | ☑      |
| 10.5      | **`data.visualizationClass` + `visualizationClasses` → plain.** The stored shapes ARE the sdk-model `IVisualizationClass` / its array — no local model, so `typings/visualization_class.ts` (both `IImmutable*` aliases) is DELETED and the list is the payload stored VERBATIM. The ~10 Immutable readers became property access / `visClassUrl`; `isDefaultVisualizationClass` and `VisualizationPicker` compare with lodash `isEqual` (identity usually holds — the selected class is an element OF the stored list — but the external writers re-derive the value, so equality stays the contract). Killed a dead telemetry read: `log_formatters#getVisualization`'s bear-era `["content", "url"]` logged `visualization: undefined` in production behind a bear-shaped fixture. Both leaves left `IMMUTABLE_FAMILY_PATHS` and moved to the audit's `FLIPPED_PATH_CONSTS`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | M/L    | ☑      |
| 10.6      | **`report.lastSavedObject` → plain.** The blocker was the metadata pipeline, the largest single Immutable consumer left: `models/metadata.ts` flipped whole (~93 Immutable sites; `makeImmutable` deleted, `reduceBuckets`' `List<Map>` contract resolved by flipping every downstream consumer in the same PR), `prepareForComparison` rewrote plain over `content`, `getNewReportMDObject`/`getVisualizationForExportFromInsight`/`getMetricMDObject` build plain objects, the export saga's `.toJS()` snapshot is gone. `typings/metadata.ts#IImmutableMd*` and `typings/report.ts#ImmutableReport(Content)` DELETED — consumers type against the bear visualization-object family (`IReport`/`IReportContent` are the state-side names). The slice guards idempotence with an explicit `isEqual`; ERP-provenance `original`s/`totals` normalize at the MD boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | L      | ☑      |
| 10.7      | **`data.visualizationProperties` → plain — the hardest flip, deliberately last of the five.** Not a container swap: `store/properties/properties_helpers.ts#joinControls` implements the colorMapping removal-entry semantics with Immutable `mergeWith` + list identity + `is()`, so it is a rewrite. **Gate:** this lands BEFORE 11.1 (the last container flip), so `report_visualization_selector`'s `referencePoint.set("properties", …)` would plant a plain value inside the still-Immutable reference point — the `[D]` mixed-container producer class (the 4.11 geo/raw-export crash). Mirror at that write site (`mirrorToContainer`, the pattern `buckets_service` uses for totals); do NOT assume 11.1 has run. Pin colorMapping removal with tests before touching `joinControls`. **Delivered:** pins written against the Immutable joinControls first (11 colorMapping specs + the two dead empty-replace branches), then the plain rewrite kept them green; the mirror sits at `getReferencePointWithProperties` (`mirrorToContainer(referencePoint, properties)`); sortItems into the RP deliberately stay plain BY REFERENCE (the RP_BUCKETS 4.11 contract — the only RP-properties reader replaces the key wholesale)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | XL     | ☑      |
| 10.8      | Consistency pass: remaining hand-written plain reducers (ai, data_sampling, featureFlags, permissions, measure_date_datasets) → `createSlice`; final doc update; file backlog items (§10). **Also flips `data.measuresDateDatasets`**: the container has been plain since 7.1 but the STATUSES inside it are `fromJS`-built (`services/measure_date_datasets_service.ts` — a mixed container, which is why `toPlain` on it is not identity). **And verifies two suspected-dead entries** in `create_store.ts`'s `IMMUTABLE_FAMILY_PATHS`: `data.attributeElements` (plain interfaces and a plain reducer since 3.2 — looks stale) and `data.shortcut.shortcutDroppedItem` (stale WITH CERTAINTY since 10.3: the dropped item is itemCache currency and every writer is plain now — the drag payload lost its `fromJS` wraps with the flip, and the postponed-replay path only writes `null`; `getDroppedCatalogItem` is also still TYPED `IRawBucketItem` while holding a catalog item, the renamed 4.11 fossil). Removing a live entry re-enables the dev checks on a genuinely Immutable subtree, so verify by removing it and exercising a flow that POPULATES the value — an empty subtree never trips `serializableCheck`. **Delivered:** the named list was stale (ai deleted at 4.1, featureFlags/permissions slice-ified at 4.4) — the real remainder was data_sampling, measure_date_datasets, and timezone_override (joined the pass, same class). measureDateDatasets left the POST-core wrapper stack entirely (every write was own-subtree), statuses plain, subtree ops shared with the surviving bucket_filters/open_report writers via the trimmed service; the scalar leaves normalize undefined → null with selector-boundary conversion back; sessionStorage side effect → saga; both suspected-dead entries REMOVED with populated-subtree pins in root_flip_contract.test.ts (attributeElements' populate actions are dispatched nowhere — dead domain, §10); `getDroppedCatalogItem` retyped `ICatalogEntry`. The 8 "opportunistically or in 10.8" domains deliberately stay hand-written-plain (§10)                                                                                                                       | M      | ☑      |

> **Delivery notes — [Phase 10.8: the consistency pass](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-108--the-consistency-pass)**: what the stale row list really contained, why measureDateDatasets never needed its wrapper seat, the shared-helper split for the two surviving external writers, the undefined→null trade of the scalar leaves, and how a dead ignore-entry is proven dead (populate, then pin).
>
> **Delivery notes — [Phase 10.7: the visualizationProperties flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-107--the-visualizationproperties-flip)**: the pin-first rewrite of joinControls and the two dead branches it refused to resurrect, the provenance-tolerant helper/comparison boundary, where the mirrors sit (and where one deliberately does not), and the idempotence guards the slice had to write down.
>
> **Delivery notes — [Phase 10.6: the lastSavedObject flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-106--the-lastsavedobject-flip)**: why the whole MD family flipped in one PR rather than consumer-by-consumer, the two ERP-provenance boundaries that stay dual-mode, the pickDefined key-presence contract the typed filter literals must keep, and the fromJS pristine-root fixture that pinned a container dead since 7.2.
>
> **Delivery notes — [Phase 10.5: the visualizationClass(es) flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-105--the-visualizationclasses-flip)**: the dead telemetry read a bear-shaped fixture kept green, why `isEqual` and not reference identity is the contract, the two structural holes that make these fixtures tsc-invisible, and the rider sweep of six buckets-domain fixture files.
>
> **Delivery notes — [Phase 10.4: the dateDatasets flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-104--the-datedatasets-flip)**: the four §10 latent readers closed with the flip, the fixture seeds the compiler could not see, why `getPlainDateDatasets` became the state itself, and the MD-boundary comments that had to stop claiming a retired contract.
>
> **Delivery notes — [Phase 10.3: the itemCache flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-103--the-itemcache-flip)**: why the compiler and not the grep found this sweep, the `mergeDeep`-vs-`lodash.merge` measurement behind the plain write path, the three type lies it exposed (one of them a dead telemetry read), and the shared `any`-typed mock that hid a third of the fixture failures.
>
> **Delivery notes — [Phase 10.1 + 10.2: the shim-removal codemod](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-101--102--the-shim-removal-codemod)**: why the split is by DOMAIN and not by directory, the two things "typed access" can mean while half the tree is still Immutable, the non-falsy `notSetValue` defaults that are a contract, and the two type lies the codemod exposed.

**Phase 10's four unstarted rows moved out.** `10.9` (the cascade dissolution + the last flip) is
Phase 11 rows 11.1–11.6, `10.10` (the remaining root transformers) is row 11.7, `10.11` (batching
residue) is row 12.2, and `10.12` (the finish line) is rows 12.3–12.4. §0 has the reasoning; §4.8 is
the rule that forced it.

**After 10.1–10.2 the remaining root-state `getIn`/`setIn` in production falls into four buckets,
none of which a codemod should touch:**

- (a) the one `sliceSelector` read per domain — §7 recipe item 5, the read layer itself, not debt;
- (b) the transitional cross-domain reducers, which Phase 11 deletes wholesale (the buckets /
  properties / shortcuts / arithmetic-measures / bucket-filters apply reducers, the appContext
  transformer, `router_reducer`, `open_report_apply_reducer`, `execution_apply_reducer`);
- (c) the dual-mode accessors inside the still-Immutable families' own `*_selectors.ts`, which
  become property access when their container flips (10.3–10.7, and 11.1 for RP/ERP);
- (d) **domain-owned WRITES in modules that still live outside `store/<domain>/`** —
  `services/buckets_service.ts` (24 sites into `data.buckets`/`bucketsMeta`),
  `store/filter_bar/filter_bar_service.ts`, `services/measure_date_datasets_service.ts`,
  `services/pluggable_visualization_service.ts`, `models/item_cache.ts#save`,
  `utils/buckets_reducer_helpers.ts`. Each writes its OWN subtree through the shim and moves with
  its domain (10.8, then 11.2–11.3), so re-pointing them at a selector would be pointless
  indirection.

Bucket (d) is the one an earlier draft of this section missed by claiming "exactly three things" —
the check is `grep`-able, so re-run the inventory rather than trusting the prose (the script is in
the 10.1–10.2 delivery note).

### Phase 11 — THE ARCHITECTURE (the buckets cluster becomes saga-orchestrated)

**Subject:** turn the cross-domain cascades into the §4.8 shape — narrow pure helpers, explicit saga
orchestration, semantic fused events, slice-owned boring reducers — and dissolve the service-shaped
root-state APIs for real. This is what was left of row 10.9/10.10, re-planned after the prototype
(§0). Every row is independently reviewable and revertible; the row order IS the dependency order.

**The prototype on `imj-stl-3150-p10-9-experiment` is the PARITY ORACLE, not a starting point.** It
holds a working, suite-green implementation of the target BEHAVIOR (with the wrong architecture), so
every row below verifies against it per typed domain value — never against a root snapshot, which
passes on a lost identity. Read
[the experiment note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-109-experiment--the-cascade-dissolution-prototype)
and
[the cascade architecture working notes](./MIGRATION_AD_REDUX_TOOLKIT_11_ARCHITECTURE.md)
before starting any of them: the second one carries the operation catalog, the helper signatures, the
event catalog, the per-slice consumers and the risk list this table only summarizes.

| PR   | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Size | Status |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 11.1 | **THE LAST CONTAINER FLIP + referencePoint slice-hood.** `data.referencePoint`, `data.extendedReferencePoint`, `data.postponedAction` → PLAIN, types-first (§7); `postponedAction` stores the ready-made action the replay saga re-puts verbatim (`sagas/postponed_action_sagas.ts` moves with it); the ERP geo pipeline rewrites plain over the existing pins; `IImmutableVisualizationProperties` dies; `referencePoint` becomes a real slice (its external writers stay documented until 11.4–11.7, exactly like the 4.5/4.6 pattern). `IMMUTABLE_FAMILY_PATHS` → `["timeTravel"]`; the provenance audit's IMMUTABLE classification retires. **Three landmines the prototype already found and the compiler cannot see — defuse and pin all three:** the lodash `isEmpty(getIn(state, EXTENDED_REFERENCE_POINT))` existence guard (`isEmpty({})` is TRUE — the write silently stops), three ERP-uiConfig readers defaulting to `List()` of which one calls `.contains` (a live TypeError on the plain `accepts` array), and `constructVisualizationMDObj`'s `sanitizedProperties.sortItems = appliedSort` after a `toPlain` that becomes IDENTITY (an in-place write through a store-shared reference). One declared behavior change: `getSecondaryAxisMeasures` becomes a union (Immutable's index-based `List.merge` was accidental). **No dispatch moves in this row** — a flip moves no orchestration, which is what makes it verifiable on its own. **Delivered:** types first (§7) — the three state modules (`reference_point_state.ts` gains `IReferencePointState` + the reference point's own filters-bucket family, NEW `extended_reference_point_state.ts`, NEW `postponed_action_state.ts`) redefined plain BEFORE any runtime change, and `tsc` enumerated the residue; `referencePoint` is a slice owning the two open-report actions it can own alone (mounted with `plainSubtreeLeaf`, so a pre-flip snapshot or fixture cannot reach an immer draft), the rest stay documented external writers for 11.4/11.7; `postponedAction` parks the ACTION, which deleted the last dual-mode seam in `buildBucketItemFromCatalogItem` and exposed one live `fromJS` PRODUCER in `recommendations_apply_reducer` (its comment claimed the buckets subtree was still Immutable — it flipped at 4.11); the ERP geo pipeline is plain over its four existing pins, with `mapCollection` keeping the identity semantics `List.map` gave it; `ensureExtendedReferencePointContainer` DIED (plain intermediates are the right container now — the 7.1 hazard inverted); all three landmines defused and pinned, plus the declared `getSecondaryAxisMeasures` union. Riders the flip forced: `IImmutableVisualizationProperties` deleted and both provenances typed by ONE portable interface — removing the `.toJS()` that erased the type exposed a TS2742 class (see §7), so the properties/uiConfig/customError types are declared as interfaces in AD rather than aliased into sdk-ui-ext's un-exported internals; `IBucketItemDisplayForm` was a `type`-required lie a cast hid; `bucketsMeta` and the reference point's four filter-detail shapes got named types where the converters took `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | XL   | ☑      |
| 11.2 | **Narrow pure helpers I — the small services (§4.8.2).** `store/filter_bar/filter_bar_service.ts` (13 writers, all over ONE domain value) → `(filterBar, …args) => IFilterBarState`; `resetAdditionalDateFilters` takes the date-dataset granularities as an argument instead of reading the store. Same treatment for `pluggable_visualization_service` (`(pluggableVisualization, item) => …`), `measure_date_datasets_service` (the slice's own helpers already exist since 10.8 — the root facade dies, `getDefaultSelectedDateDatasetUri` takes the resolved values), `over_time_comparison_service` and `store/reference_point/reference_point_sync.ts` (`(referencePoint, buckets, refPointFilters, sortItems) => IReferencePointState`, with the md-object-valid flag returned by the OPERATION, not written into the reference point). **Zero behavior change:** each root-state entry point becomes a three-line adapter that reads with the shim, calls the helper and writes back, so every existing caller keeps working and the helpers get their own unit suites. The adapters die in 11.4–11.7 as their callers move. **Delivered:** five helper modules (`store/filter_bar/filter_bar_helpers.ts`, `store/buckets/pluggable_visualization_helpers.ts`, `store/buckets/over_time_comparison_helpers.ts`, the value-level `reference_point_sync.ts`, and `getDefaultSelectedDateDatasetUri` in the measure-date-datasets domain), with the adapters reduced to `read → helper → write` and the PURE members (filter factories, ERP converters, `migrateAdditionalDateFilters`) re-exported so no call site moved. The foreign inputs are ARGUMENTS: `resetAdditionalDateFilters` / `updateFilters` take the date-dataset attributes (two different domains answer "which filters are additional date filters", which only the explicit argument makes visible) and `getDefaultSelectedDateDatasetUri` takes `{ hasDateInBuckets, hasDateFilter, primaryDateDatasetRef }`. `MeasureDateDatasetsService` is DELETED — its two remaining external writers `updateIn` the subtree and call the domain's own helper. The value-level finders are the SAME implementation `filter_bar_selector` now delegates to (the 4.10 rule). Two declared identity changes, stated not slipped: the derived-measure queue's clear is guarded and its empty read is one shared reference (a `createSelector` input — the read-path half of §4.8.5); everywhere else the legacy rebuild-on-no-op is preserved verbatim and pinned in both directions. Removing the queue's dual-mode `toPlain` exposed two stale `fromJS` fixtures whose specs passed for the wrong reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | L    | ☑      |
| 11.3 | **Narrow pure helpers II — `services/buckets_service.ts` (1,663 LOC).** The ~25 writers become value-level helpers with explicit inputs: `addBucketItems(buckets, …)`, `sanitizeTotals(previousBuckets, currentBuckets, { reorderByMeasures })`, `setBucketItemsDateDataset(buckets, ref, target, dateDatasetByRef)`, `syncDateBucketItemGranularityAndDfRef(bucketItem, dateDataset, granularityOverride?)`, `mirrorTotalsToDerivedMeasures(buckets, item)`, `validateVisualizationProperties(extendedReferencePoint, buckets)`, `setBucketTotals(buckets, totals, bucketLocalIdentifier)`, `addTotalsEnabledForAllMeasuresToNewMeasure(buckets, measure)` — plus the two genuine cross-domain calculations, which get an explicit named input AND result type per operation: `removeBucketItemsWithDependencies` and `setBucketItemOverTimeComparison`. The ~35 readers stay `(state) => value` SELECTORS that delegate to the same implementation (the 4.10 "one implementation, two entry points" rule), so the ~40 importers outside the cluster are untouched. Foreign lookups arrive as lazy resolvers (4.9's `CatalogItemTypeResolver`/`BucketItemRefResolver` + a date-dataset-by-ref resolver), feature flags as explicit named booleans. The generic deep-update helpers used INSIDE a buckets value move OUT of `utils/state_access.ts` into a plainly named value utility, identity semantics and negative-index wrap intact (§7). Still zero behavior change; adapters still in place. **Delivered:** the deep-addressing implementation moved to `utils/value_access.ts` and `state_access.ts` is five typed wrappers over it (wrappers not a re-export — `no-barrel-files` bans one, and a barrel would erase the very import-site distinction `[K]`/`[M]` are written in terms of); `store/buckets/buckets_read_helpers.ts` holds the derived reads, `buckets_totals_helpers.ts` the totals rules (`sanitizeTotals` keeping BOTH buckets values, with the grand-total re-pointing pinned — §9.5), `buckets_date_helpers.ts` the date rules with the dataset lookup as a LAZY RESOLVER (which is what let the sync / `setBucketItemsDateDataset` / primary-ref / used-refs / dimensionality-ref rules stop taking `State`; the two dimensionality fallbacks resolve from DIFFERENT sources, so they are two named resolvers), the item writers `addBucketItemsInBuckets` / `removeSingleBucketItemInBuckets` / `swapBucketItemInBuckets` in `buckets_write_helpers.ts`, the value-level `validateVisualizationProperties(extendedReferencePoint, buckets)` in `store/reference_point/extended_reference_point_helpers.ts`, and the two WIDE calculations with an explicit named input and result each — `removeBucketItemsWithDependencies` (`buckets_removal_helpers.ts`, absorbing the eight private root-state sanitizers) and `setBucketItemOverTimeComparison` (`over_time_comparison_helpers.ts`, four branches that are four transactions). Flags arrive named (`{ reorderByMeasures }`, `improvedRankingFilter`). **Four corrections the code forced on §3's signatures, stated not slipped:** `setBucketItemsDateDataset` takes the target as ONE object because the three `SET_*_DATE_DATASET` triggers pick between them; `getBucketItemDimensionalityRef` takes two resolvers; the removal's INPUT includes `bucketsMeta` (the note listed it in the result only — the chain both reads the markers and writes them) and its catalog dep is a metric-REF resolver rather than a `CatalogItemTypeResolver`; and the over-time-comparison operation's input is WIDER than the note's `{ buckets, filterBar, pluggableVisualization }` because two of its four branches run the removal chain and then keep going, so the reference-point sync happens mid-operation and the operation must own it — `referencePoint.buckets` ends up deep-equal to but not identical with `data.buckets` whenever totals exist, which 11.4 fixes by collapsing the two syncs into one event. Three de-duplications (the 4.10 rule): `getImmutableBucketItems` was a second copy of `getAllBucketItems` (deleted, 6 importers re-pointed, retiring the Immutable fossil in its name), `getBucketItemsFromBuckets` a second copy of `getBucketItemsInBuckets`, and the swap's own uiConfig `accepts` lookup a second copy of `getBucketAcceptsItemType`. `setBucketTotals` keeps its guard as an ASKED predicate rather than inferring the no-op from identity, because a write addressing a bucket that does not exist changes no buckets either and there the legacy flow still re-synced the reference point. Riders: `services/buckets_meta_service.ts` DELETED (a namespace object around one pure function, which also forced helpers to import a service to ask about a domain value), `createDerivedMeasure` / `transformDerivedMeasure` moved out of the service so the over-time-comparison helpers stop importing their own replacement target, `selectors/sliced_insight_selector.ts` reduced to its one predicate, `findReplacedBucketItemNewInsertionIndex`'s `immutableBucket` / `immutableUpdatedBucket` parameters renamed and the rule moved value-level, and `ISwapBucketItemAction`'s `from` / `to` typed `IRawBucketItem` (they were `any`, which is what let the swap read them through the dual-mode shim unnoticed) together with the two dispatching components and the apply reducer's payload. Typing the totals payload `ITotal[]` and `bucketsMeta` `IBucketsMetaState` exposed three stale `fromJS` fixtures (fifth through seventh instances of the fixture-not-the-reader class), all found by the compiler | XL   | ☑      |
| 11.4 | **The buckets operations become saga-orchestrated (§4.8.1/4.8.3).** ~15 operations behind the 24 triggers of `buckets_apply_reducer`, each: `select` the typed values it needs → narrow helpers → ONE semantic event (`bucketItemAdded`, `bucketItemsRemoved`, `bucketItemReplaced`, `bucketItemsSwapped`, `bucketItemReordered`, `bucketItemEdited`, `dualAxisToggled`, `bucketsDateDatasetChanged`, `visualizationTypeSelected`, `extendedReferencePointApplied`, `derivedBucketItemsPlaced`, `filterRemovalApplied`) → `extraReducers` in the owning slices. **The trigger stops writing state:** the 9 bucket-item edits the buckets slice owns move their write into the operation's event, so one gesture is ONE store write and no intermediate state is observable (an improvement on the prototype, where the trigger wrote and the fused event followed). `data.bucketsMeta` gets slice-hood, and TWO triggers turn out not to be cascades at all — `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED` (bucketsMeta only) becomes a plain slice case. Kills the `bucketsReducer` fake-dispatch re-entry in `utils/buckets_reducer_helpers.ts` (a reducer calling a reducer) and with it `store/buckets/buckets_reducer.ts`. `bucketsApplyReducer` leaves `root_reducer.ts` and is DELETED. **Delivered:** the operations are pure value-level calculations with an explicit named input, params and result each (`buckets_edit_operations.ts` for the eleven bucket-item edits behind ONE `editBucketItem` plus the three `SET_*_DATE_DATASET` triggers and `selectVisualizationType`; `buckets_add_operation.ts`; `buckets_move_operations.ts` for remove / replace / swap / reorder; `buckets_filter_removal_operation.ts`; `extended_reference_point_operations.ts`, which carried the geo display-form normalization out of the dying reducer), the twelve events are `buckets_operation_events.ts`, the orchestration is `buckets_operations_saga.ts` and the ONE module allowed to know the root state is `buckets_operation_inputs.ts` — per-operation readers, deps builders and writers, no generic path-keyed write map. `buckets_slice.ts` LOST its nine trigger cases (their write moved into the operation's event, §9.1) and consumes eleven events; `reference_point_slice.ts` gains the sync; `bucketsMeta` is a slice owning `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED` outright; the extended reference point, the md-object flag and the derived-measure queue become real reducers, hand-written rather than `createSlice` because immer would deep-freeze the ERP value AD hands straight back to a pluggable visualization. The two watchers that read cascade-written state key on `extendedReferencePointApplied`. **Four corrections the code forced, stated not slipped:** the ADD commits NINE domains, not six — a measure added while every reference-point measure already compares over time runs the over-time-comparison operation, two of whose branches run the removal chain; the REORDER does not run the removal chain at all, so §2.1's "+ the removal set" is an over-statement; `DND_ITEM_REMOVE` has a SECOND removal pass (purge the derived measures once period-over-period comparison is gone) that §2.1 does not mention; and **`BUCKET_TOGGLE_DUAL_AXIS` needed its own event** (`dualAxisToggled`) because it decides the `dualAxis` properties control AND every item's `showOnSecondaryAxis` — leaving the properties half on the trigger would have exposed exactly the half-applied state §9.1 warns about. A fifth correction lands on 11.3's note: a removal that removes nothing answers FOUR of its five inputs by reference, not five, because the chain ends with an unconditional `removeFilters` whose `setFilterItems` has no identity guard (pre-existing, pinned). Riders: `test/utils/dispatch_buckets_trigger.ts` drives a trigger through the real saga and the real reducer SYNCHRONOUSLY, which is what let ~90 assertions across four suites migrate by changing the call; `countStoreWrites` measures the `[P]` gate over `data` rather than the root, because time travel still runs on the trigger; and the last two dual-mode `isImmutable` branches in the buckets helpers are gone with four fixtures flipped to plain                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | XL   | ☑      |
| 11.5 | **Properties / arithmetic-measures / recommendations / shortcuts operations.** Four wrappers, ~16 triggers, ~11 operations: `visualizationPropertiesChanged`, `arithmeticMeasureAdded`, `arithmeticMeasureOperandSelected`, `arithmeticMeasureOperatorSelected`, `recommendationApplied` (one operation, five parameterizations — the discriminant is the recommendation, the payload is what it produces), `metricShortcutApplied`, `metricOverTimeShortcutApplied`, `shortcutPostponed`. THREE more triggers turn out to be single-domain writes and become plain slice/leaf cases, not cascades: `visualizationPropertiesInitialized` and `openAsReportToggled` (extended reference point only) and `SHORTCUT_SET_DROPPED_ITEM` (the dropped-item leaf, which the time-travel undo fixup also writes — that seam stays infrastructure). Depends on 11.4: the shortcut/recommendation operations REUSE the buckets add/edit operations, which is exactly what the fake dispatch was faking. All four wrappers leave the chain and are DELETED. **Delivered:** the three non-cascade flips landed first and alone (the two properties triggers as plain ERP leaf cases, the dropped item as a real leaf owning `SHORTCUT_SET_DROPPED_ITEM`, with time travel's `setDroppedItem` fixup moved next to it); then one operation module + one events module + one saga per family — `properties_operation.ts` (the totals guard decides the SYNC and the md flag, so both are conditional in the payload; the sync reads the sort items the push itself stores, never a boundary select), `arithmetic_measures_operations.ts` (the factory's fresh-identifier impurity stays at the saga boundary; the `<2 measures` bail-out commits NOTHING; the operator write-back's `isImmutable ? fromJS : plain` pair — the cluster's last — deleted), `recommendations_operation.ts` (ONE event, five parameterizations, composing the add/edit/date/type operations on values; trending re-resolves the primary date ref MID-operation because the planted date item decides it), `shortcuts_operations.ts` (the apply/postpone branch lives in the SAGA — its deciding facts are boundary reads; the over-time date lookups resolve against the COPIED shortcut lists via a dedicated resolver, because a boundary resolver would answer from the stale `data.dateDatasets`). `data.postponedAction` got a real hand-written leaf (the re-put action must not be immer-frozen). **Payload corrections on §2.2, stated not slipped:** `recommendationApplied` and the two shortcut applies carry the add operation's full nine domains (+ the class / the copied `dateDatasets` / the cleared shortcut leaves), and `arithmeticMeasureOperandSelected` carries `bucketsMeta` — the removal chain rewrites the markers. **The audit the 11.4 note demanded found ONE genuine hazard:** `onPropertiesChanged` put the store trigger and then `put(undo())` for an over-long push — with the trigger writing nothing, the undo would run before the queued operation and its commit would silently redo the change, so the too-long tail (warn + log + undo + disableRedo) moved INTO the operation handler, pinned end-to-end through the real saga chain. Riders: the whole-root adapters died with their callers (`utils/buckets_reducer_helpers.ts` + the `[J]` write* half of `buckets_operation_inputs.ts`, the OTC service writer + reference-point readers, the queue writers of `PluggableVisualizationService`, root `setBucketTotals`/`sanitizeMeasureFormat`, `DateDatasetUtils.findDateBucketItems` with this module's last dual-mode `List` sentinel); `getLocalVisualizationClass` moved to `visualization_class_service.ts`; the `SHORTCUT_APPLY_*`/`dropCatalogItem` creators are typed `ICatalogEntry` (the `Record<string, any>` TODOs); the test harness runs every family's watcher, and the oracle suites keep their pins via shims over the SAME shared implementations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | XL   | ☑      |
| 11.6 | **The bucket-filters operations (the last cluster wrapper).** 11 triggers, ~8 operations: `attributeFilterUpdated`, `dateFilterUpdated`, `dateFilterDateDatasetChanged`, `filterItemsUpdatedFromCommand` (the embedded `COMMAND/*` path), `measureValueFilterUpdated`, `rankingFilterUpdated`, `measureFilterAdded`, `measureFilterRemoved`, `measureFilterUpdated`; `STORE_UPDATE_ATTRIBUTE_FILTER_DISPLAY_FORM` is single-domain and becomes a plain filter-bar case. This family is last because it needs the most helpers (filter bar + buckets + item cache + measure date datasets) and because it is the only one writing `data.itemCache` and `data.measuresDateDatasets`. With `bucketFiltersReducer` deleted, **all six buckets-cluster wrappers are gone from `root_reducer.ts`** and the last external writer of `data.measuresDateDatasets` from this family goes with it (its whole-root facade died at 11.2; what is left at this call site is one `updateIn` around the domain's own helper). **Delivered:** BOTH display-form triggers (the filter bar's and the bucket-item metric filter's — §2.3 predicted both, this row's summary named one) landed first as ONE plain filter-bar case (`storeAttributeFilterDisplayAsLabel`); then one operations module + one events module + one saga for the nine cascade triggers — `bucket_filters_operations.ts` (an explicit named input, params, deps and result per operation, with the legacy `bucketsWereChanged` tail spelled out per operation), `bucket_filters_operation_events.ts`, `bucket_filters_operations_saga.ts` (the boundary; the command's fresh-identifier impurity arrives as a `generateFilterLocalIdentifier` dep because its create loops are data-dependent). The derived-measure consequence is `updateDerivedMeasuresOverTime` (`over_time_comparison_helpers.ts`), composing the 11.3 OTC operation per master measure — or one removal pass on `NOTHING` with the entry-buckets `sanitizeTotals`. The family's `data.itemCache` / `data.measuresDateDatasets` writes became slice cases of `measureFilterAdded`/`measureFilterRemoved`. **Payload corrections on §2.3, stated not slipped:** the three removal-chain-capable events (`dateFilterUpdated`, `filterItemsUpdatedFromCommand`, `measureFilterUpdated`) carry the full NINE domains — the derived-measure queue included, because enabling a comparison with no derived measure yet QUEUES one — and `measureFilterUpdated` carries the reference point and md flag CONDITIONALLY as legacy (an edit with neither the over-time rider nor `isModified` rewrites the filters without re-syncing); `dateFilterDateDatasetChanged` ALWAYS fires, a no-op carrying every value by reference. **The 11.4-mandated audit found TWO genuine hazards**, both the put-trigger-then-select class: `control_filtering_saga` read the filter items its command had just created (the display-as-label follow-up needs their generated identifiers) → `take(filterItemsUpdatedFromCommand)`; `synchronizeDateFilterDateDataset`'s caller read `isPoPSetup` off the filter it had asked to re-point → `take(dateFilterDateDatasetChanged)`, which the always-emit contract keeps hang-free. Declared hardenings, each replacing a legacy CRASH and never a write: an update addressing a missing filter and a metric-filter gesture addressing an item in no bucket COMMIT NOTHING (the command variant answers the unchanged input so its event still fires); an absent over-time payload reads as no comparison. Riders: the STORED bucket-item metric filter got its own type (`IBucketItemMetricFilter` — not the decorated UI shape) and all six metric-filter creators dropped their `item`/`filter`/`changes` `any`s, exposing three more stale fixtures (eighth through tenth of the fixture-not-the-reader class: a Symbol bucket item and two Immutable `Map` filters); `IMetricFilterChanges.selectedElements` stays WIDE because the dialog's apply payload still carries an Immutable `List` the operation's `toPlain` seam normalizes; the wrapper's `isImmutable ? merge(fromJS) : spread` pair — this family's last — died with it; six dead `buckets_service` write adapters deleted and `FilterBarService`'s two filter-answering entries became direct helper calls; `[P]`/identity/always-emit/commit-nothing pins in `bucket_filters_operations_saga.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | XL   | ☑      |
| 11.7 | **The remaining root transformers, under the same rule.** The PRE-core stack (appContext reset/sessionId transformer, `routerReducer`'s conditional whole-app reset, `openReportApplyReducer`) plus the two POST-core leftovers (`deleteReportApplyReducer`, the one `report.nowOpen` close left in `executionApplyReducer`). NOT moved into sagas as-is — decomposed per §4.8 (targets in the note below the table). An application-wide reset legitimately becomes ONE broad semantic event honored by many slices; that is not a root `State → State` business transformer. After this row the wrapper stack holds only the two sanctioned infrastructure wrappers. **Delivered:** all five transformers DELETED; `root_reducer.ts` is the combined core inside `withPluggableMountReset` inside `withTimeTravel` — the wrapper arrays are gone, and the wiring test's duplicate-entry pin died with them. The resets are the events + matchers of `store/app_context/application_reset_events.ts` (ONE module = the inventory; `application_reset.test.ts` pins the EXACT key set per scope over a dirtied state, preserved keys by identity): `insightContentCleared` and `applicationCleared` are translated from the frozen triggers by `reset_sagas` (the event is put FIRST in the same worker, so the legacy side effects keep reading post-reset state and no watcher-order hazard exists), `wholeApplicationReset` is the router saga's decision, OPEN_REPORT_FAILED resets unconditionally and DELETE_REPORT_FINISHED resets iff its payload carries the reset — both compose their own writes with the reset INSIDE the owning slices' cases (the NOT_FOUND status and `reportNotFound` flag land on top of the reset in one dispatch, exactly the legacy wrapper-order sequencing; the repeated-failure value is a hoisted constant so identity survives, §4.8.5). The two RECOMPUTED values ride on the events as `IApplicationResetCarrier` (fresh `sessionId` because uuid is impure, the re-defaulted class because `data.visualizationClass` must not cross-read `data.visualizationClasses`) — and with the bootstrap/refresh prepare callbacks generating ids too, the single-owner `sessionId` leaf is PURE (a declared shape change: BOOTSTRAP_DATA's payload carries `sessionId`). The router: LOCATION_CHANGED writes nothing; the saga's synchronous prefix (before any cancellable effect, and before `document.body.click()` exactly where the legacy reducer ran) computes the pair with `buildNextRoute`, commits ONE `routeChanged` event both leaves consume, and decides `shouldResetOnNavigation` PURELY over the pair — the cross-key read is gone because the ACTION carries the previous route; SET_ROUTE_PROJECT_ID stays a plain case on each leaf; `locationRedirectLock` is a slice; time travel keys the history clear on the router event (the two legacy triggers stay listed — belt and suspenders, pinned). Open-report: the saga boundary (`resolveOpenReportResult`) selects five typed domain values, resolves the class and the date-dataset-meta URI resolver, calls the pure `applyOpenReport` operation, and OPEN_REPORT_FINISHED carries the fused typed result (buckets, bucketsMeta, itemCache, filterBar, measuresDateDatasets, dateDatasets answered BY REFERENCE when no dataset is selected, visualizationClass, properties + the ERP mirror, the wholesale referencePoint) — twelve consumers, one dispatch, and the oracle suite now drives the REAL chain through the same boundary. `executionApplyReducer`'s one foreign write is the `currentReportExecutionSettled` coordination event (the watcher re-tests the id guard; a superseded result emits NOTHING — pinned). Riders: `reportExecutionFinished`'s `executedReport: any` typed as the render's `IExecutionResult`; the open-report pipeline's `any`s died with the operation module (`IRawBucketItem` gains the date item's `uri`, `IBucketItemMetricFilter` gains the date filter's `dimension`); the dead `IImmutableFilterItem`/`IImmutableDateFilter` aliases deleted; `getSelectedDateDataset` answers `undefined` where the legacy helper answered `null` (the value never leaves the operation)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | L/XL | ☑      |

**Delivery notes.** [11.1 — the last container flip](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-111--the-last-container-flip) · [11.2 — narrow pure helpers I](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-112--narrow-pure-helpers-i-the-small-services) · [11.3 — narrow pure helpers II, `services/buckets_service.ts`](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-113--narrow-pure-helpers-ii-servicesbuckets_servicets) · [11.4 — the buckets operations](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-114--the-buckets-operations-become-saga-orchestrated) · [11.5 — the four small families](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-115--the-properties--arithmetic--recommendations--shortcuts-operations) · [11.6 — the bucket-filters operations](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-116--the-bucket-filters-operations-the-last-cluster-wrapper) · [11.7 — the remaining root transformers](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-117--the-remaining-root-transformers-the-wrapper-stack-empties).

**Per-row gates (in addition to §8).** Every Phase 11 row: package suite green, `validate` green,
plus (a) parity against the experiment branch per typed domain value — `toEqual` for what changes,
`toBe` IDENTITY for what must not; (b) for every row that moves a dispatch, a spec asserting the
operation produces exactly ONE store notification; (c) the row's new architecture detector added to
the audit script in report-only mode (§7, wired to gate at 12.4). Rows 11.1, 11.4 and 11.7 are
**§8 high-risk gates**: full e2e run + manual smoke (undo/redo torture, embedded postMessage,
open/save/delete/export, splunk spot-check).

**How the 11.7 transformers dissolve (each checked against §4.8, not moved).** _(Delivered as
designed — the corrections the code forced are recorded in the row above and the delivery note.)_

- **appContext reset / sessionId.** Target: one explicit typed APPLICATION-RESET event that the
  affected slices honor in their own `extraReducers`, plus a single owner for `sessionId`.
  `resetApplication(state: State): State` called from a saga is not the target. The row's real work
  is the inventory — which state is genuinely reset, which is recomputed (sessionId, color palette,
  visualization class) and which is deliberately PRESERVED — with a pinning test on the key set, for
  the same reason 8.1's undo projection is a deny-list: a miss silently drops a user value.
- **`routerReducer`'s conditional whole-app reset.** A route reducer must not rewrite other domains.
  Target: route/project change → the saga decides a workspace transition requires a reset → the same
  application-reset event → slices reset themselves. The `route`/`previousRoute` cross-key read
  disappears once the action carries the previous route. Action ORDERING stays as the
  characterization suite pins it (the reset landing before the slices write their own flags is
  load-bearing — see `root_reducer.ts`).
- **`openReportApplyReducer`.** Decompose reads / computation / writes: select the required values,
  build a typed open-report result, dispatch ONE fused report-opened event, let each slice handle its
  own state. It applies many coupled values in one legacy pass, so the atomicity requirement is the
  one §4.8.3 already answers. It is also the last external writer of `data.referencePoint` and of the
  measure-date-dataset selection, so it closes those two documented exceptions.
- **`deleteReportApplyReducer`.** Same principle, smaller: name the affected domains and give the
  event explicit delete semantics (`DELETE_REPORT_STARTED` is already handled by cases in more than
  one slice — that is the shape to finish).
- **`executionApplyReducer`'s remaining `report.nowOpen` write.** Decide the OWNER instead of keeping
  a whole-root wrapper for one foreign write: a report-domain value closed in reaction to an execution
  signal, so either the report slice handles that action directly or the execution saga emits a
  coordination event the report slice honors.

### Phase 12 — THE CLEANING (the transition infrastructure comes out)

| PR   | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Size | Status |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| 12.1 | **Strict root composition.** With the last domain wrapper gone (11.7), `combineBranch` becomes redux's strict `combineReducers` (§4.4): the root is domain reducers plus the two sanctioned infrastructure wrappers, every key has exactly one owner, and `undefined`-tolerance / unknown-key preservation are no longer needed. The 7.2 wiring test that pins one-owner-per-key becomes largely the compiler's job                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | M/L  | ☑      |
| 12.2 | Remove `redux-batched-actions` and the inert `enableBatching` wrap in `create_store.ts` — added in 1.1 for a Phase 9 that is not happening, and nothing dispatches a batch; `rush update`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | S    | ☑      |
| 12.3 | **Remove Immutable.** Drop `immutable` + `immutable-devtools`; delete `immutable-compat.d.ts`, `typings/state.ts`, `utils/reducers.ts`, `_infra/lift_slice.ts`; `rush update`. Nothing may import `immutable` when this lands. **`create_store.ts`'s `IMMUTABLE_FAMILY_PATHS` is REDUCED TO `["timeTravel"]`, not emptied** — that entry is a PERFORMANCE exclusion, not an Immutability one (8.1: the history holds whole past states by reference, so the dev checks would deep-walk every snapshot on every dispatch — O(history × state) per action, a frozen main thread in dev). Anyone who deletes it reintroduces exactly the freeze 8.1 avoided. **Delivered with one deviation, stated not slipped:** `typings/state.ts` stays — the Immutable `State` alias the file list targeted was rewritten to the PLAIN transitional alias back at 7.1; today it dies with the shim at 12.4 (§0 has the reasoning). The ignored-paths reduction had already landed at 11.1 (the constant is `DEV_CHECK_IGNORED_PATHS`). Extra deletions that belonged to this row's spirit: `_infra/plain_subtree.ts`, `typings/immutable_map.ts`, the 22 test-era `<domain>_reducer.ts` lift mounts and `mixed_root_contract.test.ts` | M    | ☑      |
| 12.4 | **THE FINISH LINE — the transition infrastructure and the gates.** `constants/state_paths.ts` and `utils/state_access.ts` are to be DELETED, not trimmed: do not settle for dropping the `isImmutable` branch if no legitimate path-based Redux consumer is left. Whatever genuinely survives is a plain-object utility with a name that says so, in its own module, with its callers named (§4.8.4). Then flip every architecture detector from report-only to GATE in `npm run validate` (§7): `State → State` domain functions, root-`State` imports in domain/helper modules, `getIn/setIn/updateIn/deleteIn` over Redux state, `constants/state_paths` imports in business code, `pathKey` / write-surface arrays / cluster-aggregate types / generic change-set helpers, and the reducer-ownership rule (a reducer module importing another domain's selectors or the state shim). The allowlist is explicit and short — the two infrastructure wrappers and the value utility — so the gate enforces the RULE instead of grepping same-named functions                                                                                                                                                           | M/L  | ☑      |
| 12.5 | **ONE ACTION IDIOM, AND A DISPATCH THAT IS CHECKED.** Convert every remaining hand-written action creator to `createAction(FROZEN_STRING, prepare?)` and every hand-written action interface to `ReturnType<typeof creator>` (§4.7, §7 step 2) — the residue 10.8 deferred and 12.4 did not touch, in `src/actions/`, the per-domain `*_ui_actions.ts` / `*_store_actions.ts` and the eight already-plain hand-written domains. Then the consequence, which is the point: drop `as unknown as Store<IAppState, AnyAction>` from `create_store.ts`, retype `AppDispatch` to the store's own inferred dispatch, and collapse the four dispatch spellings at the call sites into one. `AnyAction` leaves the package (deprecated in redux 5, and its `[key: string]: any` is why nothing about dispatch was type-checked). One spelling at the call sites means `useDispatch<AppDispatch>()` imported per module — NOT a shared `useAppDispatch`, which `isolate: false` makes flaky (§7). Gate it with [R7]/[R8] in `audit-state-architecture.mjs`                                                                                                                                                                        | L    | ☑      |

**Delivery notes.** [12.1 — strict root composition](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-121--strict-root-composition) · [12.2 + 12.3 — the Immutable removal](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-122--123--the-immutable-removal) · [12.4 — the finish line](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-124--the-finish-line-the-transition-infrastructure-comes-out-the-gate-replaces-it) · [12.5 — one action idiom, and a dispatch that is checked](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-125--one-action-idiom-and-a-dispatch-that-is-checked): why the two TODOs were one, the `createAction<P>(TYPE)` trap that erases the literal `type`, and why a shared typed-dispatch hook cannot exist while the suite runs `isolate: false`.

### Dependency graph

```
P0 → P1 → P2 ─┬→ P3 ⇄ P4   (model PR lands just before its domain PR; 3.4→4.9→4.10→4.11 hard chain)
              └→ P5         (parallel with P3/P4)
P3+P4+P5 → P6 → P7.1 → P7.2 → P7.3 → P8;   P9 DROPPED;   P10.1–2 after 7.2
Phase 10 (CLOSED) ran in row order 10.1 → 10.8:
  10.3–10.6 are INDEPENDENT of each other — no flip is a prerequisite for another; they were ordered
    by blast radius, biggest first, so the riskiest landed with the most runway
  10.7 (properties) landed before the last flip, so it mirrors into the still-Immutable ref point
Phase 11 → Phase 12, in row order. The constraints that make it that order:
  11.1 first — a flip moves no dispatch, so every later row then operates on plain values only
  11.2 → 11.3 → 11.4: the narrow helpers must exist before orchestration can call them; 11.3 is
    split from 11.2 by size, not by dependency (filter bar + small services vs buckets_service)
  11.4 before 11.5 — the shortcut/recommendation operations REUSE the buckets operations (that is
    what `buckets_reducer_helpers`' fake dispatch was faking)
  11.6 last of the cluster — most helpers, and the only family writing itemCache / measureDateDatasets
  11.7 after 11.6;   12.1 after 11.7 (strict composition needs the last wrapper gone);
  12.3 before 12.4;   12.4 last of the transition infrastructure — the deletion audit and the
    gates can only be answered when every other row is done
  12.5 after 12.4, and a FOLLOW-UP rather than a prerequisite of anything. Its own ordering is
    what matters: every creator first, `create_store.ts` LAST, because dropping the store cast is
    where a missed creator surfaces as a compile error instead of a runtime one
```

---

## 6. Per-domain progress checklist

Update this table in every migration PR. "Slice" = createSlice landed behind bridge; "Paths" = its
`state_paths.ts` constants deleted — **historical since row 12.4: there are no path modules left,
so every row is ☑ by construction**; **"Container plain"** = its stored VALUE is plain JS, with the
Phase 10 row that flips it where it is not. That last column exists because the container axis was
tracked nowhere for six phases (see the note above the Phase 10 table) — a domain can be a fully
migrated slice and still hold an Immutable value, and both facts have to be visible at once.

Since PR 10.1–10.2 the "Paths" column means the domain's **deep leaf**
constants: the subtree ROOT stays in `constants/state_paths.ts` as long as the reducer is mounted at
it (it is the mount table now, §5 Phase 10), and a family whose value is still Immutable keeps its
leaves in its own `*_paths.ts` — which counts as deleted here, because the global schema no longer
carries them.

| Domain                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Model PR | Slice PR                                                                                                                                                  | Selectors typed | Tests migrated                         | Paths deleted                                   | Status | Container plain                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------- | ----------------------------------------------- | ------ | ------------------------------------- |
| highlighting                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        | 1.2                                                                                                                                                       | ☑               | ☑                                      | ☑ (none held)                                   | ☑      | ☑                                     |
| recommendations (own state = dismissedRecommendations; apply-handlers dissolve in 4.10/4.11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        | 2.1                                                                                                                                                       | ☑               | ☑                                      | ☑                                               | ☑      | ☑                                     |
| arithmeticMeasures (no own subtree → typed root transformer in 2.2; dissolves into narrow helpers + saga operations at PR 11.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        | 2.2                                                                                                                                                       | n/a             | ☑ (unchanged)                          | n/a                                             | ☑      | ☑                                     |
| bucketFilters (no own subtree → typed shim-based root transformer in 2.4; dissolves into narrow helpers + saga operations at PR 11.6 — the only family writing itemCache/measureDateDatasets)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 3.2 ☑    | 2.4                                                                                                                                                       | n/a             | ☑ (unchanged)                          | n/a                                             | ☑      | ☑                                     |
| catalog / chartSort / dragAndDrop / metricEditor / attributeElements / bucketNotifications / applicationContext / filterBar (already plain; 10.8 verified the `data.attributeElements` ignore-entry stale and REMOVED it — the domain's populate actions are dispatched nowhere, see §10; the FILTER BAR's 13 whole-root writers became narrow pure helpers at 11.2 and its selectors delegate to the same finders, so only its hand-written reducer is left to RTK-ify)                                                                                                                                                                                                                                                                                                                                                                                                                          | —        | stay hand-written-plain — RTK-ify opportunistically (§10; 10.8 deliberately did not take them: no Immutable values, so they gate nothing in Phases 11–12) | ☐               | ☐                                      | ☐                                               | ☐      | ☑ (plain; ignore-entry removed, 10.8) |
| router (typed root transformer → PRE-core wrapper at 7.2; **DISSOLVED at 11.7** — the `routeChanged` event carries the previous route, `route`/`previousRoute` are independent leaves, `locationRedirectLock` is a slice, the reset decision lives in the saga; route values plain, typed read layer at 10.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        | 4.1                                                                                                                                                       | ☑ (typed)       | ☑                                      | ☑ (32 leaves; 2 mounts kept)                    | ☑      | ☑                                     |
| dialogs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        | 4.1                                                                                                                                                       | ☑               | ☑                                      | ☑                                               | ☑      | ☑                                     |
| messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 3.1 ☑    | 4.2                                                                                                                                                       | ☑               | ☑                                      | ☑ (mount only)                                  | ☑      | ☑                                     |
| drillableItems                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        | 4.2                                                                                                                                                       | ☑               | ☑                                      | ☐ (mount path)                                  | ☑      | ☑                                     |
| shortcuts (shortcutDateDatasets slice; APPLY handlers dissolve into saga operations at PR 11.5, `SHORTCUT_SET_DROPPED_ITEM` turns out to be a plain leaf case; `data.postponedAction` PLAIN since 11.1 — it parks the ready-made ACTION and the replay saga + its selector moved into the domain; droppedItem is PLAIN — its stale ignore-entry left at 10.8 with the `getDroppedCatalogItem` type fossil)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 3.3 ☑    | 4.3                                                                                                                                                       | ☑               | ☑                                      | ☑ (leaves → shortcut_date_datasets_paths, 10.1) | ☑      | ☑ postponedAction (11.1)              |
| appContext (5 mini-branch mounts unwrapped at 7.2; the sessionId/reset transformer **DISSOLVED at 11.7** — the reset scopes are the typed events of `application_reset_events.ts` honored by the owning slices, and `sessionId` is a pure single-owner leaf)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        | 4.4                                                                                                                                                       | ☑               | ☑                                      | ☐ (paths still read)                            | ☑      | ☑                                     |
| embedding (5 mini-slices under the appState.meta combineBranch node since 7.2; the optional single-slice fold is WON'T DO — 10.8 judged it cosmetic churn, §10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        | 4.4                                                                                                                                                       | ☑               | ☑                                      | ☑ (device leaves → embedding_paths, 10.1)       | ☑      | ☑                                     |
| intl                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        | 4.4                                                                                                                                                       | ☑               | ☑                                      | ☑ (leaves → intl_paths, 10.1)                   | ☑      | ☑                                     |
| featureFlags                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        | 4.4                                                                                                                                                       | ☑               | ☑ (new — gap)                          | ☐ (mount path)                                  | ☑      | ☑                                     |
| permissions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        | 4.4                                                                                                                                                       | ☑               | ☑ (new — gap)                          | ☐ (mount path)                                  | ☑      | ☑                                     |
| itemCache (container flipped at 10.3, with the model code that read it and the `ICatalogEntry` type collapse)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 3.3 ☑    | 4.5                                                                                                                                                       | ☑               | ☑                                      | ☐ (mount path)                                  | ☑      | ☑                                     |
| datasets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        | 4.5                                                                                                                                                       | ☑               | ☑ (new — gap)                          | ☐ (mount path)                                  | ☑      | ☑                                     |
| dateDatasets (fully plain since 10.4 — flags at 4.5, items with their models at 10.4) / dateDatasetsMeta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 3.3 ☑    | 4.5                                                                                                                                                       | ☑               | ☑                                      | ☑ (leaves → date_datasets_paths, 10.1)          | ☑      | ☑ (10.4)                              |
| visualizationClasses + visualizationClass (2 mini-branch mounts; values plain sdk-model shapes since 10.5, no local model)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        | 4.5                                                                                                                                                       | ☑               | ☑                                      | ☐ (external writers)                            | ☑      | ☑ (10.5)                              |
| insightUsage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        | 4.5                                                                                                                                                       | ☑               | ☑                                      | ☐ (transformer reset)                           | ☑      | ☑                                     |
| configurationPanel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        | 4.5                                                                                                                                                       | ☑               | ☑                                      | ☐ (external writers)                            | ☑      | ☑                                     |
| insight (title/tags/summary/layers/layersOwner — 5 mini-branch mounts, permanently PLAIN incl. the formerly mixed tags/layers)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        | 4.8                                                                                                                                                       | ☑               | ☑                                      | ☐ (external writers)                            | ☑      | ☑                                     |
| pluggableVisualization — written ONLY from the buckets cluster, moved out of 4.7 by the deep dive; value PLAIN since 4.11; the queue's operations are narrow pure helpers since 11.2 (`IPluggableVisualizationState` named, `store/buckets/pluggable_visualization_state.ts` + `_helpers.ts`) and the subtree got a REAL LEAF REDUCER at 11.4 consuming the add / derived-placed events; the service adapter survives only for the arithmetic-measure and recommendation wrappers, dying at 11.5                                                                                                                                                                                                                                                                                                                                                                                                  | —        | 4.11 ☑ / 11.2 ☑ / 11.4 ☑                                                                                                                                  | ☑ (helpers)     | ☑                                      | ☑ (11.4)                                        | ☑      | ☑                                     |
| visualizationProperties + propertiesMeta (both plain; the ERP/totals writes dissolve into saga operations at PR 11.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        | 4.6                                                                                                                                                       | ☑               | ☑                                      | ☑ (leaves → properties_paths, 10.1)             | ☑      | ☑ (10.7)                              |
| execution (fully plain; the history rewrites dissolved at 8.1, the id-guarded nowOpen close became the `currentReportExecutionSettled` coordination event **at 11.7** — the other 4.7 leaves dissolved at 4.8)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        | 4.7                                                                                                                                                       | ☑               | ☑                                      | ☑ (leaves → execution_paths, 10.1)              | ☑      | ☑                                     |
| report (saving/savingAsNew/opening/nowOpen/loadingError/lastSavedObject — 6 mini-branch mounts; open/delete apply reducers transitional)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        | 4.8                                                                                                                                                       | ☑               | ☑                                      | ☑ (savedObject leaves → report_paths, 10.1)     | ☑      | ☑ (10.6)                              |
| buckets + referencePoint (4.9 = pure helpers; 4.10 = write-path slice + renaming mini-mount; 4.11 = reader mechanization + THE FLIP of `data.buckets`/`bucketsMeta`; 11.1 = the LAST FLIP — RP + ERP containers PLAIN and `referencePoint` a real slice for the two open-report actions it owns alone, its cross-domain writers still external; 11.2 = the reference-point SYNC becomes `syncReferencePoint(referencePoint, buckets, refPointFilters, sortItems)` with the md-object-valid flag left to the operation; the remaining writers → narrow helpers at 11.3; **11.4 = the CASCADES BECOME OPERATIONS — the apply reducer is deleted, `referencePoint` owns the sync, `bucketsMeta` has slice-hood, the ERP / md-flag / queue leaves get real reducers; the only external writer left was open-report's OPEN_REPORT_FINISHED — a slice case consuming the operation result since 11.7**) | 3.4 ☑    | 4.9 ☑ / 4.10 ☑ / 4.11 ☑ / 11.1 ☑ / 11.2 ☑ / 11.3 ☑ / 11.4 ☑                                                                                               | ☑               | ☑                                      | ☑ (RP/ERP leaves → *_paths, 10.1)               | ☑      | ☑ RP+ERP (11.1)                       |
| postMessage (mini-branch mount inside shared appState.meta; value PLAIN; folder stays `postMessageApi/state`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        | 5.1                                                                                                                                                       | ☑ (5.2)         | ☑                                      | ☐ (mount paths)                                 | ☑      | ☑                                     |
| dataSampling / timezoneOverride / measureDateDatasets (the last hand-written reducers; genAi never had one — its reducer died at 4.1 and the selectors compose featureFlags/permissions. `data.measuresDateDatasets` statuses PLAIN with the RTK-ification; the scalar leaves store null-for-unset with selector-boundary conversion; the whole-root facade DELETED at 11.2 — the default-selection rule is a helper taking resolved values, and the two external writers call the domain's helpers directly)                                                                                                                                                                                                                                                                                                                                                                                     | —        | 10.8 ☑ / 11.2 ☑                                                                                                                                           | ☑               | ☑ (new — gap closed for data_sampling) | ☑ (mount paths only)                            | ☑      | ☑ statuses (10.8)                     |
| timeTravel (wrapper, not slice; `timeTravel` root key, `store/_infra/time_travel.ts`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        | 8.1                                                                                                                                                       | ☑               | ☑                                      | ☑                                               | ☑      | ☑                                     |

## 7. Slice migration recipe (established by PR 1.2 — `store/highlighting` is the reference)

Per domain, in one PR, folder `src/store/<domain>/`:

1. **State** — `<domain>_state.ts`: `I<Domain>State` interface + `<domain>InitialState` constant. Fully typed, strict-compatible, no Immutable types anywhere in the subtree (hard gate, §9).
2. **Actions** — `<domain>_actions.ts`: convert every hand-written creator to `createAction(LEGACY_STRING, prepare?)`.
    - Type strings stay EXACTLY as they are (frozen, §3); keep the type-keys enum.
    - A `prepare` callback preserves the original positional call signature and payload shape, so call sites and payload consumers don't change at all.
    - Derive the domain action union via `ReturnType<typeof creator>`; delete the hand-written per-action interfaces.
    - **Use the prepare form even for a single pass-through payload** — `createAction(TYPE, (x: P) => ({ payload: x }))`, never `createAction<P>(TYPE)`. Supplying only the first type argument makes TS default the second to `string`, which erases the literal `type` and silently breaks every discriminated-union switch (§4.7, and the §7 gate entry for what that cost at 12.5).
    - Since row 12.5 this step is CLOSED for the whole package and enforced by [R7]: it applies to any NEW action, not to a backlog.
3. **Slice** — `<domain>_slice.ts`: `createSlice({ name, initialState, reducers: {}, extraReducers })`. ALL existing actions are wired via `extraReducers` `builder.addCase(creator, caseReducer)` (immer mutation inside); `reducers: {}` is reserved for genuinely NEW post-migration actions (those get RTK `${name}/${key}` strings).
4. **Mount** — `<domain>_reducer.ts`: `export const <domain>Reducer = liftSlice(<DOMAIN>_STATE_PATH, <domain>SliceReducer);` replaces the legacy whole-root reducer / `applyReducer` adapter. The registration in `root_reducer.ts` / `data_reducer.ts` stays untouched.
5. **Selectors** — `<domain>_selector.ts`: ONE input selector `sliceSelector(<DOMAIN>_STATE_PATH, <domain>InitialState)` (dual-mode — survives the root flip unchanged); every `createSelector` (imported from `@reduxjs/toolkit`, not reselect) hangs off it. No raw `state.getIn` remains in the domain.
6. **Services** — dissolve per §4.3: own-subtree mutations → case reducers; pure computations → `<domain>_helpers.ts`; cross-domain logic → sagas (`select` + `put`; one event action via `extraReducers` where the cascade must stay atomic).
7. **Tests** — migrate the domain's tests off `fromJS` fixtures. Tests that drive the lifted reducer with the whole root state keep working unchanged (see `store/highlighting/test/highlighting_store.test.ts`).
8. **Types** — add the domain's state to `store/types.ts` `IAppState` at its legacy position.
9. **Doc** — tick the §5 checkbox and the §6 row, update §0 Progress, and **write the delivery note** in
   [MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md)
   (link it from the phase section in §5); delete the domain's constants from `constants/state_paths.ts`
   once they hit zero references. Anything you had to discover — a container that behaves unexpectedly, a
   registration order that is load-bearing, a legacy quirk you preserved on purpose, a reader you had to
   re-point — belongs in the note. If it generalizes beyond your domain, also add it to the gate list above.

Gate before calling a domain done:

- no Immutable value can ever reach an immer draft; grep the domain's legacy paths for external
  `setIn` writers (must be none outside `liftSlice`);
- **if the domain's CONTAINER became plain while its VALUES stay Immutable** (the 4.5 pattern), grep
  every reader of the domain's accessors for `.toJS(` / `.get(` / `.getIn(` / `.size` / `.toArray()`
  / `.isEmpty()` / `.flatMap(`, plus shim-style `getIn(value, …)` call sites, and re-point them at a
  plain accessor — a `as unknown as IImmutable*` cast on the accessor's return type means tsc will
  not flag a single one of them (4.5 shipped two such readers, one a hard crash). Do not stop at
  `.toJS(`: the failing idiom does not have to be a conversion. `.size` is the worst of the set
  because it fails SILENTLY — `[].size` is `undefined` and `undefined > 0` is `false`, so a feature
  just switches off with no crash and no failing test (§10 filed four such readers of
  `getAvailableDateDatasets`; PR 10.4 fixed them when the domain flipped);
- **if a function returns an "empty" value for a not-loaded branch, assert its collection KIND**, not
  merely that it is empty. A keyed `Map()` standing in for an indexed list survives tsc behind the
  usual cast, `toJS()`es to `{}`, and throws on the first spread. `??` / `|| []` / default-parameter
  guards do NOT catch this, because nothing is ever null — only an explicit kind check does
  (`models/date_dataset.ts#toItemList` is the reference). This was the third instance of the
  mixed-container class in the date datasets domain and the one that got past 4.5's gate to a
  customer-visible critical: #11767, Analyze did not load at all with `showHiddenCatalogItems`
  enabled, because `getDateDatasetsFromMetaInfo` returned `Map()` on the first
  `DATE_DATASETS_DATA` dispatch, before `SET_DATE_DATASETS_META` had landed;
- **if a seed was deleted from `initial_state.ts`**, grep the domain's paths for raw `state.getIn(`
  readers: `RESET_FOR_PLUGGABLE_MOUNT` returns the pristine state verbatim, so the subtree really is
  absent and only the `sliceSelector` fallback saves the reader;
- **if the slice normalizes `undefined` to `null`** (forced for non-draftable state), check readers
  for Immutable `is(...)` comparisons and default parameters — neither treats `null` like
  `undefined`.
- **if a `.toJS()` disappears at a boundary we hand state to** (a pluggable visualization, an
  export, any SDK callback), check whether the consumer MUTATES what it receives: `.toJS()` was a
  defensive copy, plain slice state is frozen by immer, and the mutation throws (4.6 shipped one —
  `controlsHelper` writes `undoApplied` into the propertiesMeta prop before pushing it back).
  Also check whether the `.toJS()` was doubling as a fresh-value-per-call: dropping it changes
  reference stability, which is usually a re-render improvement but always worth stating (4.7).
- **if the domain is inside the undo snapshot, undo makes a PAST value of it the live state.** The
  snapshot has to satisfy the same container contract as the live subtree. Until 8.1 that also
  applied to anyone REWRITING a snapshot (`updateHistory` — execute_report, delete_report): write the
  subtree WHOLESALE from the domain's own initial shape, because a nested `setIn` materializes an
  absent intermediate as an Immutable Map inside an otherwise plain object (4.7). 8.1 removed both
  rewriters by narrowing the snapshot; what is left is the projection question — check
  `IUndoableState` (typings/state.ts) and decide whether your domain belongs in an undo step at all.
- **if the domain goes FULLY PLAIN, remember `toPlainSubtree` is SHALLOW** (`.toObject()`, one
  level — deliberately, because the 4.5-pattern domains keep Immutable leaves): a legacy writer or
  fixture seeding the subtree with `fromJS({ ..., error: {...} })` slips a nested Immutable Map past
  the normalization, and the plain readers fail SILENTLY — property access on a Map is `undefined`,
  so every `error.status === ...` selector just answers false; no crash, no failing test. The
  normalization is a safety net for the FLAT case only: sweep every writer of the subtree to plain
  values in the same PR (4.7's are the slice, the apply reducer and the reset transformer) and seed
  test fixtures plain.
- **a write that is not GUARDED is not idempotent** — and if any action reaching it can be
  re-dispatched from a RENDER path, that is an infinite render → dispatch → render loop that pins the
  browser's main thread. 4.7 shipped this: `applyExecutionError` re-assigned `error` on every
  dispatch, and because `PluggableVisualization#onError` dispatches from a layout effect, switching an
  insight with two date items to a pie chart froze AD until the tab was killed — it timed out 24 e2e
  specs, all as 60s hangs rather than assertion failures.
  **What Immutable actually gives you (measured on 5.1.6 in 4.9 — the earlier wording here was
  wrong):** `set`/`setIn` return `this` only when the value is an equal PRIMITIVE or the literally
  SAME reference. A deep-equal but freshly built collection does NOT short-circuit —
  `is(existing, fresh) === true` while `state.setIn(path, fresh) !== state`. So `setIn(P, fromJS(x))`
  was never a free no-op, and "the legacy code was idempotent" is only true where the legacy code
  wrote a primitive, re-used the same reference, or compared explicitly first (`bucketTotalsIdentical`
  in `setBucketTotals`, `buckets.equals(...)` in `mirrorTotalsToDerivedMeasures`,
  `lastSavedObject`'s deep `is()` in 4.8). Everywhere else the legacy write already produced a new
  root, and a plain assignment is no worse. **4.10 refinement:** `map` returns the SAME collection
  when every element maps to itself, so a mapper that conditionally `set`s equal primitives IS a
  free no-op — identity flows through `setIn`-same-reference. This is why the
  `setRelatedBucketItemsProperty` family is idempotent; it is inherited from the IDIOM, so a
  "cleanup" that rebuilds the collection silently loses it (identity specs pin all nine slice
  actions in `buckets_cluster_characterization.test.ts`).
  **So: do not assume the guard is inherited — write it.** Guard every sub-object assignment with an
  equality check against the current value, and replace the branch WHOLESALE rather than mutating its
  leaves (the history-rewrite path passes a shallow copy whose nested objects are still shared with
  the snapshot). The domain suite must assert IDENTITY (`expect(reduce(s, a)).toBe(s)`), not values:
  every value-based assertion passed throughout the 4.7 incident. Candidates are any action a
  component can fire while rendering — execution errors/warnings, validation results, sort config,
  drill state. Where the legacy code had no guard either, say so in the PR rather than adding one
  silently: it is a fix, not a migration step, and it changes how often the store notifies.
- **a reference-stability spec needs its premise ASSERTED, or it is vacuous** (Phase 5): a spec
  whose premise is "the root changed but my subtree did not" cannot use an invented unhandled
  action as the stimulus — an unhandled action is a no-op on the WHOLE root (every `liftSlice`
  mount returns `root` unchanged), so the memoized selector gets the same input reference and
  serves its cache no matter what it does. Dispatch something that really writes a FOREIGN branch
  and assert `expect(next).not.toBe(prev)` as an explicit precondition. Third instance of the
  vacuous-assertion family (4.5 deleted one, 4.8 fixed a doubly-vacuous one) and the first where
  the stimulus, not the fixture, was the defect. **FOURTH instance at 11.1**, with the cheapest
  possible remedy: the "does not mutate the store-shared properties" pin passed against the
  MUTATING implementation, because the fixture never enabled the branch that mutates. Re-introduce
  the defect and watch the spec fail before trusting a spec that guards one — it costs one edit —
  and then assert the premise in the spec itself (`expect(canApplyCustomSort(state)).toBe(true)`).
- **if a container FLIPS, flip its TYPES first** (4.11): redefine the domain's type family as
  plain interfaces/arrays BEFORE touching any runtime code and let `tsc` enumerate every
  residual Immutable consumer — the compiler finds typed-but-unidiomatic reads the §7 idiom
  grep cannot see (the grep then verifies the residue, it is not the discovery tool). Two
  corollaries: `noPropertyAccessFromIndexSignature` means an index-signature-only interface
  rejects every dotted read — declare the common fields explicitly; and check WHICH family a
  file consumes before re-pointing it — the STATE family (`typings/buckets.ts`) and the
  MD-OBJECT family (`IImmutableMd*` in `typings/metadata.ts`) are shaped alike but flip at
  different phases, and typing an MD consumer with state aliases compiles clean while lying.
- **a negative index CORRUPTS a plain sub-array under an Immutable root** (4.11): root
  `setIn(path)` with `-1` over an Immutable List wraps to the last element, but over a PLAIN
  sub-array it writes a stray `"-1"` OWN PROPERTY — silently; `Array.isArray` stays true,
  iteration skips it, and the write just vanishes from every reader. Resolve indices to
  absolute before building paths (`resolveIndex`), and the shim wraps in-range negatives
  itself (`normalizeKey`). The full mixed-root behavior surface is pinned in
  `utils/test/mixed_root_contract.test.ts` — extend it before relying on any new root-op
  behavior over a plain subtree.
- **after a flip, CONVERT AT THE BOUNDARY, both directions** (4.11): legacy writers still hand
  Immutable payloads into the now-plain subtree (`fromJS`-built action payloads, ERP-derived
  values) — every write normalizes with `toPlain(...)` at the write site; and values crossing
  INTO the subtree's readers can arrive in either shape during the transition (a plain catalog
  date item reached an `.get()` reader through `ensureDateBucketItem` — a hard crash) — reads
  at such seams go through the shim, and a function's return container MIRRORS its input
  (`mirrorToContainer`), never flips it as a side effect.
- **`tsc` cannot see through `any`, and the suite cannot see through a `fromJS` fixture**
  (4.11 §8 — three post-delivery crashes, each found in the running app, none by a gate; full
  post-mortem in the
  [4.11 delivery note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-411--the-buckets-flip)).
  The types-first sweep enumerates consumers of the domain's TYPE family, so a connected prop or
  function param declared `any` absorbs the flip silently (`newDerivedBucketItems: any` hid a
  STARTUP crash); and a test that seeds the flipped subtree with `fromJS(...)` keeps every
  Immutable idiom green against a container production no longer produces — the shortcuts
  reducer's crashing line HAD a passing test over such a fixture. In the flip PR, all three of:
  (a) grep the domain's connected components and function signatures for `any`-typed carriers of
  its values and re-type them with the flipped family — the flip is the forcing moment §2's
  "forced changes only" rule refers to, and an `any` is never forced on its own;
  (b) re-seed the domain's test fixtures plain BEFORE flipping the runtime and run the suite —
  each failure is a reader-worklist entry, and the clean pass afterwards is the evidence the
  sweep actually covered the readers;
  (c) audit residual Immutable idioms by PROVENANCE (resolve receiver → binding, classify the
  source subtree — script it), never by receiver NAME: a by-name pass cleared `bucket*`/`item*`
  and missed `displayForm`, read from `filter.original` (flips with the subtree) four lines from
  `filter.attribute` (itemCache, which did not until 10.3) — decorated models mix provenances in one object, and
  the "still Immutable during the transition" comments they carry go stale in the same instant
  the container flips; re-read every one of them in the flip PR.

- **replacing an `any` (or a `.toJS()`) with a real type can make exported selectors NON-PORTABLE**
  (11.1). `tsc` writes the inferred type of every exported const into the declaration output, and
  reselect's `OutputSelector` embeds its INPUT types — so typing one accessor propagates that type
  through every selector composed over it. If the type's members are not on the dependency's public
  barrel, the only way to name them is a path into `node_modules/...`, and `tsc` refuses it (TS2742,
  ~15 selectors at once here). The `any` was hiding it, exactly as it hides a flip. Two rules:
  declare the domain-facing type in THIS package as an `interface` (an alias resolves to the
  un-exported declaration and does not help — `interface X extends Y {}` does, because consumers
  name `X`), and prefer a structural re-declaration over an indexed access into a foreign internal
  type when the shape is part of a public contract anyway (`typings/properties.ts` already existed
  for this reason: `IVisualizationPropertiesControls` was the first instance, before the class had
  a name).
- **a whole-root transformer moved into a saga is NOT migrated** (§4.8, the lesson the Phase 10.9
  prototype paid for). Before calling a cross-domain dissolution done, check all six: the helper's
  parameter and return types are TYPED DOMAIN VALUES (grep the module for `typings/state.ts` — a pure
  helper must not import it); the saga selects individual values and composes the operation
  explicitly; the event is named after the OPERATION and its payload carries only what that operation
  produces; every affected slice has its own case and touches nothing else; no aggregate/cluster type
  and no generic change set appeared anywhere; and the operation commits in ONE dispatch. If the
  design needs a "completeness contract enforced by a test", the enumeration is in the wrong place.
- **when a shim `setIn` becomes a value-level write, carry the IDENTITY semantics over deliberately**
  (the corrected idempotence gate above, at value scope). `utils/state_access.ts#setIn` short-circuits
  on equal values and `mapCollection` returns the same collection when every element maps to itself;
  several cluster writers inherit ALL of their idempotence from exactly that. A rewrite into spreads
  or immer drafts loses it silently, and the failure mode is the 4.7 freeze (24 e2e specs timing out
  at 60s, not one assertion failure). Keep the identity-preserving idiom, assert IDENTITY in the
  domain suite, and let the returned reference — not a change set — be what marks a no-op.
- **value-internal deep addressing is a different concern from Redux state access.** A generic
  deep-update helper over a plain VALUE (a bucket item inside a bucket inside the buckets array) is
  legitimate and its negative-index/identity semantics are load-bearing (the 4.10/4.11 `"-1"`
  landmine). It must NOT live in the Redux migration shim: that is what makes 12.4's question "can
  `state_access.ts` be deleted?" answerable by grep instead of by argument.
- **when a trigger action stops writing state, re-check UNDO.** Moving an operation into a saga means
  the whitelisted trigger no longer mutates and the semantic event (not whitelisted) does. The
  snapshot is still taken before the edit, so undo behavior is unchanged — but it is now a property of
  two actions instead of one, so pin it per operation rather than assuming it.
- **`createAction<Payload>(TYPE)` ERASES the action's literal type** (12.5). `createAction` is
  `<P = void, T extends string = string>(type: T)`, and TypeScript's type arguments are all-or-nothing:
  supply only `P` and `T` falls back to its default `string`. The creator still works, the payload is
  still typed, and every discriminated-union `switch` over that domain silently stops narrowing —
  `case Keys.SOMETHING:` becomes "not comparable", or worse, a NEGATED type guard elsewhere starts
  absorbing unrelated members because everything with a `string` type looks assignable to it. That is
  how three reducers lost their cases at 12.5 (`buckets_notifications_reducer`, `filter_bar_reducer`,
  `metric_editor_reducer`), and the 33 Phase-11 operation-event creators had shipped in that form.
  **Always use the prepare form** — `createAction(TYPE, (x: P) => ({ payload: x }))` — which infers
  both. The gate's [R7] message says this, because the natural "fix" for a hand-written creator is
  exactly the broken form.
- **a converted no-payload creator gains `payload: undefined`** (12.5). `createAction(TYPE)` produces
  `{ type, payload: undefined }` where the hand-written creator produced `{ type }`. Harmless for
  `toEqual`, property reads and JSON, but two things do notice: `toStrictEqual` and
  redux-saga-test-plan's `put(...)` assertions (update them to call the creator), and — the real one —
  it makes the action assignable to any type whose payload accepts `undefined`, which is what lets a
  negated type guard swallow it. Assert with the creator, not with a literal.
- **do not put a react-redux hook behind a shared module — the suite runs `isolate: false`** (12.5,
  and the most expensive thing in that row). Two failures come out of this, in order:
    1. RTK's `hook.withTypes<T>()` reads `withTypes` off the imported hook when the module is
       EVALUATED. 25 component suites replace `useDispatch` with a bare `() => dispatchMock` through
       `vi.mock("react-redux", …)`; that partial mock has no `withTypes`, so the moment
       `useAppDispatch` had real call sites all 25 files threw
       `useDispatch.withTypes is not a function` **on import** — 26 red files, none about the change
       under test. Loud, and easy to read.
    2. The real one. With `isolate: false` the module registry is SHARED across test files in a
       worker, so a `store/hooks.ts` that re-exports `useDispatch` is evaluated ONCE and links to
       whichever `react-redux` was current then — one file's mock. Every other component in that
       worker then dispatches into that file's `dispatchMock`, so the suites that deliberately do
       NOT mock react-redux (they spy on a real `store.dispatch`, precisely to avoid leaking a
       mocked module — `BucketDropTarget.test.tsx` says so in a comment) assert on **zero calls**.
       It is order-dependent, so it presents as FLAKE: 3 of 5 full runs, a different pair of files
       each time. Neither an annotated alias nor a call-time wrapper
       (`() => useDispatch()`) fixes it — the indirection module IS the defect.

    So: import the hook in the module that uses it, and put only TYPES in a shared module (types are
    erased, so nothing links through them). `useDispatch<AppDispatch>()` is the whole pattern. If you
    are tempted by a typed hook wrapper, the suite has to be isolated first, and it is
    `isolate: false` on purpose.

- **typing a payload can break declaration emit two levels away** (12.5, the 11.1 lesson at payload
  scope). Naming a prepare callback's return shape (`IExportResultErrorMeta`, needed because the
  status fields are spread in from one of three branches and inference would produce a union in which
  `meta.statusCode` does not exist on every member) put that interface into the inferred return type
  of two exported sagas — TS4058, "cannot be named". Export the payload/meta interface; do not drop
  the annotation, because the union it prevents is a real reader bug.

## 8. Verification strategy

- **Per PR:** domain unit tests (migrated in the same PR) + feature-relevant Playwright specs (replay mode) + package build.
- **Standing guards:** 130 Playwright e2e specs; undo characterization suite (0.3) from Phase 0 onward; CI grep gate (6.4) pre-flip.
- **High-risk gates (PRs 3.4, 4.10, 7.1, 8.1, 11.1, 11.4, 11.7):** full e2e run + manual smoke — embedded mode postMessage commands, undo/redo/reset torture, open/save/delete/export, splunk event spot-check, devtools inspection.
- **For an architecture rewrite (all of Phase 11), the PROTOTYPE is the oracle.** Branch
  `imj-stl-3150-p10-9-experiment` holds a suite-green implementation of the target behavior with the
  rejected architecture; verify parity against it PER TYPED DOMAIN VALUE — `toEqual` for the values
  the operation changes, `toBe` IDENTITY for the values it must not. A root-level `toEqual` snapshot
  is not sufficient: it passes on a lost identity, which is exactly the regression class §7 warns
  about and the one a green 4,729-test suite let through in 4.11.
- **One-dispatch pin per operation:** subscribe to the store, dispatch the trigger, assert exactly one
  notification carrying a changed root reference. This is the mechanical form of §4.8.3 and the
  property batching was once supposed to provide.

## 9. Key risks

| Risk                                                                          | Mitigation                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Undo/redo semantics silently change                                           | Characterization suite (0.3) + e2e timeTravel/undoButton/resetButton; redesign isolated in Phase 8 with the suite as contract                                                                                                                                                                                                                                                                       |
| postMessage embedded protocol regression                                      | Action strings frozen; Phase 5 isolated; manual embedded smoke on every risky PR                                                                                                                                                                                                                                                                                                                    |
| Half-converted Immutable Record leaks into an immer draft                     | Hard gate: a domain becomes createSlice only when its subtree is fully plain; `immutableCheck` enabled at flip; model PRs convert whole families                                                                                                                                                                                                                                                    |
| Batching hides actions from saga `take()`                                     | RESOLVED BY NOT BATCHING — Phase 9 is WON'T DO. The audit that closed it found the risk was already REALIZED in the plan's own targets (open_report ×3 on the catalog load, bootstrap's feature-flag/permissions race), so the mitigation became dropping the phase. If batching is ever revisited for atomicity, re-derive the audit first                                                         |
| Flip fallout in untyped corners                                               | Dual-mode shim + preserved nesting make 7.1 a container swap; shim stays as safety net until Phase 10                                                                                                                                                                                                                                                                                               |
| Mixed container (plain container, Immutable values) breaks a reader invisibly | Highest-frequency class so far: 3 instances in `data.dateDatasets` alone (4.5 caught two, #11767 escaped to a critical). §7 gate greps the full reader idiom set, not just `.toJS(`; one plain accessor per domain is the only sanctioned plain read; empty sentinels are kind-checked, never `??`-guarded. The latent sites §10 filed were closed by PR 10.4, which flipped the domain fully plain |

## 10. Backlog (explicitly out of scope, filed at 10.8)

- **The root→root RESIDUE the 12.4 gate ratchets** (filed at 12.4). Three modules still hold
  `IAppState → IAppState` transformers, declared with exact counts in
  `scripts/audit-state-architecture.mjs`'s tier-2 list: `services/buckets_service.ts` (13),
  `store/filter_bar/filter_bar_service.ts` (14), `services/pluggable_visualization_service.ts` (3).
  All thirty are Phase-11 residue their own rows documented as "dies with its callers" — the write
  halves of the two service facades and the buckets removal chain. Row 12.4's mandate was the
  transition INFRASTRUCTURE (the path shim, the path modules, the loose root type), not another
  cross-domain dissolution, so they are declared rather than rushed. **26 of the 29
  `buckets_service.ts` exports have no production importer at all** — only their own suites keep
  them alive, so the honest first step is deleting the dead exports and re-pointing those specs at
  the value-level `*InBuckets` helpers (which all have their own coverage). The ratchet means the
  numbers can only go DOWN: adding a transformer fails the gate, and so does removing one without
  lowering the count.
- `connect()` → typed hooks conversion (91 sites). The `dispatch` half is DONE (12.5: 68 identical
  `useDispatch<AppDispatch>()` sites); a `useSelector` → `useAppSelector` sweep is NOT, and should
  not be attempted while the suite runs `isolate: false` — see the §7 entry, `store/hooks.ts` is the
  same shared-indirection hazard and its existing call sites are stable only because there are few
  of them.
- **Dead action strings, found at 12.5.** `REPORT_EXECUTION_TOO_LARGE_TO_DISPLAY`,
  `REPORT_EXECUTION_HAS_NEGATIVE_VALUES`, `REPORT_EXECUTION_NO_DATA` and
  `REPORT_EXECUTION_EMPTY_AFM` have no creator and no dispatcher anywhere in the repo — 12.5 deleted
  the four hand-written interfaces (they could not be converted: there was nothing to convert) but
  left the `ActionTypeKeys` members and the one orphaned `log_formatters` entry for
  `..._TOO_LARGE_TO_DISPLAY`, because pruning the frozen action-string registry is its own decision.
  Same for `FilterBarActionTypeKeys.STORE_ADDITIONAL_DATE_ATTRIBUTE_FILTERS_RESET`, an enum member
  with no creator.
- `src/actions/index.ts#Actions` and several per-domain action unions (`ReportActions`,
  `MessagesActions`, `BucketNotificationsAction`, …) have no consumer left now that reducer cases are
  wired by creator and components dispatch through one hook. They are cheap to keep and cheap to
  delete; check importers before assuming either.
- Package-wide tsconfig strictness flip
- **De-`any` connected component props/params carrying store values** (4.11 §8 lesson: an `any`
  prop absorbs a container flip silently — `newDerivedBucketItems: any` hid a startup crash the
  types-first sweep could not see). The per-flip rule in §7 covers each domain's carriers as it
  flips; this entry is the residue — `any`s on values whose domain has already flipped or never
  will. Typable NOW: `ReportVisualization`'s `config?: any` (the `getConfig` selector result is
  already plain). The `visualizationProperties?: any` carrier this entry
  used to name resolved at PR 10.7 — the value turned out to be ERP-provenance and now flows typed
  (`IImmutableVisualizationProperties`) from the selector. Sweep the rest with `grep -E ':\s*any' src/components` once the
  strictness flip lands.
- Test coverage gaps: bootstrap sagas, insight/meta/root selectors, `splunk_logger` middleware, `store/application_context` tests (featureFlags/permissions closed in 4.4; ai reducer deleted in 4.1; `data_sampling` closed in 10.8 with the slice's store test)
- **The 8 already-plain hand-written domains keep their hand-written REDUCERS** (catalog, chartSort, dragAndDrop, metricEditor, attributeElements, bucketNotifications, applicationContext, filterBar): 10.8 deliberately did not convert them — they hold no Immutable values, so they gate nothing in Phases 11–12, and a 4,000-line mechanical conversion inside the "consistency pass" row would have buried its real content. **Narrowed at 12.5: their ACTION layer is done** — every creator in those domains is a `createAction` and every action type a `ReturnType<typeof creator>`, because the action idiom had to be uniform for `dispatch()` to be type-checked at all (§4.7). What is left is the `switch (action.type)` reducers themselves → `createSlice`. Convert opportunistically when a domain is next touched (recipe §7); each is now a self-contained reducer rewrite with its actions already in the target form.
- `store/attribute_elements` looks DEAD: its populate actions (`STORE/ATTRIBUTE_ELEMENTS_UPDATE(D)`) are dispatched nowhere in the repo (10.8 stale-entry audit — the sdk AttributeFilter components own this flow now). Candidate for removal rather than RTK-ification; until then the reducer keeps the subtree plain and self-initialized.
- The optional embedding single-slice fold (5 mini-slices → 1) is WON'T DO: the mini-slices are each trivially correct and independently typed; folding them is churn with no consumer-visible gain (10.8 decision).
- `store/drag_and_drop`: `data.dragAndDrop` is never seeded and `getDndState` has no fallback, so selectors composing it throw on the pristine state `RESET_FOR_PLUGGABLE_MOUNT` returns (pre-dates the migration; found during the 4.5 review). Give it the `sliceSelector` treatment when the domain is RTK-ified (opportunistic, see above — 10.8 did not take the dnd domain).
- `_infra/plain_subtree.ts` has no dedicated test (the four requirements — Map / plain-by-reference / absent / nested-Immutable-preserved — are only covered incidentally through the two domains that mount with it).
- Optional root-state flattening (drop `appState`/`data`/`report` nesting). **Explicitly NOT part of the §4.8 finish line** — that rule bans dynamic/path-based addressing, not the nested keys: `state.data.buckets` is a valid final read. Do not mix flattening into Phases 11–12.
- FET-1260: replace `reduxStore.ts` module singleton with a getStore hook
- Decoration-on-read for buckets (derive decorated buckets in selectors instead of on write)

## 11. Reference material

- **Delivery notes for every phase shipped so far: [MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md)** — read the relevant ones before starting a phase (see the box at the top of this file)
- In-repo RTK + saga blueprint: `sdk/libs/sdk-ui-dashboard/src/model/store/` (`dashboardStore.ts`, `loading/`, `_infra/`)
- Batching pattern: `batchActions([...], "@@GDC.DASH/...")` usage across `sdk-ui-dashboard/src/model/commandHandlers/`
- Existing bridge: `src/utils/reducers.ts` (`applyReducer`) + `src/store/highlighting/highlighting_reducer.ts`
- Current wiring: `src/create_store.ts`, `src/reducers/root_reducer.ts`, `src/reducers/initial_state.ts`, `src/reducers/time_travel_reducer.ts`
