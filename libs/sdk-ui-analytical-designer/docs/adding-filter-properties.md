# Adding a Property to an AD Filter (Measure Value / Ranking)

When a new property on a Measure Value Filter (MVF) or Ranking Filter must
survive the full round trip — UI → AD state → reference point → metadata object
→ execution (AFM) → and back on load — it has to be threaded through every
converter in the chain. Miss one and the property is silently dropped on save,
reload, or execution.

The chain spans SDK packages and the Analytical Designer runtime lib
(`libs/gdc-analytical-designer`). Paths below are verified against the
current layout; check the named symbol still exists before editing, as the code
moves over time.

## The propagation pattern

Each converter that copies a filter body should preserve the new property
without forcing a default, so absent stays absent:

```typescript
const { newProp } = filter.measureValueFilter; // or .rankingFilter
const newPropValue = newProp === undefined ? {} : { newProp };
return { measureValueFilter: { ...existing, ...newPropValue } };
```

## Measure Value Filter — files to update (in order)

1. **SDK model** — add to `IMeasureValueFilterBody` in
   `sdk/libs/sdk-model/src/execution/filter/index.ts`.
2. **SDK Tiger converters** —
   `convertMeasureValueFilter` in
   `sdk/libs/sdk-backend-tiger/src/convertors/toBackend/afm/FilterConverter.ts`,
   and the reverse extraction in
   `sdk/libs/sdk-backend-tiger/src/convertors/fromBackend/afm/FilterConverter.ts`.
3. **SDK UI filters** — UI and state in
   `sdk/libs/sdk-ui-filters/src/MeasureValueFilter/DropdownBody.tsx`
   (props in `.../MeasureValueFilter/typings.ts` if needed).
4. **SDK UI ext (reference point)** — add to `IFiltersBucketItem` in
   `sdk/libs/sdk-ui-ext/src/internal/interfaces/Visualization.ts`.
5. **AD state types** — `IMeasureValueFilter` in
   `libs/gdc-analytical-designer/src/store/filter_bar/filter_bar_types.ts`.
6. **AD filter bar service**
   (`.../src/store/filter_bar/filter_bar_service.ts`): preserve in
   `updateMeasureValueFilter`, include in `convertToMeasureValueFilter`, extract
   in `convertFromExtendedRefPointFilters`.
7. **AD reference point service** —
   `convertMeasureValueFilterToRefPointFilter` (item level) in
   `.../src/services/reference_point_service.ts`.
8. **AD metadata converters** (`.../src/models/metadata.ts`):
   `measureValueFilterToMd` (write) and
   `transformVisualizationMeasureValueFilter` (read).
9. **AD bear types** (`.../src/typings/bear/bearTypes.ts`):
   `IVisualizationObjectMeasureValueFilter` (vis object) and `IMeasureValueFilter`
   (AFM).
10. **AD converters**: save in `.../src/convertors/toBackend/FilterConverter.ts`,
    load in `.../src/convertors/fromBackend/VisualizationConverter.ts`, execute in
    `.../src/convertors/toBackend/afm/FilterConverter.ts`, and the save-comparison
    path in `.../src/utils/sdkModelToADRep/FilterConverter.ts`.

## Ranking Filter — files to update (in order)

Same chain, with `Ranking` in place of `MeasureValue` and two extras:

1. **SDK model** — `IRankingFilterBody` in
   `sdk/libs/sdk-model/src/execution/filter/index.ts`.
2. **SDK Tiger converters** — `convertRankingFilter` in
   `sdk/libs/sdk-backend-tiger/src/convertors/toBackend/afm/FilterConverter.ts`,
   the transformed filter in
   `sdk/libs/sdk-backend-tiger/src/convertors/toBackend/afm/AfmFiltersConverter.ts`,
   and the reverse in `.../fromBackend/afm/FilterConverter.ts`.
3. **SDK UI filters** — UI/state in
   `sdk/libs/sdk-ui-filters/src/RankingFilter/RankingFilterDropdownBody.tsx`;
   include it in the `getFilterState()` return.
4. **SDK UI ext** — `IFiltersBucketItem` (as above).
5. **AD state types** — `IRankingFilter` in `filter_bar_types.ts`.
6. **AD filter bar service**: `updateRankingFilter`, `convertToRankingFilter`,
   `convertFromExtendedRefPointFilters`.
7. **AD reference point service** — `convertRankingFilterToRefPointFilter`.
8. **AD metadata converters**: `rankingFilterToMd` and
   `transformVisualizationRankingFilter`.
9. **AD bear types**: `IVisualizationObjectRankingFilter` and `IRankingFilter`.
10. **AD converters**: same four converter files as MVF.
11. **AD component**
    (`.../src/components/filterBar/rankingFilter/RankingFilterItem.tsx`):
    `createRankingFilterModel` (to SDK model) and `createRankingFilterItem` (back
    to AD state).
