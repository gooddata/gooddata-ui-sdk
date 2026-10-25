# Phase 11 — the architecture working notes

> **Status:** design notes for Phase 11. **Rows 11.1, 11.2, 11.3 and 11.4 are DELIVERED** — the last
> container flip ([note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-111--the-last-container-flip)),
> the small services' narrow pure helpers
> ([note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-112--narrow-pure-helpers-i-the-small-services)),
> the whole of `services/buckets_service.ts`
> ([note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-113--narrow-pure-helpers-ii-servicesbuckets_servicets))
> and the buckets family's ORCHESTRATION
> ([note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-114--the-buckets-operations-become-saga-orchestrated)).
> **Row 11.5 is DELIVERED too** — the properties/arithmetic/recommendations/shortcuts operations;
> §2.2's payload lists were corrected by the code in three places (the recommendation and shortcut
> events carry the add operation's full nine domains, and the arithmetic operand event carries
> `bucketsMeta`), recorded in the plan row.
> **Row 11.6 is DELIVERED too** — the bucket-filters operations, and with them **all six
> buckets-cluster wrappers are gone from `root_reducer.ts`**. §2.3's payload lists were corrected by
> the code in three places (marked inline below and recorded in the plan row): the three
> removal-chain-capable events carry the full nine domains including the derived-measure queue,
> `measureFilterUpdated`'s reference-point sync is CONDITIONAL as legacy, and
> `dateFilterDateDatasetChanged` ALWAYS fires so the `take` in `sagas/date_datasets` cannot hang.
> **Row 11.7 is DELIVERED too** — the remaining root transformers, and with them **the
> transitional wrapper stack is EMPTY**: `reducers/root_reducer.ts` is the combined core plus the
> two sanctioned infrastructure wrappers (time travel and the pluggable-mount reset). The
> application resets are semantic events honored by the owning slices
> (store/app_context/application_reset_events.ts), the router commits `routeChanged` from its
> saga, OPEN_REPORT_FINISHED carries the open-report operation's fused result, and the
> `report.nowOpen` close is the execution domain's coordination event.
>
> **§2.1 BELOW IS THE DESIGN SKETCH, AND THE CODE CORRECTED IT IN FOUR PLACES.** The corrections are
> marked inline and recorded in the 11.4 note; where this file and the shipped code disagree, the code is
> right. In short: the ADD commits nine domains rather than six, the REORDER never ran the removal chain,
> `DND_ITEM_REMOVE` has a second removal pass, and DUAL AXIS needed an event of its own.
>
> §3's signatures are what shipped, with the corrections the code forced — each recorded in the delivery
> note, and two of them worth carrying here because 11.4 depends on them:
>
> - the row-11.2 additional-date-filter helpers take the date-dataset ATTRIBUTES (two domains answer that
>   question differently) and `getDefaultSelectedDateDatasetUri` takes
>   `{ hasDateInBuckets, hasDateFilter, primaryDateDatasetRef }`;
> - `setBucketItemsDateDataset` takes the target as ONE object
>   (`{ bucketItemLocalIdentifier, bucketLocalIdentifier }`) because the three `SET_*_DATE_DATASET`
>   triggers pick between them, and `getBucketItemDimensionalityRef` takes TWO resolvers (date-dataset and
>   attribute-display-form) because its two fallbacks read different sources;
> - `removeBucketItemsWithDependencies` takes `bucketsMeta` in its INPUT as well as its result, and a
>   metric-REF resolver rather than a `CatalogItemTypeResolver`;
> - **`setBucketItemOverTimeComparison`'s input is wider than §3 shows, and 11.4 is what narrows it.**
>   Two of its four branches run the removal chain and then continue, so the reference-point sync lands in
>   the MIDDLE of the operation and the operation owns it (input gains `referencePoint`, `bucketsMeta`,
>   `bucketNotifications`, `extendedReferencePoint`, `isVisualizationMdObjectValid`; deps gain a
>   filters-bucket resolver and `sortItems`). The narrow
>   `{ buckets, filterBar, pluggableVisualization }` form becomes reachable once 11.4 collapses the two
>   syncs into one semantic event — see §2.1.
>   **Read with:** [MIGRATION_AD_REDUX_TOOLKIT.md](./MIGRATION_AD_REDUX_TOOLKIT.md) §4.3, §4.8, §5
>   Phase 11, §7 — and the 4.9 / 4.10 / 4.11 / 10.8 delivery notes plus
>   [the 10.9 experiment note](./MIGRATION_AD_REDUX_TOOLKIT_DELIVERY_NOTES.md#phase-109-experiment--the-cascade-dissolution-prototype).
>   **Scope:** the six buckets-cluster cascades, the services under them, and the remaining root
>   transformers. Nothing else.

The deciding principle, from §4.8:

> **Model operations, not state trees.** Cross-domain logic is explicit in sagas. Pure helpers have
> narrow typed inputs and outputs. Semantic events atomically commit results. Reducers only own and
> update their slice. No cluster. No pseudo-root. No paths.

Everything below is derived from the code on the 10.8 base plus the behavior the prototype on
`imj-stl-3150-p10-9-experiment` pinned. Numbers are measured, not estimated.

---

## 1. What the prototype settled, and what it got wrong

It **settled** (keep these conclusions, they cost real work to obtain):

- one dispatch per logical cascade is achievable and is the right target — render atomicity, undo
  granularity, `observeStore` and splunk all follow from it;
- the six wrappers can leave `root_reducer.ts` without changing behavior, and the legacy composition
  order (buckets → shortcuts → properties → arithmetic → recommendations → bucket filters) is the
  only ordering fact that matters;
- exactly two saga watchers read cascade-written state and must observe the APPLIED state, not the
  trigger: `sagas/catalog`'s availability flow and the embedded `postMessageApi/sagas/insight_changed`;
- the reference-point cluster flips plain safely, and three landmines hide behind dual-mode reads
  (§5 row 11.1 lists them) — **all three confirmed and defused at 11.1**, which also turned up two
  the prototype had not: a live `fromJS` catalog-item producer in `recommendations_apply_reducer`
  and the TS2742 portability class that removing the ERP `.toJS()` exposes;
- every cluster writer's idempotence comes from `setIn`'s equal-value short-circuit and
  `mapCollection`'s identity preservation — never from a rebuilt collection.

It got **wrong**, and this is what Phase 11 fixes: the six handlers stayed whole-root
`State → State` transformers, just called from a saga; ownership was recovered by diffing the computed
root over an array of path constants and shipping a `pathKey`-keyed write map. A whole-root
transformer is not migrated by being called from a saga, and a path-keyed write map is not typed
domain state.

A second design was drafted and also rejected before any of it merged: replacing the root with a
typed 16-field cluster aggregate (`IBucketsClusterState`) plus `collectClusterChanges`. That is
`mini-root → mini-root` — the same state-transformer architecture behind a better type — and it is
now explicitly banned (§4.8.4). **No cluster. No pseudo-root. No generic change set. No diffing.**

## 2. The operation inventory

The unit of design is the OPERATION, not the subtree. 51 trigger types across the six families
resolve to **~34 operations**, of which **5 turn out not to be cross-domain at all** and become plain
single-slice cases. Reads/writes are named by domain; "helpers" names the narrow pure functions the
saga composes.

### 2.1 Buckets family — `buckets_apply_reducer.ts`, 24 triggers → 15 operations (row 11.4)

| Operation (event)                                      | Triggers                                                                                                                                                                                                                                                                                                    | Selects                                                                                                                                                 | Helpers                                                                                                                                                                     | Commits                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bucketItemExpansionToggled` **(not cross-domain)**    | `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED`                                                                                                                                                                                                                                                                       | —                                                                                                                                                       | —                                                                                                                                                                           | `bucketsMeta` slice case, plain                                                                                                                                                                                                                                                                                                                                                                                     |
| `bucketItemEdited`                                     | the slice-owned edits (title, format, showAllValues, aggregation, chartType, isTotalMeasure, showOnSecondaryAxis, isThresholdMeasure) — **EIGHT, not nine: `dualAxis` moved to its own event, see below**                                                                                                   | buckets, filterBar.items, bucketsMeta, properties.sortItems                                                                                             | the matching `buckets_write_helpers` writer + `convertFiltersToRefPoint` + `syncReferencePoint`                                                                             | buckets, referencePoint, isVisualizationMdObjectValid                                                                                                                                                                                                                                                                                                                                                               |
| `dualAxisToggled` **(AS SHIPPED — not in the sketch)** | `BUCKET_TOGGLE_DUAL_AXIS`                                                                                                                                                                                                                                                                                   | buckets, visualizationProperties, filterBar.items, bucketsMeta, properties.sortItems                                                                    | `toggleDualAxisInBuckets` + the properties domain's `setDualAxisControl` + `syncReferencePoint`                                                                             | buckets, **visualizationProperties**, referencePoint, isVisualizationMdObjectValid. It decides TWO domains, and the legacy chain landed both in one dispatch — leaving the properties half on the trigger would have exposed §9.1's risk 1 exactly                                                                                                                                                                  |
| `bucketItemEdited`                                     | `SET_BUCKET_ITEM_SHOW_IN_PERCENT`                                                                                                                                                                                                                                                                           | + catalog-item-type resolver                                                                                                                            | `setRelatedBucketItemsProperty`, `sanitizeMeasureFormat`                                                                                                                    | as above                                                                                                                                                                                                                                                                                                                                                                                                            |
| `bucketItemEdited`                                     | `SET_BUCKET_ITEM_GRANULARITY`, `SET_BUCKET_ITEM_DISPLAY_FORM`                                                                                                                                                                                                                                               | + itemCache, date-dataset resolver                                                                                                                      | `syncDateBucketItemGranularityAndDfRef`                                                                                                                                     | as above                                                                                                                                                                                                                                                                                                                                                                                                            |
| `bucketsDateDatasetChanged`                            | `SET_{ALL_BUCKETS,BUCKET,BUCKET_ITEM}_DATE_DATASET`                                                                                                                                                                                                                                                         | buckets, date-dataset resolver                                                                                                                          | `setBucketItemsDateDataset`                                                                                                                                                 | buckets, referencePoint, isVisualizationMdObjectValid (**true**)                                                                                                                                                                                                                                                                                                                                                    |
| `bucketItemAdded`                                      | `DND_ITEM_INSERT`                                                                                                                                                                                                                                                                                           | buckets, itemCache, ERP uiConfig, dateDatasets(+meta), filterBar, properties.dualAxis, configurationPanel, referencePoint.buckets, flags(`approxCount`) | `buildBucketItemFromCatalogItem`, `addBucketItems`, `addTotalsEnabledForAllMeasuresToNewMeasure`, `setBucketItemOverTimeComparison`, `sanitizeTotals`, `syncReferencePoint` | **NINE domains as shipped, not six:** buckets, bucketsMeta, configurationPanel, pluggableVisualization, referencePoint, isVisualizationMdObjectValid — **plus filterBar, bucketNotifications and extendedReferencePoint**, because a MEASURE added while every reference-point measure already compares over time runs the whole over-time-comparison operation, and two of its four branches run the removal chain |
| `bucketItemsRemoved`                                   | `DND_ITEM_REMOVE`, `REMOVE_ITEMS`, `REMOVE_DERIVED_ITEMS`. **AS SHIPPED: `DND_ITEM_REMOVE` runs the chain a SECOND time** over every remaining derived measure when the first pass left period-over-period comparison unavailable — `purgeDerivedWhenPopUnavailable`, and the only trigger that asks for it | buckets, filterBar, itemCache, catalog, ERP.properties.sortItems, bucketNotifications, flags(`improvedRankingFilter`, `newPivotTable`)                  | `removeBucketItemsWithDependencies` (the one big cross-domain calculation), `validateVisualizationProperties`, `sanitizeTotals`, `syncReferencePoint`                       | buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint, referencePoint, isVisualizationMdObjectValid                                                                                                                                                                                                                                                                                          |
| `bucketItemReplaced`                                   | `DND_ITEM_REPLACE`                                                                                                                                                                                                                                                                                          | union of add + remove                                                                                                                                   | + `findReplacedBucketItemNewInsertionIndex`, `removeUneditedAttributeAndDateFilters`                                                                                        | union of add + remove                                                                                                                                                                                                                                                                                                                                                                                               |
| `bucketItemsSwapped`                                   | `DND_ITEM_SWAP`                                                                                                                                                                                                                                                                                             | buckets, ERP uiConfig, dateDatasets, properties.dualAxis                                                                                                | `swapBucketItem`, `setBucketItemsDateDataset`, `sanitizeTotals`                                                                                                             | buckets, referencePoint, isVisualizationMdObjectValid                                                                                                                                                                                                                                                                                                                                                               |
| `bucketItemReordered`                                  | `DND_ITEM_REORDER`                                                                                                                                                                                                                                                                                          | buckets only                                                                                                                                            | `removeSingleBucketItem`, `insertItem`, `sanitizeTotals`                                                                                                                    | **buckets, referencePoint, isVisualizationMdObjectValid — NOT "the removal set".** The legacy handler used the buckets-ONLY `removeSingleBucketItem` adapter, so no filters, notifications or markers are touched; the result type has three fields and a spec pins it                                                                                                                                              |
| `visualizationTypeSelected`                            | `BUCKETS_SELECT_VISUALIZATION_TYPE`                                                                                                                                                                                                                                                                         | — (payload is the class)                                                                                                                                | —                                                                                                                                                                           | visualizationClass, extendedReferencePoint (**cleared**), isVisualizationMdObjectValid (**false**)                                                                                                                                                                                                                                                                                                                  |
| `extendedReferencePointApplied`                        | `EXTENDED_REFERENCE_POINT_CHANGED`                                                                                                                                                                                                                                                                          | ERP payload, buckets, referencePoint(`firstRender`), properties.sortItems, filterBar, dateDatasets, catalog                                             | `convertFromExtendedRefPointFilters`, `sanitizeFormats`, the geo normalization block, `syncDateBucketItemGranularityAndDfRef`, `setFilterItems`, `sanitizeTotals`           | extendedReferencePoint, buckets, properties, filterBar, referencePoint, isVisualizationMdObjectValid (**true**)                                                                                                                                                                                                                                                                                                     |
| `derivedBucketItemsPlaced`                             | `NEW_DERIVED_BUCKET_ITEMS_PLACED`                                                                                                                                                                                                                                                                           | payload RP buckets, pluggableVisualization queue, buckets, ERP                                                                                          | `mirrorTotalsToDerivedMeasures`, `validateVisualizationProperties`, `clearNewDerivedBucketItems`                                                                            | buckets, pluggableVisualization, extendedReferencePoint, referencePoint                                                                                                                                                                                                                                                                                                                                             |
| `filterRemovalApplied`                                 | `SAGA_FILTERS_WERE_CHANGED`                                                                                                                                                                                                                                                                                 | payload removedFilters, bucketsMeta, buckets, filterBar                                                                                                 | `removeAllDerivedBucketItems`, bucketsMeta cleanup                                                                                                                          | bucketsMeta, buckets, referencePoint, isVisualizationMdObjectValid                                                                                                                                                                                                                                                                                                                                                  |

### 2.2 Properties / arithmetic / recommendations / shortcuts — 16 triggers → 11 operations (row 11.5)

| Operation (event)                                           | Triggers                                           | Notes                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visualizationPropertiesInitialized` **(not cross-domain)** | `VISUALIZATION_PROPERTIES_INITIALIZED`             | extendedReferencePoint only → plain leaf case; keep the EXISTENCE guard, not `isEmpty`                                                                                                                                                                     |
| `openAsReportToggled` **(not cross-domain)**                | `OPEN_AS_REPORT_TOGGLED`                           | extendedReferencePoint `uiConfig` only → plain leaf case                                                                                                                                                                                                   |
| `visualizationPropertiesChanged`                            | `STORE_VISUALIZATION_PROPERTIES`                   | ERP `properties` + `setBucketTotals` + RP sync → extendedReferencePoint, buckets, referencePoint, isVisualizationMdObjectValid                                                                                                                             |
| `arithmeticMeasureAdded`                                    | `STORE_ADD_ARITHMETIC_MEASURE`                     | buckets, bucketsMeta(`measureExpanded`), referencePoint, isVisualizationMdObjectValid                                                                                                                                                                      |
| `arithmeticMeasureOperandSelected`                          | `STORE_SELECT_ARITHMETIC_MEASURE_OPERAND`          | the widest of the four: buckets, pluggableVisualization, filterBar, bucketNotifications, extendedReferencePoint, referencePoint                                                                                                                            |
| `arithmeticMeasureOperatorSelected`                         | `STORE_SELECT_ARITHMETIC_MEASURE_OPERATOR`         | buckets, referencePoint; deletes the cluster's last `fromJS`/`isImmutable` pair (dead after 11.1)                                                                                                                                                          |
| `recommendationApplied`                                     | the 5 `STORE_RECOMMENDATION_*`                     | ONE operation, five parameterizations — the payload carries the recommendation kind and what it produced (buckets, filterBar, visualizationClass?, referencePoint, isVisualizationMdObjectValid). Reuses the buckets add/edit operations, hence after 11.4 |
| `metricShortcutApplied`                                     | `SHORTCUT_APPLY_METRIC`, `..._POSTPONED`           | buckets, droppedItem, postponedAction (cleared), referencePoint, …                                                                                                                                                                                         |
| `metricOverTimeShortcutApplied`                             | `SHORTCUT_APPLY_METRIC_OVER_TIME`, `..._POSTPONED` | + dateDatasets (`available`/`unavailable` copy-across), filterBar (date filter + preset), buckets granularity                                                                                                                                              |
| `shortcutPostponed`                                         | the postpone branches of both shortcuts            | postponedAction (parked), visualizationClass, extendedReferencePoint (cleared), droppedItem                                                                                                                                                                |
| `shortcutDroppedItemSet` **(not cross-domain)**             | `SHORTCUT_SET_DROPPED_ITEM`                        | droppedItem leaf only → plain leaf case. The time-travel undo fixup writes the same leaf and stays infrastructure (§4.8.1)                                                                                                                                 |

### 2.3 Bucket filters — 11 triggers → 9 operations (row 11.6)

| Operation (event)                                          | Triggers                                                                              | Commits                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attributeFilterUpdated`                                   | `STORE_UPDATE_ATTRIBUTE_FILTER`                                                       | filterBar, bucketsMeta(`modified`), referencePoint, isVisualizationMdObjectValid. **AS SHIPPED: an update addressing a filter that does not exist commits NOTHING** — the legacy invariant threw out of the reducer, and a saga must not die of it                                                              |
| `attributeFilterDisplayFormChanged` **(not cross-domain)** | `STORE_UPDATE_ATTRIBUTE_FILTER_DISPLAY_FORM`, `..._UPDATE_METRIC_FILTER_DISPLAY_FORM` | filterBar only → plain case                                                                                                                                                                                                                                                                                     |
| `dateFilterUpdated`                                        | `STORE_UPDATE_DATE_FILTER`                                                            | filterBar, buckets (derived measures), bucketsMeta, bucketNotifications, extendedReferencePoint, referencePoint — **AS SHIPPED: plus pluggableVisualization and the md flag, i.e. the full nine domains**, because enabling a comparison with no derived measure yet QUEUES one (branch 2 of the OTC operation) |
| `dateFilterDateDatasetChanged`                             | `STORE_UPDATE_DATE_FILTER_DATE_DATASET`                                               | filterBar (incl. the additional-date-filter migration), referencePoint. **AS SHIPPED: ALWAYS fires** — a missing filter or an unchanged ref answers every value by reference, because `sagas/date_datasets` `take`s this event before reading the filter it asked to change                                     |
| `filterItemsUpdatedFromCommand`                            | `STORE_ADD_OR_UPDATE_FILTER_ITEMS`                                                    | the embedded `COMMAND/*` path: filterBar, buckets, referencePoint — **AS SHIPPED: the full nine domains**, because a created first date filter runs the whole derived-measure chain. `control_filtering_saga` `take`s this event before reading the filters the command created, so it always fires             |
| `measureValueFilterUpdated` / `rankingFilterUpdated`       | `STORE_UPDATE_{MEASURE_VALUE,RANKING}_FILTER`                                         | filterBar, referencePoint                                                                                                                                                                                                                                                                                       |
| `measureFilterAdded`                                       | `..._ADD_METRIC_FILTER`                                                               | buckets (item filters), itemCache, measureDateDatasets, filterBar (configs), referencePoint                                                                                                                                                                                                                     |
| `measureFilterRemoved`                                     | `..._REMOVE_METRIC_FILTER`                                                            | buckets, measureDateDatasets, filterBar, referencePoint                                                                                                                                                                                                                                                         |
| `measureFilterUpdated`                                     | `..._UPDATE_METRIC_FILTER`                                                            | buckets, bucketsMeta, referencePoint — **AS SHIPPED: the full nine domains** (the over-time rider runs the removal chain per master), **and the reference point / md flag are CONDITIONAL as legacy**: an edit with neither the rider nor `isModified` rewrites the filters without re-syncing                  |

### 2.4 What the inventory decides

- **Payloads differ per operation and that is the point.** `visualizationTypeSelected` carries three
  values, `bucketItemsRemoved` seven, `attributeFilterDisplayFormChanged` is not an event at all. A
  universal payload would erase exactly this information.
- **`isVisualizationMdObjectValid` is an OUTPUT of the operation**, not reference-point state — the
  legacy `bucketsWereChanged(state, valid)` wrote both in one pass, which is why they looked like one
  thing. Named separately in every payload that produces it.
- **Five triggers are not cascades.** Discovering them is worth a row's effort on its own: each is a
  plain slice/leaf case, and each one removed shrinks the saga surface.
- **`removeBucketItemsWithDependencies` is the only genuinely wide pure calculation** (buckets +
  filterBar + notifications + ERP sortItems). It gets an explicit named input and result type, and it
  is called by six operations across three families — which is why 11.3 must land before 11.4.

## 3. The narrow helper catalog (rows 11.2 / 11.3)

Target signatures. `dateDatasetByRef` / `catalogItemType` / `bucketItemRef` are LAZY resolvers (the
4.9 pattern — each call walks buckets or the item cache); flags are explicit named booleans.

**Row 11.2 — filter bar and the small services** (DELIVERED — see the note; `getAdditionalDateAttributeFilters` shipped as the `pick*` / `remove*` pair the selectors delegate to, and the queue helpers live next to the buckets cluster's state module)

```ts
// store/filter_bar/filter_bar_helpers.ts        (was FilterBarService, 13 root-state writers)
addFilter(filterBar, filter): IFilterBarState
storeFilter(filterBar, updatedFilter): IFilterBarState
removeFilters(filterBar, localIdentifiers): IFilterBarState
setFilterItems(filterBar, items): IFilterBarState
setParameterItems(filterBar, items): IFilterBarState
storeAttributeFilterConfigs(filterBar, configs): IFilterBarState
updateDateFilter(filterBar, { localIdentifier, filterConfig, overTimeComparisonType, dateDatasetRef, emptyDateValuesFilter }): IFilterBarState
updateAttributeFilter(filterBar, localIdentifier, selection): IFilterBarState
createDateFilterIfDoesntExist(filterBar, dateDatasetRef): IFilterBarState
resetAdditionalDateFilters(filterBar, newDateDatasetRef, dateDatasetsWithGranularities): IFilterBarState
// already pure, unchanged: convertFromExtendedRefPointFilters, createDateFilter,
// createAttributeFilter, createMeasureValueFilter, createDefaultRankingFilter, migrateAdditional…

// store/reference_point/reference_point_sync.ts
syncReferencePoint(referencePoint, buckets, refPointFilters, sortItems): IReferencePointState
//   the md-object-valid flag is NOT written here — it is a separate output of the operation

// services/pluggable_visualization_service.ts → store/buckets/pluggable_visualization_helpers.ts
appendNewDerivedBucketItem(pluggableVisualization, item): IPluggableVisualizationState
clearNewDerivedBucketItems(pluggableVisualization): IPluggableVisualizationState

// services/measure_date_datasets_service.ts  — the root facade DIES; the slice helpers already exist
getDefaultSelectedDateDatasetUri(availableDateDatasets, { hasDateInBuckets, hasDateFilter, primaryDateDatasetRef }): string

// services/over_time_comparison_service.ts
areAllSelectedCompatible(refPointBuckets, refPointMeasures): boolean
createAndAddNewDerivedMeasure(pluggableVisualization, measure, comparisonType): IPluggableVisualizationState
```

**Row 11.3 — `buckets_service.ts`**

```ts
// domain-local transformations over IBucketsState
addBucketItems(buckets, bucketLocalIdentifier, items, position): IBucketsState
removeSingleBucketItem(buckets, localIdentifier): IBucketsState
swapBucketItem(buckets, from, to, targetBucketLocalIdentifier, { acceptsItemType, secondaryAxisEnabled }): IBucketsState
setBucketTotals(buckets, totals, bucketLocalIdentifier): IBucketsState              // guarded: identity on equal totals
addTotalsEnabledForAllMeasuresToNewMeasure(buckets, newMeasure): IBucketsState
mirrorTotalsToDerivedMeasures(buckets, derivedMeasureAddedToItem): IBucketsState    // guarded: identity on deep-equal
setBucketItemsDateDataset(buckets, ref, target, dateDatasetByRef): IBucketsState    // guarded via mapCollection
sanitizeTotals(previousBuckets, currentBuckets, { reorderByMeasures }): IBucketsState
syncDateBucketItemGranularityAndDfRef(bucketItem, dateDataset, granularityOverride?): IRawBucketItem

// pure cross-domain calculations — explicit named input AND result per operation.
// AS SHIPPED; the design sketch had a narrower input for both, see the status header.
removeBucketItemsWithDependencies(
    { buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint },
    { localIdentifiers, notifyOnlyAboutRemovedDependencies },
    { catalogMetricRef, bucketItemRef, improvedRankingFilter, reorderByMeasures },
): IRemoveBucketItemsResult   // { buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint }

// wider than sketched BECAUSE two of the four branches run the removal chain and then continue, so the
// reference-point sync lands mid-operation. Row 11.4 collapses the two syncs and narrows this back to
// { buckets, filterBar, pluggableVisualization }.
setBucketItemOverTimeComparison(
    { buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint,
      pluggableVisualization, referencePoint, isVisualizationMdObjectValid },
    { measure, isEnabled, targetType },
    { catalogMetricRef, bucketItemRef, improvedRankingFilter, reorderByMeasures,
      refPointFilters, sortItems },
): ISetOverTimeComparisonResult

validateVisualizationProperties(extendedReferencePoint, buckets): IExtendedReferencePointState
getPrimaryDateDatasetRef(buckets, filterItems, firstAvailableDateDataset): ObjRef | undefined

// the ~35 readers stay SELECTORS that delegate to the value-level implementation
selectMeasures = (state) => getMeasuresFromBuckets(selectBuckets(state))
```

**Deleted rather than converted** (row 11.4): `utils/buckets_reducer_helpers.ts`'s `addItem`,
`setVisualizationType`, `setGranularity`, `setShowInPercent`, `changeDateBucketItemDateDataset` —
each currently builds an action and calls `bucketsReducer(state, action)`, a reducer-calls-reducer
re-entry. Once the buckets operations are functions, these are ordinary calls, and
`store/buckets/buckets_reducer.ts` (the slice+apply compose) goes with them.

## 4. The saga shape

One worked example — the removal operation, which is the widest. Explicit, verbose, and that is the
design (§4.8):

```ts
function* handleRemoveBucketItem(action: ReturnType<typeof removeBucketItem>): SagaIterator {
    const buckets = yield select(selectBuckets);
    const filterBar = yield select(selectFilterBar);
    const bucketNotifications = yield select(selectBucketNotifications);
    const extendedReferencePoint = yield select(selectExtendedReferencePoint);
    const bucketsMeta = yield select(selectBucketsMeta);
    const referencePoint = yield select(selectReferencePoint);
    const sortItems = yield select(selectVisualizationPropertiesSortItems);
    const deps = yield call(buildRemovalDeps); // lazy resolvers + explicit flags

    const removal = removeBucketItemsWithDependencies(
        { buckets, filterBar, bucketNotifications, extendedReferencePoint },
        { localIdentifiers: [action.payload.localIdentifier], notifyOnlyAboutRemovedDependencies: true },
        deps,
    );

    const nextBuckets = sanitizeTotals(buckets, removal.buckets, {
        reorderByMeasures: deps.enableNewPivotTable,
    });
    const nextReferencePoint = syncReferencePoint(
        referencePoint,
        nextBuckets,
        convertFiltersToRefPoint(removal.filterBar.items, bucketsMeta),
        sortItems,
    );

    yield put(
        bucketItemsRemoved({
            buckets: nextBuckets,
            bucketsMeta: removal.bucketsMeta,
            filterBar: removal.filterBar,
            bucketNotifications: removal.bucketNotifications,
            extendedReferencePoint: removal.extendedReferencePoint,
            referencePoint: nextReferencePoint,
            isVisualizationMdObjectValid: false,
        }),
    );
}
```

Rules the sagas follow:

- **no effect between the selects and the put** other than pure `call`s — the "compute everything
  first, then put" condition (§5 Phase 9). One `put` per operation makes it structural;
- `takeEvery` unless the legacy behavior was last-wins; no operation handler awaits I/O, so there is
  no interleaving to reason about;
- the trigger action **writes nothing** — the operation's event is the only store write, which is
  what makes the intermediate state unobservable (an improvement on the prototype);
- watchers that must see the applied state key on the SEMANTIC event
  (`take(extendedReferencePointApplied)`), which is narrower and safer than the prototype's
  `isCascadeAppliedFor(<trigger>)` — and it cannot hang on a no-op cascade, because the event exists
  per operation rather than per write.

## 5. Slice ownership

Every consumer is one case, one slice, no cross-reads:

| Domain                                                                                                                        | Mount today                                                                                                                                               | Consumes                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data.buckets`                                                                                                                | `bucketsSliceReducer`                                                                                                                                     | `bucketItemAdded`, `bucketItemsRemoved`, `bucketItemReplaced`, `bucketItemsSwapped`, `bucketItemReordered`, `bucketItemEdited`, `bucketsDateDatasetChanged`, `extendedReferencePointApplied`, `derivedBucketItemsPlaced`, `filterRemovalApplied`, `visualizationPropertiesChanged`, the three arithmetic events, `recommendationApplied`, the shortcut events, `dateFilterUpdated`, `measureFilter*` |
| `data.referencePoint`                                                                                                         | slice at 11.1                                                                                                                                             | every operation that syncs it                                                                                                                                                                                                                                                                                                                                                                        |
| `data.bucketsMeta`                                                                                                            | **slice as of 11.4**                                                                                                                                      | `bucketItemExpansionToggled` (own action) + the operations that write `modified`/`autoCreated`/`*Expanded`                                                                                                                                                                                                                                                                                           |
| `data.extendedReferencePoint`                                                                                                 | **real leaf reducer as of 11.4** — hand-written, NOT `createSlice`: immer would deep-freeze the value AD hands straight back to a pluggable visualization | `visualizationTypeSelected` (cleared), `extendedReferencePointApplied`, `visualizationProperties{Changed,Initialized}`, `openAsReportToggled`, `bucketItemsRemoved`, `derivedBucketItemsPlaced`                                                                                                                                                                                                      |
| `data.postponedAction`, `data.shortcut.shortcutDroppedItem`                                                                   | leaves                                                                                                                                                    | the shortcut events + their own plain actions (and time travel's undo fixup, infrastructure)                                                                                                                                                                                                                                                                                                         |
| `data.isVisualizationMdObjectValid`                                                                                           | **real leaf reducer as of 11.4**                                                                                                                          | every operation that produces it                                                                                                                                                                                                                                                                                                                                                                     |
| `data.visualizationClass`                                                                                                     | slice                                                                                                                                                     | `visualizationTypeSelected`, `shortcutPostponed`, `recommendationApplied`                                                                                                                                                                                                                                                                                                                            |
| `data.configurationPanel`, `data.dateDatasets`, `data.itemCache`, `data.visualizationProperties`, `data.measuresDateDatasets` | slices                                                                                                                                                    | the specific operations listed in §2                                                                                                                                                                                                                                                                                                                                                                 |
| `data.filterBar`, `data.bucketNotifications`                                                                                  | hand-written reducers (§10 backlog)                                                                                                                       | an explicit case per event — the same shape a slice gets, written out                                                                                                                                                                                                                                                                                                                                |

## 6. Identity and the absence of a change set

Helpers return the ORIGINAL reference when nothing changed. A semantic event therefore carries its
values unconditionally: an unchanged reference reaching a slice returns the same state, and
`combineBranch`/`combineReducers` short-circuits on identity, so no subscriber is notified and no
render happens. **That is why there is no change set, no presence map and no diff** — the returned
values already carry the information, and §4.8.5 makes it a contract rather than an accident. Domain
suites assert `toBe`, not `toEqual`.

## 7. Disposition of the 10.9 prototype

Nothing from the prototype is on the working branch; it lives on `imj-stl-3150-p10-9-experiment`.

| Piece                                                                                                                                                       | Disposition                                                                                                                                               | Why                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RP / ERP / postponedAction plain flip (+ the 3 defused landmines, the declared `getSecondaryAxisMeasures` change, the plain geo pipeline, the frozen seeds) | **DONE at 11.1**                                                                                                                                          | Architecture-neutral and independently valuable; the flip moves no dispatch. Written from scratch against the notes rather than lifted from the prototype's diff — which is how the geo pipeline's self-typed `IErpBucketItem` aliases, the `recommendations_apply_reducer` `fromJS` producer and the TS2742 portability class were found |
| `referencePoint` slice                                                                                                                                      | **DONE at 11.1, THE SYNC ARRIVED AT 11.4**                                                                                                                | It owns the two open-report actions plus eleven operation events — one per buckets gesture. The only external writer left is open-report's OPEN_REPORT_FINISHED (row 11.7)                                                                                                                                                                |
| `buckets_cluster_cascades_saga.ts`                                                                                                                          | **DELETE**                                                                                                                                                | One generic watcher over six whole-root computes is the rejected shape. Its ORDERING knowledge and the trigger-type sets survive as evidence in §2                                                                                                                                                                                        |
| `cascadeApplied` (generic fused event)                                                                                                                      | **DELETE**                                                                                                                                                | Replaced by ~28 semantic events. `source`-based fan-out disappears with it                                                                                                                                                                                                                                                                |
| `buckets_cluster_write_surface.ts`                                                                                                                          | **DELETE**                                                                                                                                                | Ownership expressed as an external array of path constants                                                                                                                                                                                                                                                                                |
| `pathKey`, `diffClusterWrites`, `carriesClusterWrites`, `clusterWriteCase`, `clusterWriteLeaf`                                                              | **DELETE**                                                                                                                                                | Path-keyed payload plumbing. The leaf-with-a-case shape survives as an ordinary typed leaf reducer                                                                                                                                                                                                                                        |
| root-state diffing                                                                                                                                          | **DELETE**                                                                                                                                                | §4.8.4                                                                                                                                                                                                                                                                                                                                    |
| the six `State → State` cascade computes                                                                                                                    | **TEMPORARY / PARITY ONLY**                                                                                                                               | Stay exactly where they are (in the reducer chain) until their family's row lands, then are deleted family by family. They are the behavioral oracle                                                                                                                                                                                      |
| watcher re-points (`catalog_saga`, `insight_changed_saga`)                                                                                                  | **REWORK**                                                                                                                                                | The FINDING is kept (a watcher reading cascade-written state must observe the applied state); the mechanism becomes `take(<semanticEvent>)`                                                                                                                                                                                               |
| `test/utils/reduce_with_cascades.ts`                                                                                                                        | **DELETE** (done — 11.4 shipped `test/utils/dispatch_buckets_trigger.ts` instead, which runs the REAL saga and the REAL reducer and fakes only the store) | Only exists because the cascades left the chain while still being whole-root computes. With cascades in the chain (until their row) the reducer suites work unchanged; after their row they become operation-level tests                                                                                                                  |
| `buckets_cluster_write_surface.test.ts`                                                                                                                     | **DELETE**                                                                                                                                                | Pins the deleted array                                                                                                                                                                                                                                                                                                                    |
| `buckets_cluster_characterization.test.ts` + the 4 big reducer suites                                                                                       | **KEEP and EXTEND**                                                                                                                                       | The parity oracle. Their fixtures and expectations are the most valuable artifact of the whole cluster                                                                                                                                                                                                                                    |
| `IBucketsClusterState` / `collectClusterChanges` / cluster selectors (the second, rejected draft)                                                           | **DELETE**                                                                                                                                                | Never merged; the pseudo-root ban (§4.8.4) exists because of it                                                                                                                                                                                                                                                                           |

## 8. Parity strategy

1. **Per typed domain value, never a root snapshot.** For a seeded state and a trigger: run the
   prototype path (the chain-resident compute) and the new operation (saga → event), then compare each
   domain value the operation names with `toEqual`, and assert `toBe` for every value it must not
   touch. A root `toEqual` passes on a lost identity — the 4.11 regression class.
2. **The risk classes get explicit cases** (they are the ones the notes already flag): reference-point
   synchronization for every trigger shape; extended-reference-point consequences (replace,
   `properties.sortItems` rewrite, CLEAR via `visualizationTypeSelected`, `firstRender` consumption);
   totals sanitization (the previous-vs-current pair); derived-measure removal with MVF/ranking
   preservation and the notification counts; all three over-time-comparison branches; the shortcut
   park/replay path; bucket notifications / removed items; the additional-date-filter migration;
   measure-date-dataset selection; and everything undo-visible.
3. **Undo, observers, splunk**: one-dispatch pin per operation (§8 of the plan), an undo spec per
   operation whose trigger is whitelisted, and a check that `observeStore` fires at most once —
   which it now does, because the trigger writes nothing.

## 9. Risks and unknowns

1. **A trigger that both writes its own slice and cascades.** The 9 bucket-item edits do exactly
   that today. Their slice write MUST move into the operation's event, or the operation is two
   dispatches with an observable intermediate state. Listed per operation in §2.1.
2. **Wrapper composition.** Verify mechanically that no trigger type is handled by two of the six
   wrappers before splitting the families across rows 11.4–11.6 (the prototype's `CASCADE_COMPUTES`
   encodes the legacy order; a shared type would couple two rows). Cheap check, do it first.
3. **Undo whitelist.** Keying stays on the frozen trigger strings, and the snapshot is still taken
   before the edit — but it becomes a property of two actions instead of one. Pin per operation
   (§7 gate).
4. **Test churn is the largest single cost.** `bucket_reducer.test.ts` (75 KB),
   `buckets_reducer.test.ts` (32 KB), `buckets_cluster_characterization.test.ts` and
   `data_characterization.test.ts` drive the reducer chain. As each family moves they become
   operation-level tests (drive the saga with `runSaga`, assert the emitted event payload) plus pure
   helper units. Budget it inside each row; do not defer it to a "test row".
5. **`sanitizeTotals` takes TWO states.** A mechanical one-parameter conversion would silently drop
   the previous-state argument and break the totals re-pointing table (4.9's own coverage note).
6. **Deep addressing inside a buckets value** still needs the identity-preserving, negative-index-aware
   update helper. It must move out of the Redux shim under its own name (row 11.3) or 12.4 cannot
   answer whether `state_access.ts` is deletable.
7. **`isColumnSelected` and friends reach past the cluster** (bootstrap's mapbox token, six feature
   flags). They stay selectors, read at the saga boundary into explicit arguments; a helper never
   calls them.
8. **The embedded `COMMAND/*` path** (`filterItemsUpdatedFromCommand`) is protocol-facing: its
   payload shapes are external contract, so the operation's input type must mirror them exactly and
   the embedded e2e specs are the gate.

## 10. Gates (report-only as each row lands, gating at 12.4)

| Detector                    | Rule                                                                                                                                                                     | Allowlist                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `[J]` State→State           | no `(state: State) => State` in domain/business code                                                                                                                     | `store/_infra/time_travel.ts` and the pluggable-mount reset (root_reducer.ts) — the not-yet-dissolved wrappers reached zero at 11.7 |
| `[K]` root-state import     | no `typings/state.ts` import in `*_helpers.ts` / `services/**` / operation modules                                                                                       | selectors, sagas, infrastructure                                                                                                    |
| `[L]` path addressing       | no `constants/state_paths.ts` import in business code; zero imports total at 12.4                                                                                        | mounts + selectors until 12.4                                                                                                       |
| `[M]` shim over Redux state | no `getIn/setIn/updateIn/deleteIn` with a root-`State` receiver (extends the existing `[H]`)                                                                             | the shim's own module until 12.4                                                                                                    |
| `[N]` rejected shapes       | denylist: `pathKey`, `*write_surface*`, `IClusterWrites`, cluster/context/working-set aggregate types, `collect*Changes`/`diff*State`/`extract*Writes`, `changedDomains` | none                                                                                                                                |
| `[O]` reducer ownership     | a slice/reducer module may not import another domain's selectors, the state shim, or `state_paths`                                                                       | none                                                                                                                                |
| `[P]` one dispatch          | per operation: exactly one store notification per trigger (test-level)                                                                                                   | operations that legitimately commit nothing                                                                                         |

`[N]` and `[O]` are the two that would have caught the prototype and the pseudo-root draft
respectively, which is why they are written down as detectors and not as prose.
