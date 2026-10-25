# AD Runtime Typing Hardening: remove all `any`

> **Status:** COMPLETE. PR 1 (source, #14640) merged; PR 2 (tests + gate flips) lands the real gates:
> `@typescript-eslint/no-explicit-any` is `error` and `noImplicitAny` is on — the module has no `any`
> left except vitest's `Assertion<T = any>` declaration merge (documented, one line). All four gates
> pass (`lint` 0 errors, `build-check` 0 errors, `test-once` green, `validate` clean).
> **Scope:** `libs/gdc-analytical-designer` only.
> **Delivery:** TWO PRs (split decided mid-flight to keep review size sane).
> **PR 1** = C1–C6: every explicit `any` removed from non-test source; the gates stay at
> `warn`/`noImplicitAny: false` so this PR merges green on its own.
> **PR 2** = C7–C8: the test-file sweep (~531 lint + ~197 type errors, all in tests), then the
> C0 gate flips land FOR REAL: `no-explicit-any` → `error`, `noImplicitAny: false` deleted from
> `tsconfig.json`/`tsconfig.build.json`.
> **JIRA:** STL-3322.

## Goal

Make the module fully typed:

1. `@typescript-eslint/no-explicit-any` moves `warn` → `error` in `.oxlintrc.json`.
2. `"noImplicitAny": false` is removed from `tsconfig.json` (and the inert copy in `tsconfig.build.json`).
3. Every resulting issue is fixed with real types — no suppressions.

## Baseline (measured 2026-08-27)

| Gate                                     | Errors  | Notes                                                                                                                                                                                     |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rushx lint` (`no-explicit-any` @ error) | **992** | ~237 files; ~406 `any` tokens in non-test src, ~475 in tests; only 38 `as any` in non-test src. Pattern split: 652 `: any`, 239 `as any`, 53 `Record<string, any>`, 6 `<any>`, 2 `any[]`. |
| `tsgo -p tsconfig.json --noImplicitAny`  | **140** | 94×TS7018 (mostly `null`-valued fixture literals), 35×TS7006, 6×TS7011, rest variables. **100 of 140 are in `*.test.ts`.**                                                                |

Not in scope:

- The ~305 extra errors visible under the **editor** tsconfig live in SDK sources pulled in by `tsconfig.sdk-editor-paths.json`. They gate nothing — `tsconfig.json` (what CI `build-check` runs) strips those paths.
- `strictNullChecks: false` and `strictFunctionTypes: false` stay. Bivariant parameters are load-bearing for the log-formatter dispatch maps (C2). **Superseded:** STL-3326 turned `strictFunctionTypes` on and replaced that reliance with an explicit `formatterRegistry` widening.
- The ~3,830 warn-level `no-unsafe-*` findings stay warnings; they shrink as a side effect.

## Rules for every commit

- **Typing-only PR — zero runtime behavior change.** Deleting no-op casts is fine. A typing fix that would change behavior is a _finding_: flag it in the PR description + follow-up ticket, do not silently "fix" it.
- Real types first. `unknown` + type guards only at genuine dynamic boundaries: vis-properties `controls`, postMessage envelopes, deep path-walkers, caught errors.
- No invented fake shapes for dynamic data; no aggregate/universal payload types (§4.8 of the RTK migration doc applies here too).
- **No `eslint-disable`.** `as unknown as T` is allowed only (a) at documented external-mismatch boundaries, (b) at declared-dynamic extraction points, (c) in tests for deliberately-invalid payloads. Every src occurrence gets an individual look — expect ~10% to be real type lies.
- New shared types go in `src/typings/` or a slice's types module, **never in reducer modules** (dependency-cruiser no-circular gate).
- TS2742 hazard on exported selectors: prefer a local `interface X extends …` over aliasing into un-exported internals of a dependency.
- Tests: fix the **fixture**, not the reader.
- Commit trailers: `JIRA: STL-3322` + `risk:` (`nonprod` for config/doc/test-only commits, `low` for src typing commits).

## Commit plan

Counts are `no-explicit-any` errors removed (of 992).

### C0 — config flips + this doc `[x]` — landed in PR 2

- [x] `.oxlintrc.json`: `no-explicit-any` → `"error"`.
- [x] `tsconfig.json` / `tsconfig.build.json`: `"noImplicitAny": false` deleted.
- [x] Add this document.

### C1 — foundation typings + models (~115) `[x]` — 992→878 lint errors; models/typings type-clean

- [x] `src/typings/buckets.ts`: `filters` → `IBucketItemMetricFilter[]`, `displayForms` → `ICacheItemDisplayForm[]`, `totals` → sdk-model `ITotal[]`, index signatures → `unknown`; declared the real raw-item fields the code probes by bracket (`displayForm`, `dfUri`, `dfIdentifier`, `identifier`, `isLocationIconVisible`, `locationDisplayFormRef`, `areaDisplayFormRef`); `overTimeComparisonType` → sdk-ui type.
- [x] `src/typings/metadata.ts` (`filters` typed; `IBucketItem` → type alias so it satisfies the raw index signature; added the fields the MD→state transform actually writes: `isTotalMeasure`, `overTimeComparisonType`, `operandLocalIdentifiers`), `src/typings/report.ts` (`itemCache` → `ICatalogEntries`, `IErrorRawData` → `unknown`), `src/models/bucket_item.ts` (`bucketItemBase` → `Readonly<IRawBucketItem>` + 8 more sites).
- [x] `original` on both decorated filter models → `IBucketItemMetricFilter | null`; the stored-filter type moved to leaf `src/typings/bucket_item_filter.ts` (re-exported from measure_filters.ts) — typing it in place closed 2 import cycles the no-circular gate caught.
- [x] `src/models/metadata.ts` buckets→MD half: `IDecoratedBuckets` + file-local `IBucketItemTransformContext`; `ITransformedBucket` for the hybrid spread (kept the spread).
- [x] `src/models/metadata.ts` MD→buckets half: bear types end to end; `findItemInCache` → `ICatalogEntry | undefined`; `IAdditionalData.properties` → `IStoredVisualizationProperties`; `refUri`/`refIdentifier` helpers for ObjQualifier probes; guard-local rewrites where unions were probed by key.
- [x] Measure filters: `IDecoratedMetricFilter` + new `isDecoratedDateFilter`/`isDecoratedMetricAttributeFilter` predicates (strictNullChecks:false disables literal-discriminant narrowing — the predicates are mandatory).
- [x] bearTypes: `hiddenFromKda` declared on `IMeasureContent`; `layers` was ALREADY declared — the `as any` at insight_slices.ts was stale and is deleted.
- [x] `decorated_bucket.ts`: `uiSettings` → `IExtendedRefPointBucketsUiConfig | undefined`; bucket/itemCache/bucketsMeta typed.
- Findings (real type lies exposed): see Findings log.

### C2 — middleware (~62 +53 actions) `[x]` — 878→763 lint errors

- [x] `log_formatters.ts`: every param-formatter typed with its concrete `IXxxAction["payload"]`; the dispatch maps keep record dispatch behind broad value types; the `formatters` array got the broad element type that admits the narrow formatters (bivariantly, until STL-3326 made every chain formatter take `ILoggedAction` outright).
- [x] `ILoggedAction.payload/meta` → `unknown`; heuristic probe casts sit exactly once per formatter, after its type-string check; `sortFormatter`/`getFirstMeasureLocatorItem` now narrow via sdk-model `isAttributeSort`/`isMeasureSort`/`isMeasureLocator`.
- [x] ⚠ `getInsertParams` split: `UI_ADD_FILTER` now has its own `getAddFilterInsertParams` emitting the identical (`to`/`position` undefined) record; flagged as telemetry follow-up.
- [x] `splunk_logger.ts` params → `IMessageParams["params"]`; stale `as ITotal[]` casts dropped (C1 typed `IRawBucket.totals`).
- [x] Pulled forward from the actions cluster: `buckets_actions` (`logBucketTotals` totals → sdk-model `ITotal[]` + exported action type, `setBucketItemAggregation`/`toggleBucketItemExpanded` items → `IRawBucketItem`), `report_actions` (`referencePoint`/`extendedReferencePoint` → sdk-ui-ext types; execution/export error creators → `unknown` with documented probes), `properties_actions` (`IPropertiesMetaState`), `messages_actions`/`permissions_actions`/`featureFlags_actions` (`string`/`unknown`); `ssoTokenExpired` widened to `unknown` and the three saga readers of caught execution errors got typed probes.

### C3 — components + the raw/legacy `IBucketItem` blur (~110) `[x]` — 763→655 lint errors; 0 non-test type errors

- [x] buckets: `IDecoratedBucket`/`IDecoratedBucketItem` props; drop rules behind the new `IIsAllowedToDrop`; the three dnd monitor payloads are now DERIVED unions in `typings/drag_and_drop.ts` (`IDraggableBucketItem` | `IDraggableCatalogListItem` | `IDragFilterItem` = `IDraggedItem`), re-exported from their drag-source components; `IInjectedDropTargetProps.draggedItem` typed with the union.
- [x] `MeasureFilters`/`MeasureDateFilter` on the decorated filter union + predicates; the boundedFilter probe on a `Partial<IUpperBoundedFilter & ILowerBoundedFilter>` (sdk-model types).
- [x] ROOT-CAUSE fix: `getBucketItemsSelector` labeled flattened RAW items as legacy `IBucketItem` — retyped to `IRawBucketItems` at the source and the mislabel unwound through `BucketItemService`, filter bar (saga/selectors/drop target), date-dataset selectors, ranking filter, drill-down, `control_filtering_saga`; legacy `IBucketItem`/`typings/metadata.IBucketItem` became type aliases so they satisfy the raw index signature.
- [x] Report components: caught errors → `unknown` with typed probes; `rawData` reads via `IErrorRawData`; plug-viz boundary casts derived from `ComponentProps<typeof PluggableVisualization>`.
- [x] Catalog: `ICatalogEntry` end to end; tooltip details typed as the derived `Partial<>`-intersection of the three `IOrganizedCatalogTooltipDetails*` parts; `createVirtualizedListItem` made generic (one documented re-marry cast).
- [x] Misc: dialogs' `ConfirmDialog` test seam → `typeof ConfirmDialogComponent`; `CustomDragLayer` on `IDraggedItem`; `addFilter`/`createFilter` widened to the loose `ICatalogEntry` currency.

### C4 — selectors (~25) `[x]` — committed

- [x] Per-selector `props` interfaces; `bucketsUiConfig` → `IExtendedRefPointBucketsUiConfig`.
- [x] `save_report_selector.ts` path walkers → `unknown`; `IComparableReportContent.properties` typed as the deserialized `VisualizationProperties | string`; partial meta literals → `as IObjectMeta` with their existing "irrelevant here" comments.

### C5 — store/properties + controls readers `[x]` — committed

- [x] Controls bag flipped to `Record<string, unknown>`; merge helpers became container-preserving generics; declared-type extractions (`columnWidths`, `thresholdMeasures`, axis measures, table configs) are single documented reads at their sites; ripple absorbed in `metadata.ts`, `visualization_properties.ts`, `extended_reference_point_selectors.ts`, `properties_selectors.ts`.

### C6 — services, postMessageApi, utils, sagas, store misc `[x]` — src is 100% any-free

- [x] Outgoing postMessage `data` → `unknown` (opaque sdk-embedding payload); embedded-host callbacks likewise; caught errors → `unknown` with typed probes.
- [x] Telemetry: `ILogConfig` record for the event table; tracker payload index signatures → `unknown`; matomo transport on a `MatomoParam` union.
- [x] itemCache flows → `ICatalogEntries`; `bucket_item_predicates.isDateItem` widened to the item/filter/entry union it really serves; converters' deep `traverse` → `unknown`; drill-intersection legacy split typed with two documented header casts; saga `fork` result typed `Task` (SagaReturnType cannot express it).
- [x] No-op `{} as any` spread casts and `null as any` defaults deleted; the 4 documented SDK-mismatch casts are now `as unknown as <named type>` with their comments kept.

### C7 — tests `[x]` — PR 2 (549 lint + 111 type errors, all in test files)

- [x] Shared fixtures typed first (`constants.test.helpers.ts` → `IRawBuckets` / `IRawBucketItems` / `ICatalogEntry` / `IDateDataset` / bear filter types); the completion exposed dead fixture fields (`dataset: null`, `details`, date-attribute `dimensionUri`/`summary`/`elementsUri`/`identifier`, raw-filter `isDate`) and missing ones (display-form titles, dataset `relevance`, measure `definition`, content `visualizationClass`); three snapshots pinned on the fixture shape were refreshed.
- [x] Reducer/saga drivers take redux `UnknownAction` / `Action`; component fixtures use `ComponentProps<typeof X>`; dnd monitors/connectors are typed against react-dnd; vitest mocks are `Mock<…>`.
- [x] Deliberately partial fixtures are asserted with a DIRECT `as <the type they stand in for>` (comparable, so a partial that stops overlapping fails to compile); deliberately INVALID payloads are typed as what they are (an arbitrary `UnknownAction`, a host-posted `unknown` body, an `unknown`-walking sanitizer) — no `as unknown as` was added.
- [x] Two shared helpers replace repeated anys: `tests/feature_flags.test.helpers.ts#userSettings` (a complete `IUserSettings` seed) and `tests/reference_point.test.helpers.ts#toRefPointItems` (raw items projected onto the reference-point item shape); `invalid_type_guard.test.helpers.ts` became a generic `invalidTypeGuardInputs<T>()`.
- [x] Three typing-only src touches the tests needed: `DropdownWrapperHook#IDropdownContextWindow` and `utils/dropdown#IDropdownWindow` declare the window members they read (stand-ins without casts), and `sdk-embedding` gained `AdCommandData`/`AdCommand`/`AdCommandBody<T>` so the postMessage envelope is the union of the 15 commands instead of `IGdcAdMessageEnvelope<GdcAdCommandType, unknown>`.

### C8 — gate flips + zero-check `[x]` — PR 2

- [x] `no-explicit-any` → `error`; `noImplicitAny: false` deleted from both tsconfigs.
- [x] Full gates green (see Verification).

## Known cascade risks (verified up front)

- `IRawBucketItem` index-signature → `unknown` breaks the undeclared-key read at `metadata.ts:580` (`original?.["displayForm"]` pick chain) — needs an ObjRef narrowing.
- `transformBucketItems` (`metadata.ts:661-681`) builds a hybrid `{...decoratedBucket, items: mdItems}`. It gets a **local intermediate type; keep the spread** (the shape may be snapshot-pinned). Reducing it to the 3 fields `reduceBuckets` actually keeps is a follow-up, not this PR.
- The ~10% real-findings rate concentrates in C1, C2, C5.

## Verification

All from `libs/gdc-analytical-designer`:

- Per commit: `rushx build-check` + `rushx lint` — the touched area is at 0 and the total error count only decreases. `rushx test-once` additionally for C1/C5/C7 (behavior-sensitive).
- Before push: `rushx lint` → **0 errors**; `rushx build-check` clean; `rushx test-once` green; `rushx validate` green (includes dependency-cruise no-circular + architecture audit).
- End audit: no `eslint-disable.*no-explicit-any` anywhere; every `as unknown as` in src individually justified; `git diff --stat` scope-check before any `git add -A`.

## Findings log

Real type lies discovered while removing casts land here as they are found (file:line → what the type revealed → resolution/follow-up).

- `typings/bear/bearTypes.ts` `MeasureAggregation` was missing `"approximate_count"`, which `models/metadata.ts#getAttributeIdentifierFromCache` compares against — the comparison could never be true per the old type. Added to the union.
- `typings/measure_filters.ts` stored filter was missing `expression` and `displayAsDisplayFormRef`, both read off `filter.original` at runtime (`decorated_metric_attribute_filter.ts:319`, `useAttributeFilterCustomizations.ts:66` — the latter papered over it with a structural cast). Declared.
- `typings/metadata.ts` `IBucketItem` was missing `isTotalMeasure`, `overTimeComparisonType`, `operandLocalIdentifiers` — all three written by the MD→state measure transforms. Declared.
- `models/metadata.ts#transformSimpleMeasure` feeds a BEAR-shaped measure to sdk-ui's `fillMissingFormat` (declared over sdk-model `IMeasure`) — works structurally at runtime; now an explicit documented boundary cast instead of an invisible `any`.
- `insight_slices.ts:109` `(content as any)?.layers` was stale — `layers` is declared on `IVisualizationObjectContent`. Cast deleted.
- 2 import cycles (`measure_filters ↔ date_filter`, `measure_filters ↔ decorated_metric_attribute_filter`) would have shipped if `IBucketItemMetricFilter` had been imported from measure_filters.ts into the models — caught by `validate-dependencies`; the type now lives in the leaf `typings/bucket_item_filter.ts`.
- `UI_ADD_FILTER` telemetry (`adi-bucket-item-insert`) has always emitted `to: undefined, position: undefined` — its payload never carried them; the shared formatter hid it. Split into a dedicated formatter, byte-identical output. Follow-up candidate.
- `application_redirect_sagas.ts#reportExecutionError` compares the caught error's `status` against `UNAUTHORIZED = "UNAUTHORIZED"` — a string code, not an HTTP number (`NotAuthenticated` also takes a string). The probe type documents this.
- `render_insight_saga.ts` forwards the execution error's `status` as `insightRendered`'s `errorMessage` — pre-existing oddity, now visible in the types.
- `getUpdatedRankingFilterParams` cast raw bucket items to state_objects' `IBucketItem` for no reason (only `localIdentifier` is read) — casts dropped.
- `getBucketItemsSelector` (buckets_selector.ts) labeled the flattened RAW bucket items as the legacy rich `IBucketItem` via an `IRawBuckets as IBucket[]` cast — every downstream consumer inherited the lie (the raw↔MD family blur the typings docs warn about). Retyped at the root; ~10 modules unwound.
- `IInjectedDropTargetProps.draggedItem` had NO producers or consumers as a prop; kept per review and typed with the derived `IDraggedItem` union of the three real drag-source payloads.
- sdk-ui-ext `BaseVisualization.d.ts` declares `onNewDerivedBucketItemsPlaced?(): void` but invokes it WITH the reference point (`.then(triggerOnNewDerivedBucketItemsPlaced)`) — stale upstream d.ts; documented cast at the forward. SDK fix candidate.
- `SimpleBucketItem` requires `dragHandle`/`isLocationIconEnabled` props that `BucketItemPure` never passes (hidden by `any`; runtime treats them falsy/derives from state) — documented core-contract cast at the single render site.
- `drilling/types.ts` `SimpleMeasureAggregation` was also missing `"approximate_count"` (same class as the bearTypes finding).
- Two of the four "documented SDK-mismatch" casts were STALE: `convertModelInsightToADRep` has returned bear `IVisualizationObject` for some time, so `report_service.ts` and `save_report_sagas.ts` need no cast at all — the "created and updated types mismatch" comments described a world that no longer exists. Deleted.
- `executeAfmToAfm.ts#convertMeasure`'s "old types make it hard to express" cast dissolves entirely by narrowing `definition` first — the arithmetic/pop/previous-period definitions are structurally identical in both type families.
- Embedded host callbacks (`AnalyticalDesignerEmbedded`) now carry the sdk-embedding bodies (`AdInsightSavedBody`, `AdInsightRenderedBody`, `ICommandFailedBody`) and a named local `IAdInsightOpenedBody` — the opened event deliberately diverges from sdk-embedding's body (ONE-4679), which is now written down as a type instead of a comment.
- Caught exceptions (`catch (error)`) stay `unknown` by design — that is TypeScript's own type for them; readers narrow with typed probes at their single read.
- PR 2, `BucketReorderableItem.test.tsx`: the scenario table spelled the position `hoveredPosition` while the helper read `hoverPosition` — every `calculateDropIndex` case ran with `undefined`. Typing the config caught it; the cases pass with the real position, so the expectations were right by luck.
- PR 2, `data_characterization.test.ts`: the datasets fixture carried `author`/`all` under a loose shape — `IGroupedDataSets` says `all: IMetadataObject[]`, which the `{ id }` stubs are asserted to.
- PR 2, `date_datasets_sagas.test.ts`: the tags configuration was seeded with plain strings while `ILoadDateDatasetsOptions` declares `ObjRef[]` — the saga forwards the selector value verbatim, so the test never noticed. Seeded with `idRef(...)`.
- PR 2, sdk-ui-ext `IBucketItem.aggregation?: boolean` vs the raw state item's `aggregation: string | null`: the reference-point tests that seed raw items had to project them (`toRefPointItems`) because the two shapes disagree on this field — the sdk type looks stale (AD writes aggregation strings into reference points). SDK fix candidate.
- PR 2, `OptionsMenu.test.tsx` / `Report.test.tsx` / `BucketItem.test.tsx`: the prop fixtures carried keys the components stopped accepting (`isOpenAsReportVisible`, `config`/`data`/`mdObject`/`intl`, the drop handlers) — dropped once the fixtures were typed as the component props.
