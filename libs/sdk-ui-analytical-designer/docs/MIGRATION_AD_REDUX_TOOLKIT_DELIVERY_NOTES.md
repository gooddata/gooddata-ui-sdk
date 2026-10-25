# AD Runtime RTK Migration — Delivery Notes

> Companion to **[MIGRATION_AD_REDUX_TOOLKIT.md](./MIGRATION_AD_REDUX_TOOLKIT.md)**, which stays
> the plan, the phase tables and the checklists. This file is the accumulated **field record**:
> what each delivered PR actually found — the conventions it locked in, the traps it hit, the
> behavior it deliberately changed, and the work it pushed to a later phase.
>
> **If you are picking up the next PR, read this file first.** At minimum: the notes for every
> phase that touched the same domain or cluster you are about to touch, plus the two or three
> immediately preceding ones. This is not background reading — the migration's expensive
> surprises were each discovered in one phase and are only avoidable in the next _because they
> were written down here_: the #11767 mixed-container critical (4.5 → 4.6), the main-thread
> freeze that timed out 24 e2e specs (4.7 → 4.8), the `setIn` idempotence correction (4.9 →
> 4.10). The plan's §7 gate list is the short form; these notes are why each gate exists.
>
> **Every migration PR appends its own note here** and links it from its phase section in the
> plan — see the tracking convention in §0 of the plan.
>
> **Phase pointers inside a historical note are as they were written then, not the current
> schedule.** The notes for Phases 2–8 say things like _"dissolves with 4.9–4.11"_ because that is
> what the plan said at the time; PR 10.1–10.2 found that five of those pointers named work that was
> never a plan item and rescheduled it (Phase 10 rows 10.3–10.7). It happened a second time when
> Phase 10 closed at 10.8: pointers to "10.9"–"10.12" in the 10.x notes now mean Phase 11/12 rows
> (the mapping is at the top of the plan's Phase 10 section). Correcting the old notes would
> falsify the record of what each PR knew, so they stand — **for the live schedule, read §5/§6 of the
> plan, never a pointer in a delivered phase's note.**

## Contents

| Phase             | Note                                                                                                                                                  | PR              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 2                 | [`src/store/` holdouts](#phase-2--srcstore-holdouts)                                                                                                  | #11426          |
| 3 (3.1–3.3)       | [model conversions](#phase-3-3133--model-conversions)                                                                                                 | #11477          |
| 3.4               | [decorated buckets](#phase-34--decorated-buckets)                                                                                                     | #11481          |
| 4.1–4.3           | [router, dialogs, messages, drillableItems, shortcuts](#phase-4143--router-dialogs-messages-drillableitems-shortcuts)                                 | #11647          |
| 4.4               | [app context](#phase-44--app-context)                                                                                                                 | #11662          |
| 4.5               | [data domains](#phase-45--data-domains)                                                                                                               | #11738          |
| 4.6               | [properties](#phase-46--properties)                                                                                                                   | #11748          |
| 4.7               | [execute_report](#phase-47--execute_report)                                                                                                           | #11756          |
| 4.8               | [report cluster](#phase-48--report-cluster)                                                                                                           | #11786          |
| 4.9               | [buckets_service pure helpers](#phase-49--buckets_service-pure-helpers)                                                                               | #11851          |
| 4.10              | [buckets write-path slice + cluster split](#phase-410--buckets-write-path-slice--cluster-split)                                                       | #11863          |
| 4.11              | [the buckets flip](#phase-411--the-buckets-flip)                                                                                                      | #11879          |
| 5                 | [postMessage domain](#phase-5--postmessage-domain)                                                                                                    | #12111          |
| 6                 | [pre-flip mechanization](#phase-6--pre-flip-mechanization)                                                                                            | #12122          |
| 7.1               | [THE ROOT FLIP](#phase-71--the-root-flip)                                                                                                             | #12125          |
| 7.2 + 7.3         | [combined root & dissolution](#phase-72--73--combined-root--dissolution)                                                                              | #12188          |
| 8.1 + 8.2         | [time-travel redesign](#phase-81--82--time-travel-redesign)                                                                                           | #12241          |
| 9 (dropped)       | [why saga batching was not done](#phase-9--why-saga-batching-was-not-done)                                                                            | #12250          |
| 10.1 + 10.2       | [the shim-removal codemod](#phase-101--102--the-shim-removal-codemod)                                                                                 | #12261          |
| 10.3              | [the itemCache flip](#phase-103--the-itemcache-flip)                                                                                                  | #12272          |
| 10.4              | [the dateDatasets flip](#phase-104--the-datedatasets-flip)                                                                                            | #12274          |
| 10.5              | [the visualizationClass(es) flip](#phase-105--the-visualizationclasses-flip)                                                                          | #12281          |
| 10.6              | [the lastSavedObject flip](#phase-106--the-lastsavedobject-flip)                                                                                      | #12306          |
| 10.7              | [the visualizationProperties flip](#phase-107--the-visualizationproperties-flip)                                                                      | #12312          |
| 10.8              | [the consistency pass](#phase-108--the-consistency-pass)                                                                                              | #12472          |
| 10.9 (experiment) | [the cascade dissolution prototype](#phase-109-experiment--the-cascade-dissolution-prototype)                                                         | not merged      |
| 11.1              | [the last container flip](#phase-111--the-last-container-flip)                                                                                        | #12481          |
| 11.2              | [narrow pure helpers I, the small services](#phase-112--narrow-pure-helpers-i-the-small-services)                                                     | #12487          |
| 11.3              | [narrow pure helpers II: `services/buckets_service.ts`](#phase-113--narrow-pure-helpers-ii-servicesbuckets_servicets)                                 | #12494 + #12497 |
| 11.4              | [the buckets operations become saga-orchestrated](#phase-114--the-buckets-operations-become-saga-orchestrated)                                        | #12557          |
| 11.5              | [the properties / arithmetic / recommendations / shortcuts operations](#phase-115--the-properties--arithmetic--recommendations--shortcuts-operations) | #12725          |
| 11.6              | [the bucket-filters operations, the last cluster wrapper](#phase-116--the-bucket-filters-operations-the-last-cluster-wrapper)                         | #12797          |
| 11.7              | [the remaining root transformers, the wrapper stack empties](#phase-117--the-remaining-root-transformers-the-wrapper-stack-empties)                   | #12979          |
| 12.1              | [strict root composition](#phase-121--strict-root-composition)                                                                                        | #12988 + #12991 |
| 12.2 + 12.3       | [the Immutable removal](#phase-122--123--the-immutable-removal)                                                                                       | #12997          |
| 12.4              | [the finish line: the transition infrastructure comes out](#phase-124--the-finish-line-the-transition-infrastructure-comes-out-the-gate-replaces-it)  | #13453          |
| 12.5              | [one action idiom, and a dispatch that is checked](#phase-125--one-action-idiom-and-a-dispatch-that-is-checked)                                       | this PR         |

> Rows 11.1–11.5 were appended to this table retroactively (the tracking stopped at 10.9 while the
> notes kept arriving). Two PR numbers are not guessable from branch names and are recorded here so
> they stay findable: **#12497** is branch `imj-stl-3150-p11-4` but delivered the SECOND HALF of row
> 11.3 (the item writers and the wide calculations), and row 11.4 itself is **#12557**
> (`imj-stl-3150-p11-4-operations`).

---

## Phase 2 — `src/store/` holdouts

**Delivered as #11426** — what "typed slice" turned out to mean here.

Deep-dive during
implementation showed the three holdouts are whole-root CROSS-DOMAIN transformers, not subtree
reducers: `arithmetic_measures` and `bucket_filters` write exclusively into the buckets /
filter-bar / itemCache / measureDateDatasets subtrees via services, and `recommendations` owns
only `appState.dismissedRecommendations`. A liftSlice-mounted createSlice is only possible for
state a domain OWNS (§4.3), so Phase 2 delivered:

- **2.1** — real slice for `dismissedRecommendations` (`recommendations_slice.ts`, localStorage
  read moved into slice initial state, write moved reducer → `recommendations_sagas.ts`, path
  constant deleted); the five `STORE_RECOMMENDATION_*` buckets/filter-bar handlers remain a
  typed root reducer (`recommendations_apply_reducer.ts`, TRANSITIONAL) until 4.10/4.11.
- **2.2 / 2.4** — no own subtree exists, so no slice is possible yet: all creators →
  `createAction` (strings frozen; keys stay in the global `ActionTypeKeys` enum because the
  time-travel whitelist and splunk formatters match on them there), handlers typed via
  `ReturnType`, root-state access through the dual-mode shim, sagas typed with `.match`
  watchers. Both reducers carry TRANSITIONAL headers; they dissolve into the buckets cluster
  work (4.9–4.11).
- **2.3** — reducer-side telemetry → `bucket_filters_telemetry_sagas.ts` watching the same
  store actions, with a test pinning the per-action event set and counts.

Consequence for the §5 flip precondition "every root_reducer.ts entry is a liftSlice mount":
`recommendationsApplyReducer`, `arithmeticMeasuresReducer` and `bucketFiltersReducer` are
buckets-cluster entries — they are dissolved by Phase 4 (4.9–4.11), not Phase 2.

---

## Phase 3 (3.1–3.3) — model conversions

**Delivered as #11477** — conventions the model conversions locked in.

- Record methods become a **same-named namespace object of pure functions** next to the `I<X>`
  interface (`DecoratedPresetItem.getTitle(preset, intl)`), matching the idiom that already existed
  in `decorated_date_dataset.ts` / `date_filter_prop.ts`.
- `createDecorated*` factories **normalize Immutable inputs at the boundary** (`isImmutable(x) ?
x.toJS() : x`, or per-field shim `getIn`) — the raw buckets/itemCache/bucketsMeta subtrees stay
  Immutable until 3.4/4.9–4.11, so decorated models read those inputs through
  `utils/state_access.ts`.
- The `original` field of a decorated filter keeps pointing at the **raw Immutable state value**
  (write-back paths dispatch it verbatim into Immutable-consuming reducers); the decorated
  `attribute` field likewise still holds the Immutable itemCache entry — consumers read it via the
  shim.
- `data.dateDatasetsMeta` is now a **plain leaf** (`{ items: IDateDatasetsMetaItem[] }`) seeded via
  `.setIn(...)` AFTER the `fromJS` literal in `initial_state.ts` — inside the literal, `fromJS`
  would silently deep-convert it back to an Immutable Map.
- `appState.messages.{displayed,delayed}` keep their Immutable List containers (they migrate with
  the 4.2 messages slice); only the **elements** are plain `IMessage` objects now.
- `instanceof DecoratedDateFilter` checks were replaced by the `isDate: true | false` discriminant
  shared by `IDecoratedDateFilter` / `IDecoratedMetricAttributeFilter`.
- Deleted dead surface: `PRESETS_PURE`, the `dateDataset()` factory, `utils/immutable.ts#indexBy`,
  `IGranularityBucketItem`; `typings/measure_filters.ts` re-exports the model interfaces instead of
  duplicating them.
- Known behavior fix: `MeasureFilters.tsx` attribute-filter count used `filter.isDate` on Records
  (always undefined → counted date filters toward the 20-filter cap); with plain models the
  expression is now correct and date filters no longer count toward the cap.

---

## Phase 3.4 — decorated buckets

**Delivered as #11481** — `decorated_bucket` / `decorated_bucket_item` conversion.

- `IDecoratedBucketItem` / `IDecoratedBucket` / `IDecoratedBuckets` are now real plain interfaces
  owned by `typings/buckets.ts` (import paths unchanged); the factories live in the model files.
  They can't live next to the factories like the 3.1–3.3 models: the models import `IImmutable*`
  from typings, so typings→models type re-exports would trip dependency-cruiser's no-circular gate.
  `IDecoratedMetricFilters` (typings/measure_filters.ts) is a plain array of plain filter models.
- Values still Immutable INSIDE the plain decorated item: `original` (raw bucket item, typed
  `IImmutableBucketItem` — write-backs dispatch it verbatim), `attribute` (itemCache entry), and
  raw pass-throughs copied verbatim (`ref`, `operandLocalIdentifiers`). Everything else —
  `filters`, `granularity`, `dateDataset`, `items`, `accepts`, `itemsLimitByType` — is plain.
- Record semantics preserved by `fromPartial(defaults, values)`: unknown uiConfig keys are dropped
  and explicitly-undefined values fall back to the defaults (title/subtitle keep the
  `EMPTY_BUCKET_LABEL` sentinel). Test builders `newDecoratedBucket(partial)` /
  `newDecoratedBucketItem(partial)` expose the same semantics.
- **Dead code discovered and removed:** `decoratedBuckets(...).set("original", buckets)` was a
  silent NO-OP (string key on an Immutable List wraps to NaN → returns the list unchanged), so the
  container never carried `original`; the matching `buckets.delete("original")` in
  `constructVisualizationMDObj` deleted nothing. Both dropped; the plain array deliberately has no
  `original`. Also deleted: the never-set `masterMeasureOriginal` Record key; the duplicate
  `IMeasuresDescriptions` (model re-exports the typings one).
- `INITIAL_MODEL` (`fromJS([])`) moved to `models/bucket_item.ts` — it seeds the RAW buckets
  subtree (stays Immutable until 4.9–4.11) and never belonged to the decorated model.
- `models/bucket_item.ts` read helpers (`getType`, `getLocalIdentifier`,
  `getOperandLocalIdentifiers`, `isDate`, `isMeasure`, …) are now dual-mode (shim reads) — they are
  called with both raw Immutable items and plain decorated items.
- `getAttribute` / `getAttributeByIdentifier` keep their Immutable-in/Immutable-out contract (they
  resolve itemCache entries; the itemCache subtree stays Immutable — 4.5 made it a slice but kept
  the container, it flips with the decorated models in 4.9–4.11).
- The two `fromJS` deep-conversion traps in the MD path were defused: `metadata.ts`
  `transformBucketItems` stores the PLAIN decorated buckets inside the Immutable `additionalData`
  via `Map({decoratedBuckets})`/`.set(...)` (fromJS would deep-convert the array), and
  `metadata_service.ts#getMetricMDObject` builds its single-bucket wrapper as a plain literal. The
  MD OUTPUT stays Immutable (`reduceBuckets` returns `List<Map>`) so `fromJS`/`.toJS()` consumers
  are unchanged; pinned by `models/test/metadata_decorated_buckets.test.ts` (fiscal-PoP path,
  `Map({decoratedBuckets})` path, full `.toJS()` round trip).
- `buckets_service.ts#areBucketsEmpty` is dual-mode (called with RAW buckets by
  reset_button_selector and with decorated buckets by export selectors).
- Deliberate behavior adjustments: `startDragBucketItem` and `highlightItemsToBeRemovedBySwap` now
  receive the RAW `original` instead of the decorated Record (their only consumers read
  `localIdentifier`, matching the actions' declared `IImmutableBucketItem` payload type);
  `MeasureAttributeFilterOrganized` replaces Record `.equals` with lodash `isEqual` (nested raw
  values keep reference identity, so the common case short-circuits).

---

## Phase 4.1–4.3 — router, dialogs, messages, drillableItems, shortcuts

**Delivered as #11647** — ONE PR, one commit per domain.

- **router (4.1)** is a TYPED SHIM-BASED ROOT TRANSFORMER (`store/router/router_reducer.ts`), not a
  slice: its state spans three tree positions (`route`, `previousRoute`,
  `appState.locationRedirectLock`), LOCATION_CHANGED writes route+previousRoute atomically, and a
  project switch / report-cleared navigation triggers the whole-root `resetWholeApplication`. It
  dissolves at **7.2** (route/previousRoute become combineReducers branches; the conditional
  whole-app reset moves next to the app-reset wrapper) — the flip precondition reads accordingly,
  like the Phase 2 buckets-cluster entries. Route values are PLAIN now; `utils/location.ts` reads
  via the shim; `selectors/route_selector.ts` keeps its `state.getIn` calls (dual-mode; 6.1 codemods).
- **dialogs (4.1)** is a real slice. Its two cross-domain writers dissolved INTO the slice as
  extraReducers cases on the same frozen strings: `delete_report_reducer`'s DELETE_REPORT_STARTED
  dialog close and the entire `AiReducer` (GEN_AI_CHAT_ASK), which was deleted from the chain.
  `dialogs_service` dissolved (hide\* → case reducers; the two misfiled get\* selectors →
  `store/dialogs/dialogs_selectors.ts`). Dead surface removed: `DIALOGS_OPEN_METRIC_EDITOR` (never
  written — `metricEditorDialogSelector` was permanently undefined, incl. a dead SaveReportDialog
  branch) and the `openInvitationDialog` initial key. All DIALOGS\_\* child path constants deleted.
- **messages (4.2)** is a real slice with PLAIN `displayed`/`delayed` arrays; `messages_service`
  dissolved into slice draft helpers (it had zero callers outside the reducer). The single
  cross-domain read — user locale formatting the export too-many-rows toast — moved to
  `sagas/messages_sagas.ts` per §4.3(c): the slice's EXPORT_RESULT_ERROR case skips that branch and
  the saga adds the toast via MESSAGES_ADD under the same `export_result_error` message id.
  MESSAGES_ADD payload gained an optional `id` (additive) to make that possible. The reducer-side
  `clearTimeout` in removeMessage stays (legacy behavior, revisited with Phase 9).
- **drillableItems (4.2)** is a mini slice mounted INSIDE `appState.meta` (all sibling meta writers
  are leaf-scoped — verified). The `fromJS` wrap was dropped: the stored value is the plain
  `IHeaderPredicate[]` all consumers already typed it as; ReportVisualization/PluggableVisualization
  prop types corrected to `ExplicitDrill[]`; the dead duplicate `bootstrap_selector.getDrillableItems`
  deleted.
- **shortcuts (4.3)** split along the ownership boundary: `data.shortcut.shortcutDateDatasets` is a
  real slice (plain values); the buckets-coupled SHORTCUT_APPLY\_\* handlers stay a TRANSITIONAL
  whole-root transformer (`store/shortcuts/shortcuts_apply_reducer.ts`) because their branching
  depends on the selected visualization class and they write buckets/reference-point/filter-bar/
  dateDatasets — they dissolve with the buckets cluster (**4.9–4.11**), joining the Phase 2
  exception list for the flip precondition. `shortcutDroppedItem` and `data.postponedAction` stay
  transformer-managed (branch-dependent writes; time travel's undo fixup uses the kept
  `setDroppedItem` export). The postponedAction stash deliberately keeps its legacy fromJS shape —
  the replay saga reads it with Immutable getters and the payload feeds the still-Immutable buckets.
- **Convention refinement:** domain creators were converted to `createAction` IN PLACE
  (`src/actions/*_actions.ts`) instead of moving files — dialogs alone has ~25 importers; the file
  moves are pure churn deferred to 10.8 (router moved because it also gained a state module).
  Foreign-domain actions a slice listens to (report/export/save/genAI) are wired by their
  `ActionTypeKeys` enum string via `builder.addCase(ActionTypeKeys.X, handler)` — their creators
  stay untouched in their own domain files until those domains migrate.

---

## Phase 4.4 — app context

**Delivered as #11662** — ONE PR, one commit per domain: featureFlags, permissions, intl, embedding, appContext + a characterization-suite commit first.

- **Characterization first** (`reducers/test/app_context_characterization.test.ts`): 24 specs
  pinning the observable domain behavior THROUGH THE FULL ROOT CHAIN (bootstrap fan-out, meta
  flags, intl merge, sessionId refresh, featureFlags/permissions stores, and the
  router-triggered whole-app reset incl. sessionId + removedItems) — written against the legacy
  reducers, kept green across the migration.
- **Mini-branch mounts** are the 4.4 pattern: a domain whose state is several small leaves in
  SHARED containers gets one tiny slice per leaf, `liftSlice`-mounted and composed (via the
  existing `compose`) into ONE root-chain entry per domain; at 7.2 they unwrap into per-leaf
  combineReducers branches. Applied twice: `store/embedding` (meta.device/theme/isEmbedded/
  isPluggable/isHostedComponent — `appState.meta` stays a 3-owner container with drillableItems
  and postMessageContext, so META can never be a single mount before 5.1) and
  `store/app_context` (root bootstrapData/projectId/colorPalette + appState.errors/appReady).
  The monolithic legacy `bootstrap()` fan-out dissolved into per-branch extraReducers cases on
  the same frozen BOOTSTRAP_DATA string.
- **intl / featureFlags / permissions** are plain single slices (`store/intl`,
  `store/feature_flags`, `store/permissions`); the high-traffic legacy selector files
  (feature_flag_selector with ~55 derived selectors/61 importers, permissions_selector,
  intl_selector, bootstrap_selector) keep their paths and re-base their INPUT selectors on the
  domain sliceSelectors. intl's initial state absorbs the DEFAULT_MESSAGES plain-leaf seed;
  SET_LOCALE keeps its store-verbatim quirk (readers re-validate via validateLocale).
- **What remains a transformer** (`store/app_context/app_context_transformer.ts`,
  TRANSITIONAL, dissolves 7.2): the `appState.sessionId` writes and the shared
  `resetApplication`/`clearInsightContent`/`resetWholeApplication` functions — they rewrite ~15
  still-legacy subtrees and are applied as plain FUNCTIONS by router (LOCATION_CHANGED
  project-switch), open_report (open failure) and delete_report (deleting the open report), so
  neither can be action-keyed slice state yet. sessionId wired to the reset ACTIONS alone would
  silently drop the function-path refreshes.
- **UNSAFE\_ fix (app_context_reducer.ts:117):** `clearInsightContent` no longer fakes a
  dispatch through the bucket_notifications reducer; it writes the subtree via the new pure
  domain helper `bucketNotificationsWithRemovedItemsReset` — same mechanism as its sibling
  filterBar/chartSort default writes. The remaining `UNSAFE_bucketsNotificationsSetRemovedItems`
  (buckets_service.ts) dissolves at 4.10; the full slice-actions-in-a-batch form arrives with
  Phase 9 batching.
- **jquery gotcha (new wiring rule):** `actions/app_context_actions.ts` imports jquery +
  jquery.browser (a `window` read at import time) for the `bootstrapData` creator's viewport
  measurement. Slices in the reducer graph therefore wire this domain's cases by frozen enum
  STRING with TYPE-ONLY creator imports (erased at runtime) — a value import would crash every
  node-env consumer (hit: messages_sagas.test). Jquery-free domain creators (embedded_actions,
  appMode) are wired as real creators.
- **Container/behavior changes:** `appState.errors` is a plain array (Error.tsx/Root.tsx moved
  off the Immutable List API: `.last()`/`.size` → index/`.length`); absent-until-bootstrap
  subtrees are now null-initialized slices (readers already treated them as optional).
  Deliberate fixes: `featureFlagsError(String(err))` passed the error as the workspaceId
  argument (featureFlags_sagas); the permissions saga handler was typed with the SUCCESS action
  while receiving the REQUEST; dead `appState.bootstrapData`/`appState.userFeatureFlags` seeds
  removed (the real branches are root-level); `getColorPalette` relocated from
  services/color_palette_service.ts to `store/app_context/app_context_selectors.ts` (§4.3 — a
  pure reader is a selector); CatalogPanel's inline `state.getIn(PROJECT_ID)` unified onto
  `getProjectId`.
- **Import-cycle gotcha (now a rule for every mini-branch domain):** a domain's sliceSelector
  paths must come straight from `constants/state_paths`, never from its own reducer module —
  the reducer imports the slices, the slices import the domain's action creators, and those
  live next to the legacy-facing selectors, so `selectors → reducer` closes a cycle. Two
  distinct symptoms hit here: appContext's cycle (reducer → transformer →
  reset_button_selector → bootstrap_selector → selectors) left the captured path `undefined`
  at module init and broke half the test suite; embedding's (selectors → reducer → slices →
  appMode → selectors) ran fine but failed dependency-cruiser's `no-circular` in `rushx
validate`. Consequence: the `<DOMAIN>_STATE_PATH` aliases the earlier single-mount domains
  export from their reducer are deliberately NOT reintroduced for mini-branch domains — the
  mount and the selector both read the shared constant. `META` gained a `DEVICE` subtree-root
  constant for the device mount.

---

## Phase 4.5 — data domains

**Delivered as #11738** — ONE PR, one commit per domain: datasets, insightUsage, itemCache, dateDatasetsMeta, dateDatasets, visualizationClasses, configurationPanel + a characterization-suite commit first.

- **Characterization first** (`reducers/test/data_characterization.test.ts`): 39 specs pinning the
  data domain THROUGH THE FULL ROOT CHAIN before the handlers moved — the merge semantics
  (`DATE_DATASETS_DATA` is a SHALLOW merge, `STORE_UPDATE_ITEM_CACHE` a deep one), the
  default-visualization-class precedence, the reset paths, and the RESET_FOR_PLUGGABLE_MOUNT
  remount contract. Kept green across the whole PR.
- **`reducers/data_reducer.ts` is now a pure composer of mounts** — `immutableDataReducer` is
  deleted, which is the first §5 flip precondition satisfied for the whole data branch, and
  `reducers/test/data_reducer.test.ts` is gone (each case moved to its domain's store suite).
- **Values that deliberately stay Immutable** (the pattern this phase established): a domain
  becomes a slice for its WRITE path even when its VALUES are still Immutable, because those values
  are the currency of the not-yet-migrated buckets/report clusters. Three cases, each documented in
  its `<domain>_state.ts`: `itemCache` (entries — `getAttribute()` calls `.merge()` on them and
  decorated bucket items hold one in `attribute`; flips in 4.9–4.11), `dateDatasets.available`/
  `allItems` (items read with Immutable getters by the postMessage sagas and buckets_service; flips
  in 4.9–4.11 — 4.8 kept the open_report writer's `fromJS` untouched) and `visualizationClass(es)`
  (10 readers plus the Immutable `is()` deep-equality
  in `isDefaultVisualizationClass`). RTK supports this: on a non-draftable state it calls the case
  reducer with the raw value and requires a return, so those slices return new Immutable values
  instead of mutating a draft.
- **`_infra/plain_subtree.ts` (new, TRANSITIONAL)**: the inverse hazard for the PLAIN slices. A
  legacy writer doing `setIn(PATH, value)` into an ABSENT branch makes Immutable materialize the
  intermediate as an Immutable **Map**; Immer cannot draft it, so a mutation-style case reducer
  would silently lose its writes and return undefined (which RTK rejects). `liftPlainSlice` +
  `toPlainSubtree` normalize the container on the way into the mount and the input selector
  (by reference when already plain, so the identity short-circuits survive). Used by
  `dateDatasets` and `configurationPanel`, the two domains with such writers.
- **Ownership found by the deep dive** (the plan row said "config panel, bucketsMeta"): `bucketsMeta`
  has SEVEN writers spread across buckets_reducer, buckets_service, open_report, time_travel,
  arithmetic_measures, bucket_filters and the app-context transformer — it is a buckets-cluster
  subtree and migrates with 4.9–4.11, not here. The insight leaves (`title`/`tags`/`summary`/
  `layers`/`layersOwner`) and `pluggableVisualization` are written by execute/save/open report, so
  they belong to 4.7/4.8a–4.8b. What 4.5 did deliver instead: `datasets` and `insightUsage` (single
  writer, fully plain), `itemCache`, `dateDatasets` + `dateDatasetsMeta`, the `visualizationClasses`
  mini-branch and `configurationPanel`.
- **Services dissolved** (§4.3): `services/dataset_service.ts` → `store/datasets/datasets_helpers.ts`;
  `services/insight_usage_on_dashboards_service.ts` → domain helpers + selectors;
  `services/date_datasets_meta_service.ts` → a thin TRANSITIONAL re-export facade over the domain
  selectors (~20 call sites keep their path, the file move is 10.8);
  `services/date_datasets_service.ts` lost its three setters and re-based its cross-domain reads;
  `selectors/configuration_panel_selector.ts` deleted into the domain selectors. Note the lint gate
  (`no-barrel-files`) forbids re-export shims, so relocated pure helpers
  (`getDefaultVisualizationClass`, the class-list variant) are imported from their new home.
- **SET_DATE_DATASETS_META now fans out to two slices** — the meta leaf and the granularity entries
  it derives into the itemCache — instead of one service function writing another domain's subtree.
  `test_mocks#seedDateDatasetsMeta` replaces the old `DateDatasetsMetaService.setDateDatasetsMeta`
  state builder that 10 test files used, and drives the real action through both mounts.
- **Absent-subtree readers fixed**: with the seeds gone from `initial_state.ts`, `open_report_reducer`
  and `utils/api.ts` read the itemCache through `getItemCacheState` instead of `state.getIn(...)`, so
  they no longer depend on a slice-owned subtree being pre-seeded.
- **Pre-existing quirks pinned, not fixed** (so the PR stays behavior-neutral): Immutable's
  `mergeDeep` CONCATENATES list-valued fields, so re-sending a cache entry grows its `displayForms`;
  `DATE_DATASETS_DATA`'s "dedupe/sort" test names describe the saga, not the reducer.
- **Deliberate adjustments**: an empty visualization-class list stores `null` as the selected class
  instead of `undefined` (RTK forbids returning undefined on a non-draftable state; every reader
  already treated it as optional); the granularity-cache derivation skips meta items without
  `attributes` instead of letting the legacy accumulator chain turn undefined and throw on the next
  item; `data.datasets` initializes to explicit empty groups rather than `{}`.
- `models/date_dataset.ts#INITIAL_MODEL` deleted — a subtree's initial value now lives with the
  slice that owns it.

**Phase 4.5 review pass — the two hazards a slice-per-write-path domain actually creates.** A
post-implementation review of the whole 4.5 diff (five reviewers, one per domain cluster) found the
domain slices, mounts, action strings, merge semantics and reset parity correct, but surfaced two
classes of fallout that the "values stay Immutable" pattern makes easy to miss. Both are now fixed
in this PR and pinned by regression suites; treat them as a checklist item for every remaining
domain that keeps Immutable values (4.6–4.11).

#### A container that flips plain while its ITEMS stay Immutable breaks `.toJS()` readers — and TypeScript cannot see it, because the accessor still advertises the Immutable type.

`DateDatasetsService.getDateDatasets` returns the plain subtree cast `as unknown as
IImmutableDateDatasets`, so two readers kept calling `.toJS()` on it: `selectors/
drill_down_selectors.ts` (hard `TypeError` whenever a date item sits in a bucket and the drill-down
config is rendered) and `selectors/buckets_selector.ts#constructVisualizationMDObj` (the optional
`dateDatasets?.toJS?.()` silently yielded `undefined`, so a saved insight lost its
empty-date-values attribute filter). Neither had test coverage. Fix: a single memoized
`getPlainDateDatasets` accessor in the domain (`fromJS(...).toJS()`, dual-mode so a whole-subtree
Immutable value still normalizes) is now the ONE way to read this domain as plain data — a
per-reader `.toJS()` cannot be right while the container is mixed. Pinned by
`selectors/test/date_datasets_plain_readers.test.ts` (both readers, each verified to fail without
the fix). **Rule for the remaining domains: when a container becomes plain but its values do not,
grep the domain's accessors for `.toJS(`/`.get(` at every call site — the cast makes the compiler
useless here, so the sweep has to be manual.**

**Follow-up (#11767) — a THIRD instance of this class in the same domain got past this gate.**
Not a reader this time, so the `.toJS(`/`.get(` grep above could not have found it: the sentinel
itself had the wrong collection KIND. `getDateDatasetsFromMetaInfo` returned `Map()` for the
not-loaded-yet branch while every consumer iterates an indexed list, and the usual
`as unknown as IImmutableDateDatasets` cast hid it from tsc. With `showHiddenCatalogItems`
enabled, `selected_date_datasets_selector` routes the "available" list through that function on
the very first `DATE_DATASETS_DATA` dispatch — before `SET_DATE_DATASETS_META` lands — so the
`Map()` reached `decoratedDateDatasets`, `toJS()`ed to `{}`, and threw on
`[...(plain.available ?? [])]`: **Analyze did not load at all**. Two lessons, both folded into the
§7 gate: (a) the sentinel's kind is part of the contract, and (b) `??`/`|| []` cannot enforce it,
because a wrong-kind value is never null — `models/date_dataset.ts#toItemList` does an explicit
kind check instead. A post-fix sweep of every migrated domain (all `as unknown as` casts, every
`isImmutable`/`toPlain` boundary helper, plus every 1-arg exported selector of all 26 domains run
against a booted-but-not-loaded state with the flag both on and off) found no fourth live
instance through 4.6; the latent ones it did surface are filed in §10.

#### Deleting a seed from `initial_state.ts` is only safe once every reader goes through the domain accessor.

`RESET_FOR_PLUGGABLE_MOUNT` returns the pristine `initialState` VERBATIM (no mount
runs), so a slice-owned subtree is genuinely absent until the next dispatch, and
`resetForPluggableMount` is public API (`src/index.ts`). Four readers still used the raw path and
would throw on that state: `components/report/ReportCustomError.tsx`,
`utils/buckets_reducer_helpers.ts#getLocalVisualizationClass` and two in
`selectors/shortcuts_selector.ts` (plus its `DATE_DATASETS_AVAILABLE` read). All four now read
through `getVisualizationClassesState` / `getAvailableDateDatasets`; pinned by
`reducers/test/pristine_state_readers.test.ts`. Routing them through the typed accessors also
exposed a latent mis-annotation the untyped `state.getIn` had hidden (element callbacks typed
`IImmutableVisualizationClasses` instead of `…Class`) — corrected.

#### `undefined` → `null` normalization is not automatically reader-transparent.

A slice cannot
return `undefined` for a non-draftable state, so an empty class list stores `null`; Immutable's
`is(null, undefined)` is **false**, and a default parameter (`visualizationClass = Map()`) does
not fire for `null`. `isDefaultVisualizationClass` now normalizes both operands (legacy was
internally inconsistent: `false` on the seeded pristine state, `true` right after
`resetApplication` wrote `undefined`; both paths now agree that no class available means nothing
to reset) and `constructVisualizationMDObj` coerces with `?? Map()`. The reset transformer writes
`?? null` so its value matches the slice's own shape.

Also removed: a leftover `STORE_CONFIGURATION_PANEL_COLLAPSED` block in
`reducers/test/buckets_reducer.test.ts` that survived the handler move to the slice and passed
vacuously (it asserted `toBeTruthy()` on a flag whose slice default is already `true`, driving a
reducer that no longer handles the action) — its twin in `bucket_reducer.test.ts` had been removed
correctly.

Found and deliberately NOT fixed here (pre-existing, unrelated to 4.5, filed in §10): the
drag-and-drop domain has never seeded `data.dragAndDrop` and `getDndState` has no fallback, so any
selector composing `getDraggedCatalogItem` (e.g. `displayMetricOverTimeSelector`) throws on the
pristine post-reset state — it did so before this PR too.

Same category, raised by a reviewer on the 4.5 PR and deferred to **4.7/4.8a** rather than to §10,
because fixing it needs a decision this branch cannot make: `insight_selectors.ts` calls
`visClassRaw.toJS()` unguarded in `getInsightWithBucketsViaMd` (line 151) and
`getInsightForCreateViaMd` (line 208), so both throw when no visualization class is selected. That
is byte-identical to master — `state.getIn(VISUALIZATION_CLASS)` over a `visualizationClass: null`
seed returned the same `null` — and 4.5 only added a type cast there. Note the throw site MOVED
though: before 4.5, `getVisualizationClass` (line 63) threw first and `currentReportMDObjectExtended`
never completed; with its `?.` guard the chain now reaches 151/208. Net behavior is unchanged (both
selectors throw in that state, before and after), and no reader pulls them there — every consumer
(execution/export/save/catalog + postMessage sagas, three filter-bar `mapStateToProps`) presupposes
a rendered visualization, and `RESET_FOR_PLUGGABLE_MOUNT` unmounts the host. The reason this is NOT
a `?.` one-liner: `visClassUrl()` four lines on runs `invariant(vc, …)`, so optional chaining only
relocates the crash, and returning a default would put a visualization-class-less insight
definition on the postMessage wire to the embedding host — the same silent-`undefined` shape as the
`constructVisualizationMDObj` filter-drop defect this PR fixed. Decide the boundary behavior when
the insight leaves and the open/save-report paths migrate.

---

## Phase 4.6 — properties

**Delivered as #11748** — ONE PR: a characterization-suite commit first, then the domain.

- **Characterization first** (`reducers/test/properties_characterization.test.ts`): 23 specs pinning
  the domain THROUGH THE FULL ROOT CHAIN — the merged/current properties writes and their totals
  stripping, the `getMergedProperties` deep merge, the clear-scale semantics of optional stacking,
  the dual-axis flag, the `propertiesMeta` shallow merge, undo/redo's `undoApplied` write and both
  reset paths. Kept green across the whole PR, unedited.
- **The split** follows 4.3/4.4: `data.visualizationProperties` and `data.propertiesMeta` are two
  mini-branch mounts composed into ONE root-chain entry (`store/properties/properties_reducer.ts`),
  and everything the same actions write OUTSIDE the domain — the extended reference point
  (`STORE_VIS_PROPERTIES_CHANGED`, `VIS_PROPERTIES_INITIALIZED`, all of `OPEN_AS_REPORT_TOGGLED`)
  and the bucket totals — stays a TRANSITIONAL whole-root reducer (`properties_apply_reducer.ts`)
  joining the Phase 2 exception list for the flip precondition. It dissolves with 4.9–4.11.
  **Registration order is load-bearing:** the mount runs BEFORE the apply reducer, because
  `setBucketTotals` → `bucketsWereChanged` copies `visualizationProperties.sortItems` into the
  reference point and must see what the slice has just stored (the legacy reducer did both in one
  function, in that order).
- **`visualizationProperties` keeps Immutable values** (the 4.5 itemCache pattern): the value is
  handed to the still-Immutable reference point verbatim
  (`referencePoint.set("properties", properties)`), `insight_selectors` calls `.toJS()` on it, and
  the merge itself is Immutable-shaped — `joinControls` implements the colorMapping
  removal-entry semantics with `mergeWith` and list identity. It flips with the buckets cluster.
- **`propertiesMeta` becomes PLAIN, and the frozen `undoApplied` path survives it.** Verified
  behavior of Immutable v5 that made this safe: `setIn` traverses a plain nested subtree and
  copies it back as a plain object, and `getIn(path, default)` reads it — so time travel's
  `state.setIn([...PROPERTIESMETA, "undoApplied"], …)` and the flag readers in
  `optional_stacking_selector` / `recommendations_selector` are untouched. The same `setIn` on an
  ABSENT branch still materializes an Immutable Map, hence `liftPlainSlice` + a normalizing input
  selector (`_infra/plain_subtree.ts`), covered by a test.
- **Reader fallout of that flip — the 4.5 gate paid off, and it was a crash.**
  `ReportVisualization` did `visualizationPropertiesMeta?.toJS() ?? null`; the plain value has no
  `.toJS`, so the prop would silently become `null`. The fix is NOT just dropping the call:
  sdk-ui-ext's `controlsHelper` **mutates** the object it receives
  (`set(propertiesMeta, "undoApplied", false)`) before pushing it back through `pushData`, and RTK
  freezes slice state with immer — passing the stored object through would throw
  (`Cannot assign to read only property`). `.toJS()` had been supplying a defensive copy by
  accident. The component now spreads a fresh copy per render (identical to the old cost), pinned
  by a regression test verified to fail without it. **Rule for the remaining domains: when a
  subtree stops being Immutable, check not only who READS it but who MUTATES what we hand them —
  `.toJS()` is a copy, and dropping it is an aliasing change.**
- **Both seeds deleted from `initial_state.ts`** (the slices self-initialize). Per the 4.5 gate,
  every reader was re-pointed at the domain accessors: the properties saga,
  `report_visualization_selector`, `buckets_service#bucketsWereChanged` and `buckets_reducer`'s
  sortItems fallback. The remaining raw reads (`dualAxis`, the stacking and recommendation flags)
  all carry a `getIn` default and are safe on the absent subtree;
  `reducers/test/pristine_state_readers.test.ts` grew a properties section. The reset transformer
  and `open_report_reducer` write the domains' initial states instead of reading the deleted seeds.
  `getVisualizationPropertiesSortItems` deliberately does NOT default — a properties replace can
  drop the key, and the legacy readers write whatever they read into the reference point.
- **Identity stability of the meta merge**: assigning through the immer draft leaves the state
  untouched when the pushed meta repeats what is already stored, so an unchanged echo does not
  re-render the report — Immutable's `merge` behaved the same, and a naive object spread would not.
- **Services dissolved** (§4.3): `services/properties_service.ts` → `store/properties/properties_helpers.ts`
  (pure merge computations, shared with the saga); the duck-typed `isImmutable`/`isImmutableList`
  predicates moved to `utils/immutable.ts` — they are generic, and the filter bar uses them too.
- **Generic-portability gotcha (new wiring rule):** a `createAction` whose payload mentions an SDK
  type with a DEFAULT type argument the SDK does not re-export (`IVisualizationProperties<IDefaultControlProperties>`)
  fails declaration emit with TS2742, because the inferred creator type cannot be named. Annotate
  such creators explicitly with `ActionCreatorWithPreparedPayload<…>` so the reference stays
  unexpanded.
- Pre-existing quirks pinned, not fixed: the "extended reference point non-empty" guard is lodash
  `isEmpty` over an Immutable Map, which is ALWAYS false — it really only asks whether the subtree
  exists; and `buckets_reducer` handles `BUCKET_TOGGLE_DUAL_AXIS` too, reading the addressed bucket
  unguarded, so the action throws through the root chain when that bucket is absent.
- Deleted dead surface: `IImmutableVisualizationPropertiesMeta`.

---

## Phase 4.7 — execute_report

**Delivered as #11756** — ONE PR: a characterization-suite commit first, then the domain.

- **Characterization first** (`reducers/test/execute_report_characterization.test.ts`): 23 specs
  pinning the domain THROUGH THE FULL ROOT CHAIN — the start/finish/error/warning writes, the
  id-matching guard, the late-result history rewrites (past AND future snapshots, plus the
  non-matching snapshot that must be left alone), the foreign leaves and all three reset paths.
  Two assertions were edited during the migration and those edits ARE the behavior changes: the
  deleted seed (below) and the pristine-state read that now goes through the domain accessor.
- **The split** follows 4.6, with the registration order INVERTED: `report.execution` is a single
  mount (`store/execution/execution_reducer.ts`) and everything the same actions write outside the
  domain stays a TRANSITIONAL whole-root reducer (`execution_apply_reducer.ts`) joining the Phase 2
  exception list. That file carries two groups with two different dissolution dates — the foreign
  report/insight leaves (`report.nowOpen`, `report.loadingError`, `data.title`, `data.summary`) go
  at **4.8a**, the `updateHistory` side effects at **Phase 8**.
- **Registration order is load-bearing, and the other way round than 4.6's:** the mount runs AFTER
  `OpenReportReducer`. That reducer applies `resetApplication` as a FUNCTION on OPEN_REPORT_FAILED,
  which rewrites this whole subtree, and the slice's report-not-found status has to land on top of
  the reset — exactly as the legacy `.setIn(REPORT_EXECUTION_ERROR_STATUS, NOT_FOUND)` did after its
  own `resetApplication(state)` call. Registered earlier, the reset would swallow the error and the
  "insight not found" screen would never appear. Pinned by a full-chain test in the domain suite.
- **The first report-branch domain to go FULLY PLAIN.** Both values the legacy reducer wrapped in
  `fromJS` — `error.responseData` and `warning.limitBreaks` — are built from plain action payloads
  rather than being buckets-cluster currency, and each had exactly one accessor, so no
  "values stay Immutable" carve-out was needed. Reader sweep per the 4.5 gate: the twelve
  `error.get("status")` reads in `selectors/report_selector.ts` plus its two `.toJS()` accessors now
  read the domain accessor, and the selector-test fixtures that seeded the error with `fromJS` seed
  plain objects. **Both of those accessors also stopped minting a fresh value per call** — the
  `.toJS()` was doubling as an accidental copy, so the four connected error components and the
  partial-data warning re-rendered on every unrelated store change; they no longer do.
- **The id guard is split across the two halves.** The slice writes only when the result belongs to
  the current execution; the apply reducer rewrites history only when it does not. Because none of
  these actions writes `id`, the halves cannot disagree whatever the chain order — which is why the
  condition can be re-tested rather than shared.
- **The transitions are IN-PLACE mutators in `execution_helpers.ts`** (§4.3(b)), shared by the slice
  (an immer draft) and the history rewrite (a shallow copy of a snapshot's subtree). One
  implementation is what keeps the paths from drifting — the legacy reducer got that for free by
  handing ONE whole-root function to `updateHistory`. Two reasons mutation beats `{...state}` here:
  an immer draft must not be spread into a returned object (nested values come along as draft
  proxies), and `delete` reproduces the legacy `deleteIn` exactly — the key becomes ABSENT, which is
  what the `!!error` readers test for. `null` would not do.
- **The history rewrite replaces the execution subtree WHOLESALE, and that is the subtle part.** A
  nested `setIn` into a plain subtree materializes the absent `error`/`warning` intermediate as an
  Immutable **Map inside an otherwise plain object** — and a snapshot becomes the LIVE state the
  moment the user hits undo, where the now-plain readers would break on it. Pinned by a test
  asserting the rewritten snapshot is plain, which fails on the nested-write form. **Rule for the
  remaining domains: a subtree written into undo/redo snapshots has to satisfy the same container
  contract as the live one — history is not a write-only sink.**
- **Both the seed and a dead flag deleted from `initial_state.ts`**: the slice self-initializes, and
  the seed's `first: true` had no reader anywhere in the package (pinned by the characterization
  suite before removal). The reset transformer writes the domain's initial state.
  `reducers/test/pristine_state_readers.test.ts` grew an execution section — the error screens and
  the export/save gating all ask "is something wrong / is there data" before anything has executed,
  so those readers run on the pristine post-reset state.
- **Actions**: the six domain creators became `createAction` in place with prepare callbacks
  preserving the positional signatures and the exact payload/meta/error shapes (the splunk
  formatters and postMessage sagas read `action.meta`/`payload` only, so they are untouched); the
  interface names survive as `ReturnType` aliases for the four sagas that use them. The foreign
  OPEN*REPORT*\* cases are wired by frozen enum STRING because those creators are still hand-written
  functions until 4.8a (the 4.4 convention).
- **Ownership found by the deep dive** (§6 said "pluggableVisualization / insight … 4.7 / 4.8a–4.8b"):
  `data.pluggableVisualization` holds RAW Immutable bucket items and is written exclusively from the
  buckets cluster (buckets_reducer/service, over_time_comparison, arithmetic_measures,
  bucket_filters, recommendations) — it is buckets-cluster state and moves to **4.9–4.11**. The
  insight leaves are written by execute/open/save report and the reset transformer; 4.7 needs only
  `data.title`/`data.summary`, so splitting the group here would have half-owned it and rewritten
  open/save report twice. They land whole at **4.8a** and stay in the apply reducer until then.
- Pre-existing quirk noticed, deliberately NOT fixed (outside this domain's blast radius):
  `log_formatters` maps REPORT_EXECUTION_TOO_LARGE_TO_DISPLAY onto `getErrorParams`, which reads
  `action.meta.*` — that action carries no `meta` at all.

---

## Phase 4.8 — report cluster

**Delivered as #11786** — 4.8a + 4.8b JOINED in ONE PR: a characterization-suite commit first, then creators, the insight domain, the report domain, delete_report.

- **Characterization first** (`reducers/test/report_characterization.test.ts`): 35 specs pinning
  the whole report cluster THROUGH THE FULL ROOT CHAIN — the open lifecycle (incl. the isDraft
  branch, the save-button-compatible lastSavedObject shape and the history clear), both save
  flag variants and the saveAsNew-only layers adoption, the delete-started history rewrite and
  the delete-finished conditional reset, the open-failure split (no reason = report-not-found +
  execution NOT_FOUND on top of the reset; a reason lands in `report.loadingError`), all reset
  paths and the container KINDS of the insight leaves. The assertions edited during the
  migration ARE the behavior adjustments below.
- **Creators first** (the 4.1–4.3 convention): all 17 open/save/delete creators became
  `createAction` IN PLACE with prepare callbacks preserving the positional signatures and exact
  payload shapes; the interfaces survive as `ReturnType` aliases. The execution slice's two
  OPEN_REPORT\_\* string-wired cases switched to real creators, as its 4.7 comment promised.
  Jquery check per the 4.4 rule: `post_message_action_helper` is import-safe, so value imports
  are fine in the reducer graph.
- **The insight domain** (`store/insight`) owns `data.title`/`tags`/`summary`/`layers`/
  `layersOwner` as FIVE mini-branch mounts in one root-chain entry (the 4.4 embedding pattern —
  `data` is a shared container). Writers dissolved out of open/save report and
  execution_apply_reducer (which loses the parked REPORT_TITLE_CHANGE / REPORT_DESCRIPTION_CHANGE
  cases); the application resets keep writing the leaves as FUNCTIONS via the transformer,
  re-pointed at the domain initials. **Deliberate behavior adjustment:** `tags`/`layers` were
  MIXED containers (Immutable List on the pristine/reset path via the fromJS seed, plain arrays
  after open/save — readers survived by the silent `[...list]`/`.length`-on-List accidents);
  they are permanently PLAIN now on every path. Per the #11767 gate the array accessors
  KIND-CHECK instead of `??`-guarding: a fixture List normalizes shallowly, a wrong-kind
  container falls back to `[]`. The mounts use `liftSlice`, NOT `liftPlainSlice` — the
  object-spread normalization would turn a fixture List into a keyed object; every case reducer
  returns instead of mutating, so a non-draftable fixture value passes through until the first
  real write.
- **The report domain** (`store/report`) owns `report.saving`/`savingAsNew`/`opening`/`nowOpen`/
  `loadingError`/`lastSavedObject` as SIX mini-branch mounts in one entry (`report` is shared
  with the execution slice). SaveReportReducer dissolved WHOLE into the slices and is deleted.
  Two deliberate normalizations: **loadingError stores `null`** where the legacy reducer deleted
  the key (non-draftable state cannot be undefined — the 4.5 rule); the ONE accessor
  `getReportLoadingError` restores `undefined`, because `hasReportLoadingError`/`isReportValid`
  test against undefined and `null !== undefined` would paint an error screen over a healthy
  report — pinned by a dedicated never-leaks test. **lastSavedObject keeps its Immutable value**
  (the 4.5 itemCache pattern): it is buckets-cluster currency (`prepareForComparison` runs
  Immutable APIs over its `content` for the save button, `getNewReportMDObject` grafts with
  `setIn`, time travel copies it across snapshots); its case reducers guard with deep `is()`
  before replacing, preserving the legacy `setIn` idempotence (the 4.7 §7 lesson) — pinned by
  identity assertions (a deep-equal re-save returns the SAME root).
- **What stays transitional in the domain** (all joining the Phase 2 exception list):
  `open_report_apply_reducer` (the trimmed OpenReportReducer — the foreign buckets-cluster
  writes, dissolve 4.9–4.11, and the open-failure `resetApplication` FUNCTION call, dissolves
  7.2) and `delete_report_apply_reducer` (the relocated delete reducer — the history rewrite of
  the deleted report's snapshots, Phase 8/8.2, and the delete-of-open-report conditional reset,
  7.2). **Registration order is load-bearing, the 4.7 invariant extended:** the open apply
  reducer runs BEFORE the insight/report/execution mounts, so on OPEN_REPORT_FAILED the slices'
  writes (loadingError = reason, execution NOT_FOUND) land ON TOP of the application reset —
  the legacy `resetApplication(state).setIn(...)` sequencing expressed by chain position.
- **execution_apply_reducer after 4.8**: the unguarded REPORT_EXECUTION_STARTED loadingError
  clear moved into the report slice; what remains of group 1 is the ONE write whose guard needs
  a cross-slice read — closing a just-opened report (`report.nowOpen`) only when the finished
  result matches `report.execution.id`. A one-boolean mini-slice cannot test that, so it stays a
  documented external writer of the report domain until the Phase 8 rework of this file.
- **Boundary decision settled** (deferred from 4.5): `getInsightWithBucketsViaMd` /
  `getInsightForCreateViaMd` now `invariant` on a selected visualization class before the
  `.toJS()`. The THROW semantics are deliberate and unchanged — returning a default would put a
  class-less insight on the postMessage wire, the silent-undefined shape #11767 taught us to
  refuse — the TypeError just became a named precondition.
- **Reader sweep per the §7 gate** (both directions, twice): every raw `state.getIn` reader of
  the eleven migrated leaves re-pointed at the domain accessors (report_selector's lastSaved
  family + flags, save_report_selector's comparison reads, report_title/description/
  reset_button/open_report/export/editor_header selectors, save_report_from_kd_dialog,
  buckets_selector's saved identifier, log_formatters' splunk `visualizationObjectId` keeping
  its `?? null` notSetValue, report_service, delete_report_sagas);
  `getInsightLayers`/`getInsightLayersOwner` moved from buckets_service to the domain (§4.3).
  The remaining raw accesses are exactly the sanctioned external writers: the reset transformer,
  execution_apply's guarded nowOpen close, delete's history rewrite and time travel's
  lastSavedObject carry-over. `pristine_state_readers.test.ts` grew report + insight sections
  (all eleven seeds are deleted from `initial_state.ts`; the accessors answer the seed values on
  the post-reset state — incl. `isReportTitleEmpty` staying true and `getNewReportMDObject`'s
  `setIn` graft not throwing).
- **Vacuous test fixed while migrating**: the delete_report history spec nested its fixture meta
  under a `visualization` key (REPORT_SAVED_URI reads `visualizationObject.meta.uri`) AND
  dispatched an unrelated dummy ref — it passed without exercising the rewrite at all. It now
  deletes the snapshots' actual report and pins that other reports' snapshots are left alone.
- Deliberately NOT flipped here: `dateDatasets.available`/`unavailable` — open_report's
  `fromJS` writes stay byte-identical, so the §10 latent mixed-container readers stay latent
  until 4.9–4.11 flips the values.

---

## Phase 4.9 — buckets_service pure helpers

**Delivered as #11851** — a characterization commit first, then one commit per helper group.

- **What moved and what deliberately did not.** 4.9 is the pure-computation half of the buckets
  cluster: `services/buckets_service.ts` goes 1,987 → 1,630 LOC and `src/store/buckets/helpers/`
  arrives with 609 LOC of typed pure functions over PLAIN structures —
  `totals_sanitization.ts` (the grand-total / subtotal machinery + same-function reordering, behind
  one `sanitizeBucketTotals`), `totals_for_new_measure.ts` (the inheritance rule for a freshly
  dropped measure), `measure_format.ts` (`sanitizeMeasureFormat` / `sanitizeFormats`),
  `bucket_item_predicates.ts` (seven dual-mode predicates), `bucket_layout.ts` (the
  replacement-insertion index), `filter_dependencies.ts` (which filters depend on which bucket
  items). The **state transformers stayed** — `sanitizeTotals`, `swapBucketItem`, `addItems`,
  `removeMultipleBucketItemsWithDependencies`, `setBucketItemsDateDataset`,
  `mirrorTotalsToDerivedMeasures` are still `(State) => State` in the service, because they write the
  Immutable buckets subtree and that flips at 4.10. Nothing changed container kind in this PR.
- **The rule that kept it safe: no function changed its return container.** The temptation is to make
  `getMeasures`/`getBuckets`/`getBucketItemsFromBuckets` return plain arrays while their callers use
  `.count()`/`.first()`/`.toJS()`. That is 4.10/4.11 work with a §7 reader sweep attached; doing it
  here would have hidden a container flip inside a "pure helper extraction". Only logic whose inputs
  AND outputs were already plain moved, plus the predicates, which moved to dual-mode reads (a
  widening, never a narrowing).
- **State access moved OUT to the callers rather than being passed through** (§4.3(b)):
  `getTotalsForMeasureEnabledOnAllOtherMeasures` takes `previousMeasureLocalIdentifiers` instead of
  the state, the format helpers take a `CatalogItemTypeResolver`,
  `convertRemovedDimensionalityRefs` takes a `BucketItemRefResolver`, and
  `findFiltersRelyingOnSlicedInsight` takes the ranking filter / MVFs / flag. The resolvers stay
  LAZY — `convertRemovedDimensionalityRefs` still asks only about entries that are both a local
  identifier and being removed, since each call walks the buckets and the item cache; pinned by a
  spec that records which identifiers the resolver was asked about.
- **§7 GATE CORRECTED — the "legacy `setIn` was idempotent for free" premise is false for
  collections.** Measured on Immutable 5.1.6: `set`/`setIn` return `this` when the value is an equal
  PRIMITIVE or the literally SAME reference, and **not** when it is a deep-equal but freshly built
  collection — `is(existing, fresh) === true` and `state.setIn(path, fresh) !== state`. So a legacy
  `setIn(BUCKETS_PATH, fromJS(computed))` was never a no-op; the idempotence in this service comes
  from its EXPLICIT guards and nowhere else (`bucketTotalsIdentical` in `setBucketTotals`,
  `buckets.equals(...)` in `mirrorTotalsToDerivedMeasures`). Both facts are pinned in
  `services/test/buckets_service_characterization.test.ts`: `setBucketTotals` returns the same root
  for a deep-equal totals list because it compares first, `sanitizeTotals` returns a NEW root for an
  unchanged totals list because it does not. **What this changes for 4.10 and later:** when these
  writes become case reducers, the guard has to be written deliberately — there is no `setIn`
  behavior to inherit it from. 4.7's freeze diagnosis stands (a plain assignment always dirties an
  immer draft), only its explanation of why the legacy code did not freeze was wrong: the legacy
  write dirtied the root too, and `applyExecutionError` re-assigned a leaf that made the difference
  visible. Assert IDENTITY, and check the guard exists.
- **Reader sweep done here, not deferred.** The predicates' consumers were re-pointed at the helper
  module in this PR rather than left behind a compatibility re-export: the `no-barrel-files` lint
  rule forbids re-exporting an imported binding, and the blast radius was six production files, not
  the ~60 an early grep suggested — `BucketItemService.isDateItem` is a DIFFERENT function
  (`services/bucket_item_service.ts` declares its own), which inflated the count.
- **One deliberate behavior widening, pinned:** a hole (`null`/`undefined`) in the bucket list handed
  to `areBucketsEmpty` no longer throws. The old body read `bucket.items` off a non-Immutable value;
  the shim is existence-based, so a hole now contributes no items. Nothing depended on the throw.
  `containsMetricWithDateFilter` still throws for a metric with no `filters` key at all — that one is
  preserved on purpose (every bucket item AD builds has the key, so a throw there is a real defect).
- **Coverage added where it was missing, not everywhere.** The characterization commit went after the
  logic with NO direct coverage — the entire measure format sanitization (the `buckets_reducer` suite
  even claims "more cases tested by testing sanitizeMeasureFormat", which was not true), the plain
  bucket queries, the transitive `getAllDependantBucketItems` walk,
  `findInvalidArithmeticMeasuresForRemoval`'s remaining-measure threshold, the `enableNewPivotTable`
  reordering. Each helper then got a suite driven with plain fixtures, targeting the branches that
  fail SILENTLY: the subtotal re-pointing table, the `-1`-findIndex ordering quirk for an unknown
  measure, the dual-mode predicates through `describe.each` over both container shapes, and the case
  that must never regress — an unresolvable dimensionality ref KEEPS its local identifier rather than
  being dropped, because dropping it silently re-points a ranking filter at the remaining attributes.
- **Still open for 4.10/4.11 in this file** (unchanged by 4.9): the 32KB `buckets_reducer`, the
  `referencePoint` writes, `data.pluggableVisualization` (written only from this cluster), the second
  `UNSAFE_bucketsNotificationsSetRemovedItems` site in `setRemovedDependantItemsNotification`, the
  `getBuckets`/`getMeasures`/`getAttributes`-family read-style functions that become selectors, and
  the four latent `.size`-on-a-plain-array readers filed in §10 that fire when
  `dateDatasets.available` flips.

---

## Phase 4.10 — buckets write-path slice + cluster split

**Delivered as #11863** — characterization first, then creators, the mechanical relocation, the
slice, the UNSAFE_ dissolution and the reference_point entry point, one commit each.

- **The headline scope correction: 4.10 does NOT flip the buckets subtree.** The plan's §0/§6
  wording ("the PR that actually flips the buckets subtree") turned out to contradict its own §7
  gate, which requires the reader sweep to land in the SAME PR as any container flip: 57
  production files are typed against `IImmutableBucket*`, 36 consume `buckets_service` readers,
  and bucket items are the currency of the decorated models, the pluggable visualizations and
  the item cache. A flip here would have been either a 150-file PR or a shipped
  mixed-container class — the §9 table's highest-frequency bug. 4.10 therefore delivers the
  **write-path slice with the Immutable value preserved** (the 4.5 itemCache pattern: RTK's
  non-draftable path hands the case reducer the raw List and requires a returned one), and the
  container flips at **4.11 together with the selector/reader sweep**, which §7 forces to be
  simultaneous anyway. Consequence worth naming: because the value stays Immutable, every
  carried-over `setIn` keeps its legacy idempotence semantics — the 4.7 freeze class
  (plain assignment always dirties an immer draft) is structurally impossible in this PR.
- **Cascades did not become sagas either, and the blocker is atomicity, not effort.** Nearly
  every legacy handler ends in `bucketsWereChanged`: a referencePoint sync reading THREE other
  domains (filter bar, bucketsMeta, visualizationProperties) in the same dispatch as the
  buckets write. Split across saga `put`s, components can render fresh buckets against a stale
  reference point (the reference point drives the pluggable visualization render — that is an
  extendedReferencePoint round-trip trigger, not a cosmetic glitch). The batch form that makes a
  multi-action cascade atomic for rendering, undo and splunk arrives with Phase 9 — the 4.4 note
  already said this about the UNSAFE_ sites ("the full slice-actions-in-a-batch form arrives
  with Phase 9 batching"). So the cross-domain handlers stay in ONE transitional whole-root
  reducer, `store/buckets/buckets_apply_reducer.ts` (the relocated legacy file), registered
  AFTER the mounts in the domain's composed root-chain entry (the 4.6 order rule), and
  `reducers/buckets_reducer.ts` is gone.
- **What the slice owns (9 actions):** title, format, showAllValues, aggregation, chartType,
  dual axis, and the `setRelatedBucketItemsProperty` family (isTotalMeasure,
  showOnSecondaryAxis, isThresholdMeasure) — everything whose write is computable from the
  subtree + payload alone. The write logic is value-level in
  `store/buckets/buckets_write_helpers.ts`, and the service's root-state lookups
  (`getItemsPath`, `getBucketItemIndex/Path`, `getBucketIndex`,
  `findBucketItemByLocalIdentifier`, `getImmutableBucketItems`, `findDerivedBucketItems`)
  delegate there — one implementation, so slice and legacy callers cannot drift. The apply
  reducer keeps only the sync tail for these actions. `appState.renamingBucketItem` became a
  clean boolean mini-mount (sole writers are the two renaming actions).
- **Two Immutable findings the characterization surfaced, both now load-bearing:**
    - **`map` identity refinement of the corrected §7 gate:** Immutable 5.1.6's `map` returns
      the SAME list when every element maps to itself, so the `setRelatedBucketItemsProperty`
      family IS idempotent on same-value re-dispatch — identical references short-circuit even
      though fresh deep-equal collections do not. All nine slice actions have pinned
      same-value-re-dispatch IDENTITY specs; keep the `setIn`/`map` idioms in the helpers, do
      not "clean them up" into rebuilt collections.
    - **The dual-axis negative-index landmine:** `BUCKET_TOGGLE_DUAL_AXIS` on an unknown bucket
      does not throw (the 4.6 note guessed wrong) — `getBucketIndex` returns `-1` and
      Immutable's negative indexing wraps it to the LAST bucket, silently toggling that
      bucket's items. Pinned as-is; an index guard is a behavior fix, not a migration step.
- **Seeds stay, deliberately** (deviation from 4.5's seed-removal pattern): `data.buckets` and
  `data.referencePoint` keep their `initial_state.ts` seeds because the subtree has raw
  `state.getIn` readers across the package until 4.11 and RESET_FOR_PLUGGABLE_MOUNT returns the
  pristine state verbatim (§7 seed gate). The slices' initialState and the seeds are the same
  values (`INITIAL_MODEL`, `false`), so both init paths agree.
- **Documented §7 gate exception (the 4.6 propertiesMeta/time-travel shape):** until 4.11,
  `data.buckets` keeps external writers — the service transformers called from this domain's
  own apply reducer and from the open_report/shortcuts/recommendations/properties apply
  reducers. Safe during the transition because the value stays Immutable (their `setIn`
  semantics are unchanged) and the mount short-circuits on identity, so no spurious
  notifications.
- **Second UNSAFE\_ site dissolved:** `UNSAFE_bucketsNotificationsSetRemovedItems` (the last
  reducer-calls-reducer fake dispatch) is replaced by the pure domain helper
  `bucketNotificationsWithRemovedItems`, exactly like its reset sibling in 4.4; the removal
  chain writes the computed subtree value and stays ONE dispatch. Pinned by the
  characterization's notification specs (written + untouched cases).
- **reference_point is a domain module, not yet a slice:**
  `store/reference_point/reference_point_sync.ts` owns the sync write (callers pass the values
  in — no service↔domain import cycle) and `bucketsWereChanged` is now just the input-gatherer.
  Slice-hood needs 4.11: the domain's writers are exactly the cross-domain cascades, and ERP
  deletion semantics (`deleteIn` vs a key holding `undefined` behind the EXISTENCE-BASED shim
  `getIn` — the 4.9/#11767 class) must be normalized together with the ERP readers.
- **Undo mechanics checked, unchanged:** snapshots are pushed when the WHITELISTED action hits
  TimeTravelReducer (first in the chain) — the codebase already runs UI→saga→STORE for several
  buckets actions, so the snapshot-before/mutate-after shape is the norm and the split changes
  nothing. No whitelist edits in this PR.
- **Still open for 4.11** (unchanged here): the container flip + full §7 reader-idiom sweep
  (including the four latent `.size` readers in §10), the `getBuckets`/`getMeasures` selector
  conversion, the services-dissolution sweep, ERP normalization, `data.bucketsMeta` (seven
  writers across the cluster) and `data.pluggableVisualization`, the remaining ~15 creators,
  and the apply reducer's cross-domain handlers (those additionally wait for Phase 9 batching
  where they need multi-slice dispatch).

---

## Phase 4.11 — the buckets flip

**Delivered as #11879** — ONE PR closing Phase 4: `data.buckets`, `data.bucketsMeta` and
`data.pluggableVisualization` are PLAIN. Originally split 4.11a/4.11b per the 4.8a/4.8b
precedent; the split was reverted mid-flight and the whole item shipped as ordered commits in
the one PR (toolkit → three mechanization batches → THE FLIP → Phase-4 tail), full suite green
per commit. The §8 high-risk gate (full CI e2e + manual smoke) applies to this PR before merge.

- **The strategy is the plan's own Phase 6 → 7 applied to the cluster:** convert every reader
  to a container-agnostic form while the values are still Immutable (each step a zero-change,
  individually verifiable commit), so the flip commit becomes a provable container swap
  gated by a grep, not a 150-file leap. The alternative — flip + sweep in one PR-sized change —
  is exactly the megachange shape §9 calls the highest-frequency bug source. The join did not
  change this; it only moved the verification boundary from PRs to commits.
- **The census finding that scopes the sweep:** Immutable's root `state.getIn`/`setIn`
  TRAVERSE plain subtrees (the 4.6 verification generalizes), so root-path reads survive the
  flip untouched. The sweep is ONLY Immutable METHOD calls on bucket VALUES — `item.get(...)`,
  `.size`/`.count()`/`.first()`/`.toJS()`/`.toArray()`/`.isEmpty()`, Immutable-only
  `.filterNot`/`.toList()`, container `.get(i)` (negative wrap!), `.equals`. Measured: ~245
  sites across 31 service-consumer files, plus the `components/buckets` tree (props-passed
  items) and `buckets_service` internals.
- **Toolkit:** `utils/collection_access.ts` — `count`, `first`/`last`, `getAt` (preserving the
  negative-index wrap the pinned dual-axis landmine depends on), `toPlain` (deep for Immutable,
  identity for plain), `toShallowArray` (`List.toArray` parity), `containsValue`. Every helper
  runs its suite over BOTH container shapes (the 4.9 predicates convention).
- **Mechanized (readers, ~30 files across four commits):** batch 1 = buckets_selector,
  configuration_checkboxes, optional_stacking, shortcuts, report_visualization, date_filter,
  drill_down and the filter-bar date-filter selectors; batch 2 = measure_descriptions,
  bucket_item_service, over_time_comparison_service, utils/buckets; then the write path
  (`buckets_write_helpers`, `buckets_apply_reducer`, `buckets_service` internals ~55 sites,
  `open_report_apply_reducer`), saga/telemetry (`log_formatters`, `bucket_filters`
  reducer+sagas, `filter_bar_saga`, `arithmetic_measures`, `highlighting_saga`, telemetry) and
  the `components/buckets` tree + filter-bar components. **Classified OUT during census:**
  `control_filtering_saga` and `utils/api` — their Immutable calls read other domains' values,
  not bucket values; recorded so nobody "finishes" them into this cluster later.
- **Two real fixes, not just mechanization (§10 latent `.size` readers):** `shortcuts_selector`
  (`.size` on `getAvailableDateDatasets` → `count()`, so the metric-over-time shortcut cannot
  silently switch off when `dateDatasets.available` flips) and `filterBarDropdownUtils` (same
  class, found during the components sweep). The remaining §10 readers stay filed — they belong
  to the dateDatasets flip, not this cluster.
- **Conventions locked (and held through the flip):** (1) item cache / ERP uiConfig /
  visualization class VALUE reads stay Immutable-idiom — those containers flip separately, and
  converting them here would smuggle scope; (2) a function's return container MIRRORS its input
  container (`mirrorToContainer` — `fromJS` iff the reference is Immutable) — no hidden flips,
  the 4.9 rule; (3) missing-item lookups widen from `undefined.get` TypeErrors to `undefined`
  through the shim — a widening, never a narrowing, stated per commit.
- **THE FLIP was types-first, and that ordering is the lesson:** flip `typings/buckets.ts`
  BEFORE any runtime change — redefine the STATE family (`IImmutableBucketItem`/`IImmutableBucket`
  and plurals; names keep the "Immutable" fossil until Phase 10) as plain interfaces/arrays and
  let `tsc` enumerate every residual Immutable consumer. The compiler found the stragglers the
  §7 grep cannot see (typed-but-unidiomatic reads); the grep then verifies the residue, not the
  discovery. Two type-family corollaries: `noPropertyAccessFromIndexSignature` forces DECLARED
  common fields + an index signature on the item interface, and the MD-OBJECT family split out
  as `IImmutableMdBucketItem(s)` in `typings/metadata.ts` — save_report_selector,
  models/metadata and reference_point_service consume MD shapes and must never be re-pointed at
  the state family.
- **The negative-index landmine has a second axis, now pinned:** Immutable's root `setIn` does
  NOT wrap negative indices over PLAIN sub-arrays — it writes a stray `"-1"` own property on a
  spine-copied array (silently, and `Array.isArray` stays true). Closed twice: `normalizeKey`
  in the shim (in-range negative indices wrap on plain arrays) and `resolveIndex` in the path
  builders. The whole mixed-root behavior surface (traversal, plainness preservation,
  spine-copy identity, primitive short-circuit, deep-equal NO-short-circuit, deleteIn splice,
  the stray-`"-1"` landmine, transition parity) is pinned in
  `utils/test/mixed_root_contract.test.ts` — read it before touching the shim.
- **Idempotence is re-established, never inherited (4.9 gate, now with teeth):** `Array.map`
  never returns identity, so every formerly-Immutable `map` idiom went through `mapCollection`
  (identity-preserving, container-mirroring); `mirrorTotalsToDerivedMeasures` carries an
  explicit deep-equality guard. Silent-failure classes closed with helpers + specs:
  `Array.concat(undefined)` appends undefined AS AN ITEM and `concat(List)` appends the List as
  ONE element → `toShallowArray` in the flatten helpers.
- **Seed gate:** plain seeds are applied via `setIn` AFTER the `fromJS` initial-state literal —
  inside the literal, `fromJS` would deep-convert them straight back to Immutable. Same idiom
  for all three flipped subtrees (`buckets`, `referencePoint.buckets`, `bucketsMeta`,
  `pluggableVisualization`), and RESET_FOR_PLUGGABLE_MOUNT returns the pristine state verbatim,
  so the seeds ARE the post-reset contract (pinned in buckets_cluster_characterization).
- **Frozen shared mocks:** a by-reference `.push` on a shared plain mock leaked state between
  test files (log_formatters saw 4 measures). `deepFreezeMock` now wraps the shared bucket
  mocks in `constants/test_mocks.ts` and `INITIAL_MODEL` is `Object.freeze([])` — in-place
  mutation of pristine state throws loudly instead of corrupting the next test. Keep new shared
  fixtures behind it.
- **Flip mechanics as predicted by 4.10:** slice state → plain, write helpers → plain ops,
  `extendedReferencePointChanged` writes `toPlain(normalizedBuckets)` into BUCKETS while the
  ERP pipeline value stays Immutable; referencePoint's container stays an Immutable Map, only
  its `.buckets` value goes plain BY REFERENCE via the sync, `.filters` stays `fromJS`-built
  (`IRefPointFiltersBucket`). One documented Immutable allowlist inside the apply reducer: the
  geo display-form block operates on ERP values (`IErpBucket*` local types). §7 idiom grep at
  zero over the flipped subtrees.
- **Phase-4 tail (closes the phase):** `bucketsMeta` + `pluggableVisualization` flipped (services
  rewritten on the shim), the domain selector module `store/buckets/buckets_selectors.ts`
  created (`getBucketsState` via `sliceSelector`, `getAllBucketItems`) and
  `services/buckets_service.getBuckets` re-pointed at it — the ~36 legacy importers keep their
  entry point until the Phase 10 sweep.
- **Phase-9 deferral, scope-corrected:** RP slice-hood, cascades→sagas dissolution and the
  deleteIn-vs-undefined normalization stay in Phase 9 — the RP writers ARE the cross-domain
  cascades (the 4.10 atomicity argument), and ERP normalization to plain belongs with them, not
  here. ERP stays Immutable end-to-end (`IExtendedRefPointBuckets = List<Map>`), with the
  dual-mode readers widened `IImmutableBuckets | IExtendedRefPointBuckets` at the seams.
- **§8 smoke findings (post-delivery, fixed on the branch) — THE FIXTURE THAT SEEDS THE OLD
  CONTAINER IS THE FLIP'S REAL BLIND SPOT.** THREE production crashes escaped a green 4,729-test
  suite AND the §7 idiom grep AND the types-first `tsc` pass — found one at a time, in the app,
  which is itself the point: each was invisible to the gate that was supposed to catch it. The
  common root cause is that a test seeded the flipped subtree with `fromJS(...)`, so the
  Immutable idiom under test kept working against a container production no longer produces.
    1. **`ReportVisualization.tsx` — `newDerivedBucketItems.toJS is not a function`, on startup,
       even with empty buckets** (the seed is `[]`, not `List []`). Doubly hidden: the prop was
       declared `newDerivedBucketItems: any`, and `tsc` enumerates consumers of a TYPE, not of
       `any`; and the test passed `fromJS([])` as the prop instead of going through the selector.
       Fix: drop the `.toJS()`, type the prop `IImmutableBucketItems` (killing the `any`), re-seed
       the test plain. Handing the immer-frozen array straight to sdk-ui-ext was verified safe —
       `addNewDerivedBucketItems` and all three `mergeDerivedBucketItems` overrides (headline,
       bulletChart, repeater) only read and push references into fresh arrays.
    2. **`metadata.ts#measureFilterToMd` — `displayForm.toJS is not a function`**, on every insight
       carrying a measure ATTRIBUTE filter (`bucketsToMetadata` → save / export / insight render).
       This one is the sharpest lesson of the three: **a decorated model carries TWO provenances in
       one object.** `filter.attribute` is an itemCache entry (still Immutable) but `filter.original`
       is the RAW bucket filter, which flipped PLAIN with the buckets subtree — and the two meet in
       a single expression, `areObjRefsEqual(displayForm.toJS(), attributePrimaryDisplayForm.get("ref").toJS())`.
       The read of `filter.original` HAD been mechanized to the shim; what escaped is that the VALUE
       it returns was then used with an Immutable idiom. The stale comment above it still claimed
       `filter.original` was "still an Immutable Map during the transition". Fix: `toPlain(...)` on
       both sides (dual-mode, so the Immutable side keeps working). Note the crash needs
       `attributePrimaryDisplayForm` to be TRUTHY — with no primary display form the `||`
       short-circuits and the branch never runs, which is why no existing test hit it.
    3. **`shortcuts_apply_reducer.getTrendBucketLocalIdentifier` — `b.get is not a function`** on
       the metric-over-time shortcut (`setGranularity` → reached whenever a column chart is
       selected and date datasets are available). It read `getIn(state, BUCKETS)` — correctly,
       through the shim — and then called `b.get("localIdentifier")` on each element. The census
       swept `selectors/shortcuts*`; this sibling apply-reducer was never on the worklist. Its
       test DID exercise the path and passed, because the fixture seeded `[...BUCKETS, 0]` with
       `fromJS({...})` — **a plain array holding Immutable Maps**, a mixed container the write
       boundaries never produce. Fix: `getIn` for both reads; fixture re-seeded plain, which
       immediately exposed three sibling `.size`-on-a-plain-array assertions in the same file
       (now `toHaveLength`, which also pins plainness — a `List` has `.size`, not `.length`).
    - **The instrument, and it is cheap: flip the fixture, not the reader.** Re-seeding the
      bucket fixtures plain across `buckets_reducer`, `buckets_service` and
      `buckets_reducer_helpers` turned up no further production bugs (every failure was test-side
      `.set()`/`List.of` construction), which is the _positive_ result that makes the sweep
      trustworthy. One of those failures is worth keeping in mind though: feeding
      `setBucketItemOverTimeComparison` a plain buckets array plus an `fromJS(...)` ITEM silently
      DROPPED the derived measure's totals (`toPlain` is shallow, so the nested Immutable Map
      answers `undefined` to every plain read). With uniform plain inputs it passes. That is the
      declined CodeRabbit "per-element mixed-container trio" finding demonstrated: the
      uniform-container invariant is load-bearing, and a mixed fixture corrupts results silently.
    - **Audit by PROVENANCE, never by name — this is what let #2 hide.** A by-name sweep
      (`bucket*`, `item*`, `filter*` receivers) clears the obvious sites and misses a receiver
      called `displayForm`. The reliable pass is mechanical: for EVERY Immutable-only call, resolve
      the receiver's BINDING and classify the source subtree. Two throwaway scripts did it —
      `<receiver>.toJS()` matched to its `const` binding within scope, and a second pass over
      variables bound from `getIn(...)`/`.original` that are later used with an Immutable method.
      That reduced ~130 `.toJS()` sites plus the `.get`/`.size`/`.sortBy`/`.updateIn` families to
      ~20 needing a human look, and every residual one resolved to a genuinely Immutable source
      (itemCache, MD-object family, ERP/uiConfig, visualizationProperties, visualizationClasses,
      catalog, dateDataset VALUES, the RP container, root State) or to an
      `isImmutable`/`Map.isMap`/truthiness guard. Two spots worth remembering because they look
      dangerous and are not: `additionalData` is built with `fromJS({... dateFilterDateDatasetRef ...})`,
      which deep-converts the plain filter-bar ref, and `reduceBuckets`' `mdBucket.get("items").size`
      is safe only because `transformBucketItems` normalizes `items` to a `List` first.
    - **Gate for the remaining flips (itemCache, dateDatasets, visualization classes):** before
      flipping a subtree, (a) grep its consumers' PROP TYPES and function params for `any` — the
      compiler is blind there; (b) grep its TESTS for `fromJS(` / `List.of(` seeds of that subtree
      and flip them FIRST, then run — the failures are the reader worklist; (c) treat `.size`
      on a flipped collection as a silent bug, never a crash; (d) enumerate the DECORATED models
      that mix provenances (`.original` flips with the subtree, `.attribute` does not) and re-read
      every comment claiming a field is "still Immutable" — those comments are load-bearing
      documentation that the flip silently invalidates. A green suite over old-container fixtures
      proves nothing about the new container.
- **§8 smoke finding #4 (post-delivery, fixed on the branch) — PROVENANCE IS PER-KEY, NOT
  PER-CONTAINER.** `getIn(...)?.toJS is not a function` in `insight_selectors.ts#getDisplayFormRef`,
  hit in the app on geo raw export — but the blast radius is every raw export (geo or not) of an
  insight where ANY bucket attribute carries an explicit display-form choice:
  `getRawExportOverrides` walks all decorated items through the same `.toJS()` readers.
    - Root cause: `decorated_bucket_item.ts#getAttribute` MERGES `displayForm`/`dfRef`/
      `areaDisplayFormRef` from the (plain since 4.11) bucket item into the Immutable itemCache
      entry. Immutable's `merge` does NOT convert incoming values, so the decorated `attribute` is
      an Immutable Map whose merged KEYS hold plain values — a mix INSIDE one container. The
      provenance audit resolved the receiver's binding ("itemCache entry → Immutable → safe") and
      was right about the container, wrong about three of its keys. A write site can change a
      key's provenance without changing the receiver's.
    - Fix, both sides: (1) boundary — fromJS-wrap the merged values so the container stays
      uniform (fromJS is identity on already-Immutable values); (2) readers — the two
      insight_selectors helpers (and the two future-fragile `MeasureFilters.tsx` siblings) read
      via dual-mode `toPlain(getIn(...))`, which also survives the future itemCache flip.
    - Again hidden by an old-container fixture: `decorated_bucket.test.ts` seeded its buckets
      `fromJS(...)`, so the very test asserting `.toJS()` on the merged `areaDisplayFormRef`
      stayed green. Re-seeded plain, it fails exactly with the production TypeError without the
      merge fix — plus two new regression tests (models-level uniformity invariant, and an
      end-to-end `getRawExportOverrides` repro over PLAIN state buckets), both verified to fail
      without the fix.
    - **The instrument is now permanent: `scripts/audit-immutable-provenance.mjs`** — a
      TypeScript-AST audit (type-independent; the seams are `any`, tsc is blind) with five
      detectors: [A] shim-read value consumed with an Immutable-only idiom, [B] variable bound
      from a shim read/`.original` later used with an Immutable idiom, [C] Immutable idiom on
      guaranteed-plain helper output, [D] un-sanitized (no fromJS/mirrorToContainer) write of a
      shim-read value into an Immutable container — the producer class of this very crash — and
      [E] old-container test fixtures (`setIn(<FLIPPED path>, fromJS(...))`). Run it before every
      subtree flip and after every §8 smoke; `--gate` exits non-zero on RED for CI once the
      backlog is burned down. Current standing: production code clean; **122 old-container
      fixture seeds remain across ~25 test files** (buckets_service.test.ts alone: 55) — that is
      the §8 burn-down backlog, each one a potential hiding spot for the next landmine.
    - **BACKLOG BURNED DOWN + THE AUDIT IS A VALIDATE GATE (same day).** All 122 fixture seeds
      re-seeded plain across 28 files — ZERO production reader bugs surfaced (the positive result
      that makes the flip's reader sweep trustworthy); three latent test defects killed
      (`bucketsAddItem`'s Immutable `-1` wrap-to-last let tests "add" items to buckets absent
      from the seed; an `fromJS([...])` List-wrapped bucketItem whose plain `.localIdentifier`
      read undefined; a bucketsMeta leaf seeded `fromJS(["m1"])` where production stores a plain
      string). `npm run validate-provenance` (`--gate`) is chained into `validate`.
    - **Detector [F] — the `any`-typed-receiver gap, found by deliberately re-introducing crash
      #1.** Re-adding `newDerivedBucketItems.toJS()` + reverting the prop to `any` passed every
      gate: the syntax detectors track bindings within a function, but a prop/param crosses the
      component boundary carrying no provenance, and tsc is blind at `any`. Fix is layered:
      (1) detector [F] asks the TYPE CHECKER (real ts.Program, ~6s) for every Immutable-only READ
      idiom whose receiver type is `any` — this catches the shape regardless of where the value
      came from; (2) the fringe is big — **485 findings / 342 sites measured** (the de-`any`
      backlog narrowed to "any × Immutable idiom") — so [F] gates via a RATCHET BASELINE
      (`scripts/provenance-baseline.json`, line-independent keys): existing findings tolerated,
      any NEW one fails validate; REDs are never baselinable; burn down by TYPING receivers
      (preferred — the compiler then gates that site forever, e.g. the typed
      `IImmutableBucketItems` prop makes `.toJS()` a TS2339) or dual-mode reads, then
      `--update-baseline` (count must only shrink). [F]'s first sweep immediately found THREE
      more hidden old-container fixtures that detector [E] could not see (variable-indirection
      seeds: metadata_legacy's `mergeIn(DATA, fromJS({... buckets}))`, recommendations_selector's
      same shape plus a `mergeIn([...BUCKETS, 1], fromJS(...))` REVERSE mix, BucketItemPure's
      plain array holding an `fromJS` bucket) — all flipped plain, all green; [E] extended to the
      mergeIn family. Residual honesty: a receiver whose TYPE LIES (declared Immutable, actually
      plain) is invisible to both tsc and [F] — only truthful types, plain fixtures, and the §8
      smoke cover that.
    - **THE BASELINE WAS NOT PROTECTION — THE READS THEMSELVES HAD TO GO DUAL-MODE. The rule is
      now: NO Immutable read idiom on an `any`-typed receiver, anywhere.** A ratchet only stops
      NEW debt; every pinned site was valid solely under TODAY's containers, so the next subtree
      flip would turn a baselined `.toJS()`/`.get()` deep in a component into a production crash —
      the ReportVisualization escape replayed, and betting on someone de-`any`-ing 342 seams first
      is not a plan. So ~700 call sites across 104 files were converted (codemod + hand fixes):
      `.toJS()`→`toPlain`, `.toArray()`→`toShallowArray`, `.getIn(p)`→`getIn(x,p)`,
      `.isEmpty()`→`isEmptyCollection`, and — the ones the first pass MISSED because they are
      shared with native Map/Set and therefore not "Immutable-only" — **`.get(k[,d])`→
      `getIn(x,[k][,d])`, `.has(k)`→`hasIn(x,[k])`, `.size`→`count(x)`**. Those three were the
      real exposure: `.get` is literally the "b.get is not a function" crash, and `.size` is
      WORSE than a crash (silently `undefined` on a plain array). Detector [G] now covers that
      family, so the gate sees them; the baseline is EMPTY again and the audit runs at 0.
    - **What deliberately stays Immutable, each with a `provenance-audit-ok: <reason>`:** the
      dual-mode definitions themselves (`toPlain`/`toShallowArray`/`getIn`/`hasIn`), Immutable
      WRITES (`.set()` on ERP / MD-object / dateDataset values — no dual-mode equivalent exists,
      and those families flip as a whole, not read-by-read), the deliberately DUCK-TYPED
      `isImmutableList` guard (`toPlain` defers to Immutable's `isImmutable` and would miss the
      half-converted values that guard exists to catch), and two assertions that PIN a container
      contract (the crash-#4 fromJS-wrap; RP.filters staying Immutable) — a dual-mode read there
      would silently accept a regression.
    - **Typed (non-`any`) Immutable receivers are deliberately NOT converted** — e.g.
      `report.toJS()` in export_report_sagas, where `report` is
      `ReturnType<typeof getVisualizationForExportFromInsight>` (the MD-object family). The
      compiler already gates those: if that selector ever returns plain, the `ReturnType` changes
      and `.toJS()` becomes a TS2339 build error. That is the whole doctrine in one line —
      **truthful type ⇒ the compiler is the gate; `any` ⇒ the read must be dual-mode.** Codemod
      lesson worth keeping: insert added imports at the AST end position of the last
      `ImportDeclaration`; a `^import …$` line regex lands inside multi-line import blocks and
      breaks 13 files, and converting a helper's own body creates infinite self-recursion
      (`toPlain` calling `toPlain`) — exclude the definition modules.

---

---

## Phase 5 — postMessage domain

**Delivered as #12111** — 5.1 + 5.2 JOINED in one PR (the 4.8a/b precedent). Commit chain:
characterization → creators → slice (5.1) → selectors (5.2) → reportMessage selector fix → docs.

- **The domain's state footprint is one leaf.** The plan's "postMessage state reducers → typed
  slice (all 33 action strings kept)" turned out to be: 33 `PostEventActionTypeKeys` strings that
  are ALL saga-consumed (string-keyed `takeEvery`) — no reducer ever handled them — plus ONE
  store action (`SET_POST_MESSAGE_CONTEXT`) writing ONE leaf, `appState.meta.postMessageContext`.
  The reducer→slice work is therefore small; the bulk of 5.1 is the creator conversion
  (13 action files, ~33 creators → `createAction` with prepare callbacks, the 4.4/4.8 convention;
  interfaces survive as `ReturnType` aliases). Verified before touching anything: the splunk
  `postMessageFormatter` reads context from ACTION payloads, not state; the reset transformers
  never write `meta.postMessageContext`; the reducer was the subtree's only writer, the
  `getPostMessageContext` accessor its only reader.
- **Mini-branch mount in the 3-owner meta container** (`postMessageApi/state/`, folder stays per
  §4.2 — the state files reshaped to slice layout in place). This was the LAST piece blocking a
  single `meta` slice: embedding (4.4) + drillableItems (4.2) + postMessageContext (5.1) can fold
  into one branch at 7.2.
- **The value flips PLAIN in the same commit as its reader** (§7 flip+sweep gate): the content
  arrives verbatim in a plain action payload — the legacy `fromJS` wrap bought nothing — and the
  accessor re-points through `sliceSelector` (dual-mode). The `initial_state.ts` seed
  (`postMessageContext: null`) is deleted; §7 seed-gate sweep found no raw `state.getIn` readers
  of the path. The slice stores `null` for "no context yet" (a slice cannot return `undefined`
  for non-draftable state); the accessor normalizes `null` to the legacy
  `{ contextId: undefined }` fallback, so RESET_FOR_PLUGGABLE_MOUNT (which serves the seedless
  pristine state verbatim) reads identically.
- **Deliberate improvement, pinned by identity specs:** the write gains an equality guard on
  `contextId`. The legacy `setIn(path, fromJS(content))` produced a new root on EVERY dispatch
  (the §7 idempotence correction — never inherited); the only dispatcher is the open-insight
  saga, never a render path, so this was safe before and is merely cheaper now.
- **5.2 — selectors typed + the controls-subscription stability verification.** The selector file
  moves to RTK's `createSelector` (reselect v5); `getPostMessageContext` becomes memoized — the
  legacy fresh-`.toJS()`-per-call was not a defensive copy anybody needed (§7 boundary check:
  every consumer is a saga `select` reading fields; none mutates). The flip-precondition audit of
  `availableCommandsStateSelector`: all 13 inputs are primitive-returning selectors or memoized
  object selectors (`availableClearCommandsSelector` over two booleans; `getFilterItems` =
  `createSelector` over the filterBar subtree reference), so the combiner — and the redux-watch
  `availableCommands` post to the embedding host — only fires when an input value actually
  changes. Two impurities live INSIDE the combiner (`isElementUrisSupported()`,
  `shouldWaitForInjectedApiToken()` — module/location reads): they cannot destabilize references
  (they run only when an input changed) but mean a changed capability alone never re-posts;
  legacy behavior, preserved. The characterization suite pins same-ref/new-ref through the full
  root chain and is dual-mode — 7.1 re-runs it against the plain root for the final precondition
  tick.
- **The standing provenance gate caught master's new code, as designed** (first post-4.11 proof):
  between the 4.11 rebase audit and this branch, master's hooks conversion of the report-message
  components introduced `visualizationClasses.toJS()` on an `any`-typed receiver
  (`reportMessageSelector` = raw `state.getIn`). `validate-provenance` failed this PR's gate with
  2 [F] findings — exactly the boundary-crossing shape the detector exists for. Fix: re-base the
  selector on the typed visualization-classes domain accessor (truthful type ⇒ compiler gates
  it); audit back to 0. Lesson for every later PR: any×Immutable reads added on master surface at
  the NEXT migration PR's validate — budget for a small collateral fix commit.
- **What deliberately did NOT change:** the `PostEventActionTypeKeys` /
  `PostMessageStoreActionTypes` enums stay (time-travel whitelist and splunk formatters import
  them; local enums per the Phase 2 exception — zero external string matching broke);
  `STORE_REMOVE_FILTER_ITEMS` remains saga-handled and time-travel-whitelisted; the
  incoming/outgoing protocol modules and `getPostMessageContextId` helpers are untouched
  (protocol frozen, §3).
- **Review round 1 found a VACUOUS reference-stability spec — new §7 gate.** The memoization
  spec dispatched a made-up unhandled action (`SOME_UNRELATED_ACTION`) to represent "an unrelated
  root change", but an unhandled action is a no-op on the WHOLE root: every `liftSlice` mount
  returns `root` unchanged, so `next === written` (probe-verified) and the memoized selector was
  handed the same input reference — it served its cache trivially and the spec asserted nothing.
  A reference-stability spec must therefore (a) dispatch an action that really writes a FOREIGN
  branch (`setHighlightedFilterItem` here — root moves, this subtree identical) and (b) assert
  `expect(next).not.toBe(prev)` as an explicit precondition, so it can never silently go vacuous
  again. Same family as the vacuous assertions deleted in 4.5 and the doubly-vacuous
  delete_report test fixed in 4.8, with a new mechanism: not a wrong fixture or a stale action,
  but a NO-OP stimulus. Whenever a spec's premise is "the root changed but my subtree did not",
  the premise itself needs an assertion. Confirmed the rewritten spec fails when the accessor is
  un-memoized (the old one passed).
- **Casts → annotations in the converted creators** (same round): all 14 `as <Payload>` casts
  became annotated `const payload: <Payload>` — a cast suppresses excess- and missing-property
  checks, an annotation gates them, which is the same "truthful type ⇒ the compiler gates it"
  doctrine 4.11 §8 arrived at from the `any` side. All type-checked clean, so no cast had been
  hiding a mismatch; the 4.8 creator files still carry the cast idiom and can be normalized
  opportunistically.
- **Gate:** rushx build + build-check, lint 0, format-check, validate (incl. provenance 0),
  full package suite. Per the 5.1 row: embedded e2e in CI + manual embedded smoke (postMessage
  command pass) before merge — checklist in the PR body.

---

## Phase 6 — pre-flip mechanization

**Delivered as ONE PR** — 6.1–6.4 joined, ordered commits per plan item, suite green per
commit. Zero behavior change by construction: the shim delegates to Immutable whenever the
receiver is Immutable, so every conversion is an identity transform TODAY and a crash-remover
at 7.1.

- **The codemod is checker-driven, not grep-driven — that is the phase's core lesson.** The
  plan row's `state.getIn(P)` → `getIn(state, P)` cannot be done by name: a receiver called
  `state` inside a slice is an Immutable VALUE (properties_slice writes
  `state.setIn([CONTROLS…])` on its still-Immutable slice value — converting it would smuggle
  a family flip), and root states travel under names like `updatedState`, `result`,
  `getLastSavedObject(state)`. The reliable discriminator is the TYPE CHECKER: convert exactly
  the receivers whose type resolves to the root `State` alias (union members included). The
  throwaway codemod (ts.Program per pass, innermost-first fixpoint so chained
  `.setIn().setIn()` and nested-argument calls converge; imports merged at the AST end of the
  last ImportDeclaration — the 4.11 lesson) converted **~1,500 sites in ~170 files** across
  prod and tests; hand work was ~30 sites in the classes below.
- **`rootReducer`'s inferred `any` return was load-bearing for the sweep**: `compose` is
  untyped, so every fixture built as `rootReducer(state, action)` lost the `State` alias and
  was invisible to both the codemod and the gate. Typing the return `: State` (zero runtime
  change) brought whole test families back under the discriminator. Same move at smaller
  scale: `let state: any` fixture declarations in five test files became `State`, and two
  saga tests' `fromJS({})` fake roots got `as State` casts. Truthful types ⇒ the gate sees
  the site — the 4.11 doctrine, now applied to the ROOT container.
- **What has no shim equivalent was rewritten, not mechanized** (recipes for anyone touching
  the leftovers):
    - root `.withMutations(cb)` (2 prod reset chains in `app_context_transformer.ts`, 7 test
      fixtures) → sequential shim `setIn` writes (prod) / a tiny functional `withWrites`
      builder (tests). withMutations was only a mutation-batching optimization; the resets
      are rare, so the extra spine copies are irrelevant.
    - root `.mergeIn(PATH, obj)` / `.mergeDeepIn` (test fixtures only) → per-key `setIn`.
      Immutable's merge stores the given values VERBATIM (the crash-#4 lesson), so the
      per-key rewrite is value-identical — and it forces the fixture to pick each key's
      container consciously (see next bullet). A deep merge of a single leaf is exactly a
      `setIn` of that leaf.
    - root `.toJS()` in assertions → `toPlain(…)`; root `.removeIn` → `deleteIn`; legacy
      2-arg `state.setIn(path)` (value silently `undefined`) → explicit
      `setIn(state, path, undefined)`.
- **The mergeIn fixtures were hiding the §8 fixture class at DATA-path level.** Detector [E]
  keys on FLIPPED path constants, but `mergeIn(DATA, fromJS({ itemCache, buckets: […] }))`
  writes through the DATA path — and `fromJS` silently rebuilt the flipped-plain `buckets`
  (and one fixture's `referencePoint.buckets`) as Immutable Lists. The per-key rewrites seed
  each family with its production container: itemCache / visualizationClass / filters / ERP
  stay `fromJS`, buckets seed PLAIN, referencePoint keeps the 4.11 contract (Immutable
  container, plain `.buckets` value). Re-seeding plain immediately exposed Immutable idioms
  in the tests' own fixture manipulation — `(items).push(fromJS(item))` updaters relying on
  `List.push`-returns-new-List (on a plain array `push` returns the LENGTH, which updateIn
  then stores — and mutates the shared literal in passing) → non-mutating spreads over plain
  items. No production reader bug surfaced, consistent with the 4.11 backlog burn-down.
- **Two latent fixture defects found and fixed while converting** (both invisible before):
  `bucket_reducer_for_combo_chart` chained its ERP-supported-comparison-types seed onto the
  small pre-merge Map using the FULL state path, parking it in a dead `data.data…` branch —
  re-seeded at the real path (suite stays green; the seed was satisfying an intention, not an
  assertion); and `bootstrap_selector`'s hide-top-bar fixture round-tripped the ENTIRE root
  through `toJS()/fromJS()`, rebuilding every flipped subtree as Immutable — now two shim
  writes over the real initial state.
- **`utils/reducers.ts` matters more than the plan row said**: `applyReducer` (and the dead
  `combine`) ran root `.getIn`/`.setIn`/`.set`/`.get`. The transformers and apply reducers it
  hosts survive the 7.1 flip and only dissolve at 7.2 — so the BRIDGE itself had to go
  dual-mode, not just its call sites. Same for redux-logger's `stateTransformer: s.toJS()` →
  `toPlain(s)` (dual-mode now, identity candidate at 7.1).
- **The 6.4 gate is two new detectors in the standing audit, not a separate grep script**:
  [H] — any Immutable method call (`get/getIn/set/setIn/…/merge/withMutations/toJS/equals`)
  on a receiver whose checker type resolves to the root `State` alias; RED, never
  baselinable. [I] — a `fromJS({…})` literal declaring a root branch key (`appState`/`data`/
  `report`/…): a hand-built Immutable root no production path produces after 7.1; RED in
  tests. The allowlist is the flip machinery that dies WITH the flip (`initial_state.ts`, the
  shim + its two contract suites, the two `_infra` mount-machinery suites whose premise is
  both containers); deliberate Immutable-root contract specs elsewhere carry per-site
  `provenance-audit-ok:` suppressions (insight/report pristine-state accessor contracts, the
  properties materialization spec). Audit runs at **0 findings** on this branch.
- **`validate-provenance` is back in `validate`** — it had been unhooked on master
  (67de052dd94) to unblock a red master after a merge race, which is exactly the dynamic the
  Phase 5 note predicted (two independently-green PRs can merge into a red audit). The fix
  is fix-forward: the audit is 0 on this tree, and any future master red is a small
  collateral commit, not a reason to lose the only gate that keeps 7.1 provable.
- **What deliberately did NOT change:** `getInitializedState`/`dispatchAction`/`runSaga`
  (the 6.3-named infra) contain no container idioms — they inherit dual-modeness from
  `initialState`/`rootReducer` and needed only the typed-return fix above; Immutable VALUE
  reads on typed receivers (lastSavedObject, ERP, itemCache, MD-object families) stay — the
  compiler gates them, and they flip with their families (Phases 8–10); `notSetValue`
  defaults were preserved except two sites where the default was dead AND lied about the
  container (`buckets_apply_reducer`'s `List()` default on the flipped BUCKETS path → `[]`).
- **Gate:** build + build-check green, lint 0 errors, format-check, full package suite
  (4,749 tests) green, `validate` green end-to-end incl. the audit at 0. Phase 6 is
  mechanical; the §8 high-risk manual smoke stays with 7.1, which this phase exists to
  de-risk.

## Phase 7.1 — THE ROOT FLIP

The root state container is a plain object. Delivered as two ordered commits — the pre-flip
contract first, the flip second — so the flip commit is provable against a contract that predates
it.

- **The contract-first shape is the phase's core mechanism.** `reducers/test/root_flip_contract.test.ts`
  was written and green on the UNFLIPPED tree, with every assertion container-neutral for the
  root (values compared through an era-proof `fromJS(x).toJS()` normalizer; container assertions
  only where the contract survives the flip). The flip commit changed NOTHING in that file — that
  is the proof. It pins: the pristine values byte-for-byte, the per-key container contracts
  (`data.referencePoint` Immutable until Phase 9, the 4.11 subtrees plain with the shared
  `INITIAL_MODEL` identity), reset-pristine-after-real-work + second-reset isolation, and a
  deep-freeze no-in-place-mutation tripwire that is inert on an Immutable root and bites on the
  plain one.
- **THE SCOPE LESSON — the flip is the ROOT CONTAINER ONLY; `appState`/`data`/`report` stay
  Immutable and flip with their own domains.** The first cut of this PR flipped the root _and_
  its three branches, passed every gate (4,760 unit tests, audit at 0, dependents building) and
  then blanked AD in e2e on every open-insight / route-change / reset path with
  `TypeError: e.set is not a function`. The mechanism is the shim's materialization rule
  (`utils/state_access.ts`): **a deep write through an ABSENT key materializes the intermediate
  containers in the container of its PARENT.** `data.extendedReferencePoint` is absent on the
  pristine state and is created by the first open-report write
  (`setIn(state, EXTENDED_REFERENCE_POINT_PROPERTIES, …)`, unguarded — `properties_apply_reducer`
  seeds `fromJS({})` first precisely because its author hit this); under an Immutable `data` it
  came out an Immutable Map, under a plain one a plain object, and the next consumer's `.set(…)`
  threw. So flipping a BRANCH does not just change that container — it silently changes the
  container of everything lazily created beneath it, forever after. That is a per-domain subtree
  flip (same doctrine as every other subtree in this migration: flip only when all readers are
  ready), not part of the root swap. Keeping the branches Immutable makes 7.1 a true container
  swap: **every value in the tree keeps the exact container it had before**, and the only thing
  that changes is the root object itself. The same reasoning applies to `data.dateDatasets` and
  the `extendedReferencePoint.uiConfig.*` paths — the class is wide, which is exactly why the
  answer is to remove it rather than to guard each write site.
- **Why no gate caught it.** The audit's [H]/[I] detectors prove the root container is never used
  with Immutable idioms — they say nothing about what a _lazily materialized_ container will be.
  The unit suite never exercises the sequence (reset → open report → plug-viz reference-point
  round trip) that materializes ERP and then calls `.set` on it. The pre-flip contract suite
  asserted the pristine SHAPE, not the materialization RULE. It does now
  (`materializes absent intermediates as Immutable, like the pre-flip root did`) — that single
  assertion fails against the broken cut and passes against this one.
- **Per-key container decisions** (from the reader audit, not from the literal): the root is
  plain; `appState`/`data`/`report` are `fromJS` Maps as before (incl. the dead
  `header`/`brandTitle` seeds, kept verbatim — 10.8 removal candidates, since the header menus
  are GENERATED in selectors and nothing reads the seed); `data.referencePoint` keeps its
  Immutable container with the plain `INITIAL_MODEL` buckets leaf, and the 4.11-flipped seeds
  (`buckets`, `bucketsMeta`, `pluggableVisualization`) stay plain values inside the Immutable
  `data`, applied AFTER the literal so `fromJS` cannot deep-convert them. The plan row's
  "(localStorage read + intl quirk preserved)" was stale: both self-initialize in their slices
  since 4.4/2.x — nothing to preserve.
- **Factory + frozen singleton + fresh-per-consumer.** `buildInitialState()` returns a fresh root;
  `RESET_FOR_PLUGGABLE_MOUNT`, `preloadedState` and `getInitializedState()` each take their own
  build (a shared plain singleton handed to live stores would let one mount's in-place mutation
  corrupt every later mount — the Immutable Map was only safe because it could not be mutated).
  The exported `initialState` stays for READS (the appContext reset transformer seeds from it,
  tests pin against it) and is DEEP-FROZEN — the `models/bucket_item.ts` loud-failure doctrine
  applied to the whole pristine seed.
- **The reader audit ran on two axes, because the standing detectors have a designed blind spot.**
  Axis 1: `FLIPPED_PATH_CONSTS` temporarily extended with the newly-flipping container consts —
  the [A]/[B]/[F] sweep returned ZERO (the Phase 6 burn-down had already emptied the ratchet
  baseline). Axis 2, by hand: `toPlain` on a flipping CONTAINER holding Immutable VALUES —
  `toPlain` is the sanctioned dual-mode move, so no detector flags it, but it is identity on a
  plain container and silently stops deep-converting the values inside. Exactly ONE production
  reader had the pattern: `MeasureDateDatasetsService.getAll` (statuses written `fromJS`, container
  flips) — fixed pre-flip to per-value conversion, with a container-era regression test. The
  audit's `toPlain`-blindness is worth remembering for the Phase 8–10 family flips: sweep
  `toPlain(` call sites by hand whenever the container/value split moves.
- **Runtime fallout was 15 tests, all fixture-side, in exactly two classes** — no production
  reader broke (the 4.11 backlog burn-down and Phase 6 mechanization held):
    1. **Absent-path materialization** (the bigger class): `setIn(initialState, DEEP_PATH, v)`
       through an ABSENT subtree used to materialize Immutable intermediates from the Immutable
       root; the shim materializes PLAIN ones. Fixtures that then fed a still-Immutable family
       reader (or the still-Immutable properties slice) a plain container crashed or silently
       missed. Recipes: seed from `getInitializedState()` (the mounts materialize each slice's
       own initial first — this is what production always does), or seed the WHOLE still-Immutable
       family value (`set(EXTENDED_REFERENCE_POINT, fromJS({...}))`), never a leaf through the
       absent spine. The properties normalization spec flipped meaning: the Immutable-materialized
       subtree it pins is now the dual-mode SAFETY NET's contract, not a live producer's.
    2. **Whole-root `toPlain` assertion masking**: `expect(toPlain(result)).toEqual(...)` used to
       deep-convert Immutable values a fixture had planted (an `fromJS` ObjRef passed where
       production passes a plain one); identity-on-plain-root stopped masking them. The fixtures
       now pass what production passes.
- **`State` became a CLOSED plain object type** (alias, not interface — the `^I[A-Z]` lint rule):
  no index signature, so a residual `state.getIn(...)` is a compile error on top of detector [H].
  Root keys mirror the 6.4 ownership inventory; leaves stay `any` until 7.3/10.8. The deliberate
  Immutable-root safety-net specs (lift_slice, insight/report pristine contracts, compose/combine)
  keep their Immutable fixtures behind `as unknown as State` — they now pin the SAFETY NET, which
  stays until Phase 10.
- **Deliberate behavior changes:** none user-visible. redux-logger's `stateTransformer` normalizes
  the mixed tree with `fromJS(s).toJS()` (a plain `toPlain` would stop at the plain root and log
  the branches as Immutable); it becomes redundant when the branches flip. The
  `immutable-devtools` hookup STAYS — the branches are still Immutable, so the formatting is
  still useful; it goes with the dependency at 10.12.
- **Audit script:** unchanged except the comment on `ROOT_MACHINERY_ALLOWLIST` — `initial_state.ts`
  stays listed, because it still BUILDS the Immutable branches. The branch path constants stay OUT
  of `FLIPPED_PATH_CONSTS`: they have not flipped. Audit at 0 end to end.
- **Deferred / follow-ups:** time-travel's module-level `pastStates`/`futureStates` arrays are NOT
  cleared on `RESET_FOR_PLUGGABLE_MOUNT` (pre-existing — the reset short-circuits the chain so
  `TimeTravelReducer` never sees it; Phase 8 should decide); dead `appState.header`/`brandTitle`
  seeds (10.8); `serializableCheck`/`immutableCheck` stay off until 7.3.
- **Gate:** build + build-check green, full suite 4,763 green, `validate` green end-to-end with
  the audit at 0. Full-e2e DIFF BASELINE: "Extended test (integrated)" run 31389911056 on
  a8529923b58 (the last pre-flip commit) — all `gdc-analytical-designer-harness` variants green.
  The §8 high-risk gate for THIS PR — full e2e run + manual embedded/undo/save/export smoke —
  runs on the PR itself before merge.

## Phase 7.2 + 7.3 — combined root & dissolution

Delivered as ONE PR on top of 7.1: the pre-combine contracts first, then the rewrite. Production
dispatch is now `preWrappers → combineBranch core → postWrappers` (root_reducer.ts).

- **`combineBranch`, deliberately not redux's `combineReducers` (yet).** Three transition-era
  reasons, each a bug class with the wrappers still writing foreign keys: redux's combiner
  silently DROPS every key it has no reducer for (the anti-key-drop contract in
  root_flip_contract.test.ts pins the survivors), throws on `undefined` returns (legacy writers
  store present-undefined through the shim, and `hasIn` distinguishes it from absent), and has no
  identity short-circuit at branch scope. Swap for the strict combiner when the last wrapper
  dissolves (Phase 10).
- **Wrapper placement was derived from action-overlap analysis, not position-copying.** A wrapper
  had to keep its side of the legacy order only against reducers REACTING TO THE SAME ACTION:
  PRE-core = TimeTravel (snapshots the pre-action state), appContext transformer (its resets must
  land before the report/execution slices write failure flags on top — the OPEN_REPORT_FAILED
  contract), router (cross-key route→previousRoute move), openReportApply (external writer of
  itemCache/dateDatasets/properties on FINISHED — the slices deliberately do NOT handle those
  actions, which is what makes the pre-core position safe). POST-core = the buckets-cluster
  reducers that read what the slices just wrote (`syncAfterSliceWrite` says it in the name),
  in their legacy relative order. If a future wrapper gains an action a mount also handles,
  re-run this analysis before placing it.
- **The extended reference point is the one key that must stay ABSENT until written.**
  properties_characterization pins a guard that distinguishes "no plug viz has reported yet"
  (absent → leave alone) from "one exists, even empty" (write) — so the first cut's
  self-initializing empty-Map holder was WRONG and came out again. Instead, the three
  formerly-unguarded deep writers (open_report ERP-properties write, openAsReportToggled uiConfig
  writes, buckets_service#validateVisualizationProperties) materialize the Immutable container
  first via `ensureExtendedReferencePointContainer` — without it, a deep write through the absent
  key under the now-plain `data` branch creates plain intermediates and the plug-vis round trip
  dies on `.set` (the 7.1 e2e class, re-armed at branch scope; pinned by the real-action
  materialization test).
- **Dissolution: pristine == initialized.** `initial_state.ts` is a thin accessor over
  `combinedRootReducer(undefined, INIT)`; every seed moved to its leaf's initial
  (reference_point_state.ts, buckets_cluster_state.ts — frozen, the loud-failure doctrine);
  the dead `header`/`brandTitle` seeds are gone (nothing read them); RESET_FOR_PLUGGABLE_MOUNT
  and store init short-circuit to a fresh build; `getInitializedState()` = the real reducer
  factory. The legacy "subtrees absent until the next dispatch" window no longer exists —
  pristine_state_readers.test.ts now pins that the pristine build serves the slice initials.
- **Deviations from the plan rows, with reasons:** `compose` survives as a TEST-ONLY helper — the
  ~30 per-domain mount entries (`store/<domain>/<domain>_reducer.ts`) still compose liftSlice
  mounts so the domain store tests can drive a domain in isolation; prod never imports them and
  the family dies together at 10.12 (`combine`/`applyReducer` ARE deleted, with data_reducer.ts).
  The router and appContext transformers did not "dissolve": both need cross-key/whole-root
  reads (previousRoute ← route; the reset functions), so they became the PRE-core wrappers the
  §4.4 end state calls `withAppReset` — they go with Phase 8/10. appState.meta is a nested
  combineBranch of the five embedding minis + drillableItems + postMessageContext rather than
  one folded meta slice (equivalent structure; the fold is optional 10.8 polish).
- **Action typing:** new infra avoids the deprecated `AnyAction`. Note `UnknownAction` is NOT a
  drop-in — the legacy hand-written action INTERFACES have no index signature and fail against
  it — so legacy-facing signatures (rootReducer, compose) take plain `Action` and the combiner's
  leaf entries take `any` (strictFunctionTypes would reject every narrow action union otherwise).
- **7.3 store changes:** `serializableCheck`/`immutableCheck` enabled with `warnAfter: 128`,
  `ignoredPaths` = the still-Immutable families (they leave the list as each flips, Phases 8–10)
  and `ignoreActions: true` (payloads carry Immutable values until then); `redux-validate-fsa`
  dropped (createAction guarantees FSA shape); `redux-watch` → `_infra/observe_store.ts` (same
  reference-equality semantics); both dependencies removed.
- **Behavior deltas, all in the "pristine shape" class:** slice subtrees exist with their initials
  on the pristine/post-reset state instead of materializing on the next dispatch (readers went
  through fallback accessors either way — same served values, pinned); `data.dragAndDrop` now
  self-initializes, which incidentally fixes the pre-existing §10 backlog crash (selectors
  composing `getDndState` threw on the pristine state); `data.visualizationClass` pristine value
  is the slice's `null` instead of undefined (readers normalize both — pinned in
  pristine_state_readers).
- **Gate:** build + typecheck green, full suite green, validate green with the audit at 0 (branch
  container consts moved to FLIPPED). Same §8 high-risk gate as 7.1: full e2e on the PR + manual
  smoke, with the plug-vis round trip (open insight, switch types, undo/redo/reset, save/export)
  as the focus.

---

## Phase 8.1 + 8.2 — time-travel redesign

Delivered as ONE PR. 8.2 was not a separate step in the end: narrowing the snapshot (8.1) left both
`updateHistory` callers with nothing to rewrite, so they were deleted rather than ported — the plan
row predicted the mechanism ("disappear by construction") but scheduled it as follow-up work.

Undo/redo is now `store/_infra/time_travel.ts`: a higher-order reducer wrapping the whole wrapper
stack, writing the two stacks into the root key `timeTravel`. `reducers/time_travel_reducer.ts` and
its module-level `pastStates`/`futureStates` are gone.

- **The snapshot is a DENY-list projection, not an allow-list.** The plan sketched
  `pick(state, UNDOABLE_SLICES)`. An allow-list has to enumerate every editable key correctly on
  the first try and the failure mode is asymmetric: an accidentally INCLUDED key restores a value
  that never changes mid-session (harmless — it is what the whole-root snapshot already did),
  while an accidentally EXCLUDED one silently drops a user edit on undo, with no crash and no
  failing test. `IUndoableState` (typings/state.ts) therefore omits `report`, `timezoneOverride`,
  `appState.messages` and `timeTravel`, and keeps everything else — including keys a strict
  reading would have dropped (`route`, `bootstrapData`, `featureFlags`), because that is the
  behavior undo has always had. Two unit tests pin the exact captured key set at the root and
  inside `appState`, so a root key added later still forces the decision to be made consciously
  rather than inherited silently.
- **The four exclusions ARE the four legacy restore fixups.** `copyMessages`,
  `copyLastSavedReportIfAny` and `copyTimezoneOverride` copied a live value back over a restored
  snapshot; excluding the key does the same thing by never capturing it. Only the two fixups that
  are not expressible as an exclusion survive (`clearCollapsedBucketsMeta`, `setDroppedItem(null)`).
  The same move deletes the `updateHistory` back door — the single place in the reducer layer that
  mutated module state — because `report` leaving the snapshot means a snapshot has no execution to
  go stale and no `lastSavedObject` to resurrect a deleted report from.
- **Two latent bugs died with the singleton, both of the "shared mutable history" class.**
  (a) `resetWholeApplication` (the router's project switch) wrote `appState.undo/redo = false` and
  left the stacks POPULATED — one edit in the new project re-enabled undo, and a second undo
  restored the previous project's buckets. With the flags derived from the stacks, the only way to
  express "no undo" is to clear the history, which is also the correct behavior. (b) Two stores on
  one page (a pluggable remount, or any test that built two) shared one history; the key is
  per-store state now, and `create_store.test.ts` pins it.
- **The flags were a type lie that is now true.** `undoPossible` was declared `boolean` but returned
  `undefined` until the first edit (the `appState.undo` holder started absent). It returns `false`
  now. The only externally visible consequence is in the postMessage `availableCommands` payload,
  where `isUndoAvailable`/`isRedoAvailable` change from omitted-when-unset to always present —
  a host reading either field sees `undefined` vs `false`, and every AD consumer already coerces.
- **`.match()` compares the type string ONLY.** Reading `action.payload.saveAsNew` after
  `saveReportFinished.match(action)` throws on any hand-rolled `{ type }` action — which the legacy
  reducer's `action?.payload?.x` had been quietly guarding. Every payload read in the wrapper keeps
  that guard, and the "leaves the state untouched for %s" test dispatches a bare `{ type }` for
  every non-undoable `ActionTypeKeys` value precisely to keep it honest.
- **The dev checks needed an escape hatch, for cost not correctness.** The history holds whole past
  states BY REFERENCE, so `immutableCheck`/`serializableCheck` would deep-walk every snapshot on
  every dispatch — O(history × state) per action, a frozen main thread in dev rather than a
  warning. RTK matches an ignored path EXACTLY and then skips the subtree, so the single entry
  `"timeTravel"` covers the whole history; the devtools get a `stateSanitizer` collapsing it to its
  stack depths for the same reason. `create_store.test.ts` asserts no `console.error` while the
  history grows, which is the only place a reducer mutating a captured branch would surface.
- **Batch-awareness moved to 9.1.** §4.5 wanted "one saga batch = one undo step". `enableBatching`
  wraps OUTSIDE the root reducer in `create_store.ts`, so a batch is unwrapped into individual
  dispatches before the wrapper sees anything, and no saga dispatches batches yet — the change
  belongs in the PR that introduces them, where the e2e undo specs can actually judge the
  granularity.
- **Dead code the redesign surfaced:** the legacy restore skipped `copyLastSavedReportIfAny` when
  the snapshot's `actionType` was RESET_APPLICATION — but RESET_APPLICATION is a history-CLEAR
  trigger, so no entry could ever carry it. The whitelist also listed
  `UI_RECOMMENDATION_CONTRIBUTION_IN_PERCENT` twice (a `Set` now, plus a no-duplicates test).
- **Characterization suite:** moved to `store/_infra/test/` with the code and re-pointed at the new
  accessors (`selectTimeTravel(state).past`, `undoPossible(state)`). Every semantic spec is
  unchanged. The two `updateHistory` specs could not survive the API they tested; they were
  replaced by the invariant that supersedes them — a superseded execution result and a report
  deletion leave both the live state and the history untouched (asserted on history IDENTITY, so a
  future reducer reaching into the history fails the test). The same substitution was made in
  execute_report_characterization (3 specs) and report_characterization (1 spec).
- **Gate:** build + typecheck green, full package suite green (4716 tests), validate green
  (lint/format/dep-cruise/provenance, audit at 0). Same §8 high-risk gate as 7.1: full e2e on the
  PR + manual smoke — the undo/redo/reset torture path, embedded-mode postMessage
  availableCommands, and a project switch followed by an edit + undo (the bug class (a) above).

---

## Phase 9 — why saga batching was not done

No code shipped from this phase; the plan section (§5, Phase 9) carries the decision and this note
carries what the investigation actually found, because the findings outlive the decision — anyone
reaching for `batchActions` in this codebase later needs them.

- **`enableBatching` unwraps inside the REDUCER, so sagas never see the inner actions.** It keys off
  `action.meta.batch === true`, not the type string (which is why named `@@AD.BATCH/*` types are
  free). The middleware chain — `sagaMiddleware` included — only ever sees the batch action itself,
  so `take` / `takeEvery` / `takeLatest` are blind to its contents. Batching an action a saga waits
  on throws nothing and logs nothing: the saga simply never wakes up. A blocked `take` hangs the
  feature forever; a `takeEvery` handler just silently stops running. The library's other export,
  `batchDispatchMiddleware`, is NOT an escape hatch — it re-dispatches each child individually,
  which removes the single-notification benefit entirely.
- **Two of the phase's own named targets would have hung production.** `open_report_sagas` blocks on
  `take(SAGA_CATALOG_LOAD_FINISHED)` in THREE places, dispatched by `loadCatalog` — the exact run
  9.1 was to batch (report opening hangs). `bootstrapData` needs BOTH
  `take(WORKSPACE_PERMISSIONS_SUCCESS)` and `take(STORE_FEATURE_FLAGS_DATA)` — an `all([...])`
  nested inside a `race({...})` against the error takes — and bootstrap was a 9.2 target, so
  batching either action hangs app startup.
  Both are the flows where a hang reads as "the app is broken", not "a feature misbehaved".
- **The tempting shortcut rule is FALSE.** "Only `STORE_*` actions are batchable, because §4.6 says
  sagas watch the `UI/*` / `SAGA/*` / `COMMAND/*` layers" — sagas demonstrably watch six `STORE_*`
  types and ~25 `creator.match` predicates. Any audit has to be mechanical, not convention-based.
- **A plain `yield take(` grep is not the audit.** It misses takes nested in `race({...})`, which is
  exactly how the bootstrap case is written. A scan has to cover `race`/`all` compositions too.
- **The benefit was costed against the wrong React.** The phase was sized in puts ("catalog 45,
  open_report 18") with the implied cost being that many render passes. On React 19.1.1 +
  react-redux 9.2.0, React auto-batches all updates including saga dispatches, so N puts in one run
  already coalesce into ONE render pass. What is left is N reducer passes + N subscriber-notification
  loops — real, but never measured, and not what the put counts imply.
- **It would also have added a silent failure to UNDO.** A whitelisted action inside a batch is
  invisible to the whitelist test in `withTimeTravel`, so the edit produces NO undo step at all.
  That is the batch-awareness item 8.1 deferred to 9.1; with the phase dropped it is simply not
  needed, and `store/_infra/time_travel.ts` documents the trap for anyone who revisits.
- **What the phase was implicitly carrying.** PRs 4.10 and 4.11 deferred the buckets-cluster
  cascades and referencePoint slice-hood to "Phase 9 batching". That work is real and independent of
  batching; it is re-homed as PR 10.9 (cascades → sagas with plain sequential puts) and PR 10.10 (the
  whole-application reset transformers + the strict `combineReducers` swap). PR 10.11 removes
  `redux-batched-actions` and the inert `enableBatching` wrap that PR 1.1 added for this phase.
- **When to revisit:** atomicity, not throughput. If a component subscribed to two slices is ever
  seen rendering on an inconsistent pair a saga produced mid-run — or a 10.9 cascade turns out to
  carry two whitelisted actions — the first-choice fix is ONE domain event action handled via
  `extraReducers` in each affected slice (the bootstrap fan-out / DELETE_REPORT_STARTED shape):
  atomic in one dispatch, saga-visible, one undo step, no new dependency. `batchActions` is the
  fallback only if assembling the payload before the dispatch is impractical — with the take-audit
  re-derived for the sagas involved, batch-awareness added to `withTimeTravel`, and the
  10.11-removed library re-added.

---

## Phase 10.1 + 10.2 — the shim-removal codemod

**Delivered as ONE PR** (branch `imj-stl-3150-p10-1-2`, ordered commits per item). The headline
number: `constants/state_paths.ts` went from **171 exported constants to 63**, and the 63 are one
entry per mount in `reducers/combined_root_reducer.ts`. The file's own header now says what it is —
the mount table, not the schema — and tells the next author that a new deep path belongs in the
owning domain.

### The split the plan got wrong (and why it does not matter)

The plan billed 10.1–10.2 as "codemods **per directory**". That is the wrong axis, and following it
would have produced two PRs that each half-migrated every family. A path constant and the readers
that use it do not live in one directory: `EXTENDED_REFERENCE_POINT_UICONFIG_BUCKETS` was read from
`selectors/`, `components/`, `services/` and `store/` — the constant only dies when ALL FOUR move.
The codemod is therefore split **by domain**: build the family's read layer, re-point every reader
wherever it lives, then delete the constants that hit zero. Commits: router → reference point /
properties → cross-domain consumers + the mount table.

If a future phase needs the directory framing, use it for the ORDER of domains, never for the unit
of work.

### What "typed slice selectors / property access" could and could not mean

Two thirds of the leaf paths pointed into subtrees that are **still Immutable**, and they do not
flip together: `report.lastSavedObject` in PR 10.6, `visualizationProperties` in 10.7, the reference
point and extended reference point in 10.9. Property access is not available in any of them, so a
naive reading of the plan row ("→ typed property access") would have stalled the whole phase behind
three later PRs — one of which (10.9) is an XL cascade dissolution.

The move that works for both cases:

- **Plain + typed subtree** → the leaf constants are DELETED and the domain's selectors read by
  property. `store/router/router_selectors.ts` is the reference: three input selectors (`route`,
  `previousRoute`, `appState.locationRedirectLock`) and every leaf an optional chain on
  `IRouteParams`. 32 route constants died.
- **Still-Immutable subtree** → the leaf paths MOVE OUT of the global schema into the owning
  domain's `*_paths.ts`, next to a `*_selectors.ts` that exposes one NAMED accessor per read. The
  reads stay dual-mode (`getIn`), so nothing about the container changes; what changes is that the
  family's shape has an owner and its readers no longer know where it lives. Precedent: the
  pluggable-visualization paths have been module-local since 4.11.

New path modules: `store/reference_point/{reference_point,extended_reference_point}_paths.ts`,
`store/properties/properties_paths.ts`, and — for leaves whose only remaining users are fixtures —
`store/{execution,report,embedding,intl,date_datasets,shortcuts}/*_paths.ts`.

**PR 10.9 inherits a much smaller job because of this.** The ERP flip used to mean editing ~40
reader files; it now means editing `extended_reference_point_selectors.ts`.

### The `notSetValue` defaults are a contract, and they are not all falsy

The single highest-risk part of the codemod. `getIn`'s `notSetValue` is EXISTENCE-based (see
`utils/state_access.ts`), and the call sites did not agree on it:

- `canStackInPercent` defaults to **true** — a visualization that never reported the flag can stack
  in percent. A falsy default silently disables the checkbox.
- `uiConfig.axis` defaults to **AXIS.PRIMARY**, not undefined.
- `optionalStacking.stackMeasuresToPercent` is read with an explicit `undefined` default because the
  caller distinguishes "not reported" from "reported false" (`lockedStackToPercent ?? persisted`).
- `visualizationProperties.controls.stackMeasures` falls back to a **uiConfig-provided** value, so
  the default belongs to the caller, not the accessor — which is why
  `getVisualizationPropertiesControl` takes `notSetValue` as a parameter.

Every default is reproduced verbatim in the accessor and commented where it is not the falsy one. If
you add an accessor, copy the default from the call site you are replacing; do not normalize it.

### Two type lies the codemod exposed

Typing a value that was previously read through an untyped shim is how you find out the type was
wrong. Both of these compiled clean for years:

- `IHashFragments["query"]` did not declare `explainType`, `asOfDate`, `thousandSeparator` or
  `decimalSeparator` — all four are read off `route.params.query` by the selectors. `parseQuery`
  returns whatever the hash carries, so they were always reachable; nothing had to name them while
  the read went through `getIn(state, ROUTE_EXPLAIN_TYPE)`.
- `ICustomRouteParams.showEmbedButton` / `.apiTokenAuthentication` were declared `boolean`, and the
  only producer (`getRouteParams`) copies raw URL query STRINGS into them. The runtime never
  changed — the sole consumer re-serializes them into a query string — but the declaration was
  fiction. Both are `string` now, like every sibling.

Expect more of these in 10.12/10.8: each one is a place where `any` or an untyped read has been
absorbing a mismatch.

### Deliberate behavior changes (both benign, both pinned)

- `isLocationChangeLocked` answers `false` instead of `undefined` for a hand-built fixture that
  predates the `appState.locationRedirectLock` key. The combined root owns the key
  (`holdSubtree<boolean>(false)`), so production always has it; both values are falsy.
- `getRouteParams`'s `reportId` fallback is `?? DEFAULT_REPORT_ID` rather than an existence-based
  `notSetValue`. No writer produces a present-but-undefined `reportId` (`storeRoute` always applies
  `defaults`, `withProjectId` writes only `projectId`), so the two are indistinguishable today.

### Fixtures: `withRouteParams`, not `setIn(state, ROUTE_PROJECT_ID, …)`

`mocks/route_mock.ts` is the pattern for the next phase's fixture work. Deep `setIn` over a leaf
constant was the only reason tests needed the constants at all; a typed patch builder
(`withRouteParams` / `withRouteQuery` + the `previousRoute` twins) says what the fixture means and
materializes the absent subtree the same way the legacy deep write did. It also caught a fixture
that was seeding `isEmbeddedFromKD` as a BOOLEAN into a field the selector compares to `"true"` —
the test had been asserting the right answer for the wrong reason.

### Gates

`rushx validate` green (lint / dep-cruise / stylelint / format / locales / provenance), the
provenance audit at **0 findings**, and the full suite green — **4721 passed / 397 files**, twice
(after the domain read layers, and again after the mount-table trim). Two lint rules to know about
before you write a domain read layer: `no-barrel-files` forbids re-exporting a type through a
selectors module (import it from the owning domain), and `no-duplicate-imports` will catch the
second import you add to a module you already import from.

The audit script's own subtree classification lists (`FLIPPED_PATH_CONSTS` /
`IMMUTABLE_PATH_CONSTS` in `scripts/audit-immutable-provenance.mjs`) are keyed BY CONSTANT NAME, so
renaming a path constant silently reclassifies its readers to UNKNOWN. They were updated with the
codemod; do the same in 10.9 when the ERP paths flip to `FLIPPED_PATH_CONSTS`.

### The gap this PR found: a whole axis the plan never tracked

Reviewing the shim surface surfaced something bigger than the codemod. **Six containers are still
Immutable, and only ONE of them had a plan row.**

The plan tracked one thing per domain — _did it become a slice?_ — which is §6's "Slice PR" column
and the (then) 44-item count. All 39 delivered items are that axis and every one is genuinely done.
Container SHAPE is a second, independent axis, and it was a plan item exactly once: row 4.11, THE
BUCKETS FLIP, explicitly scoped to `data.buckets`/`bucketsMeta`. The other five flips were promised
in **code comments** instead:

> _"the container flip rides along with the decorated models and the buckets cluster in 4.9–4.11"_
> — `properties_state.ts`, and near-identical sentences in `item_cache_state.ts`,
> `report_state.ts`, `date_datasets_state.ts`. `visualization_classes_state.ts` named no phase at all.

A sentence like that reads as a commitment but has **no checkbox, no owner and no gate**. When 4.11
shipped, the buckets flip was the deliverable and the passengers were never counted — so no box went
un-ticked and the item total never included them. Nothing regressed; they were never scheduled. Row
10.12 ("remove the `immutable` dependency") had been written assuming its precondition would arrive as
a side effect of work that was never scoped to deliver it.

Fixed here, doc-and-comment only:

- **Phase 10 gains rows 10.3–10.7**, one per still-Immutable CONTAINER: itemCache → dateDatasets
  items → visualizationClass(es) → lastSavedObject → visualizationProperties. They land before 10.8
  so the consistency pass runs on already-plain containers, and removing the dependency moves to
  10.12, last.

    **They are containers, not models — Phase 3 is complete and does not reopen.** The first draft of
    these rows opened with a "decorated models → plain" PR, on the theory that the models were the
    shared currency the containers were shaped by. That is backwards twice over, and it is worth
    recording because it is an easy wrong model to re-derive.

    First, Phase 3 already did the model work — ALL of it. 3.1–3.4 converted every model from an
    Immutable Record to a plain interface (#11477, #11481), and the reviewer's challenge was exactly
    right: there is no model left unconverted.

    Second, the direction of causation runs container → model, not model → container. What is still in
    `src/models/` is **transition scaffolding** — code that exists only because a container it reads has
    not flipped, and that a flip DELETES rather than converts. Three shapes, all subtractions:

    - a `fromJS` keeping a plain value container-uniform with the Immutable value it is merged into.
      `decorated_bucket_item.ts` says it in its own comment: _"The bucket item is PLAIN since 4.11 while
      the itemCache entry is Immutable; `merge` does NOT convert the incoming values, so without fromJS
      the merged keys would carry plain values inside an Immutable container"_ — the 4.11 geo/raw-export
      crash. Flip the itemCache and the `fromJS` is deleted; the merge is plain-into-plain.
    - a dual-mode guard tolerating both containers — `isImmutable(x) ? toPlain(x) : x` in `bucket_item`,
      which collapses to its else branch.
    - an invariant asserting the container — `models/item_cache.ts`'s `invariant(Map.isMap(items))`.

    `.original` is not even in this category anymore: 4.11 flipped buckets and the audit's
    `PLAIN_PROPERTY_SOURCES` treats it as plain. The one genuine exception is `models/metadata.ts`,
    whose `reduceBuckets` returns `List<Map>` BY CONTRACT for the MD round trip — that is an interface
    decision to make in 10.6, not scaffolding to delete.

    The flips are INDEPENDENT of one another, ordered by blast radius rather than by dependency.

    **The authoritative inventory of what is still Immutable is `create_store.ts`'s
    `IMMUTABLE_FAMILY_PATHS`, not a grep.** This is the single most useful thing in this note for
    whoever picks up 10.3–10.12. That array is the list of paths RTK's dev `serializableCheck` /
    `immutableCheck` are told to skip, which means it is self-enforcing in the other direction: anything
    Immutable that is NOT on it makes the dev checks fire. A grep of `*_state.ts` does not have that
    property, and the first draft of rows 10.3–10.7 was built from exactly such a grep — which is how it
    missed four paths, because **they are `holdSubtree` leaves with no state module to grep**:

    - `data.measuresDateDatasets` — the container is plain (7.1) but the STATUSES inside are
      `fromJS`-built (`measure_date_datasets_service.ts`), so it is a MIXED container and `toPlain` on it
      is not identity. Folded into 10.8 with the domain's RTK-ification.
    - `data.postponedAction` — `fromJS(applyMetricPostponedShortcut(item))`, read back with Immutable
      getters by `sagas/postponed_action_sagas.ts`. Folded into 10.9 with the shortcuts cascade.
    - `data.attributeElements` — SUSPECTED STALE: plain interfaces (`IAttributeElement {uri, title}`) and
      a plain reducer since 3.2, with no Immutable writer anywhere in the domain.
    - `data.shortcut.shortcutDroppedItem` — SUSPECTED STALE: its writer takes
      `Record<string, any> | null` and the catalog is plain, but `getDroppedCatalogItem` is still TYPED
      `IImmutableBucketItem`, a 4.11 naming fossil. The type is the only evidence for the entry.

    10.8 owns verifying the two suspects. **The verification has a trap:** an ignored path whose value is
    absent or empty never trips `serializableCheck`, so removing the entry and watching a green test run
    proves nothing. Exercise a flow that POPULATES the value. (Tried during this PR: removing both
    entries and running the store/shortcuts/catalog suites produced no warning — which is exactly the
    inconclusive result the trap predicts, so the entries stayed.)

    **`timeTravel` is on that list forever and must not be removed** (8.1): it is a PERFORMANCE
    exclusion, not an Immutability one — the history holds whole past states by reference, so the dev
    checks would deep-walk every snapshot on every dispatch, O(history × state) per action. That is a
    frozen main thread in dev, not a warning. So 10.12 REDUCES the array to `["timeTravel"]`; it never
    empties it, and "the list is gone" is not the definition of done.

- **§6 gains a "Container plain" column**, because a domain can be a fully migrated slice AND still
  hold an Immutable value; both facts now have to be visible at once.
- **Item total 44 → 49, progress 89 % → 80 %.** Booking the correction now beats discovering it when
  10.12 fails to start.
- **Every stale `4.9–4.11` pointer in the SOURCE and in the plan corrected** (22 of them — the slice
  states, the apply reducers, `store/types.ts`, §6 rows and the §10 backlog): each now names the row
  that actually does the work, 10.9 for the cascade dissolutions and 10.3–10.7 for the flips. The
  ones inside delivered phases' notes deliberately stand — see the box at the top of this file.

One ordering constraint fell out of putting the flips before 10.8, and therefore before 10.9:
`report_visualization_selector` does `referencePoint.set("properties", properties)`, so flipping
properties (10.7) while the reference point is still Immutable plants a plain value inside an
Immutable container — the audit's `[D]` mixed-container producer class, which is precisely the 4.11
geo/raw-export crash. 10.7 must mirror at that write site (`mirrorToContainer`, the pattern
`buckets_service` already uses for totals) rather than assume 10.9 has run. The other three flips do
not feed the RP container.

**The generalizable lesson, and it is the same one 10.1–10.2 hit twice:** a plan row must match the
unit of work. "Codemods per directory" did not match how a path constant's readers are distributed;
"rides along with phase X" did not match anything at all. If a deliverable cannot be ticked
independently, it is not in the plan — it is a hope in a comment.

### Deferred, on purpose

- The transitional cross-domain reducers (`bucketsApplyReducer`, `app_context_transformer`,
  `properties/shortcuts/recommendations/arithmetic-measures/bucket-filters` apply reducers,
  `open_report_apply_reducer`, `execution_apply_reducer`) keep their root-state `getIn`/`setIn`. They
  dissolve wholesale in PR 10.9/10.10 — rewriting their reads now would be work thrown away. They do
  import their paths from the owning domain, so the schema move is complete regardless.
- The remaining `getIn(state, DOMAIN_MOUNT_PATH)` reads inside each domain's OWN selectors are the
  `sliceSelector` pattern (§7 recipe item 5), not shim debt. They are the one read per domain the
  recipe asks for.
- `models/metadata.ts`'s `getIn(data, [...])` calls take a metadata bag, not root state — out of
  scope here; they go with the metadata models.

---

## Phase 10.3 — the itemCache flip

**Delivered as ONE PR** — `data.itemCache` is a plain object of plain entries, and with it the last
container the buckets cluster shared with the catalog. The §8 high-risk gate (full CI e2e + manual
smoke) applies before merge: the flipped value reaches the bucket items, the catalog list, drag &
drop, the filter bar, the metric editor and the postMessage filter API.

### The compiler was the discovery tool, not the grep

The provenance audit reported **0 findings** before this PR and 0 after, and that is not a
contradiction: the audit classifies _provenance-ambiguous_ receivers (shim reads, `any`-typed
carriers). Every itemCache read was already TYPED — as `IImmutableCacheItems`, `IImmutableCatalogItem`
or `unknown` — so the grep-shaped detectors had nothing to catch. What found the work was 4.11's
types-first rule: redefine the family as plain interfaces, run `tsc`, and read the errors as the
worklist. That produced **279 errors across 30 production files and 30 test files**, which is the
whole sweep, enumerated, before a single runtime line changed.

Two decisions made the compiler that sharp:

- **No index signature on `ICatalogEntry`.** `IRawBucketItem` (4.11) carries `[key: string]: any`,
  and that signature silently absorbs `entry.get("x")` — the index type makes `.get` an `any` that is
  callable. Declaring the union of real fields instead means `tsc` rejects every Immutable idiom on an
  entry. The cost is real (fixtures with invented fields need a local cast) and worth paying once.
- **Collapsing three names into one.** `IImmutableCacheItem` was an Immutable `Record` class whose
  field list was fiction (the cache stored `fromJS`-built `Map`s, never `Record`s);
  `IImmutableCatalogItem` was `Map<string, any>`; the decorated item's `attribute` was `unknown` with
  a documented cast at each reader. They always described ONE currency — `getAttributeByIdentifier`
  returns a cache entry or the synthetic date item, and the catalog list feeds its own items to the
  same consumers through drag & drop. One interface, `ICatalogEntry`, named for what it holds rather
  than where it happens to live.

### `mergeDeep` is not `lodash.merge` — measured, not assumed

The write path had to reproduce `cache.mergeDeep(fromJS(items))` over plain values. `merge({}, cache,
items)` looks like a drop-in and fails on both axes that matter, verified against Immutable 5.1.6:

| case                      | Immutable `mergeDeep` | lodash `merge`      |
| ------------------------- | --------------------- | ------------------- |
| `["a","b","c"]` ← `["z"]` | `["a","b","c","z"]`   | `["z","b","c"]`     |
| deep-equal no-op merge    | returns `this`        | always a new object |

The array behavior is a pinned characterization (`displayForms` concatenate — a pre-migration quirk),
so lodash's index-merge would have silently changed it. The identity behavior is §7's idempotence
gate: an always-allocating merge dirties the subtree on every dispatch and invalidates every memoized
selector hanging off it. The delivered `mergeItemsIntoCache` therefore uses `mergeWith` + a
`concatArrayFields` customizer for the recursion, plus an explicit per-entry `isEqual` guard and a
`changed` flag for identity — and stays a PURE function whose result the case reducers RETURN. The
plan row predicted "both cases become ordinary mutations"; returning an unmodified draft is immer's
own no-change signal, so the pure form keeps the root reference that a mutating deep merge would
lose. Two specs pin it (`item_cache_store.test.ts`): the cache reference survives a deep-equal merge,
and an untouched entry keeps its reference when a sibling changes.

One residue, stated rather than fixed: lodash SKIPS `undefined` source values where `mergeDeep`
stores the key with `undefined`. Indistinguishable to every reader, and no producer sends one.

### What the flip DELETED

Every item below is scaffolding that existed only because this container had not flipped — the row's
claim held up:

- `models/item_cache.ts`'s `invariant(Map.isMap(items))` — an assertion about the CONTAINER, so it
  died with it rather than becoming a plain-object check that only restates the parameter type;
- the three `fromJS` wraps in `getAttribute`'s merge (`displayForm`, `dfRef`, `areaDisplayFormRef`).
  They kept an Immutable entry container-uniform when plain bucket-item values were merged in — the
  4.11 geo/raw-export crash class. Plain-into-plain cannot mix provenances;
- `createDateItem`'s `fromJS` — the synthetic entry imitates a cache entry, so it flips with it;
- **three `fromJS(item)` PRODUCERS that were never about the cache at all**: `CatalogList` (×4),
  `MeasureAttributeListItemOrganized` and `MeasureDateFilter#setSelectedPreset` wrapped PLAIN values
  so that shared consumers (`CatalogItem`, `CatalogDetailsBubble`, `getAddedMeasure`) could keep
  reading with `.get()`. Converting those consumers is what let the producers go — and it removed an
  Immutable value that was being stored into `data.dragAndDrop`, a subtree the dev checks do NOT
  exclude.

`§3.4`'s "getAttribute / getAttributeByIdentifier keep their Immutable-in/Immutable-out contract" is
retired with them: that contract existed BECAUSE this container did.

### Three type lies the flip exposed

Typing a value that was read through `unknown`/`any` is how you find out the type was wrong. All
three compiled clean for years:

- **`getMetricsInBucket` claimed `IDecoratedBucketItem[]` and returns RAW bucket items**
  (`store/metric_editor/metric_editor_sagas.ts`). Both consumers read `.attribute` as an identifier
  STRING, which is what a raw item carries; a decorated item's `attribute` is the cache ENTRY. The
  4.11 corollary — "check WHICH family a file consumes before re-pointing it" — with the families
  swapped.
- **`models/metadata.ts#setSelectedDisplayFormFromVisualizationObject` was typed with the STATE
  family** while `metadataToBuckets` re-converts its whole `additionalData` with `fromJS`. It
  consumes an MD-OBJECT value and stays Immutable until 10.6; it now says so
  (`typings/metadata.ts#IImmutableMdCacheItem` exists for exactly this).
- **`getMetricFilterParams` (telemetry) reads `["id"]` off a payload no producer keys that way.**
  The date preset arrives as `{ identifier: DATE_DATASET_ATTRIBUTE, interval }`; the attribute-list
  items carry `identifier` too. So both metric-date-filter events have been silently dead, and only
  the test fixture — a hand-built `Map({ id: … })` — kept them green. **This one is a FIX, not a
  migration step**, and it is called out here rather than folded in silently (§7).

### Fixtures: the flip's real blind spot, again

`tsc` cleared production before a single test was touched; the suite then failed **68 tests across 27
files**, and every one was a fixture seeding the old container. The single highest-leverage instance:
`mocks/decorated_bucket.ts` passed `fromJS(itemCache)` into the shared decorated-bucket mock, and
`constants/test_mocks.ts` typed the mock `any` — so `tsc` could not see it and roughly a third of the
failures traced to that one line. Both are now plain and TYPED (`ICatalogEntries`), which is the
durable fix: the `any` is what allowed the drift.

Fixture defects the sweep surfaced, all pre-existing:

- decorated-item fixtures with `attribute: "some.identifier"` (a raw item's shape) in six places in
  `bucket_rules.test.ts` alone, plus `chart_sort_bucket_items` and the ERP saga test;
- `item_cache_selector.test.ts` seeded an ARRAY of entries into a keyed cache — it only worked
  because `Map.find` iterates values;
- `MeasureValueFilterItem.test.tsx` seeded `{ metric: { <id>: … } }`, a shape the `metric.<id>` lookup
  could never find;
- display-form fixtures keyed `identifier` where `ICacheItemDisplayForm` declares `id`;
- `bucket_reducer.test.ts`'s `isLocationIconVisible?: string` helper param (the field is a boolean).

Two 4.11 regression specs were INVERTED rather than deleted — they pinned that the geo overrides were
Immutable after the merge; they now pin that nothing the merge produces is Immutable. Same crash
class, asserted from the other side (`decorated_bucket_item.test.ts`, `decorated_bucket.test.ts`).

### The buckets family rename rode along

`IImmutableBucketItem(s)` / `IImmutableBucket(s)` → **`IRawBucketItem(s)` / `IRawBucket(s)`** across
73 files. That family has been plain since 4.11, which deliberately kept the fossil names "until the
Phase 10 rename sweep" so its own diff stayed a container swap. This is that sweep. `IRawBucketItem`
already existed as a module-local interface in `drill_down_selectors.ts` describing a cache entry
with a title — renamed to `ITitledCacheEntry`, which is what it is. The MD family keeps its
`IImmutableMd*` prefix because it is still true.

### Deliberate behavior changes (both benign)

- `getCacheItemByDisplayFormRef` returns the STORED entry instead of a deep `toPlain` copy. Readers
  only read it; the immer-frozen state makes an accidental mutation throw loudly rather than silently
  diverge.
- `getAttribute` short-circuits to the stored entry when there are no decorations (`Map.merge({})`
  answered `this`), so the common undecorated read no longer allocates.

### Gates

`rushx validate` green (lint / dep-cruise / stylelint / format / locales / provenance), the provenance
audit at **0 findings** with `ITEM_CACHE` moved from `IMMUTABLE_PATH_CONSTS` to
`FLIPPED_PATH_CONSTS` (so an Immutable idiom on a cache value is now reported RED, not filed for
later), `tsgo -p tsconfig.json` clean, and the full suite green — **4723 passed / 397 files**.
`data.itemCache` is out of `create_store.ts`'s `IMMUTABLE_FAMILY_PATHS`, which re-enables both RTK dev
checks on the subtree. While updating the audit script's classification lists, one stale Phase 10
pointer was corrected: the `DATE_DATASETS_` comment named 10.3 for the date-datasets flip, which is
10.4.

### Deferred, on purpose

- `models/item_cache.ts` has no production consumer left (`save`/`load`/`loadWithDefault` are
  test-only since the domain got its slice in 4.5). Deleting it is not forced by the flip — filed for
  10.8's dead-code pass.
- The `getImmutableBucketItems` / `immutableBuckets` VARIABLE and function names still carry the
  fossil word. The type family is renamed; the identifier sweep is mechanical and belongs with
  whichever PR touches those call sites (10.9 moves most of them).
- `SimpleBucketItem`'s `?? getIn(bucketItem, ["attribute", "isLocationIconVisible"])` fallback is
  preserved verbatim through the shim. On a cache entry `attribute` is a STRING, so it has always
  resolved to `undefined` — deleting it is a behavior claim this PR does not need to make.

---

## Phase 10.4 — the dateDatasets flip

**Delivered as ONE PR** — `data.dateDatasets.available` / `allItems` are plain arrays of plain
`IDateDataset`s. The flags were plain since 4.5, so this closes the domain:
`IDateDatasetsState extends IDateDatasets` is now literal — the stored value IS the plain read
shape.

### The compiler found the readers; the path-constant grep found the fixtures

Same split as 10.3, with the roles sharpened. Deleting the three type aliases
(`IImmutableDateDataset(s)`, `IImmutableDecoratedDateDataset`) produced **38 errors across 8
production and 11 test files** — the reader worklist, enumerated before any runtime change. But
SEVEN fixture seeds never appeared in it: an untyped `setIn(state, DATE_DATASETS_AVAILABLE,
fromJS(...))` has no type to break, so `tsc` is structurally blind to it (the 4.11 §8 lesson in
its purest form — no `any` needed, the shim's signature absorbs everything). Those came from
grepping the domain's PATH CONSTANTS across test files. In a flip PR, run both sweeps; neither
subsumes the other. The largest single seed was shared: `test_mocks#setupAppStateWithDateDatasets`
fed four component suites Immutable items from one line.

### What the flip DELETED

- `DecoratedDateDatasets.createFromImmutable` → `createFromDateDatasets` — its
  `getIn(...).map(...).toArray()` was one of the four §10 latent readers (`toArray is not a
function` on a plain list, `.map` throw on an `undefined`-valued `allItems` key);
- `DecoratedDateDataset.createFromImmutable` collapsed into `createDecorated` — with plain items
  the dual-mode constructor and the plain one had become the same function; `plainRef` died with it;
- `date_dataset.ts#toItemList`, the kind-check boundary tolerating array | List | keyed-Map — every
  producer is typed plain now, so absence (`?? []`) is the only case left;
- the `fromJS` wraps in the slice's shallow merge, `date_datasets_service#fromMeta`, the
  open-report and shortcuts apply writers, and `buckets_service`'s `{used}` builders
  (`getImmutableUsedDateDatasets*` → `buildUsedDateDatasets*`, returning plain
  `IUsedDateDatasets` — `selected_date_datasets_selector`'s Immutable `.set("available", …)` on
  that value became a spread);
- `DateDatasetsService.getDateDatasets`, the accessor returning the container cast
  `as unknown as IImmutableDateDatasets`. §10 called the cast out by name: it is what let a new
  `.get(…)`/`.size` reader compile clean and crash. Its three consumers read
  `getPlainDateDatasets` now.

`date_item.ts`'s `fromJS`, named by the plan row, was ALREADY gone — it imitates an itemCache
entry, so it flipped with 10.3 (that delivery note says so). The row's claim was one PR stale.

### The four §10 latent readers, closed

Three `.size > 0` sites (`recommendations_selector` ×2, `catalog_selector`) read `.length` — the
type flip forced them, since `.size` on `IDateDataset[]` no longer compiles. The fourth,
`shortcuts_selector`, had been hardened with dual-mode `count()` in the meantime; it reads plain
`.length` now and the shim call is gone. The meta selectors' `?? fallback` (the #11767 shape that
escaped to a customer-visible critical once) fires on the value's KIND now: a value whose `items`
is not an array falls back to the initial state instead of passing `{}` through AS the array.

### `getPlainDateDatasets` returns the state itself

The memoized `fromJS(dateDatasets).toJS()` copy existed to normalize the mixed container; with the
mix gone it would be a per-change deep allocation for nothing. The accessor now hands out the
stored (immer-frozen) state — the 10.3 `getCacheItemByDisplayFormRef` precedent: readers only
read, and an accidental mutation throws loudly in dev instead of silently diverging. One §7 gate
check this forced: `constructVisualizationMDObj` used that copy as a defensive clone before
`filtersToMetadata` — verified read-only, so the clone is not replaced.

### Typing the model closed a latent import cycle — in the TYPINGS file

`typings/datasets.ts` had imported `IDecoratedDateDatasets` from `models/date_dataset.ts` (for
`ISelectedDateDatasets`) since before the migration; the model never imported back, so no cycle —
until this PR typed `decoratedDateDataset(item: IDateDataset)` and dep-cruise's `no-circular`
fired. The fix moves `ISelectedDateDatasets` INTO the model: it composes the DECORATED shape, so
it belongs with it, and the dependency between the two files is one-directional again
(model → typings). The general shape to watch: a `typings/` file that imports from `models/` is a
cycle waiting for the first flip that makes the model want its state types back.

### MD-boundary comments had to stop claiming a retired contract

`models/metadata.ts#findItemInDateDatasets` carried "dateDataset ITEMS are Immutable by contract
until that subtree flips" over its `.map`/`.set` pipeline. The subtree flipped and the pipeline is
STILL correct — because its values never came from the state directly: every caller passes
`additionalData` through a deep `fromJS` boundary (`metadataToBuckets`, `buckets_selector`'s
`bucketsToMetadata` input), which converts plain arrays to Lists just as it used to preserve
Immutable children. The comments now name the fromJS boundary as the provenance, not the state
contract — a "still Immutable during the transition" comment goes stale the instant the container
flips (§7), and this was the only one the sweep found still lying.

### Deliberate behavior notes (all benign)

- The slice's shallow merge stores payload values VERBATIM and stays unguarded, like the legacy
  write (which always allocated a fresh `fromJS` value): `dateDatasetsUpdated` is saga-dispatched,
  never fired from a render path, so the §7 idempotence class does not apply.
- `getPlainDateDatasets` gained reference stability (the state, not a fresh copy) — strictly fewer
  re-renders for its `createSelector` consumers.
- `shortcuts_apply_reducer` passes the first available dataset's plain `ref` to
  `setBucketItemsDateDataset` directly; the `fromJS` that "restored the legacy Map shape" fed a
  write site that `mirrorToContainer`s to the plain buckets anyway.

### Fixtures

Two specs were INVERTED rather than deleted (the 10.3 pattern): the store suite's "keeps the items
Immutable while the flags stay plain" pins the opposite now, and `data_characterization`'s
container spec asserts `isImmutable(...) === false` on both the stored list and the service
read. The #11767 keyed-Map specs could not be inverted — their INPUT is unrepresentable in the
typed plain world — so they were rewritten to pin the surviving failure mode: absence decorates to
no items instead of throwing. The `date_datasets_plain_readers` regression suite (4.5's `.toJS()`
crash class) kept both end-to-end assertions over plain seeds.

While sweeping, one stale 10.3 pointer was corrected (that PR's own precedent):
`store/types.ts` still annotated `itemCache` as "still an Immutable Map through 4.5".

### Gates

`tsgo -p tsconfig.json` clean, full suite green (**4722 passed / 396 files**),
`rushx validate` green (lint / dep-cruise / stylelint / format / locales / provenance) with the
audit at **0 findings** — `DATE_DATASETS_`
moved into `FLIPPED_PATH_PREFIXES` and the bare `DATE_DATASETS` mount constant into
`FLIPPED_PATH_CONSTS`, so an Immutable idiom on any of the domain's paths is now reported RED.
`data.dateDatasets` is out of `create_store.ts`'s `IMMUTABLE_FAMILY_PATHS`, re-enabling both RTK
dev checks on the subtree.

## Phase 10.5 — the visualizationClass(es) flip

**Delivered as ONE PR** — `data.visualizationClasses` is the plain sdk-model payload array stored
VERBATIM; `data.visualizationClass` is a plain `IVisualizationClass` (or null). The first flip
whose plain shape needed NO local model: the stored value IS `@gooddata/sdk-model`'s
`IVisualizationClass`, so `typings/visualization_class.ts` and both `IImmutable*` aliases are
deleted outright instead of being renamed or collapsed.

### The dead telemetry read a bear-shaped fixture kept green

`middleware/log_formatters.ts#getVisualization` (the splunk formatter for
`BUCKETS_SELECT_VISUALIZATION_TYPE`) read `getIn(["content", "url"])` — the BEAR wrapping. The
payload has been SDK-shaped (`visualizationClass.url`) since the classes started coming from
`backend.workspace(...).insights().getVisualizationClasses()`, so `adi-event-visualization-changed`
has logged `visualization: undefined` in production for years. It never failed a test because
`log_formatters_fixtures.ts` seeded bear-shaped `{content, meta}` Immutable Maps — the fixture
class in its purest form: the fixture didn't just keep the wrong CONTAINER alive, it kept the
wrong SHAPE alive. The formatter reads the sdk shape now and the fixtures are plain sdk-shaped;
the test assertions ("bullet", the pluggable script URL) are unchanged and now pin the actual
production behavior. Deliberate behavior change: the event carries a real visualization type again.

### `isEqual` is the contract, reference identity is a coincidence

The two Immutable `is()` sites (`reset_button_selector#isDefaultVisualizationClass`,
`VisualizationPicker`) read lodash `isEqual` now. On the slice path the stored selected class IS an
element of the stored list (both mini-slices read the same payload, and
`getDefaultVisualizationClass` returns a list element), so `===` would pass today — but the three
external writers (open_report, app-context reset, `SELECT_VISUALIZATION_TYPE`) re-derive the value
through `find()`s and component props, and nothing pins that they always hand back the same
reference. Equality-by-value is the semantics the legacy `is()` guaranteed, so it stays the
contract; the store test pins the reference-sharing as a fact, not a promise. The
`?? undefined` normalization survives verbatim: `isEqual(null, undefined)` is FALSE exactly like
`is(null, undefined)`, and the empty-state leaf is null while the computed default is undefined.

### Why tsc cannot see these fixtures — two distinct holes

The type-flip sweep (deleting the aliases) found the production readers, including two
`visClassRaw.toJS()` calls in `insight_selectors` the name-grep sweep had missed. The fixture
sweep again had to be a PATH-CONSTANT grep, and this PR can name the two STRUCTURAL reasons the
compiler is blind, beyond the shim's untyped `setIn`:

- an explicit `any` on the fixture (`const bucketItem: any = newDecoratedBucketItem(...)` in
  `ConfigurationCheckboxes.test.tsx`) — nothing downstream is checked;
- **an all-optional interface with an index signature is container-blind**: `IRawBucket` /
  `IRawBucketItem` have only optional properties plus `[key: string]: any`, so an Immutable `Map`
  STRUCTURALLY SATISFIES them — `createDecoratedBucketsMock([fromJS({...})])` type-checks clean
  with the wrong container inside. Any future flip whose plain type has that shape gets NO
  compiler help at all; the grep sweep is the only net.

### Rider: six buckets-domain fixture files flipped (review finding)

Review flagged `fromJS` fixtures in six component test files outside this domain — all seeds of
values that have been plain since 4.11 (raw buckets, decorated `original`s) or 10.3 (drag
payloads): `Bucket`, `BucketItem`, `BucketItemPure`, `ConfigurationCheckboxes`,
`ArithmeticMeasureBucketItem`, `MeasureFilters` tests. All six flipped plain and pass — the
components read them through the dual-mode helpers, so these were latent old-container seeds, not
live bugs. They ride along here rather than waiting for 10.12 because the audit's by-name pass
cannot see them (the hole above).

### Deliberate behavior notes (all benign)

- `getEnabledVisualizationClassesUrls` and the enabled-classes filter allocate plain arrays
  instead of `toPlain` copies of Lists — same values, fewer conversions; both stay memoized.
- `insight_selectors#getVisualizationClass` returns the stored class BY REFERENCE (the
  10.3/10.4 accessor precedent) instead of a `?.toJS()` copy per change, and its type is honest
  about `undefined` now.
- `constructVisualizationMDObj`'s `(visualizationClass ?? Map()).getIn(...)` became optional
  chaining; the `?? Map()` existed only because the accessor yields null, which a default
  parameter does not catch — `?.` yields the same `undefined` uri for the MD object.
- The two mini-slices share references on the store path (list element = selected class) where
  the legacy slices deliberately converted the payload twice into equal-but-distinct Maps.

### Fixtures

The store suite's "stores the classes as an Immutable List" spec was INVERTED (the 10.3/10.4
pattern) to "stores the plain payload array" and pins storage-by-reference;
`data_characterization`'s container spec asserts `Array.isArray`. The vis-class seeds swept in
sixteen more test files (the multi-line `fromJS({...})` form needed a paren-balancing pass — a
single-line grep missed six of them, which the test run then caught as `visClassUrl` crashes).
`export_selector`'s deep write `setIn([...VISUALIZATION_CLASS, "visualizationClass"], fromJS(...))`
became a whole-leaf plain seed — a deep write into the now-plain leaf would have built a mixed
container.

### Gates

`tsgo` build + check clean, full suite green (**4722 passed / 396 files**), `rushx validate`
green with the provenance audit at **0 findings** — `VISUALIZATION_CLASS` / `VISUALIZATION_CLASSES`
moved from `IMMUTABLE_PATH_CONSTS` to `FLIPPED_PATH_CONSTS`, so an Immutable idiom on either path
is RED now. Both leaves left `create_store.ts`'s `IMMUTABLE_FAMILY_PATHS`, re-enabling the RTK dev
checks on them.

## Phase 10.6 — the lastSavedObject flip

**Delivered as ONE PR** — `report.lastSavedObject` is a plain `IReport`
(`typings/report.ts`: the bear visualization-object shape with `meta: Partial<IObjectMeta>` and a
nullable `content`), and the whole MD-OBJECT family flipped with it. `models/metadata.ts` — the
largest single Immutable consumer left, ~93 sites — lost them all in one pass: `makeImmutable`
is deleted, both transform directions (`bucketsToMetadata`, `metadataToBuckets`) consume and
produce plain values, `prepareForComparison` is a plain pipeline, and
`getNewReportMDObject`/`getVisualizationForExportFromInsight`/`getMetricMDObject` build plain
objects. `typings/metadata.ts#IImmutableMd*` and `typings/report.ts#ImmutableReport(Content)` are
deleted; consumers type against `typings/bear/bearTypes.ts` directly.

### Why the whole family flipped in one PR, not consumer-by-consumer

The plan said "flip those consumers first, then the container." In practice there was no
consumer-first seam: `reduceBuckets`' `List<Map>` output was Immutable BY CONTRACT because
`constructVisualizationMDObj` fed it to `fromJS` and `getMetricMDObject` `.toJS()`-ed it — every
boundary existed only to keep the next one Immutable. Flip any single stage and every neighbor
needs a conversion shim that the next PR deletes again. The one-PR flip removes the contract
instead of relocating it; the types-first sweep (delete the aliases, follow tsc) enumerated the
production surface in six files, and the rest was the fixture sweep.

### Two provenance boundaries deliberately stay dual-mode

The MD pipeline's inputs are NOT uniformly plain, and the flip had to say so explicitly:

- **decorated `original`s mix provenances.** Through `currentReportMDObjectExtended` the
  decorated buckets wrap EXTENDED-REFERENCE-POINT items, and the ERP family is still Immutable —
  so `bucketItem.original` / `filter.original` reads stay on the `getIn` shim, and the OBJECT
  values extracted from them (`displayForm`, `dfRef`, `displayFormRef`) normalize with `toPlain`
  before landing in the now-plain MD output. A property-access "cleanup" here is the 4.11
  mixed-container crash waiting for the first extended-reference-point save comparison.
- **decoration passes `totals` through RAW.** `decoratedBucket` copies `totals` off the source
  bucket verbatim (`getIn(bucket, ["totals"])`), so an ERP bucket hands an Immutable List in.
  `reduceBuckets` normalizes it at the boundary (`isImmutable ? toPlain : identity`) — the
  characterization suite used to PIN the Immutable value passing through and now pins the
  normalization instead.

### pickDefined is a key-presence contract, not a style choice

The `typedMap`/`typedObject` + `pickDefined` filter builders became typed bear-family literals
(`IVisualizationObjectFilter` et al.) — but `pickDefined`'s behavior had to survive as
conditional spreads: it DROPS undefined-valued keys, and key presence feeds `isEqual` in the
save comparison (`isEqual({a: undefined}, {})` is false). A typed literal that always writes
`negativeSelection: undefined` would flip `isSavedReportCurrentReport` for every insight whose
saved filter omits the key. Same reason the relative-date `from`/`to` spreads stay conditional
while the absolute-date filter keeps its always-present keys — that is what the legacy builder
produced, byte for byte.

### The slice guard is written, not inherited (again)

`lastSavedObjectSlice` kept the legacy `setIn` idempotence with an explicit
`isEqual(current(state), next)` guard — `current()` because the comparison must run over the
plain value, not the immer draft proxy. The §7 identity specs (`reduce(s, a)).toBe(s)` on an
identical re-save/re-open) pass unchanged. `buildLastSavedCompatibleReport` dropped its
`JSON.stringify(fromJS(...))` — Immutable's `toJSON` made that byte-identical to serializing the
plain object, which its own comment already promised.

### A fixture pinned a container that has been dead since 7.2

`report_store.test.ts`'s pristine-state suite built its root as `fromJS(buildInitialState())` —
"PINS the dual-mode accessor contract over an Immutable root." Since 7.2 the combined root
self-initializes every leaf, so the fromJS didn't produce a root with ABSENT leaves (the
describe's stated premise); it produced a root whose lastSavedObject leaf was an Immutable Map
production cannot contain — and the flip's plain reads correctly refused it. The fixture now
deletes the report branch outright (`{ ...buildInitialState(), report: {} }`), which tests what
the suite always meant to: the accessors serving the domain's initial values over absent leaves.

### Riders (small, forced by the same sweep)

- `MeasureAttributeFilterOrganized#onSelectItem` dropped its `fromJS(item) as unknown as` wrap —
  the add-metric-filter payload is typed `ICatalogEntry` (plain since 10.3) and the reducer
  `toPlain`-ed the manufactured Immutable value right back.
- `isReportExecutableSelector`, `openReportIdSelector` and the `getLastSavedReport*` family are
  property access; `insight_selectors` lost two `mdObjectRaw.toJS()` calls; the export saga lost
  its `report.toJS()` snapshot.
- Typed in the same sweep (the flip is the §2 forcing moment): `constructVisualizationMDObj`
  (`IDecoratedBuckets` + `IImmutableVisualizationProperties` params), `bucketsToMetadata`
  (`IBucketsToMetadataAdditionalData`), `metadataToBuckets` (`IMetadataToBucketsResult`),
  `getSelectedDateDataset` (`IRawBuckets`), `getVisualizationForExportFromInsight`
  (`IInsightDefinition`, with the saga's `ReturnType` → `SagaReturnType` fix it exposed).
- `getPlainVisualizationPropertiesWithDefaultValues` is the plain twin of the Immutable
  defaulting helper — the Immutable original stays for the visualization-properties STATE family
  (10.7); only the MD path switched.

### Fixtures

All fromJS seeds of MD-family values re-seeded plain across twelve test files
(`metadata_legacy`/`metadata`/`metadata_decorated_buckets`/`metadata_service`/`report_service`/
`save_report_selector`/`buckets_selector`/`report_selector`/`report_store`/
`open_report_apply_reducer`/`date_datasets_plain_readers`/`pristine_state_readers`); the
still-Immutable ERP/reference-point/properties seeds in the same files deliberately keep their
`fromJS`. The `typedMap` unit test died with the helper; the decorated-buckets suite's "keeps raw
Immutable totals" pin INVERTED to "normalizes raw Immutable totals at the boundary" (the
10.3/10.4/10.5 pattern). Every `toMatchSnapshot` passed unchanged — the plain pipeline is
shape-identical to the Immutable one.

### Gates

`tsgo` build + check clean, full suite green (**4721 passed / 396 files** — one test deleted with
`typedMap`), `rushx validate` green with the provenance audit at **0 findings** —
`REPORT_LAST_SAVED_OBJECT` moved to `FLIPPED_PATH_CONSTS` and the `SAVED_` prefix moved to
`FLIPPED_PATH_PREFIXES`, so an Immutable idiom on any lastSavedObject path is RED now. The leaf
left `create_store.ts`'s `IMMUTABLE_FAMILY_PATHS`, re-enabling the RTK dev checks on it.

## Phase 10.7 — the visualizationProperties flip

**Delivered as ONE PR** — `data.visualizationProperties` is a plain `IVisualizationProperties`
(sdk-ui-ext's own push currency; the first flip since 10.5 that needed NO local model), and
`store/properties/properties_helpers.ts` is the rewrite the plan promised rather than a retype:
`joinControls` / `getMergedProperties` / `removeInvalidControls` / `getReplacedProperties` are
plain merge computations now, `properties_slice.ts` computes plain next values, and the domain's
leaf reads (`getVisualizationPropertiesSortItems` / `Controls` / `Control`) are property access.
`typings/properties.ts#IImmutableVisualizationProperties` deliberately SURVIVES with its name:
it now types only the extended-reference-point value, which really is still an Immutable Map
until PR 10.9 — a type is renamed when its value stops being Immutable, not before.

### Pin first, rewrite second — and the pins found two dead branches

The plan's gate ("pin colorMapping removal with tests before touching joinControls") was the
right order for a reason the plan did not know yet. The removal-entry semantics had NO test at
all — the old suite exercised list merges only through nested-object controls, never a top-level
list — so eleven pins were written against the IMMUTABLE implementation and run green before the
rewrite: removal-by-id, replace-in-place, append-on-unknown-id, unmatched removals dropped,
a list emptied by removals drops the whole key, `undefined` over a stored list drops the key,
`null` keeps it, primitive lists merge by identity, removal entries in new-only lists are
stripped (and a new-only all-removals list drops the key), an originally-empty list survives
empty. Two more pins caught latent DUAL-BEHAVIOR branches that a naive plain rewrite would have
silently "fixed": `replaceThresholdMeasures` reads `.length` of an Immutable List (`undefined`,
so the empty-list delete branch NEVER fired) and `replaceDisableKeyDriveAnalysisOn` counts
`Object.keys` of an Immutable Map (the instance's own internal fields, never zero — the
empty-map delete branch never fired either). Production has always REPLACED those keys, empty or
not, and the empty-replace difference is save-comparison-visible (`isEqual({a: []}, {})` is
false), so the plain rewrite keeps the replace-always behavior and the dead branches stayed
dead. All pins then translated to plain fixtures 1:1.

### One provenance boundary, normalized at the entry points

Until 10.9 the helpers serve two masters: the slice hands them plain state, the saga hands them
the ERP-Immutable `getExtendedReferencePointProperties` value. Every exported helper normalizes
its inputs with `toPlain` (identity on plain — the normalization dissolves with 10.9 instead of
needing another rewrite), and `areSameVisualizationProperties` normalizes BOTH sides before an
`isEqual` compare, because its two call sites genuinely compare across provenances
(ReportVisualization dropped its `fromJS(properties)` wrap for the same reason). The Immutable
`getVisualizationPropertiesWithDefaultValues` died; its "plain twin" from 10.6 took over the
name, with `getSortItemIdentifiers` staying dual-mode (its buckets_service caller reads
ERP-provenance sort items).

### Mirrors at three writes into the still-Immutable cluster — and deliberately NOT at a fourth

The plan's gate named `report_visualization_selector`'s `referencePoint.set("properties", …)` as
the §9 mixed-container producer, and the mirror sits exactly there
(`mirrorToContainer(referencePoint, properties)`). The sweep found two more writes of
now-plain values into the Immutable cluster: `properties_apply_reducer`'s ERP_PROPERTIES write
(mirrored the same way) and open_report's ERP/RP writes (the `fromJS` there survives, renamed
`erpVisualizationProperties` to say WHY it survives). The fourth candidate —
`syncReferencePoint`'s sortItems into RP_PROPERTIES_SORTITEMS — deliberately does NOT mirror:
buckets_cluster_characterization pins the write BY REFERENCE, the reference point has held live
plain buckets by reference since 4.11, and the only RP-properties reader
(report_visualization_selector) replaces the key wholesale before anything iterates it. A
first-cut mirror there was reverted against the pin.

### The slice guard is written, not inherited (third time)

Every case computes a plain `next` and returns it through `isEqual(current(state), next) ?
state : next` — the 10.3/10.6 lesson applied wholesale. `storeVisualizationProperties` had NO
identity guard even in the Immutable era (a fresh merged Map arrived on every dispatch); the
guard is a deliberate improvement and is SAFE for undo because history snapshots key off the
trigger action (`UI_VIS_PROPERTIES_CHANGED` in the time-travel whitelist), not off the store
action the saga emits. Two identity specs pin it (`stackMeasures` re-toggle, equal re-store).

### Types derived from usage

`storeVisualizationProperties` / `visualizationPropertiesInitialized` payloads lost their `any`s:
the merged properties are `IVisualizationProperties | undefined` (the `totals`/`bucketType`
riders ride the index signature) and the initialized payload is the pluggable visualization's
actual `{ supportedProperties }` push shape — the creator's parameter had CLAIMED the bare
properties since 4.6 while every reducer read `.supportedProperties`. The
`ColumnWidthItem = any` TODO resolved against `@gooddata/sdk-ui-pivot` (already a production
dependency — it is what the pluggable pivot table pushes). The saga needed the same TS2742
`SagaIterator<void>` annotation the action creators already carried, and `utils/immutable.ts`
lost `isImmutableList` (the old joinControls was its last caller).

### Fixtures

The flipped-path seeds re-seeded plain across eleven test files (properties store/characterization/
helpers/sagas, visualization_properties selector + utils, app_context_store,
time_travel_characterization, buckets_cluster_characterization, open_report_apply_reducer,
ReportVisualization); the ERP seeds in the same files deliberately keep their `fromJS`, and
pristine_state_readers only dropped a reader's `.toJS()` (no seed of its own). The
multi-line paren-balanced sweep (the 10.5 lesson) found zero extra seeds beyond the single-line
grep this time — one apparent hit was the nested ERP seed of a properties test.

### Gates

`rushx build` clean (after the annotation fix declaration emit demanded), full suite green
(**4744 passed / 397 files** — up 23: the pins and identity specs, minus the `isImmutableList`
describe), `rushx validate` green with the provenance audit at **0 findings** —
`VISUALIZATION_PROPERTIES` moved to `FLIPPED_PATH_CONSTS` and the `PROPERTIES_` prefix to
`FLIPPED_PATH_PREFIXES`, so an Immutable idiom on any properties path is RED now. The leaf left
`create_store.ts`'s `IMMUTABLE_FAMILY_PATHS`, re-enabling the RTK dev checks on it.

## Phase 10.8 — the consistency pass

**Delivered as ONE PR** — the last hand-written reducers became slices, the last non-cluster
Immutable values (the `data.measuresDateDatasets` statuses) flipped plain, and the two
suspected-stale `IMMUTABLE_FAMILY_PATHS` entries were proven stale and removed.
`create_store.ts`'s ignore list is down to `timeTravel` (permanent, a performance exclusion)
plus the reference-point cluster (`data.referencePoint`, `data.extendedReferencePoint`,
`data.postponedAction`) — everything that remains Immutable at runtime now flips with ONE row,
10.9.

### The row's own list was the first stale thing the pass found

The plan row named "(ai, data_sampling, featureFlags, permissions, measure_date_datasets)".
Three of those five were already done or gone: the `ai_reducer` was DELETED at 4.1 (its dialog
state moved into the dialogs slice; today's genAi surface is two saga watchers and selectors
composed of featureFlags/permissions — there is no genAi reducer to convert), and
featureFlags/permissions became slices at 4.4. What actually remained hand-written was
`data_sampling`, `measure_date_datasets` — and `timezone_override`, which the row could not have
named because the domain was CREATED after it was written (6.2, out of the shim-writer). The
lesson repeats 10.1's: enumerations in plan rows go stale silently; the authoritative worklist
is the code (here: grep `reducers/` for non-slice reducers), the row is only the intent.

### measureDateDatasets never needed its wrapper seat

`MeasureDateDatasetsReducer` sat in the POST-core wrapper stack since 7.2 — but every write it
ever made landed inside `data.measuresDateDatasets`. It was a whole-root reducer only because
the legacy service API was whole-root-shaped (`setIn(state, [...DATA, "measuresDateDatasets",
...])`), not because any action needed foreign state. So the conversion is a MOUNT MOVE, not a
cascade dissolution: the slice owns the key in the combined root, the wrapper left the stack,
and 10.9's list shrank by one entry it never really contained. The FINISHED case's one
subtle contract — a reload of a measure's availability PRESERVES a previously selected date
dataset URI — came along inside the helper and is pinned by a dedicated test.

### One set of semantics for two eras of writers (the 10.3 split, applied again)

Two external whole-root writers of this subtree SURVIVE the pass on their own schedules:
`bucket_filters_reducer`'s date-filter add/remove (dissolves 10.9) and
`open_report_apply_reducer`'s selected-dataset init (dissolves 10.10). Instead of leaving them a
parallel implementation to drift against the slice, the subtree mutations live in
`store/measure_date_datasets/measure_date_datasets_helpers.ts` — identity-preserving pure
functions over the SUBTREE — and both the slice cases and the trimmed transitional
`MeasureDateDatasetsService` (now: the three whole-root setters + the buckets/filter-bar-composed
`getDefaultSelectedDateDatasetUri`) call the same helpers, exactly the split 10.3 used for
item_cache's external merge writer. The service's READ surface is gone: `getStatus`/`getAll`
re-pointed to domain selectors, `isAvailable` had no production caller and died. `getAll` is the
instructive one — its reselect memoization and per-value `toPlain` existed ONLY because the
statuses were Immutable inside a plain container; with the flip the subtree itself is the stable
reference, so the "selector" is the `sliceSelector` read and no derived object is built at all.

### Partial entries are the CONTRACT, not sloppiness

The legacy writers wrote single leaves through absent intermediates (`setIn([..., id,
"isLoading"], true)` materializes `{ isLoading: true }` alone — the old reducer test pinned
exactly that shape), and every reader went through the defaults-filling `getStatus`. The plain
state keeps both halves honest in the types: entries are
`Partial<IMeasureDateDatasetsStatus>`, and `getStatusFromState` is the one defaults boundary.
Typing the entries as the full status would have been a lie the compiler enforces — the
"selection parked before availability loads" entry (`{ selectedDateDatasetUri }` alone, written
by open_report before the measure's datasets ever load) is a real production shape.

### The undefined → null trade of the scalar leaves

`createSlice` cannot self-initialize from `undefined`, so `dataSamplingPercentage` and
`timezoneOverride` store `null` where the hand-written reducers kept a present-undefined key
(the §7 gate anticipated exactly this normalization). The consumers were checked per the gate:
every read goes through ONE selector each, so the conversion back to `undefined` happens there
(`?? undefined`) — load-bearing for the execution config, where `{ dataSamplingPercentage:
undefined }` is dropped by the JSON layer but a `null` would be SERIALIZED and sent to the
backend. The slices' store tests pin the round trip on both sides of the boundary. Rider: the
DELETE case's `sessionStorage.removeItem` moved from the reducer (an RTK-era impurity) into the
domain saga that already watches the same action for telemetry — pinned by a spy test asserting
the reducer no longer touches storage.

### How a dead ignore-entry is proven dead: populate, then pin

The plan's instruction ("verify by removing it and exercising a flow that POPULATES the value —
an empty subtree never trips `serializableCheck`") became two permanent tests in
`root_flip_contract.test.ts` rather than a one-off manual smoke: drive the real populating
dispatch through the root reducer and assert the stored value is plain
(`data.shortcut.shortcutDroppedItem` via `shortcutSetDroppedItem` — stored PLAIN and BY
REFERENCE; `data.attributeElements` via the update/updated pair). The provenance audit backed
the removals by construction: every droppedItem writer is the dragged catalog item (itemCache
currency, plain since 10.3) or `null` (the postponed-replay path and time travel's undo fixup),
and attributeElements' reducer and external reset write only plain values. The audit also found
something the plan did not predict: **`STORE/ATTRIBUTE_ELEMENTS_UPDATE(D)` is dispatched
NOWHERE in the repo** — the domain is not just plain, it is apparently dead (the sdk
AttributeFilter components own that flow now). Filed in §10 as a removal candidate; deleting a
domain is not a consistency-pass rider.

### The 4.11 type fossil, retired

`getDroppedCatalogItem` was still typed `IRawBucketItem` while holding a CATALOG item — the
renamed fossil the plan called out. It is `ICatalogEntry | null | undefined` now (absent until a
drop parks one, null after replay), `shortcutSetDroppedItem`'s `Record<string, any>` TODO
resolved to `ICatalogEntry`, and `store/types.ts`' `shortcutDroppedItem` follows. Riders in the
same file: the `IAppState` comments for `visualizationProperties` ("still an Immutable Map
through 4.6") and `lastSavedObject` ("still an Immutable value") had been false since 10.7/10.6
— fixed, and `measuresDateDatasets`/`dataSamplingPercentage`/`timezoneOverride` joined the typed
root at their legacy positions.

### What the pass deliberately did NOT take

The 8 already-plain hand-written domains §6 offered "opportunistically or in 10.8" (catalog,
chartSort, dragAndDrop, metricEditor, attributeElements, bucketNotifications,
applicationContext, filterBar — ~4,000 lines, filter_bar alone 1,752) stay hand-written: they
hold no Immutable values, so they gate NOTHING in 10.9–10.12, and converting them inside this
row would have buried its real content under mechanical churn (the row is sized M; they are not
scoped into any remaining row's contents). Same call for the optional embedding single-slice
fold. Both decisions are §10 backlog entries now, so the "or in 10.8" ambiguity is resolved in
the plan rather than left dangling.

### Gates

`rushx build` clean, full suite green, `rushx validate` green with the provenance audit at
**0 findings** — `MEASURES_DATE_DATASETS_PATH` was already in `FLIPPED_PATH_CONSTS` (the
CONTAINER flipped at 7.1; the audit classifies container reads), so the flip changed the
audit's comments, not its verdicts. Three entries were REMOVED from `create_store.ts`'s
`IMMUTABLE_FAMILY_PATHS` (`data.measuresDateDatasets` plus the two stale ones), re-enabling the
RTK dev checks on all three subtrees; `timeTravel` and the three reference-point paths stay
ignored — the former as a performance exclusion, the latter until PR 10.9 flips them.

---

## Phase 10.9 (experiment) — the cascade dissolution prototype

**NOT MERGED — and not going to be.** Row 10.9 ("cascades out of the reducer chain + the last flip")
was fully prototyped on branch `imj-stl-3150-p10-9-experiment`: three commits, suite green,
`validate` green, provenance audit at 0. Reviewing it against the migration's actual goal is what
produced the §4.8 definition of done, the closure of Phase 10 at 10.8, and the re-plan into Phases
11 (the architecture) and 12 (the cleaning). This note records what the experiment established and
why its architecture was rejected, so the branch can eventually be deleted without losing either.

### What it built

Commit 1 flipped the reference-point cluster plain (`data.referencePoint`,
`data.extendedReferencePoint`, `data.postponedAction`) and gave `referencePoint` slice-hood. Commit
2 moved the six POST-core apply reducers out of `reducers/root_reducer.ts`, kept their handler
modules byte-identical as pure `State → State` computes, and had ONE saga select the post-core
root, run every compute that handled the action in the legacy stack order, DIFF the result over
`buckets_cluster_write_surface.ts` (an array of 16 path constants), and dispatch the changed
subtrees as one `cascadeApplied(source, clusterWrites)` event whose payload was a
`pathKey → subtree` map; every affected mount consumed its own key through matcher plumbing
(`carriesClusterWrites` / `clusterWriteCase` / `clusterWriteLeaf`).

### Why the architecture was rejected

Every phase gate passed and the target was still missed, which is the lesson: the gates asked "did
behavior change?" and none asked "is this the end state?".

- The six cascades remained whole-root `State → State` transformers — **moving the caller into a
  saga does not change the ownership problem**.
- `constants/state_paths.ts` — the file the migration has been deleting since 10.1 — was quietly
  given a NEW load-bearing job: runtime addressing for domain writes.
- The event payload was `Record<string, unknown>` keyed by dotted paths: nothing about "which
  domains does this operation change" was typed, and one generic event served every operation.
- "What may a cascade write" lived in an external array whose own doc comment admitted the failure
  mode ("a path missing here silently DROPS the write") and whose completeness a sentinel TEST had
  to enforce — an enumeration the type system should own.
- Root-state DIFFING discovered the outputs, instead of the operations producing them.

A second draft was rejected at design time before any of it merged: replace the root with a typed
16-field cluster aggregate (`IBucketsClusterState`) + `collectClusterChanges`. That is
`mini-root → mini-root` — the same state-transformer architecture behind a better type. Both
rejections are now §4.8.4's banned-shapes table, and detectors `[N]`/`[O]` in the Phase 11 working
notes exist specifically to catch them mechanically.

### What the experiment established (kept as evidence, drives Phase 11)

- **The flip is safe and architecture-neutral** — it moves no dispatch. It re-lands as row 11.1,
  including the three landmines the compiler could not see, all found by reading every reader the §7
  idiom grep surfaced: the lodash `isEmpty` ERP-existence guard (`isEmpty({})` is TRUE — the
  `ERP_PROPERTIES` write silently stops after the flip; pinned by the properties characterization),
  the `List().contains` default on the flipped uiConfig `accepts` array (a live TypeError in
  drag-and-drop), and the `toPlain`-became-identity sortItems assignment in
  `constructVisualizationMDObj` (an in-place write through a store-shared reference). One declared
  behavior change rides along: `getSecondaryAxisMeasures` becomes a union — Immutable's index-based
  `List.merge` semantics were accidental. The `.toJS()` defensive copies at the plug-viz boundary
  can go because all 23 pluggable visualizations `cloneDeep(referencePoint)` on entry (the §7
  disappearing-toJS gate, answered by reading the consumer).
- **One dispatch per logical cascade is achievable and right** — render atomicity, undo granularity
  (the whitelist keys on the frozen trigger strings; the snapshot is captured before the mutation),
  `observeStore` and splunk all follow from it. Phase 11 keeps the property and improves on it: the
  trigger stops writing state entirely, so there is no observable intermediate at all.
- **The take-audit result**: over every watcher of the ~50 trigger types, exactly TWO read
  cascade-written state and must observe the APPLIED state — `sagas/catalog`'s availability flow and
  the embedded `insight_changed_saga`. In Phase 11 they key on the semantic event
  (`take(extendedReferencePointApplied)`), which also removes the prototype's "only safe for
  triggers whose cascade always writes" caveat.
- **Identity is the idempotence contract**: the cluster writers inherit their no-op behavior from
  `setIn`'s equal-value short-circuit and `mapCollection`'s identity preservation; the saga-side
  registration order (cascade watcher FIRST) is what kept the postponed-shortcut replay computing
  over applied state; and the double-registration hazard (a second watcher would double-apply
  cascades) is why the shared `runSaga` util registers it exactly once.
- **The parity suites are the oracle.** The prototype's green suite is a working implementation of
  the target BEHAVIOR; every Phase 11 row verifies against it per typed domain value (`toEqual` for
  what the operation changes, `toBe` identity for what it must not — a root snapshot passes on a
  lost identity, the 4.11 regression class).

### Disposition

Full per-piece table in
[MIGRATION_AD_REDUX_TOOLKIT_11_ARCHITECTURE.md §7](./MIGRATION_AD_REDUX_TOOLKIT_11_ARCHITECTURE.md).
Summary: the flip and the referencePoint slice are KEEP (re-land at 11.1); the characterization and
reducer suites are KEEP as the oracle; the take-audit finding is KEEP with the mechanism reworked;
the cascade saga, `cascadeApplied`, the write surface, `pathKey`, the matcher plumbing, the
root-state diff and `reduce_with_cascades` are DELETE; the six `State → State` computes stay in the
reducer chain (where they are on `master` today) as PARITY ONLY until each family's Phase 11 row
deletes them.

### Process note

The experiment cost three commits on an unmerged branch. Landing it would have cost a follow-up
phase plus unwinding an abstraction that fourteen mounts, a sentinel suite and a delivery note had
been written around. The check that catches this class is not another behavior gate — it is asking,
at design time, whether the shape being introduced is the shape the migration is trying to reach.
That question is now §4.8, step 2 of the read-before-you-code list.

## Phase 11.1 — the last container flip

`data.referencePoint`, `data.extendedReferencePoint` and `data.postponedAction` are PLAIN, and with
them **no Immutable collection is left anywhere in the state tree**. `referencePoint` is a real
slice. No dispatch moved — which is the whole point of doing the flip as its own row: everything
that follows in Phase 11 operates on plain values only.

### Types first, and what the compiler found

Three state modules were redefined plain BEFORE any runtime change (§7's 4.11 rule):
`reference_point_state.ts` (`IReferencePointState` plus the reference point's own filters-bucket
family — the four filter-detail shapes its converters produced as `any`), a new
`extended_reference_point_state.ts`, and a new `postponed_action_state.ts`. Then `tsc` enumerated
the residue, and the residue is the point: **21 errors across 12 files, of which the geo pipeline
was NOT one** — it had its own local `IErpBucketItem = ImmutableMap<string, any>` aliases and was
self-consistently compiling against a container production was about to stop producing. The type
sweep finds the typed consumers; it cannot find the ones that type themselves.

Two idiom classes only the audit script found (`tsc` sees through neither): `controls.get(...)` in a
splunk formatter and in `ReportTooLargeToCrosstabulate`'s transposition selector, both on
`any`-typed receivers. Both would have thrown.

### The three landmines, defused and pinned

1. **The `isEmpty` existence guard** (`properties_apply_reducer`). The line read
   `!isEmpty(getIn(state, EXTENDED_REFERENCE_POINT))`, which LOOKS like an emptiness test and was
   not one: lodash `isEmpty` is FALSE for every Immutable Map (it sees the collection's internal own
   properties), so the guard only ever rejected an ABSENT subtree. `isEmpty({})` is TRUE — post-flip
   the same line silently stops the ERP-properties write for an extended reference point that exists
   and holds nothing. It is an explicit `!= null` check now, pinned three ways in
   `properties_characterization.test.ts` (present-and-empty writes, present-and-undefined does not,
   absent does not) — and the pins only have teeth with a PLAIN seed.
2. **`List().contains` on the flipped `accepts` array** (`buckets_service`'s bucket swap). Immutable's
   `contains` does not exist on an array: a live TypeError in drag-and-drop the moment the container
   flipped. Two sibling readers defaulted to `List()` on the same family. The pin is
   `bucket_reducer.test.ts`'s heatmap swap spec, which was passing either way until its uiConfig
   fixture was re-seeded plain.
3. **The in-place `sortItems` write** (`constructVisualizationMDObj`). `toPlain(sanitized)` CONVERTED
   while the ERP was Immutable and therefore always produced a fresh object, so
   `sanitizedProperties.sortItems = appliedSort` was safe. Plain, `toPlain` is IDENTITY — the same
   line writes THROUGH the store-shared reference, and because this subtree is not immer-frozen it
   would not even throw: the applied sort would silently join the stored extended reference point.
   It builds a copy now. **The pin was VACUOUS on the first attempt** (see §7 — fourth instance):
   the fixture never enabled `canApplySort`, so it passed against a deliberately re-introduced
   mutation. Verified by re-introducing the defect, then the premise was asserted in the spec.

One declared behavior change rides along: `getSecondaryAxisMeasures` is a UNION now. It combined the
two secondary-axis lists with Immutable's `List.merge`, which is INDEX-BASED — `List(["x1"])
.merge(List(["y1"]))` is `List(["y1"])`, so a measure on the secondary X axis was silently dropped
whenever the Y axis held one at the same index. Nothing wanted that; four specs say so now.

### What the flip DELETED, not converted

- **`ensureExtendedReferencePointContainer`.** Every deep ERP writer called it first, because a write
  through the absent key materialized PLAIN intermediates under the plain `data` branch where the
  plug-viz round trip then called `.set(...)` and died (the 7.1 e2e class). The hazard is INVERTED:
  plain intermediates are the correct container now, so the shim's own rule is the whole mechanism.
  `root_flip_contract.test.ts` pins all three write paths in their new direction.
- **`IImmutableVisualizationProperties`**, and with it the `toPlain` normalization at every
  `properties_helpers` entry point and the three `mirrorToContainer` writes INTO the cluster
  (`report_visualization_selector`, the ERP write, `syncReferencePoint`'s sortItems). One shape, one
  type, no boundary.
- **The last dual-mode seam in `buildBucketItemFromCatalogItem`.** Catalog items have been plain since
  10.3; the ONE path still delivering a `fromJS`'d one was the postponed-shortcut replay, which
  re-put `{type: get("type"), payload: get("payload")}` out of a `fromJS`-stored action. Storing the
  ACTION and re-putting it verbatim closes it — replay and a real drag now travel the same shape,
  and the `toPlain` copies that kept a nested Immutable Map from silently answering `undefined` to
  every plain read inside a built bucket item went with it.

That last one had a consequence worth stating plainly: the suite then failed on
`recommendations_apply_reducer`, which was building its catalog item with `fromJS(...)` under a
comment claiming the buckets subtree was still Immutable — **it flipped at 4.11**. A stale comment
kept a live Immutable producer alive for two phases, and only removing the dual-mode reader on the
other side exposed it.

### The slice, and what it deliberately does not own

`referencePoint` owns the two open-report actions it can own ALONE: `OPEN_REPORT_STARTED`
(→ `{ buckets: INITIAL_MODEL }`, verbatim what the legacy `deleteIn` + `setIn(RP_BUCKETS, …)` pair
produced) and `OPEN_REPORT_FAILED` without a reason (`reportNotFound`, guarded so a repeat is
IDENTITY). Both were removed from `openReportApplyReducer`; both work because that wrapper is
PRE-core, so its application reset lands first and the slice writes on top — the sequencing the
legacy `setIn(resetApplication(state), …)` had. Everything else that writes the reference point is
cross-domain and stays a documented external writer (the 4.5/4.6 pattern): `syncReferencePoint`
(row 11.4) and `OPEN_REPORT_FINISHED` (row 11.7).

The mount is `plainSubtreeLeaf`, not a bare slice reducer: a time-travel restore of a pre-flip
snapshot or a stale `fromJS` fixture would otherwise hand an Immutable Map to an immer draft, which
cannot draft it — the mutations vanish and the reducer returns undefined.

One identity honesty note: the slice's `OPEN_REPORT_FAILED` guard is asserted on the SLICE, not
through the root. `openReportApplyReducer` rebuilds the subtree on every such dispatch, so the
dispatch as a whole is not idempotent — a property of that reset (row 11.7), not of this domain.

### The portability class (new §7 gate)

Removing a `.toJS()` and an `any` is what exposed it: `tsc` writes every exported const's inferred
type into the declaration output, and reselect's `OutputSelector` embeds its INPUT types, so typing
ONE accessor propagates that type through every selector composed over it. sdk-ui-ext's internal
barrel does not export `IUiConfig`, `IBucketsUiConfig`, `IBucketUiConfig`, `ICustomError`,
`IDisplayForm` or `IDefaultControlProperties` — so ~15 exported selectors became non-portable at
once (TS2742), in files this row never touched. The fix is structural, not local: the ERP's uiConfig
types are declared as INTERFACES extending the SDK's (an alias resolves to the un-exported
declaration and does not help; `interface X extends Y {}` does, because consumers name `X`), and
the properties shape is AD's own `IStoredVisualizationProperties` in `typings/properties.ts` — the
module that already existed for exactly this reason, since `IVisualizationPropertiesControls` was
the first instance of the class before it had a name.

Two type lies surfaced the same way. `IBucketItemDisplayForm` declared `type` REQUIRED while its
only producer copies `ICacheItemDisplayForm`s (where `type` is optional, deliberately — date-derived
display forms carry none); the `toPlain<IBucketItemDisplayForm[]>` cast was what hid it, so it is an
alias to the cache shape now. And `sanitizeFormats`/`sanitizeReferencePointFormats` took the SDK's
`IReferencePoint` for a value that is AD's reference-point STATE family — the §7 "same shapes,
different families" lie that compiles clean. It takes a structural `IPreviousMeasureFormats` now,
naming the three fields the format decision actually reads.

### Fixtures

Every RP/ERP/catalog-item fixture in 12 suites was re-seeded plain, and each failure was a reader:
the 4 `validateVisualizationProperties` / `constructVisualizationMDObj` failures were `fromJS`
seeds keeping `getSortItemIdentifiers`'s Immutable reads green, and `bucket_reducer_for_combo_chart`
seeded the ITEM CACHE with an Immutable Map — a container flipped at 10.3. Two suites' Immutable
halves were deleted rather than converted (`getSortItemIdentifiers` and
`areSameVisualizationProperties` pinned a dual-mode behavior that no longer exists), and the
`toPlain(...)` wrappers around ERP/RP assertions went with them: an assertion that converts cannot
see a container regression, which is the whole reason the characterization suites pin containers by
IDIOM.

### The review round

Six fixes came out of it, and three are worth recording because each is a class, not a typo:

- **`Map()` is a SINGLETON; `{}` is not.** The flip translated
  `getExtendedReferencePointProperties(state) || Map()` into `|| {}` — and those two accessors are
  `createSelector` INPUTS, so a fresh object per read defeats the memoization of everything composed
  over them. The stability had been inherited from the Immutable idiom; post-flip it has to be
  written (module-level frozen constants). Same treatment for the `[]` defaults that feed
  `createStructuredSelector`. **This is the identity gate (§4.8.5) applied to a READ path** — the
  gate is usually quoted about writes, and a flip converts defaults on both.
- **A stale comment kept a dead container alive, and then argued for it.**
  `addCatalogItemToBucket`'s "production catalog items are Immutable" dated from before 10.3. The
  reviewer read it as evidence that `buildBucketItemFromCatalogItem` must stay dual-mode, and the
  finding was rated Major. Tracing it (both callers' payloads are typed `ICatalogEntry`; no
  production `fromJS` yields a catalog item) is what proved it dead — the same trace that had already
  found the live `fromJS` in `recommendations_apply_reducer`. The reads are property access now and
  the comment says what is true.
- **A type that under-states absence invites the wrong fix.**
  `getExtendedReferencePointBuckets` was declared `IExtendedRefPointBuckets` while it returns
  `undefined` until a plug viz answers — and TWO consumers depend on exactly that
  (`bucketsExtended || buckets`; `[]` is truthy and would hide the regular buckets). The reviewer
  correctly warned against defaulting it. The type is optional now, which is what makes the
  fallback legible instead of accidental.

Two findings were dismissed with reasons rather than fixed: an `item.filters[0]` throw on a
filter-bucket entry with `filters: []` (byte-identical before the flip — the caller `toPlain`'d
first, same plain shape — and no producer: `createAttributeFilter` always sets a `filterConfig`; a
filter-bar concern for 11.2/11.6), and the `{ content, meta }` visualization-class shape in
`bucket_reducer.test.ts`'s `setVisualizationClass` helper, retired at 10.5 — correcting it changes
which branch the heatmap / non-heatmap swap specs exercise, which is a buckets question for 11.4.
Both are §10 backlog candidates. The inert twin of the second one (MeasureConfiguration's fixture)
was corrected, since nothing reads it.

One guard was added and its scope had to be corrected mid-fix: the geo display-form restore now
returns an already-restored item unchanged. The first version of the comment claimed it reduces store
notifications — it does not, because `sanitizeFormats` rebuilds every bucket object upstream on every
answer. The claim was wrong before the pin was written, and writing the pin is what showed it: the
bucket-identity assertion failed while the item-identity one passed. **A pin is also how you find out
your own comment overclaims.**

### Gates

Package suite green (4779 passed), `validate` green, provenance audit at **0 findings — and its
IMMUTABLE classification is now retired**: `IMMUTABLE_PATH_CONSTS` is empty, the prefix list is
deleted, and `ERP_`/`RP_`/`REFERENCE_POINT`/`EXTENDED_REFERENCE_POINT`/`POSTPONED_ACTION` moved to
the FLIPPED lists. `create_store.ts`'s ignore list is down to `timeTravel` and renamed
`DEV_CHECK_IGNORED_PATHS` — it is a performance exclusion, not an Immutability inventory, and a new
entry there is a regression. §8 high-risk row: full e2e + manual smoke (undo/redo torture, embedded
postMessage, open/save/delete/export, splunk spot-check) still to run.

## Phase 11.2 — narrow pure helpers I, the small services

Five services stopped taking the root state. Every operation over the filter bar, the
reference-point sync, the derived-measure queue, the over-time-comparison rules and the
measure-date-dataset selection is now `(domainValue, …explicitArgs) => domainValue` (§4.8.2), and each
whole-root entry point is the same three lines: read the value with the shim, call the helper, write
the value back. Nothing above the adapters changed — which is the point of doing this row before any
orchestration moves, and why the parity evidence is the UNTOUCHED suites (`filter_bar_service.test.ts`
alone is 1,584 lines of them).

### What the signature had to say out loud

Three of the five had a dependency that only became visible once it had to be written down:

- **`resetAdditionalDateFilters` and `updateFilters` read the date-dataset attributes from TWO
  different domains** — the granularity list (`getDateDatasetRefsWithGranularities`, itemCache-derived)
  and the date-datasets META items. As whole-root writers they each just called "the" selector, and
  nothing said they disagreed. As helpers they take `dateDatasetAttributes`, so the two callers pass
  their own source and the divergence is in the code instead of behind it. Both entry points keep
  their existing source verbatim; reconciling them is a question for 11.6, not a refactor.
- **`getDefaultSelectedDateDatasetUri` takes `{ hasDateInBuckets, hasDateFilter, primaryDateDatasetRef }`.**
  All three belong to the BUCKETS domain, and the rule they feed belongs to measure-date-datasets;
  splitting them at the argument list is what let the whole-root facade die. The primary-ref lookup is
  eager now where the guard used to short-circuit it — verified safe (`getFirstAvailableDateDataset`
  answers `undefined` on an unloaded catalog, it does not throw).
- **`syncReferencePoint` does NOT write `isVisualizationMdObjectValid`.** The legacy
  `bucketsWereChanged(state, valid)` wrote the sync and the flag in one pass, which is the only reason
  they ever looked like one thing; the flag is an OUTPUT of the operation that mutated the buckets
  (§4.8.3). It is written next to the sync by the adapter until row 11.4 gives each operation an event
  that names both.

### `MeasureDateDatasetsService` is deleted, and that is the shape of the rest

The facade had exactly two kinds of member: subtree writers that delegated to the domain's helpers
anyway (10.8 had already split them) and one composed READ. So the row deleted the module instead of
adapting it: the read became a helper with resolved arguments, and the two remaining external writers
(`bucket_filters_reducer` → 11.6, `open_report_apply_reducer` → 11.7) each `updateIn` the subtree
around the domain's own helper. The transitional part is now one visible line at each call site rather
than a module that looks like an owner. That is what the other four adapters will look like when their
callers move.

### Two identity changes, declared

§7 asks for a guard the legacy code did not have to be stated rather than slipped in, so:

- **the queue's clear is GUARDED.** `setIn(PATH, [])` rebuilt the array on every plug-viz answer, so
  clearing dirtied the subtree even when the queue was already empty — which it is on every answer that
  placed nothing. An already-empty queue is identity now.
- **the queue's empty read is ONE shared frozen reference.** `getIn(state, PATH, [])` minted a fresh
  array per read, and this accessor is a `createSelector` INPUT (`report_visualization_selector`), so
  the memoization of everything composed over it was defeated whenever the subtree was absent. Same
  class as the 11.1 review round's `Map()`-is-a-singleton finding, on the same kind of path.

Everywhere else the legacy behavior is preserved verbatim, including the parts that look like bugs:
every filter-bar `items` write goes through the ranking-filters-last normalization, which REBUILDS the
array unconditionally, so a no-op removal still produces a new value. The helper suite pins that in
both directions — the identity guards that exist and the rebuilds that are inherited — so the row that
wants to change one can see exactly what it is buying. Adding it here would have changed how often the
store notifies, in a row whose whole claim is that nothing changed.

### What the dual-mode removal exposed

Dropping the `toPlain` at the derived-measure queue's boundary broke two specs, and neither was a
regression: `over_time_comparison_service.test.ts` seeded its bucket items with `fromJS` — a container
the buckets subtree stopped producing at **4.11** — and the `toPlain` was silently normalizing the
fixture on the way in. SIX of the eight `hasDerivedMeasureAsOperand` specs had been passing for the
wrong reason (an Immutable operand answers `undefined` to a property read, so the lookup found nothing
and every negative expectation held). The fixtures are plain now and the specs assert what they claim.
**Fourth instance of the fixture-not-the-reader class** (§7), and the first found by deleting a
conversion rather than by flipping a container: a dual-mode boundary keeps stale fixtures alive
downstream of the flip that made them stale.

The same removal retired `over_time_comparison_service`'s closing
`isImmutable(compatible) ? compatible.toList() : compatible` — a container-mirroring branch whose
Immutable half no producer could reach, because both `masterMeasures` sources have been plain arrays
since 11.1.

### Riders

`IPluggableVisualizationState` got a name (the 11.1 treatment of `IBucketsMetaState`, for the same
reason: the operations took `State` and answered `State`, so the queue's element type was nowhere in
the type system). `filter_bar_selector`'s eight finders now delegate to the value-level helpers rather
than re-implementing them — the 4.10 "one implementation, two entry points" rule, which is what keeps
a saga operation and a component from drifting apart. And the suite that covered the deleted facade
moved to the domain (`measure_date_datasets_default_selection.test.ts`) with all six scenarios intact,
re-pointed at the COMPOSITION the selector performs: the rule itself is pinned per input, but the
wiring of three buckets-domain reads into it is what a refactor can silently break.

One pin needed its premise fixed before it meant anything. The "a repeated date-filter update is
identity" spec first asserted the guard on a filter that had never been updated — where it cannot fire,
because the update always writes an `emptyDateValuesFilter` key and a `filterConfig` that a pristine
filter does not have. It drives the second dispatch of the same update now, which is the case that
actually happens in production, and asserts that the first one wrote.

### The review round

Three findings, all from CodeRabbit, and the one rated Major is worth recording because **the defect
was real and its stated trigger was not.**

`measure_date_filter_selector` read `dateDatasetMetaItem.uri` BEFORE the absence check that stood
directly below it — the check itself being the evidence that absence was expected. The reviewer's
scenario was "the measure has no available date dataset": that one cannot crash, because
`Array.prototype.find` on an EMPTY array never invokes the predicate, so the unsafe read is not
reached. The reachable path needs the availability to be non-empty AND the date-datasets META not to
carry the dataset it names — two collections loaded by different requests, so they can disagree. Fixed
(pre-existing, in a line 11.2 rewrote; declared, not silent) and pinned on the path that actually
throws, verified by re-introducing the original code and watching the pin fail with
`Cannot read properties of undefined (reading 'uri')`. **A finding can be right about the bug and
wrong about how to reach it, and only the reproduction tells you which.**

The second finding removed a stale nullable contract: `updateMeasureValueFilter` was declared
`(filterBar, filter: IMeasureValueFilter | null)` while its first statement destructures `filter`, so
a null would have thrown before anything ran — and its only producer,
`UI_UPDATE_MEASURE_VALUE_FILTER`, types the payload non-null. The `| null` and the `filter?.conditions`
chain that came with it are gone. This is the mirror of the 11.1 review round's "a type that
under-states absence invites the wrong fix": a type that OVER-states it invites a caller to rely on a
branch that does not exist.

### Gates

Package suite green (4,813 passed, 29 new specs), `validate` green, `build` green (`tsconfig.json`
is the config that type-checks the test files — a bare `tsc -p tsconfig.json` does not, and it is what
missed a tuple-vs-array mismatch in a new fixture), provenance audit at **0 findings**. No new
`state_paths` entries, no new whole-root writer: the row's net effect on the §10 gate list is one
module deleted and five `(state) => state` surfaces reduced to adapters.

**Playwright: OUTSTANDING.** Not a high-risk row by §8 — no dispatch moved and no container changed —
so the requirement is the relevant filter-bar / buckets specs rather than the full torture pass, and
they have not been run yet.

---

## Phase 11.3 — narrow pure helpers II: `services/buckets_service.ts`

The whole of `services/buckets_service.ts` stops taking the root state. Every computation becomes a
narrow pure helper over a domain VALUE with explicit arguments, the ~35 readers stay `(state) => value`
selectors delegating to those same implementations, and each remaining root-state entry point is a
`read → helper → write` adapter that dies with its caller as the cascades become saga operations at
rows 11.4–11.7. The service went from 1,663 to ~700 LOC of adapters.

The row is organized by INPUT WIDTH, which is also the order the sections below follow:

1. the computations that only ever needed the buckets SUBTREE — the derived reads, the totals rules and
   the date-dataset rules — each `(buckets, …args) => value`;
2. the ITEM WRITERS — add, remove, swap — same shape, but writers rather than readers;
3. the two genuinely WIDE cross-domain calculations, `removeBucketItemsWithDependencies` and
   `setBucketItemOverTimeComparison`, which get an explicit named input and an explicit named result
   each (§4.8.2's sanctioned shape for exactly this case).

Zero behavior change is the row's contract, and the parity evidence is the same throughout: the oracle
suites in `services/test/buckets_service.test.ts` (184 KB of them) and the characterization suites are
UNTOUCHED and green, because every whole-root entry point kept its signature.

### The shim split is the row's real deliverable

`utils/state_access.ts` existed (PR 0.4) so root-`State` call sites could stop writing
`state.getIn(PATH)` while the root was still an Immutable Map. That job finished at 7.1. But Phase 11's
helpers still need deep addressing INSIDE a buckets value (`[...itemPath, "format"]`), which has
nothing to do with the root — and while both roles shared one module, two things were impossible:
the `[M]` detector could not tell a legitimate value-level `setIn` from a root-state one, and nobody
could answer whether `state_access.ts` is deletable at 12.4. So the implementation is
`utils/value_access.ts` now and `state_access.ts` is five typed wrappers over it.

**Wrappers, not a re-export**, and the lint rule that forced it turned out to be right for a second
reason. `no-barrel-files` rejects `export … from`; the first workaround attempt (`export type { … }`)
was rejected too. That is the correct outcome: a barrel would make the two entry points
indistinguishable at the import site, which is the one property the split exists to create. The
signatures stay deliberately loose (`unknown` receiver, not `State`) — the root is not the only thing
addressed through that module yet, and narrowing them is a migration of its own, not a module move.

### What the signatures had to say out loud

- **`sanitizeTotals` keeps BOTH buckets values.** §9.5 flagged this as the row's trap and it is a real
  one: a grand total is identified by sitting on the FIRST attribute of its bucket, so re-pointing it
  after a reorder is only answerable by comparing before with after. A one-parameter conversion would
  have kept every other totals spec green. It is pinned now in both directions — the reorder case that
  needs the previous value, and the no-move case that must not rewrite.
- **The date-dataset lookup is a LAZY RESOLVER** (the 4.9 pattern), which is the single change that let
  five date rules stop taking `State`. `setBucketItemsDateDataset` resolves it ONCE rather than per
  item: every item it writes ends up pointing at the same `ref`, so the whole-root version's per-item
  lookup was answering the same dataset every time.
- **`getBucketItemDimensionalityRef` takes TWO resolvers, not one lookup.** Its two branches fall back
  the same way but from different sources — a date item resolves through its DATE DATASET's granularity
  attribute, an attribute item through the ITEM CACHE. As a whole-root reader that difference was
  buried in two `if` blocks; as parameters it is in the signature.
- **Feature flags arrive named.** `sanitizeTotals` takes `{ reorderByMeasures }` instead of reading
  `enableNewPivotTable`. The flag is visualization-specific and legitimately so (totals is a
  pivot-table-only concern) — which is exactly the kind of claim that should be visible at the call
  site rather than asserted in a comment inside the helper.

### A guard that identity cannot express

`setBucketTotals` keeps its no-op guard as an ASKED predicate (`areBucketTotalsIdentical`) rather than
letting the adapter infer the no-op from reference identity. The reason is a case identity genuinely
cannot express: a write addressing a bucket that does NOT exist also changes no buckets, and there the
legacy control flow still called `bucketsWereChanged` — re-syncing the reference point and clearing the
md-object validity flag. Two different outcomes, one identical returned value. Pinned as its own spec,
because it is precisely the kind of thing a later cleanup would "simplify" away.

This is the counter-example to §4.8.5, not a violation of it: identity is the no-op signal for a
VALUE, but a whole-root adapter's control flow is not a value.

### Two de-duplications the extraction exposed

Both are the 4.10 one-implementation rule, and neither was visible until the readers had to be given a
value-level home:

- **`getImmutableBucketItems` was a second copy of `buckets_selectors#getAllBucketItems`** — same
  composition, different name, six importers each. Deleted and re-pointed, which also retires the
  Immutable fossil in the name (the subtree has been plain since 4.11);
- **`getBucketItemsFromBuckets` was a second copy of `getBucketItemsInBuckets`.** The two differed only
  in a null-bucket guard that both containers answer identically, and in a `.toList()` that is identity
  on a List.

### The item writers

`addBucketItemsInBuckets` / `removeSingleBucketItemInBuckets` / `swapBucketItemInBuckets` join the 4.10
family in `store/buckets/buckets_write_helpers.ts`, and that module's deep-addressing import moves to
`utils/value_access.js` where it belongs — every receiver in it is a buckets value, never the root.

Three legacy behaviors are reproduced rather than tidied, because all three are observable and none is
visible from a signature:

- a multi-item add at a fixed POSITION inserts every item at the same index, which REVERSES their order.
  Unreachable today (the only positional caller adds one item), kept because "add these three at index
  2" has no other defined meaning here;
- the swap resolves BOTH item paths against the pre-write buckets and then applies them in order, so a
  refused same-bucket swap writes through an index the delete has already shifted;
- the items path of an add is resolved once, so a fold cannot re-target itself half way through.

The swap's own copy of the uiConfig `accepts` lookup — including the `?? []` the 11.1 flip made
load-bearing — was a second implementation of `getBucketAcceptsItemType`; the helper takes it as a
resolver and the duplicate is gone.

### The two wide calculations

`removeBucketItemsWithDependencies` (`store/buckets/buckets_removal_helpers.ts`) absorbed the eight
private `(state) => State` sanitizers that lived under it. Its result is the five domains it actually
decides — `{ buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint }` — and NOT
the reference-point sync or the md-object flag, which belong to the operation (§4.8.3) and stay in the
adapter until 11.4.

**Two corrections the code forced on §3's signatures**, stated rather than slipped:

- the input includes `bucketsMeta`. The design note listed it in the RESULT only, but the chain both
  reads it (`getUneditedFilters` asks whether a filter is unmodified-and-auto-created) and writes it
  (the `autoCreated` marker of every removed item);
- the catalog dep is a metric-REF resolver, not the `CatalogItemTypeResolver` the note named. The filter
  rescue needs the ObjRef to re-point a filter at, not the item's type.

ORDER is this helper's real contract, and four facts in it are load-bearing:

1. the four filter sanitizers run BEFORE the "which filters must go" question. They convert filters that
   reference a disappearing bucket measure/attribute into catalog-`ObjRef` filters, and that conversion
   is exactly what then stops them counting as having a missing dependency. Ask first and sanitize
   second and every such filter is silently deleted;
2. the notification counts come from the SANITIZED filter bar but the ORIGINAL buckets;
3. the notification is computed BEFORE the filters are removed, for the same reason;
4. `sanitizeTotals` compares the ORIGINAL buckets with the reduced ones (§9.5), and runs AFTER the
   sort-item validation.

`setBucketItemOverTimeComparison` (in `over_time_comparison_helpers.ts`) is four branches that are four
different transactions, not variants of one write. **Its input is wider than §3 predicted, and the
reason is worth recording:** branches 1 and 3 run the removal chain — whose legacy tail re-synced the
reference point and cleared the md-object flag — and then KEEP GOING, re-sanitizing totals and sort
items afterwards. The sync therefore happens in the MIDDLE of the operation, so the operation has to own
it, and `referencePoint.buckets` ends up deep-equal to but not identical with `data.buckets` whenever
totals exist. Moving the sync to the end would tidy that up and change which buckets value the plug viz
receives — a behavior change in a row that promises none. Row 11.4 collapses the two syncs into one
event, and that is where §3's narrow `{ buckets, filterBar, pluggableVisualization }` input becomes
reachable. Both facts are pinned, including the no-totals case where the sync is NOT observable.

The flag is carried as a plain `boolean` in and out rather than as an optional "write this" field: the
branches that run the tail answer `false`, the others answer what they were given, so an unchanged flag
is an unchanged primitive and the adapter's write is a no-op. An optional field would have been a
change-set field, which §4.8.4 bans.

### Riders the extraction forced

- **`services/buckets_meta_service.ts` is DELETED.** It wrapped ONE pure function in a namespace object,
  so it bought an indirection and an import edge and nothing else — and it meant the removal chain's
  helpers would have had to import a SERVICE to ask a question about a domain value. The rule lives in
  `store/buckets/buckets_meta_helpers.ts` next to the `autoCreated` writer; its two callers import the
  function.
- **`createDerivedMeasure` / `transformDerivedMeasure` leave the service** for
  `store/buckets/derived_measure_helpers.ts`. They never took the root state, and keeping them there
  forced `over_time_comparison_helpers.ts` to import from the very service it exists to replace — a
  helper depending on its own replacement target. Its `as unknown as IRawBucketItem` double cast is gone
  with the move: the literal is typed at the generic instead.
- **`selectors/sliced_insight_selector.ts` shrinks to its one predicate.** It answered "which items are
  slicing" by concatenating two separately filtered lists over a `toPlain` copy of every bucket item —
  the same SET `getAttributesInBuckets` already answers, in a different order, with only its length ever
  inspected. Second definition deleted (the 4.10 rule); `getSlicingBucketItems` had exactly one consumer
  and it was the removal chain.
- **`findReplacedBucketItemNewInsertionIndex`'s parameters were called `immutableBucket` /
  `immutableUpdatedBucket`** — untrue since 4.11 and actively misleading, since the `toPlain` calls next
  to them are the dual-mode normalization every helper of this row keeps, not evidence of an Immutable
  state. The rule is value-level in `helpers/bucket_layout.ts` now, named after the two orders it
  compares.
- **`ISwapBucketItemAction`'s `from` / `to` were `any`.** That is what let the swap read them through the
  dual-mode shim with nobody noticing the type had gone (the 4.11 lesson: `tsc` cannot see through
  `any`). Typed `IRawBucketItem` together with the two components that dispatch it and the apply
  reducer's `{ bucketItem, catalogItem }: any` payload.

### Fixtures

Typing the totals payload as `ITotal[]` exposed two `fromJS` fixtures seeding the container the buckets
subtree stopped producing at **4.11**, and typing `bucketsMeta` as `IBucketsMetaState` exposed a third
(`buckets_meta_service.test.ts`, now `store/buckets/test/buckets_meta_helpers.test.ts`). **Fifth through
seventh instances of the fixture-not-the-reader class** (§7), all three found by the COMPILER rather
than by a runtime failure — the 11.1 lesson repeating, that a type is the cheapest audit available once
the `any` is gone.

### What the new specs caught

The helper suites are not decoration; two of them failed first and both were the SPEC being wrong about
the code, which is the useful direction:

- the removal helper does NOT answer the filter bar by reference on a no-op. Every `items` write goes
  through `normalizeFilterBar`, which rebuilds unconditionally — and the legacy chain called
  `removeFilters` on every removal too, so this is inherited, not introduced (PR 11.2's identity note
  predicted it). Pinned in both directions;
- a classic ranking filter is dropped outright once no slicing bucket item survives, whatever measure it
  points at — so the branch-3 spec needed an attribute in the fixture before it could observe the
  ranking filter being re-pointed at all.

### The review round found a real one, and it is the container class again

The two new slicing readers applied ARRAY operations to a container-PRESERVING reader.
`getAttributesInBuckets` answers the shape of its input, so an Immutable buckets value yields a `List` —
whose `length` is `undefined` and whose `.map` answers another `List`. Both sites therefore returned the
wrong answer SILENTLY rather than throwing:

- `getSlicingBucketItemLocalIdentifiersInBuckets` would hand the removal chain a `List`, making
  `remaining.length === 0` an always-false — so "no slicing survives" would never fire and filters the
  legacy chain removed would be kept;
- `isInsightSliced` would answer `false` for any Immutable buckets value, because `undefined > 0` is.

Neither was caught by the suites, because nothing currently feeds Immutable buckets through the removal
chain — and neither would have been caught by the compiler, because the declared `string[]` was simply a
lie. What made it a regression at all is that BOTH replaced code that went through `toPlain` first. The
fix is the pattern the module already had one line up (`getBucketItemLocalIdentifiersInBuckets` wraps
with `toShallowArray`) plus `count` for the predicate, and both are now pinned with an Immutable fixture
— verified by re-introducing the bug and watching the specs fail.

**The lesson is narrower than "remember toPlain":** a helper whose input container is not fixed cannot be
consumed with array syntax, and the declared return type will not tell you. The dual-mode helpers in
`utils/collection_access.ts` exist for exactly this, and the audit that would have caught it mechanically
is a `[K]`-style rule about array methods on the output of a shape-preserving reader — noted for §7.

### Gates

`build-check` green (`tsconfig.json`, the config that type-checks the test files), `validate`
green end to end (lint, dependency-cruise, stylelint, format, locales), provenance audit at **0
findings**, package suite **4,901 passed** (4,813 at the row's start, so 88 new specs) with the oracle
and characterization suites UNTOUCHED — which is the parity evidence for a row whose whole claim is that
nothing changed.

**Playwright: OUTSTANDING.** Not a high-risk row by §8 — no dispatch moved and no container changed —
so the requirement is the relevant buckets / totals / date-dataset / over-time-comparison specs rather
than the full torture pass.

---

## Phase 11.4 — the buckets operations become saga-orchestrated

**The row that makes the architecture real.** `store/buckets/buckets_apply_reducer.ts` (774 LOC) is
DELETED and gone from `reducers/root_reducer.ts`; `store/buckets/buckets_reducer.ts` went with the fake
dispatch it existed for. Its 24 triggers write nothing at all now.

The shape, per trigger: a saga handler selects the typed domain values it needs, resolves the foreign
facts as a deps object, calls a narrow pure operation, and commits ONE semantic event that the owning
slices and leaves consume as ordinary cases. No effect between the selects and the put other than pure
`call`s; `takeEvery`, because no handler awaits I/O.

### What shipped

- **The operations** are pure value-level calculations with an explicit named input, params and result
  each — the shape 11.3 established for its two wide calculations, now applied to all of them.
  `buckets_edit_operations.ts` holds the eleven bucket-item edits behind ONE `editBucketItem` (the
  discriminant is the KIND of edit), the three `SET_*_DATE_DATASET` triggers, `selectVisualizationType`
  and the dual-axis operation; `buckets_add_operation.ts`, `buckets_move_operations.ts` (remove /
  replace / swap / reorder), `buckets_filter_removal_operation.ts` and
  `extended_reference_point_operations.ts` are the rest. The last one carried the geo display-form
  normalization block out of the dying reducer, with its one state read becoming a resolver.
- **The events** are `buckets_operation_events.ts` — twelve of them, payload = the operation's result,
  different per operation because that is the information a universal payload would erase (§2.4).
- **The saga boundary** is `buckets_operation_inputs.ts`, the ONE module of the family allowed to know
  the root state: per-operation readers, deps builders and writers. No generic path-keyed write map —
  that is the shape §4.8.4 bans because it is what the 10.9 prototype shipped.
- **The consumers.** `buckets_slice.ts` LOST its nine trigger cases and gained ten event cases;
  `reference_point_slice.ts` gained the SYNC (eleven cases, one per operation) it has been waiting for
  since 11.1; `visualization_classes`, `configuration_panel`, `properties`, `filter_bar` and
  `bucket_notifications` each consume the events that decide them. `data.bucketsMeta` became a slice —
  and owns `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED` outright, one of §2.4's five non-cascades.
  `data.extendedReferencePoint`, `data.isVisualizationMdObjectValid` and `data.pluggableVisualization`
  stopped being `holdSubtree` entries and got real reducers.
- **The fake dispatch is gone.** `utils/buckets_reducer_helpers.ts` keeps its five entry points, but
  they read the operation's input, run it and write the result through the SAME per-operation writers
  the sagas commit through. Their callers are the shortcuts and recommendations wrappers (row 11.5).

### Why the three leaves are hand-written and `bucketsMeta` is not

`createSlice` runs its case reducers inside immer, which DEEP-FREEZES what they return in development.
The extended reference point is the value AD hands straight back to a pluggable visualization on the
next round trip, and the queue holds items the plug viz places — freezing either would turn a
pre-existing in-place write somewhere in that contract into a hard throw, which is a risk this row has
no reason to take. A plain reducer function has the identity short-circuit and none of the freeze
exposure. `bucketsMeta` is a slice because it is AD's own marker maps and nothing outside AD holds them.

### Five corrections the code forced on the design notes

1. **The ADD operation commits NINE domains, not six.** §2.1 lists buckets, bucketsMeta,
   configurationPanel, pluggableVisualization, referencePoint and the md-object flag. It also commits
   the filter bar, the notifications and the extended reference point, because a MEASURE added while
   every reference-point measure already compares over time runs the whole
   `setBucketItemOverTimeComparison` operation — and two of that operation's four branches run the
   removal chain. Three ordering facts under it are load-bearing and now documented in the module: every
   foreign fact is read from the entry state; `areAllSelectedCompatible` asks about the REFERENCE POINT
   only (which the add has not touched, so the entry value is what the legacy code read from the
   half-written state); and the comparison TYPE is resolved against the buckets WITH the new item but
   the reference point WITHOUT it.
2. **The REORDER does not run the removal chain.** §2.1's commits column says "buckets (+ the removal
   set)". The legacy handler used the buckets-ONLY `removeSingleBucketItem` adapter, so no filters,
   notifications or markers are touched. The result type has three fields and a spec pins that.
3. **`DND_ITEM_REMOVE` has a SECOND removal pass** §2.1 does not mention: the legacy handler ran the
   whole chain again over every remaining derived measure when the first pass had left
   period-over-period comparison unavailable. It is `purgeDerivedWhenPopUnavailable` in the params, set
   by that one trigger.
4. **`BUCKET_TOGGLE_DUAL_AXIS` needed an event of its own.** It decides TWO domains — the `dualAxis`
   visualization-properties control and every item's `showOnSecondaryAxis` — and the legacy chain landed
   both in one dispatch. Keeping the properties half on the trigger while the buckets half moved to a
   semantic event would have exposed exactly the half-applied state §9.1's risk 1 describes: the control
   on, the items not yet flagged. So dual axis is not a `BucketItemEdit`; it is
   `toggleBucketsDualAxis` committing `dualAxisToggled`, and the properties RULE stays in the properties
   domain as the exported `properties_helpers#setDualAxisControl` that the operation composes.
5. **11.3's identity claim was one domain too generous.** Its note said a removal that removes nothing
   answers all FIVE inputs by reference. Four do. The chain ends with an unconditional `removeFilters`,
   and `setFilterItems` under it always builds `{...filterBar, items}` — no identity guard. That is
   pre-existing rather than a regression here (the whole-root adapter wrote the value with the shim's
   `setIn`, which short-circuits on equal PRIMITIVES or the SAME reference and never on a deep-equal
   object), so it is pinned in both directions and the note is corrected. Adding the guard would be a
   behavior change — one fewer store notification per no-op removal — and belongs to whoever wants it.

### The undo/observer consequence, stated precisely

"One gesture, one store write" is a statement about **`data`**, not about the root. Time travel runs on
the TRIGGER and must keep doing so — a snapshot is the state as it was BEFORE the edit, so it cannot
wait for the operation's event. Every whitelisted buckets trigger therefore changes the root once
(pushing `timeTravel.past`) before the event changes it again.

That second root change notifies nothing that matters: `observeStore` and `react-redux` both compare the
SELECTED value by identity, and no consumer selects `timeTravel` except the undo/redo affordances, for
which the snapshot is precisely the news. `countStoreWrites` in the test harness measures `data`
accordingly, and the oracle pins one write per gesture and ZERO for an operation that legitimately
commits nothing.

The undo whitelist itself did not change: it keys on the frozen trigger strings, the snapshot still
precedes the edit, and the semantic events are deliberately NOT undoable — so a gesture is still exactly
one undo step, now spread over two dispatches instead of one.

### Testing

`test/utils/dispatch_buckets_trigger.ts` drives a trigger through the real saga and the real root
reducer and answers the resulting state. It is **synchronous**: every operation handler does selects,
pure calls and one put and never awaits I/O, so `runSaga` over a `stdChannel` completes the whole gesture
inside `channel.put`. That is what let ~90 existing assertions across four suites migrate by changing
the call, with no `async`/`await` churn — and an accidental future `yield take(...)` inside an operation
handler shows up immediately as a spec that stops seeing its write, which is a tripwire rather than a
limitation. It is NOT the deleted `reduce_with_cascades.ts`: there is no chain to re-assemble here, and
the only thing it fakes is the store.

The parity evidence is that `reducers/test/bucket_reducer.test.ts` (56 gestures),
`buckets_reducer.test.ts` (28), `bucket_reducer_for_combo_chart.test.ts` (4) and
`buckets_cluster_characterization.test.ts` kept every expectation they had. Two new suites cover what
has no oracle: `buckets_operations_saga.test.ts` (35 specs — all 24 triggers reach a handler and commit
the RIGHT event, the trigger writes nothing, the no-op operations put no event, the non-cascades reach
no saga) and `buckets_operations.test.ts` (15 specs of value-level IDENTITY, asserted with `toBe`).

One false pass was found and fixed while migrating: the characterization suite's "removing an attribute
with no dependants leaves the notifications subtree untouched" still went through `rootReducer`, where it
passed because the trigger no longer writes anything at all.

### Rider: the last dual-mode branches in the buckets helpers

`getBucketItemsInBuckets` and `mirrorTotalsToDerivedMeasures` each carried an `isImmutable` branch kept
"for the transition". `data.buckets` flipped at 4.11, and after this row the only thing that could still
deliver an Immutable buckets value was a `fromJS` TEST FIXTURE. Both branches are gone and four fixtures
are flipped to plain — the rule the container audits settled on ([[fixture-seeds-old-container]]): a
dual-mode reader keeps a dead container alive and hides the day a real producer regresses.
`bucket_item_predicates.test.ts` deliberately keeps its dual-shape table — those predicates go through
the SHIM, which stays dual-mode until 12.4, and they are also called on decorated buckets.

`buckets_cluster_state.ts` is deleted, split into `buckets_meta_state.ts` and
`pluggable_visualization_state.ts`: the module named a "cluster" the architecture does not have (§4.8.4),
and bucketsMeta's state belongs next to the slice it got in this row.

### The cycle a slice case creates, and where 11.5/11.6 will hit it

Wiring the events into the consumer reducers introduced **21 `no-circular` errors**, and every one of
them ran through a TYPE that happened to live in a reducer module:

```text
buckets_add_operation     ->  filter_bar_reducer          (for IFilterBarState)
filter_bar_reducer        ->  buckets_operation_events    (the five events that decide the filter bar)
buckets_operation_events  ->  buckets_add_operation       (for its result type)
```

A type has no runtime dependencies, so keeping `IFilterBarState` next to the reducer that happens to be
its first writer is what created the edge — and every other domain had already stopped doing that
(`buckets_state.ts`, `reference_point_state.ts`, `properties_state.ts`, `buckets_meta_state.ts`). The fix
is two new modules, `store/filter_bar/filter_bar_state.ts` and
`store/bucket_notifications/bucket_notifications_helpers.ts`, with all importers re-pointed and NO
re-export shim (`no-barrel-files` bans one, and a shim would keep the very edge it removes).
`filter_bar_reducer.ts` is now imported by exactly two modules: the combined root and its own test.

**Rows 11.5 and 11.6 will hit this exact trap**, because they make `arithmetic_measures_reducer.ts` and
`bucket_filters_reducer.ts` consume operation events while the buckets operations still need types those
modules export. The rule to apply before wiring, not after: **a domain's state type and its pure helpers
belong in `*_state.ts` / `*_helpers.ts`, never in the reducer** — the moment a reducer consumes another
domain's events, anything the reducer exports becomes a cycle risk.

It was found late because `rushx validate` is what cruises dependencies, and `lint` / `format-check` /
`build-check` / `test-once` all pass without it. **Run `rushx validate`, not the individual scripts.**

### What the e2e run found: a trigger's write is no longer synchronous, and four specs depended on it

The playwright run failed four specs, and all four are ONE consequence of the row that the unit suites
structurally could not see. `bucketsApplyReducer` wrote during the **trigger's own dispatch**, so the new
buckets were in the store before the saga middleware even published the action. An operation saga has no
such privilege: `runPutEffect` schedules through the redux-saga scheduler, so while a flush is in progress
a `put` is QUEUED and the event reaches the reducer only afterwards. Two things that used to be free
stopped being free — **who reacts first**, and **what a saga sees after it dispatched a trigger**.

Neither is visible to `dispatch_buckets_trigger.ts`, because that harness runs the operations saga ALONE.
The tripwire the harness advertises catches a `take` inside an operation handler; it cannot catch a
_second watcher_ of the same trigger, and that is exactly what broke.

**1. `EXTENDED_REFERENCE_POINT_CHANGED` has two watchers, and the replay lost the race.**
`store/shortcuts/postponed_action_sagas.ts` replays the shortcut a metric drop parked; it was registered
long before `watchBucketsOperations` in `sagas/sagas.ts`, so its replay dispatched FIRST, added the
measure, and then `extendedReferencePointApplied` — computed from the pre-replay buckets — overwrote
`data.buckets` with the plug viz's answer, which does not contain it. For the over-time shortcut it also
wiped the date filter that `setGranularity` had just created, because that event carries `filterBar` too.
Symptom: `.s-bucket-measures .s-bucket-item` **expected 1, received 0** — the canvas shortcut did nothing
at all. Three specs: `factBasedMetric` (single metric shortcut), `dndToCanvas` (drop a metric to blank
canvas), `undoButton` (metric over time followed by a filter change, which died at the missing
`.s-date-filter-button`). The attribute shortcut was NOT affected: `sagas/shortcut_sagas.ts` waits with a
dynamic `take`, which registers last and therefore already ran after the commit.

The fix is a `yield take(extendedReferencePointApplied.type)` in `dispatchPostponedAction`, so the
dependency is **local and independent of registration order** rather than an invariant hidden in the
position of an entry in a 50-element `all([...])`. `watchBucketsOperations()` also moved to the FRONT of
that list, which restores the reducer-era default that the buckets write is the first dispatch a trigger
produces — but that is a default, not something another saga may lean on.

**2. `syncBucketItemsDateDataset` read the buckets it had just asked to change.**
It puts one of the three `setBucket*DateDataset` triggers and then calls `synchronizeDateFilterDateDataset`
and `handleBucketDerivedItemsWithDateFilter`. The latter selects `isPoPSetup`, which compares the bucket
date items' `dateDatasetRef` against the filter's — and at that moment `bucketsDateDatasetChanged` is
still queued, so it compared the PRE-change dimension, found it matching, and never purged the derived
measures. Symptom: `dateFilterDataset` "Should remove derived items when date dimensions are not same in
buckets and in filter", **expected 1, received 2**. Fixed with a `yield take(bucketsDateDatasetChanged.type)`
between the put and the reads.

**The pattern to check before any further row moves a reducer handler into a saga**: grep for every other
watcher of the trigger, and for every `put(trigger)` followed by a `select` in the same saga. Both were
mechanically enumerable here — the audit found exactly these two sites, plus three telemetry loggers
(`bucket_saga.ts`) that read the whole state for context only, where pre- vs post-write is immaterial.

`store/shortcuts/test/postponed_action_ordering.test.ts` is the regression oracle, and it needed the
harness widened: `runBucketsTrigger` now takes co-watchers and registers them BEFORE the operations saga,
which is the adversarial order. Reverting either fix turns the spec red with `expected [] to have a
length of 1` — the unit-test form of the e2e symptom.

### Gates

`rushx validate` green END TO END (lint 0 errors, dependency-cruise **0 errors**, stylelint, format,
locales, provenance audit 0 findings), `build-check` green, package suite **4,955 passed** across
412 files (4,901 at the row's start, so 54 net new specs after the dual-mode tables collapsed).

**Playwright: OUTSTANDING, and this is a §8 HIGH-RISK ROW** — the orchestration of the whole buckets
family moved out of the reducer chain. The required pass is the full e2e run plus the manual smoke §8
names: embedded-mode postMessage commands, undo/redo/reset torture, open/save/delete/export, a splunk
event spot-check and devtools inspection of the one-dispatch-per-gesture property.

## Phase 11.5 — the properties / arithmetic / recommendations / shortcuts operations

**Delivered as #12725.** This entry is RETROACTIVE — the PR recorded the row in the plan's §5 table
(where its full field record lives) but did not append a note here; this section restores the
tracking and keeps only the facts a later row needs. For the details read the plan's row 11.5
"Delivered:" text.

Four wrappers (~16 triggers, ~11 operations) left the chain and were DELETED. The three non-cascade
flips landed first and alone: the two properties triggers became plain extended-reference-point leaf
cases, and the dropped item became a real leaf owning `SHORTCUT_SET_DROPPED_ITEM` (time travel's
`setDroppedItem` fixup moved next to it). Then one operation module + one events module + one saga
per family: `properties_operation.ts`, `arithmetic_measures_operations.ts`,
`recommendations_operation.ts`, `shortcuts_operations.ts`.

What matters downstream (11.6 reads this):

- **Payload corrections on §2.2, stated not slipped:** `recommendationApplied` and the two shortcut
  applies carry the buckets ADD operation's full nine domains (+ the class / the copied
  `dateDatasets` / the cleared shortcut leaves), and `arithmeticMeasureOperandSelected` carries
  `bucketsMeta` — the removal chain rewrites the markers.
- **The 11.4-mandated audit found ONE genuine hazard:** `onPropertiesChanged` put the store trigger
  and then `put(undo())` for an over-long push — with the trigger writing nothing, the undo would
  run before the queued operation and its commit would silently redo the change. The too-long tail
  (warn + log + undo + disableRedo) moved INTO the operation handler, pinned end-to-end.
- **The predicted reducer-module cycle hit exactly as the 11.4 note said it would:**
  `IShortcutDroppedItemState` closed `events → operations → reducer`, caught only by
  `rushx validate` (dependency-cruise). The type moved to its own state module
  (`shortcut_dropped_item_state.ts`). 11.6 must expect the same trap for every type it makes an
  event payload carry.
- Riders: the whole-root adapters died with their callers (`utils/buckets_reducer_helpers.ts`, the
  `[J]` write half of `buckets_operation_inputs.ts`, the OTC service writer, the queue writers of
  `PluggableVisualizationService`, root `setBucketTotals`/`sanitizeMeasureFormat`,
  `DateDatasetUtils.findDateBucketItems` with this module's last dual-mode `List` sentinel);
  `getLocalVisualizationClass` moved to `visualization_class_service.ts`; the `SHORTCUT_APPLY_*` /
  `dropCatalogItem` creators are typed `ICatalogEntry`.

## Phase 11.6 — the bucket-filters operations, the last cluster wrapper

**Delivered as #12797.** `bucket_filters_reducer.ts`
is DELETED and gone from `reducers/root_reducer.ts`, and with it **all six buckets-cluster wrappers
are gone from the chain** — what remains of `postCoreWrappers` is the report family's two entries
(row 11.7). Its eleven triggers split exactly as §2.3 predicted: BOTH display-form triggers are one
plain filter-bar case (`storeAttributeFilterDisplayAsLabel`), and the nine cascade triggers are saga
operations in the 11.4/11.5 shape — `bucket_filters_operations.ts` (an explicit named input, params,
deps and result per operation), `bucket_filters_operation_events.ts` (nine semantic events),
`bucket_filters_operations_saga.ts` (the boundary). The derived-measure consequence of a
date/metric-filter change is `updateDerivedMeasuresOverTime` in `over_time_comparison_helpers.ts`,
composing the 11.3 OTC operation per master measure; the family's `data.itemCache` and
`data.measuresDateDatasets` writes became `measureFilterAdded`/`measureFilterRemoved` slice cases.

### The audit the 11.4 note demanded found TWO genuine hazards

Both are the put-trigger-then-select class, and both got the `take(<event>)` fix:

1. **`control_filtering_saga` read the filter items its command had just created.** The
   `setFilterContext` flow puts `STORE_ADD_OR_UPDATE_FILTER_ITEMS` and then selects the filter items
   to find the GENERATED local identifiers of the filters the command created (the display-as-label
   follow-up addresses them). With the trigger writing nothing, the select read the pre-command
   items and the follow-up silently missed every created filter. Fixed with
   `take(filterItemsUpdatedFromCommand)` — and the operation therefore ALWAYS answers a result, so
   the event always fires (a rejected update answers the unchanged input by reference).
2. **`synchronizeDateFilterDateDataset`'s caller read `isPoPSetup` off the filter it had asked to
   re-point.** The same shape as the `bucketsDateDatasetChanged` hazard the 11.4 note recorded,
   one screen further down the same flow. Fixed with `take(dateFilterDateDatasetChanged)`, and the
   operation always fires that event too — a missing filter or an unchanged ref carries every value
   by reference, which is the §4 "cannot hang on a no-op cascade" property made concrete.

Co-watchers audited and SAFE: the telemetry watchers select post-write state for context only, the
splunk middleware formats on the PRE-write state in both architectures (`store.getState()` before
`next(action)`), and time travel keys on the trigger with a before-the-edit snapshot
(`STORE_ADD_OR_UPDATE_FILTER_ITEMS` stays in the undo whitelist, the 11.4 `countStoreWrites`
precedent).

### Payload corrections on §2.3, stated not slipped

- the three removal-chain-capable events (`dateFilterUpdated`, `filterItemsUpdatedFromCommand`,
  `measureFilterUpdated`) carry the full NINE domains — the derived-measure queue included, because
  enabling a comparison with no derived measure yet QUEUES one;
- `measureFilterUpdated` carries the reference point and the md flag CONDITIONALLY, as legacy: an
  edit with neither the over-time rider nor `isModified` rewrites the filters but does not re-sync
  (pinned by identity — the payload carries the value it read);
- `dateFilterDateDatasetChanged` always fires (above).

### Declared hardenings — each replaces a legacy CRASH, never a legacy write

- an attribute-filter update addressing a filter that does not exist COMMITS NOTHING (the legacy
  helper's invariant threw out of the reducer, so nothing landed there either — but an uncaught
  throw out of a takeEvery worker kills the family's WATCHER, which the reducer never risked);
- a metric-filter operation addressing a bucket item that is in no bucket COMMITS NOTHING (the
  legacy path fed an empty filters path into `updateIn` and mangled the root);
- a date-filter payload without `overTimeComparisonMeasures`/`overTimeComparisonType` reads as "no
  comparison" (the legacy reduce crashed on the absent list; the fields only arrive together).

### Riders

- The STORED bucket-item metric filter got its own type — `IBucketItemMetricFilter` in
  `typings/measure_filters.ts`, deliberately NOT the decorated UI shape (`attribute` is the cache
  identifier string, not a catalog entry) — and all six metric-filter creators dropped their
  `item`/`filter`/`changes` `any`s for `IRawBucketItem`/`IBucketItemMetricFilter`/
  `IMetricFilterChanges`. Typing them exposed three more stale fixtures (the eighth through tenth
  instances of the fixture-not-the-reader class): a Symbol bucket item in `MeasureFilters.test`,
  Immutable `Map` filters in `log_formatters.test` and the telemetry suite — all flipped to the
  plain values production holds.
- `IMetricFilterChanges.selectedElements` stays WIDE (`ReadonlyArray | List`): the
  metric-attribute-filter dialog's apply payload still carries an Immutable `List` from its older
  boundary, and the operation's `toPlain` seam is what normalizes it — the one place this family
  still touches an Immutable value, and it is a PAYLOAD seam, not state.
- The wrapper's `isImmutable(filter) ? merge(fromJS(patch)) : spread` pair — this family's last —
  died with it: the receiving filter lives in `data.buckets`, plain since 4.11.
- Six `buckets_service` write adapters with no caller left anywhere were deleted
  (`removeSingleBucketItem`, `addItems`, `swapBucketItem`, `getMeasuresWithoutArithmetic`,
  `getBucketByBucketItemLocalIdentifier`, `findAllInvalidArithmeticMeasures`); the root adapters the
  OLD ORACLE SUITES still pin stay until their pins migrate or `sagas/highlighting` (their last
  production caller, via the removal chain) gets its own row. `FilterBarService`'s two
  filter-answering entries became direct value-level helper calls; the facade's write half now
  serves only open-report (11.7), the removal chain and test fixtures.
- The oracle suite's two direct calls into the dead wrapper migrated: `updateOrAddNewFilterItems`
  specs drive the REAL command trigger through `dispatchAction`, `updateDerivedMeasures` specs call
  the value-level composition over the saga's own exported reader/deps.
- NEW row-level pins in `bucket_filters_operations_saga.test.ts`, all through the harness (real saga,
  real reducer): the `[P]` one-dispatch gate for all nine triggers, the two commit-nothing
  hardenings (zero writes AND no event), the always-emit contract both `take` sites depend on
  (including a co-watcher in the adversarial order that must see the command-created filters), and
  the conditional-tail identity of `measureFilterUpdated`.

### Gates

`rushx validate` green END TO END (lint 0 errors, dependency-cruise **0 errors** — the predicted
state-type-in-a-reducer-module cycle did NOT recur because every event payload type already lives in
a `*_state.ts`/`*_types.ts` module, stylelint, format, locales, provenance audit 0 findings),
`build-check` green, package suite **4,965 passed** across 413 files (4,951 at the row's start, 14
net new pins).

**Playwright: OUTSTANDING.** This row is not on §8's high-risk list, but it moves the LAST cluster
orchestration out of the reducer chain and touches the embedded `COMMAND/*` protocol path — the
required pass before merge is the embedded filter-context e2e set plus a filters smoke (attribute /
date / MVF / ranking gestures, metric filter add/update/remove, undo over a filter change).

## Phase 11.7 — the remaining root transformers, the wrapper stack empties

**Delivered as #12979.** The five transitional whole-root transformers —
`app_context_transformer.ts`, `router_reducer.ts`, `open_report_apply_reducer.ts`,
`delete_report_apply_reducer.ts`, `execution_apply_reducer.ts` — are DELETED, each decomposed per
§4.8 rather than moved into a saga. `reducers/root_reducer.ts` is now the combined core inside
`withPluggableMountReset` inside `withTimeTravel` — exactly the two sanctioned infrastructure
wrappers §4.8.1 names, and the `[J]` gate's "wrappers not yet dissolved" set is EMPTY. Every root
key has a real owner: `appState.sessionId` (a pure leaf), `appState.locationRedirectLock` (a
slice), `route`/`previousRoute` (independent leaves); the only `holdSubtree` entry left is
`timeTravel`, whose only writer is the time-travel wrapper by design.

### The application resets became semantic events with ONE inventory module

`store/app_context/application_reset_events.ts` is the single place that says which actions reset
what scope, exactly as the 11.7 plan note demanded:

- **insight-content clear** (`isInsightContentResetEvent`) — 15 values;
- **application reset** (`isApplicationResetEvent`) — those plus 8 more;
- the **whole-application reset** (`wholeApplicationReset`, the router's event) adds
  `data.dateDatasets` and clears the undo history.

The owning slices honor the matchers in their own `extraReducers` — one line each, resetting to
the domain's own initial value. The two RECOMPUTED values ride ON the events as
`IApplicationResetCarrier`, built at the dispatch boundary: a fresh `sessionId` (uuid is impure —
and with the `bootstrapData`/`refreshSessionId` prepare callbacks now generating ids too, the
single-owner sessionId reducer is PURE; the BOOTSTRAP_DATA payload gaining `sessionId` is a
DECLARED shape change, recorded in the app_context characterization) and the re-defaulted
visualization class (`data.visualizationClass` must not cross-read `data.visualizationClasses`).

The five reset paths:

1. `RESET_APPLICATION` / `CLEAR_INSIGHT_CONTENT` stay the frozen INTENT triggers and write
   NOTHING; `sagas/reset_sagas.ts` translates each into its event — the put is the worker's FIRST
   effect, so the legacy side effects (telemetry, URI reset, date-dataset refetch) keep reading
   post-reset state, and merging translation and side effects into ONE worker removes any
   dependence on watcher registration order. Time travel keeps clearing on the triggers too
   (belt and suspenders — the characterization pins them and a bare-store dispatch must keep
   clearing) and gains the router event.
2. `OPEN_REPORT_FAILED` resets unconditionally, so its creator CARRIES the carrier (all its
   dispatch sites are sagas). The failure's own writes compose with the reset INSIDE the owning
   slices' cases — `report.loadingError` keeps the reason, the execution slice answers
   `reportNotFoundError(NOT_FOUND)` over the initial state, and the reference point's composed
   `{...initial, reportNotFound: true}` is a hoisted module constant so a repeated failure
   returns the SAME reference (§4.8.5). One dispatch, the legacy wrapper-order sequencing.
3. `DELETE_REPORT_FINISHED` resets exactly when the deleted report is the open one — the delete
   saga always knew that before dispatching (the fact is unreadable afterwards), so the carrier's
   PRESENCE on the payload is the condition the matchers key on.
4. The router path is below.
5. `RESET_FOR_PLUGGABLE_MOUNT` stays what it was — the whole-root pristine rebuild, now named as
   the sanctioned app-reset infrastructure (`withPluggableMountReset`).

**The inventory is PINNED**: `store/app_context/test/application_reset.test.ts` dirties every
reset-scope key plus a set of deliberately-preserved ones and asserts the EXACT changed-key set
per scope (preserved values by IDENTITY), the carrier consumption, and the triggers' inertness.

### The router dissolved into an event pair and a saga decision

`LOCATION_CHANGED` is a pure trigger. The router saga's SYNCHRONOUS PREFIX — placed before
`document.body.click()` (which can fire dispatching handlers) and before any cancellable effect,
which is what a takeLatest worker needs so a rapid follow-up navigation cannot cancel the writes —
does three things: reads the pre-navigation route (the trigger writes nothing, so the read is the
"previous route"), computes the next route with the pure `buildNextRoute` (pluggable-mode
projectId preservation included), and commits BOTH values with ONE `routeChanged` event. The
cross-key read the legacy reducer needed is gone because the ACTION carries the previous route —
`route` and `previousRoute` are boring independent leaves (`route_leaf_reducers.ts`), and
SET_ROUTE_PROJECT_ID is a plain case on each (the payload is all either side needs).
`shouldResetOnNavigation` then decides the whole-application reset PURELY over the pair — project
switch or report-cleared-to-default, first-navigation reset included — and puts
`wholeApplicationReset`. The locked-redirect early return still happens AFTER the writes, as the
legacy reducer/saga split had it. One declared consequence: a resetting navigation is TWO
dispatches (`routeChanged`, then the reset event) where the legacy reducer was one — both land in
the same outer dispatch cascade, neither is undoable, and the 11.4 note's subscriber analysis
applies unchanged.

### Open-report became the operation the row promised

`store/report/open_report_operation.ts` is the pure computation the apply reducer ran over the
whole root: input `{itemCache, bucketsMeta, filterBar, measuresDateDatasets, dateDatasets}`,
params `{insight, loadedItems, visualizationClass}` (the class resolved at the boundary — the
default-class rule reads the enabled-classes selector, a fact the operation must not own), deps
`{dateDatasetUriByIdentifier}`. `sagas/open_report_sagas.ts#resolveOpenReportResult` is the
boundary — a plain function over `state` so the oracle suite drives the IDENTICAL path — and
OPEN_REPORT_FINISHED carries the fused `IOpenReportResult`: buckets, bucketsMeta (modified
rebuilt, expansion markers present-undefined as legacy), the shallow-merged itemCache, the filter
bar composed through the domain's own 11.2 helpers, the per-measure date-dataset selections, the
conditional dateDatasets ANSWERED BY REFERENCE when the insight selects no dataset (§4.8.5 — the
slice's unconditional case is a no-op exactly where the legacy `if` skipped the write), the
visualization class, the properties (with the ERP mirror and the wholesale reference point). One
dispatch, twelve owning consumers, and the reference-point filters conversion reads the PRE-open
bucketsMeta exactly as the legacy pass did. OPEN_REPORT_STARTED's ERP delete became an ERP leaf
case. `open_report_apply_reducer.test.ts` became `open_report_operation.test.ts` — the same pins,
now driven through the saga's own boundary AND the real root reducer.

### The nowOpen close became the execution domain's coordination event

`executionApplyReducer`'s one foreign write — closing `report.nowOpen` when the finished result
belongs to the CURRENT execution — is `currentReportExecutionSettled`, emitted by
`execution_coordination_saga.ts` after re-testing the same id guard the execution slice applies
(none of the execution actions writes `id`, so the two tests cannot disagree — the wrapper's own
mutual-exclusivity argument). A superseded result emits NOTHING (pinned). `report.nowOpen` has no
production reader between the trigger and the event, so the one-nested-dispatch gap is
unobservable; `isReportNowOpen` in fact has NO production consumer at all — left for a Phase 12
decision rather than deleted mid-row.

### The audit the 11.4 note demands, run for this row

- The put-trigger-then-select class: the three `put(resetApplication())` sites
  (postMessage open/clear, unsaved-changes) and `clear_insight_content_saga`'s
  put-then-`clearInsightContentFished` reply are SAFE — the translation worker's put is nested
  inside their put, so the state is fully reset when their effect returns.
- `reset_sagas`' own selects were the one genuine ordering dependency (telemetry reads the
  refreshed sessionId) — solved structurally by same-worker-put-first, pinned in
  `reset_sagas.test.ts`.
- LOCATION_CHANGED co-watchers: the router saga is the only taker and is itself the writer now;
  the takeLatest cancellation window is closed by the synchronous prefix (pinned in
  `router_sagas.test.ts`: the route pair and the reset land before the redirect-lock early
  return).
- REPORT_EXECUTION_FINISHED co-watchers: `render_insight_saga` reads lastSavedObject only, the
  splunk middleware formats pre-write state in both architectures, the execution slice guards on
  its own id.

### Riders

- `reportExecutionFinished`'s `executedReport: any` is typed as the render's `IExecutionResult`
  (with the `status` the embedded render notification reads off the finished/failed union).
- The open-report pipeline's `any`s died with the operation module; `IRawBucketItem` gained the
  date item's `uri` and `IBucketItemMetricFilter` the date filter's `dimension` — both fields the
  legacy code read untyped through the shim.
- The dead `IImmutableFilterItem`/`IImmutableDateFilter` aliases are deleted;
  `IImmutableElement` stays — it types a live dual-mode payload seam.
- `getSelectedDateDataset` answers `undefined` where the legacy helper answered `null`; the value
  never leaves the operation (it only gates the dateDatasets write).
- The legacy composed `store/app_context/app_context_reducer.ts` (a test-only shim since 7.2)
  went with the transformer; `store/report/report_reducer.ts` and
  `store/execution/execution_reducer.ts` remain as test-only branch drivers.
- `rootWrapperReducers` and its duplicate-entry wiring pin died with the wrapper arrays —
  `combineBranch` enforces one-owner-per-key by construction.

### Gates

`rushx validate` green END TO END (lint 0 errors, dependency-cruise 0 errors, format, locales,
provenance audit 0 findings), `build-check` green, package suite **4,976 passed** across 415 files
(4,951 at the row's start, 25 net new pins — the reset inventory, the router navigation suite, the
translation order, the coordination guard).

**Playwright: OUTSTANDING — this row IS a §8 high-risk gate.** Required before merge: full e2e run
plus the manual smoke (undo/redo/reset torture, embedded postMessage commands,
open/save/delete/export, splunk event spot-check) — the reset, open, delete and navigation flows
all moved their write paths.

## Phase 12.1 — strict root composition

**Delivered as #12988 (code) + #12991 (12.1b, the comment-only companion).** The combined root is redux's strict `combineReducers`, nested per branch
(`reducers/combined_root_reducer.ts`), and `store/_infra/combine_branch.ts` (`combineBranch` +
`holdSubtree`) is DELETED with its documented `any` seam. One owner per key is structural now — a
second writer has nowhere to plug in — so the 7.2 wiring pin moved to the compiler:
`ICombinedRootState` is inferred from the reducers themselves, with ONE documented cast to the
loose public `State` at the export (the leaves keep their narrow action unions; every reducer
no-ops unknown actions, so the widening is safe at runtime). `timeTravel` is owned by a plain
self-init leaf next to its seed (`_infra/time_travel_state.ts#timeTravelLeafReducer`), written
only by the time-travel wrapper, as before.

### Null at rest, undefined at the boundary

Strict `combineReducers` rejects an `undefined` reducer return, and six values are genuinely
optional: `route`, `previousRoute`, `appState.sessionId`, `data.extendedReferencePoint`,
`data.postponedAction`, `data.shortcut.shortcutDroppedItem`. The row did NOT push `?? null` into
every case of every domain reducer — a missed one would be a production throw. Instead ONE mount
adapter, `_infra/nullable_leaf.ts`, converts at the composition boundary: the domain reducers keep
their natural `undefined` contract (several writers carry an optional payload field with exactly
that meaning), the store holds `null` at rest, and each input selector converts back
(`getRouteState`/`getPreviousRouteState`, `getAppSessionId`, `getExtendedReferencePoint`,
`getPostponedAction`, `getDroppedCatalogItem`), so no consumer sees a shape change. Identity is
preserved both ways — `null` stays `null`, an unchanged value comes back by reference — so the
no-op signal survives.

The audit this conversion demanded (the 11.6 lesson: an optional source into a raw reader crashes
with zero unit signal): every deep read through the six keys goes through `getIn`, which answers
the not-set value on a `null` mid-path exactly as it did on an absent key; `hasIn` has no
production caller over them; the one root-state writer (`setDroppedItem`) writes `null` already.
The one real casualty was `buckets_service.ts`: its unconditional ERP write-backs re-wrote the
normalized `undefined` over the stored `null` and dirtied a no-op — now guarded by the normalized
read (`writeExtendedReferencePoint`), which restores the identity contract the § on operations
promises.

### Consequences, declared

- The pristine state carries the six keys as `null` where they used to be ABSENT;
  `root_flip_contract.test.ts` splits the pin into NULL-at-rest vs ownerless-absent
  (`appState.undo`/`redo` stay nonexistent — the strict root cannot hold a key nobody owns).
- Undo snapshots always carry `route`/`previousRoute` now. Reachable histories are unaffected:
  both are written before APP_READINESS_CHANGE clears the history, so no reachable entry predates
  them — the restoreSnapshot "optional root key" divergence note is moot and rewritten.
- A stray root key in a hand-built state is DROPPED by the strict root instead of preserved;
  `strict_root_composition.test.ts` pins it as the conscious record.
- Immutable left the dispatch path: the `plainSubtreeLeaf` mounts are gone (bare slice reducers),
  `initial_state.ts` dropped its `isImmutable` branch, and the dev logger's `fromJS/toJS`
  deep-clone `stateTransformer` went with it. `plain_subtree.ts` survives only inside the
  `lift_slice` test-era reducers and is labeled so; both die at row 12.3.

### Riders

- Comment cleaning started, per the phase's charter, SPLIT for reviewability: #12991 (row 12.1b)
  carries the scripted, comment-lines-only citation sweep — "(PR 11.5)", "since PR 10.3",
  "(§4.8.5)", "(docs/MIGRATION…)" stripped across 313 files with zero code lines touched — while
  the code PR keeps only the comment rewrites that DESCRIBE its new contracts (the leaf state
  modules, time_travel's restore note, the read layers). Forward pointers to rows 12.2–12.4 stay;
  the mid-sentence archaeology ("the 10.8 audit", "PR 11.3 added") is the remaining tail for
  those rows.
- `IPostponedActionState` / `IShortcutDroppedItemState` no longer bake `undefined` into the
  stored-value aliases; the touched leaf reducers dropped the deprecated `AnyAction` for `Action`.
- `store/types.ts#IAppState` declares the null-at-rest keys (`sessionId: string | null`,
  `route/previousRoute: IRouteState | null`, `shortcutDroppedItem: ICatalogEntry | null`).

### Gates

`rushx validate` green END TO END (lint 0 errors, dependency-cruise 0 errors, format, locales,
provenance audit 0 findings), `build-check` green, package suite **5,020 passed** across 417 files
(5,004 at the row's start, 16 net new — `strict_root_composition.test.ts` and
`nullable_leaf.test.ts`; the nine raw-read characterization pins that asserted undefined-at-rest
now assert null with unchanged selector-visible behavior).

**Playwright: OUTSTANDING.** Required before merge: full e2e run — the row changes the dispatch
path of every action and the at-rest shape of six keys, exactly the class of change only e2e has
caught before (the 11.6 lesson).

## Phase 12.2 + 12.3 — the Immutable removal

**Delivered as #12997 (ONE PR)** — rows 12.2 (`redux-batched-actions` out) and 12.3 (`immutable` +
`immutable-devtools` out). Nothing imports `immutable` anymore — production, tests and mocks
included — and the provenance audit gates at zero findings with an empty baseline.

### 12.2 — the batching residue

`enableBatching` wrapped the root reducer since 1.1 for a Phase 9 that was investigated and
dropped (its §5 note); nothing ever dispatched a batch, so the wrap was inert. The store takes
`rootReducer` directly now, the wired-but-unused unwrap test is gone, and the time-travel notes
keep the batch-blindness hazard as historical context for anyone revisiting batching — a
whitelisted action inside a batch would silently record NO undo step.

### 12.3 — what physically went

- **Dependencies:** `immutable`, `immutable-devtools` (and `Root.tsx`'s dev-only devtools hookup).
- **Modules:** `typings/immutable-compat.d.ts` (the v3→v5 `any`-widening shim),
  `typings/immutable_map.ts`, `utils/reducers.ts` (`compose` — test-only since 7.2),
  `store/_infra/lift_slice.ts`, `store/_infra/plain_subtree.ts`, and the **22 test-era per-domain
  `<domain>_reducer.ts` lift mounts** they existed for. The domain store suites drive
  `combinedRootReducer` directly now; the selectors that imported a `*_STATE_PATH` re-export from
  a lift-mount module import the path constant itself.
- **Dual-mode branches:** every `isImmutable`/`fromJS`/`List`/`Map` seam in the models
  (`bucket_item`, `decorated_bucket`, `decorated_bucket_item`, `decorated_metric_attribute_filter`
  — `plainDeep` included, `preset_item`, `metadata`), the selectors
  (`optional_stacking`, `insight`, `filter_bar`, `date_datasets_meta`) and the attribute-filter
  components. `utils/value_access.ts` / `utils/collection_access.ts` kept their Immutable-derived
  SEMANTICS verbatim (negative-index wrap, existence-based reads, identity-preserving
  map/filter — the §7 no-op story) and lost only the container branches; `toPlain` survives as a
  named identity seam until the 12.4 sweep; `mirrorToContainer` (identity since 11.1) is deleted
  with its call sites.
- **The last Immutable producer:** the attribute-filter dialog's apply payload
  (`IUpdateAttributeFilterPayload.selectedElements` was an Immutable `List` of `fromJS` element
  Maps built in `useAttributeFilterCustomizations` / `mapFilterToSelectedItems`). It is a plain
  `IElement[]` now, and `IMetricFilterChanges.selectedElements` dropped its `List` variant.

### The deviation and the finds

- **`typings/state.ts` is NOT deleted** (the row's file list said to): the Immutable
  `State = Map<string, any>` alias that list targeted was rewritten to the PLAIN transitional
  alias at 7.1; today the module carries 253 `State` importers plus the time-travel types, and
  its own doc has always said it dies with the shim — that is 12.4's sweep, not this row's.
- **Driving the combined root exposed two test-scope truths.** (1) A stubbed open-report
  operation result (`{} as any`) stops working the moment EVERY owning slice consumes the
  payload — the suites build the real result through `buildOpenReportFinished` against their
  fixture state now (the filterBar slice's `payload.result.filterBar` read was the tripwire).
  (2) Root-identity pins must scope to the owning branch: a re-save legitimately pushes a fresh
  save-success toast into `appState.messages`, and SET_DATE_DATASETS_META legitimately stores the
  meta — the report/itemCache identity contracts are pinned per-branch now.
- **Moot specs died with their premise:** `mixed_root_contract.test.ts` (pinned immutable.js
  library behavior over a mixed root — no subject left), the properties "stale-era Immutable Map
  safety net" spec, and the insight-store List-normalization spec.
- **The plainness pins kept their teeth** through the duck-typed `utils/immutable.ts#isImmutable`
  (checks for a `toJS` carrier, no package dependency): the characterization suites' era
  normalizers became tripwires that FAIL on any value that still duck-types as Immutable.

**Playwright: OUTSTANDING.** Required before merge: full e2e run — 12.3 touches the
attribute-filter apply path end-to-end (dialog payload shape) and every store suite's dispatch
surface, the class of change only e2e has caught before.

## Phase 12.4 — THE FINISH LINE: the transition infrastructure comes out, the gate replaces it

The row that ends the migration. Nothing addresses AD's state by path any more, there is one root
type and it has no `any` in it, and the instrument that used to guard the Immutable seam has been
replaced by one that guards §4.8.

### What was deleted

| Deleted                                                                                                                                                                                                          | Was                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `constants/state_paths.ts`                                                                                                                                                                                       | the mount table — 60 root path constants                                                                                      |
| eleven domain `*_paths.ts` (report, execution, properties, intl, embedding, reference_point, extended_reference_point, shortcut_date_datasets, pluggable_visualization, date_datasets, post_message_state_paths) | 86 more leaf constants                                                                                                        |
| `utils/state_access.ts` (+ its spec)                                                                                                                                                                             | the dual-mode ROOT path shim                                                                                                  |
| `store/_infra/slice_selector.ts` (+ its spec)                                                                                                                                                                    | `sliceSelector(PATH, initialState)` — 43 domain input selectors                                                               |
| `typings/state.ts`                                                                                                                                                                                               | the `State` alias: `appState`/`data`/`report` as `Record<string, any>`                                                        |
| `scripts/audit-immutable-provenance.mjs`, `scripts/provenance-baseline.json`                                                                                                                                     | the Immutable provenance audit and its ratchet                                                                                |
| nine leftover `*_STATE_PATH` mount constants in domain modules                                                                                                                                                   | the last per-domain path residue                                                                                              |
| `dndReducer`, `bucketNotificationsReducer`, `getItemsPath`, `getBucketItemPath`                                                                                                                                  | root wrappers with no production caller (their suites drive `combinedRootReducer` / the value-level `*InBuckets` helpers now) |

### The root type is the deliverable

`store/types.ts#IAppState` was a partial shape with `& Record<string, unknown>` escapes on every
branch; it is now closed at every level, names the owning domain's state type for all 33 `data`
keys / 10 `appState` keys / 7 `report` keys, and contains **no `any`**. Sixteen domains that had no
entry got one; two state types that lived inside reducer modules (`IChartSortState`,
`IApplicationContextState`) moved to their own leaf modules first, because the root type importing a
reducer module is the cycle class 11.5/11.6 kept hitting.

**The drift gate is what makes it stay true.** `reducers/combined_root_reducer.ts` asserts
`IAppState` and the `combineReducers`-inferred `ICombinedRootState` are mutually assignable. A
reducer key with no declaration breaks one direction, a declaration nothing owns breaks the other,
and `build-check` fails on the spot. The loose `(State | undefined, Action) => State` cast is gone;
what remains is an ACTION-side cast only, and it says so.

### What the closed type found — none of it visible to any earlier gate

- **`IUndoableState` was lying.** It declared the full `appState` while `captureSnapshot` had always
  stripped `messages`, and `restoreSnapshot` put it back by hand with nothing checking either half.
  The omission is in the type now (`Omit<IAppState["appState"], "messages">`).
- **A key no reducer owns:** a fixture seeding `data.dateDatasets.dateDataset`.
- **A casing bug:** `OverTimeComparisonType:` for `overTimeComparisonType:` in a log-formatter
  fixture — silently inert for as long as it has existed.
- **An impossible literal:** `loadingError: "some-loading-error"` against a leaf whose only legal
  value is `"incorrectMetadata"`.
- **Eight fixtures seeding the pre-tiger MD-object shape** (`{ meta, content }`) for
  `visualizationClass`, which production has not produced since the leaf went plain. They share one
  named mock now (`mocks/visualization_class_mock.ts`) so there is a single place to be wrong.

That list is the "fixture seeds the old container" class §7 has warned about since 4.5, and this is
the first row where the COMPILER found it instead of a customer. Closing the root type is what did
it: while a branch was `Record<string, any>`, every one of these seeds type-checked.

### Tests: a typed patcher replaced the path shim

`setIn(state, SOME_PATH, value)` was how ~200 suites built fixtures. The replacement is
`mocks/state_builder.ts` — `withRoot` / `withAppState` / `withMeta` / `withData` / `withShortcut` /
`withReport`, each taking `Partial<>` of the REAL branch type. It is the value utility §4.8.4's last
paragraph allows, named as test-only, with its callers named.

**Two things about it are load-bearing, and both were learned the hard way in this row:**

1. **The builders preserve IDENTITY** — a patch whose values are already the identical references
   returns the SAME state. The first cut did not, and four §4.8.5 identity pins failed instantly
   (`setBucketTotals`/`sanitizeTotals`/`mirrorTotalsToDerivedMeasures` "returns the very same
   state"). The shim's `setIn` short-circuited for free; a spread does not. The same guard went into
   the production writes that lost it (`services/buckets_service.ts#writeData`). This is the 4.7
   render-loop class arriving through a mechanical rewrite rather than a new feature — exactly what
   §7's "do not assume the guard is inherited — write it" is about.
2. **A path is not a parameter.** Several suites parameterised helpers BY ROOT PATH
   (`bucketLocation = BUCKETS`, an `it.each` column of paths). That is the write-surface-array shape
   §4.8.4 bans, and it does not survive the deletion. They take a closed-union discriminator now
   (`BucketsBranch = "buckets" | "referencePoint"` with a typed read/write pair) or a patch function
   in the table column.

**Specs whose PREMISE died with the shim were rewritten, not deleted.** `report_store`'s "accessors
on the pristine state (the leaves are absent)" seeded `report: {}` and pinned that `sliceSelector`'s
`notSetValue` supplied the domain initial values. Strict `combineReducers` self-initializes every
leaf and the closed type cannot express an absent one, so the premise is now impossible — the spec
pins what the fallback stood in for: the pristine build answers the initial values. Same for
`getFeatureFlags` "empty" (seeded ABSENT, meaning `{}`).

### The gate that replaced the provenance audit

`scripts/audit-state-architecture.mjs`, wired into `validate` as `validate-architecture`, at **0
findings**. Six rules, each a shape §4.8.4 records as tried-and-rejected: **R1** a
`(state: IAppState) => IAppState` in domain code; **R2** the root type imported by a
`*_state`/`*_types`/`*_helpers`/`*_operations` module; **R3** `getIn`/`setIn`/… over the ROOT;
**R4** a path module or the deleted shim; **R5** the banned vocabulary (`pathKey`,
`changedDomains`, `*ClusterState`, `collectClusterChanges`, `diffDomainState`, `extractWrites`,
write-surface arrays); **R6** a reducer importing another domain's selectors.

**The allowlist is two-tier, and the second tier is a RATCHET rather than an exemption.** Tier 1 is
the sanctioned whole-root code §4.8.1 names — time travel, the reset wrapper, the root composition,
the fixture patchers. Tier 2 declares the three modules that still hold root→root transformers
(`services/buckets_service.ts` 13, `store/filter_bar/filter_bar_service.ts` 14,
`services/pluggable_visualization_service.ts` 3) **with their exact counts**: adding one fails the
gate, and REMOVING one also fails it, telling you to lower the number. The residue therefore cannot
stagnate at "some", and it is stated here rather than hidden — see the backlog row in §10.

Four of the rules are also expressed in `.dependency-cruiser.js` (`no-state-path-modules`,
`no-root-state-shim`, `no-root-state-in-value-modules`, `reducer-owns-one-slice`), where the
import-graph half is structural. Wiring them **caught a real cycle the moment the root type was
completed**: `store/types → report/report_state → actions/open_actions → … → embedding_selectors →
store/types`, because `OpenReportError` — a report-domain VALUE type — was declared on the action
module. It lives in `report_state.ts` now and the action imports it, which is the direction that
keeps a state module a leaf. Third instance of the reducer-module cycle class, and the first found
by a rule rather than by a build failure.

### Gates

`rushx validate` green END TO END — lint **0 errors**, dependency-cruise **0 errors** (10
pre-existing `no-orphans` infos), stylelint, format, locales, and `validate-architecture` at **0
findings**. `build-check` green. Package suite **4,931 passed** across 414 files.

**The gate caught its own author, twice, and that is the evidence it works.** The first cut of the
identity guard was a `writeData(state, patch)` helper in `buckets_service.ts` — root→root, so the
tier-2 ratchet failed with "14 declared 13". It is a value-level PREDICATE now (`dataUnchanged`
takes the branch, not the root) and the three call sites do their own spread. Wiring the
dependency-cruiser rules likewise failed immediately on the `OpenReportError` cycle. Neither would
have been visible without the rules being on.

**Playwright: OUTSTANDING.** This row rewrites every state read and write in the package. The
required pass before merge is the FULL e2e set, not a subset — and specifically the undo/redo,
open/save-report and buckets-drag paths, because the identity-guard regressions this row found in
unit tests are the class that shows up in e2e as 60-second hangs rather than assertion failures
(§7, the 4.7 freeze).

---

## Phase 12.5 — one action idiom, and a dispatch that is checked

**The row exists because of two TODOs left in `create_store.ts` after 12.4**, which turned out to be
one TODO: _"typed `Store<IAppState, AnyAction>` rather than the inferred `EnhancedStore` … the
permissive dispatch goes away once all creators are `createAction()`"_, and a count of the
hand-written creators still standing. The comment was right about the dependency and wrong about the
size: the grep behind it looked for `type: ActionTypeKeys` and found 15 modules, while the compiler
— once the store cast came off — found **34**.

### Why the two halves are one change

An `interface` never receives an implicit index signature. Redux 5's `UnknownAction` is
`{ type: string } & { [k: string]: unknown }`, so a hand-written `interface IFooAction { type: X;
payload: … }` is NOT assignable to it. RTK's `PayloadAction` is a type **alias** over an object
literal type, which does get one, so it is. That single asymmetry is the whole story:

- while hand-written creators existed, the only way to keep their call sites compiling was
  `AppDispatch = Dispatch<AnyAction>`;
- `AnyAction`'s index signature is `any`, so `dispatch(anythingWithAType)` type-checked — **none of
  the ~60 explicitly-typed dispatch sites were actually checked**;
- so the creators had to go first, and `create_store.ts` last.

Verified before writing any of it, with a six-line probe: `dispatch` of an RTK action (with and
without payload, and with the FSA `error: true` marker) compiles against `Dispatch<UnknownAction>`,
and a hand-written interface action does not. That probe is now two permanent pins in
`create_store.test.ts` — `AppDispatch` ⇄ `typeof store.dispatch` mutual assignability, and a
`@ts-expect-error` on dispatching a hand-written interface. An unused `@ts-expect-error` is itself a
compile error, so the second pin cannot rot into a comment.

### The compiler was the discovery tool, not the grep

The 4.11 lesson (_"if a container flips, flip its TYPES first and let `tsc` enumerate the
consumers"_) applied verbatim to actions. Removing the store cast produced 85 `TS2345 … Index
signature for type 'string' is missing` errors naming 30 action types across **19 modules the grep
never saw** — `sagas/*/…_ui_actions.ts`, `store/*/…_store_actions.ts`, the per-domain
`*ActionTypeKeys` enums. A third family did not error at all and still needed converting:
`metric_editor_actions.ts`'s creators return `{ type: Keys.X as const, payload }` **object
literals**, which DO get an implicit index signature — invisible to both the grep and the compiler,
and exactly the "second kind of action" the row exists to remove.

Final tally: **148 creators converted** (242 → 390 in the package), 34 modules, 61 hand-written
action interfaces replaced by `ReturnType<typeof creator>`, **−982 lines net**.

### The trap that cost the most: `createAction<Payload>(TYPE)`

The natural way to convert `foo(x: P): IFooAction` is `createAction<P>(TYPE)`. It is wrong, silently.
`createAction` is `<P = void, T extends string = string>(type: T)` and TypeScript's explicit type
arguments are all-or-nothing — supply only `P` and `T` becomes its default `string`. The creator
works, the payload is typed, and the action's `type` is `string` instead of the enum member. Two
consequences, both of which happened here:

1. **Discriminated-union switches stop narrowing.** `case Keys.STORE_RESET_REMOVED_ITEMS:` →
   _"not comparable"_.
2. **A negated type guard starts eating unrelated members.** This is the subtle one.
   `isInsightContentResetEvent(action)` is `action is InsightContentResetAction`; in the ELSE branch
   TS removes every union member assignable to that type. With the reset events' `type` typed
   `string`, a freshly-converted no-payload action (`{ payload: undefined; type: LITERAL }`) became
   assignable to one of them and was narrowed away — so `bucketNotificationsLeafReducer` lost two of
   its three cases, and `filter_bar_reducer` three, with no error at the guard itself.

The fix was at the source rather than in the reducers: **all 33 Phase-11 operation-event creators**
(`buckets_operation_events.ts` and its six siblings) were already written in the generic form and now
use the prepare form, so every action in the package carries a literal `type`. That made the two
`(action as ReturnType<typeof event>)` casts inside the `for (const event of …WRITERS)` loops
non-overlapping — they are `as unknown as` now, with a comment saying the `match()` is the runtime
proof the compiler cannot follow through a loop. §4.7 now states the prepare form as a rule and [R7]'s
gate message warns about this specific mistake, because it is the first thing anyone will try.

### The dispatch call sites: four spellings became one, via a design that had to be redone

8 `useDispatch<Dispatch<SomeUnion>>()` and 25 bare `useDispatch()` joined the 25 that already read
`useDispatch<AppDispatch>()`: **68 identical sites**, no bare `useDispatch()` and no narrow
per-domain dispatch left in production. The narrow ones (`Dispatch<BucketsActions>`,
`Dispatch<IAddFilterAction>`, …) were a workaround with no rule behind them — nothing enforced that a
component dispatched only its own domain, and the constraint bought nothing once dispatch was
checked at all.

**The first attempt routed all 68 through `useAppDispatch` in `store/hooks.ts`, and that was wrong
for this package. Two distinct failures, and the second is the one to remember.**

**(1) `withTypes` cannot survive a partial module mock.** `useDispatch.withTypes<AppDispatch>()`
reads `withTypes` off the imported hook when `store/hooks.ts` is EVALUATED. 25 component suites
replace `useDispatch` with a bare `() => dispatchMock` via `vi.mock("react-redux", …)`; that partial
mock has no `withTypes`. The first full run after the conversion was **26 red test files**, every one
`TypeError: useDispatch.withTypes is not a function` at import. Loud, obvious, fixed by an annotated
alias — which then exposed the real problem.

**(2) A shared module that re-exports a react-redux hook cannot work under `isolate: false`.**
`vitest.config.ts` sets `isolate: false` deliberately (and stays that way), so the module registry is
SHARED across test files within a worker. `store/hooks.ts` is therefore evaluated **once per
worker** and links to whichever `react-redux` was current at that instant — which, given 25 files
that mock it, is frequently one of those mocks. Every component in that worker then dispatches into
some other file's `dispatchMock`, so the suites that deliberately do NOT mock react-redux — they
create a real store and `vi.spyOn(store, "dispatch")`, exactly to avoid leaking a mocked module, and
`BucketDropTarget.test.tsx` carries a comment saying so — assert on **zero calls**.

Order-dependent, so it reads as flake: **3 of 5 full runs failed, a different pair of files each
time** (`BucketDropTarget`, `Messages`, `Trash`, `ExportCsvDialog`). It is worth being explicit that
two plausible fixes do NOT work, because both look like they should: an annotated alias
(`export const useAppDispatch: () => AppDispatch = useDispatch`) and a call-time wrapper
(`() => useDispatch()`) both still resolve through the one shared module. **The indirection module is
the defect.**

The end state is therefore react-redux's hook imported in each component's own module, which is what
the pre-12.5 code did and why the suite was stable: `useDispatch<AppDispatch>()`. `store/hooks.ts`
keeps only `useAppSelector` (13 pre-existing call sites, stable) and now carries the warning; the
TYPE import from `store/types.js` is free, because types are erased and nothing links through them.
Seven consecutive green full runs after the change.

Two things this says about the row's process: the `withTypes` breakage was found by running the
suite, but the flake was only found by running it **repeatedly** — a single green run after the fix
would have "confirmed" the broken design. And the comment in `BucketDropTarget.test.tsx` explaining
why it avoids mocking react-redux is what turned a mystery into a diagnosis in one read; §7's gate
list exists for exactly that reason.

### Riders

- **`AnyAction` is gone from the package** (12 modules). Most became `UnknownAction`.
  `middleware/log_formatters.ts` did not: its 33 formatters are heuristic readers that reach into
  `payload`/`meta` positionally, and `UnknownAction`'s index signature is `unknown`, not `any`. It
  declares its own `ILoggedAction` — `interface ILoggedAction extends UnknownAction { payload?: any;
meta?: any }` — which says what is actually true and keeps the deprecated type out. `splunk_logger`
  uses the same type. [R8] gates the rest.
- **25 `addCase(ActionTypeKeys.X, (state, action: IFooAction) => …)` became `addCase(creator, …)`**
  (messages + dialogs slices), so 9 manual action annotations disappeared and the payload type comes
  from the creator. The 9 in `intl_slice.ts` / `app_context_slices.ts` STAY on the string form with
  type-only imports — documented there since 12.1: a value import of `actions/app_context_actions.js`
  drags jquery (a `window` read at import time) into the reducer graph and breaks node-env consumers.
  That is a real constraint, not laziness, and the type-only annotation is equally safe.
- **Two inline `put({ type: … })` literals** in `save_report_sagas.ts` now call creators, one of which
  had to be created (`delayedLongSaving` — `MESSAGES_DELAYED_LONG_SAVING` had a slice case and a
  dispatcher but never a creator). Its `isSavingDoneAction` predicate — `[FINISHED, ERROR].includes(action.type)`
  — is `isAnyOf(saveReportFinished, saveReportError)`.
- **Two creators over one type string** are now one `createAction` plus a call:
  `displayConfirmUnsavedChangesDialogWithPostMessageAction` calls
  `CreateConfirmUnsavedChangesRequestAction`, `metricEditorFocusMetric` calls `metricEditorFocusTab`.
  The reverse case — one interface over three type strings (catalog loading flags, filter-dropdown
  gestures) — becomes three creators and a union of their `ReturnType`s.
- **`typings/action.ts` DELETED.** `IAction { type: any; payload: any; [key: string]: any }`, the
  loosest action type in the package, zero importers; §4.7 has slated it for deletion since the flip
  and dependency-cruise reported it as an orphan the moment the sweep finished.
- **Four dead report actions deleted** — `IDataTooLargeToDisplayAction`,
  `IReportHasNegativeValuesAction`, `IReportNoDataAction`, `IReportEmptyAfmAction`: interfaces with no
  creator and, verified repo-wide, no dispatcher. They could not be converted because there was
  nothing to convert. Their `ActionTypeKeys` members and the one orphaned `log_formatters` entry are
  filed in §10 rather than removed here — pruning the frozen string registry is its own decision.
- **`exportResultError`'s meta had to be declared, not inferred** (`IExportResultErrorMeta`): the
  status fields are spread in from one of three branches, so inference gives a union in which
  `meta.statusCode` does not exist on every member. Declaring it triggered TS4058 in two exported
  sagas ("cannot be named") — the 11.1 portability lesson at payload scope — so the interface is
  exported. `report_actions.ts#exportReportError` went the other way: its old declared
  `statusCode: string` was a LIE (the value is `error?.response?.status`), so the meta is inferred
  and honest now.
- Payload interfaces are NOT action interfaces and stayed: `IReportExecutionFinishedPayload`,
  `IConfirmUnsavedChangesDialogActionPayload(Data)`, `IShowAddMessagePayload`,
  `IExportResultActionPayload`.

### The gate: [R7] and [R8]

`audit-state-architecture.mjs` grew from six rules to eight, still at **0 findings**.

- **[R7]** — a `type` property whose VALUE spells an action type: an action-type enum member
  (`*ActionTypeKeys.MEMBER` — every frozen string in this package lives in one), a union of them (the
  hand-written interface form), or a raw string in AD's action convention (`UI/…`, `STORE/…`,
  `SAGA/…`, `COMMAND/…`). One allowlist entry:
  `postMessageApi/actions/post_message_action_helper.ts#ICommandAction`, the EXTERNAL postMessage
  protocol shape, whose `type` is the whole `PostEventActionTypeKeys` enum — no `createAction` can
  express that.
- **[R8]** — the identifier `AnyAction`.
- **Both read the AST, and the first cut of both did not.** Two rounds of narrowing, the second from
  review:
    1. Matching any `type: "UPPER_CASE"` string produced three false positives, all react-dnd
       (`type: "BUCKET_ITEM"` in `typings/drag_and_drop.ts` and `components/buckets/Bucket.tsx`,
       `type: "ATTRIBUTE"` in a dropdown fixture). Hence the enum-member / action-convention narrowing.
    2. Both rules still ran over RAW SOURCE. R7 would have failed `validate` on a comment or string
       that happened to read `type: STORE/FOO`, and R8 stripped comments with a regex — so a line
       holding `"https://…"` had everything after the `//` removed, hiding a real `AnyAction` later on
       that same line. The script already parses every file with the TypeScript AST for R1/R3, so both
       rules now use it: R7 inspects `PropertyAssignment` / `PropertySignature` nodes named `type`, and
       R8 looks for an `Identifier`. Comments are not AST nodes and strings are not identifiers, so
       both classes of mistake are structurally impossible rather than patched.

    Verified in both directions with throwaway probe files, because a gate that cannot fail teaches
    nobody anything (the reason 12.4 deleted the provenance audit): R7 fires on all four real shapes —
    interface discriminant, union discriminant, creator returning an enum member, creator returning a
    raw action string — and stays silent on the comment, the string and the react-dnd context; R8 fires
    on `AnyAction` sharing a line with `"https://…"` and stays silent on the doc comments that explain
    its removal.

### Gates

`rushx validate` green end to end — lint, dependency-cruise **0 errors** (9 pre-existing `no-orphans`
infos, one fewer than 12.4 because `typings/action.ts` was one of them), stylelint, format, locales,
`validate-architecture` **0 findings (R1–R8)**. `build-check` green. Package suite **4,933 passed**
across 414 files, **run seven times end to end** — see the dispatch section for why one run was not
evidence here. The two new dispatch pins are compile-time, so a green build IS their assertion.

**Review round (CodeRabbit).** Three findings taken, one dismissed with reasoning. Taken: the R7/R8
raw-source scanning above; a self-contradiction in the plan's own 12.5 row, which still said "collapse
the call sites into one `useAppDispatch`" alongside the correction saying not to (leftover from the
rejected first design — exactly the wording that would send the next reader back into the hazard); and
`filterLocalIdentifier: string = undefined` → `filterLocalIdentifier?: string` in
`highlight_bucket_and_filter_items`, carried over verbatim from the hand-written creator and
inconsistent with the `?:` this row used everywhere else. Dismissed: "the delete creator omits
`postMessageContext`" on `deleteCatalogAttributeHierarchy`. It is real but PRE-EXISTING and not a
regression — `git show HEAD~1` has the old creator returning `payload: { deletedAttributeHierarchyId }`
and nothing else, so `getPostMessageContextId(undefined)` returning `undefined` is shipped behavior;
the sole production dispatcher is a UI click in `AttributeHierarchyEditingDialog` with no incoming
context to pass. Changing it would be an unrequested behavior change in a row whose contract is that
every payload shape is preserved.

**Playwright: OUTSTANDING.** Every action creator in the package changed shape, so the required pass
is the FULL e2e set. Two things to watch specifically. First, **`createAction(TYPE)` adds
`payload: undefined`** where a hand-written creator emitted `{ type }` alone — inert for property
reads and JSON (postMessage), but it is a real difference in the splunk stream and the devtools.
Second, the **undo/redo** paths: `undo`/`redo` keep their `meta.updateCatalog` verbatim (nothing reads
it — preserved because a prepare callback's job is to keep the shipped shape), and the time-travel
whitelist keys on type strings that are unchanged. Also smoke embedded mode: the postMessage protocol
strings are frozen and untouched, but `attributeHierarchyModified` and the export/save actions carry
`postMessageContext` built inside prepare callbacks now.
