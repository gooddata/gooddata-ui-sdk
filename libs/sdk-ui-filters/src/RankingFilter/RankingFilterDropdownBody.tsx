// (C) 2020-2026 GoodData Corporation

import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { isEmpty, isEqual, xorWith } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import {
    type IRankingFilter,
    type ObjRefInScope,
    areObjRefsEqual,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { type IDimensionalityItem } from "../MeasureValueFilter/typings.js";
import {
    areDimensionalitySetsEqual,
    isEmptyDimensionalityInvalid,
} from "../MeasureValueFilter/useDimensionalityEditor.js";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown.js";
import { MeasureDropdown } from "./MeasureDropdown/MeasureDropdown.js";
import { OperatorDropdown } from "./OperatorDropdown/OperatorDropdown.js";
import { Preview } from "./Preview.js";
import { RankingAttributesSection } from "./RankingAttributesSection.js";
import {
    type IAttributeDropdownItem,
    type ICustomGranularitySelection,
    type IMeasureDropdownItem,
    type RenderMeasureDropdownBody,
} from "./types.js";
import { ValueDropdown } from "./ValueDropdown/ValueDropdown.js";

const isApplyButtonDisabled = (
    filter: IRankingFilter,
    filterState: IRankingFilter,
    enableRankingWithMvf: boolean,
    applyOnResult: boolean,
    enableRankingStrictLimit: boolean,
    strictLimitOfRows: boolean,
) => {
    const rankingFilter = filter.rankingFilter;
    const rankingFilterState = filterState.rankingFilter;

    const operatorNotChanged = rankingFilter.operator === rankingFilterState.operator;
    const valueNotChanged = rankingFilter.value === rankingFilterState.value;
    const attributesNotChanged = isEmpty(
        xorWith(rankingFilter.attributes, rankingFilterState.attributes, isEqual),
    );
    const measureNotChanged = isEqual(rankingFilter.measure, rankingFilterState.measure);

    // When flag is enabled, also check if applyOnResult changed
    const applyOnResultNotChanged =
        !enableRankingWithMvf || (rankingFilter.applyOnResult ?? true) === applyOnResult;

    // When flag is enabled, also check if strictLimitOfRows changed. A missing flag means "with ties"
    // (legacy/default behavior); the strict condition is selected only when strictLimitOfRows === true.
    const strictLimitOfRowsNotChanged =
        !enableRankingStrictLimit || (rankingFilter.strictLimitOfRows ?? false) === strictLimitOfRows;

    return (
        operatorNotChanged &&
        valueNotChanged &&
        attributesNotChanged &&
        measureNotChanged &&
        applyOnResultNotChanged &&
        strictLimitOfRowsNotChanged
    );
};

interface IRankingFilterDropdownBodyComponentProps {
    measureItems: IMeasureDropdownItem[];
    attributeItems: IAttributeDropdownItem[];
    filter: IRankingFilter;
    onApply: (filter: IRankingFilter) => void;
    onCancel?: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
    enableRankingWithMvf?: boolean;
    enableRankingStrictLimit?: boolean;
    renderMeasureDropdownBody?: RenderMeasureDropdownBody;
    // The following mirror the measure value filter dimensionality props (apart from naming). When
    // isAttributesSectionEnabled is true, the multi-attribute "out of" section replaces the legacy
    // single-attribute dropdown.
    isAttributesSectionEnabled?: boolean;
    /**
     * Current "out of" attributes (titled), seeded by the host: the filter's own attributes, or the insight
     * defaults when the filter has none ("reuses insight attributes"). Used as the initial selection and the
     * Apply baseline; carrying titles lets the preview render them (including catalog attributes).
     */
    attributes?: IDimensionalityItem[];
    /** Insight default "out of" attributes (bucket attributes/dates), used for the reset action. */
    insightAttributes?: IDimensionalityItem[];
    /** Catalog "out of" attributes (used when not lazily loaded via loadCatalogAttributes). */
    catalogAttributes?: IDimensionalityItem[];
    /** Lazily loads catalog "out of" attributes valid for the current selection (on picker open). */
    loadCatalogAttributes?: (attributes: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
}

export function RankingFilterDropdownBody({
    measureItems,
    attributeItems,
    filter,
    onApply,
    onCancel = () => {},
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    enableRankingWithMvf = false,
    enableRankingStrictLimit = false,
    renderMeasureDropdownBody,
    isAttributesSectionEnabled = false,
    attributes,
    insightAttributes,
    catalogAttributes,
    loadCatalogAttributes,
}: IRankingFilterDropdownBodyComponentProps) {
    const intl = useIntl();

    const rankingFilter = filter.rankingFilter;
    const [value, setValue] = useState(rankingFilter.value);
    const [operator, setOperator] = useState(rankingFilter.operator);
    const [measure, setMeasureIdentifier] = useState(rankingFilter.measure);
    // Legacy mode edits a single attribute (by ref); the custom section edits many titled attributes.
    // In multi-attribute mode the host seeds the selection (filter's own attributes or, when it has none,
    // the insight defaults — "reuses the insight attributes"). The titles travel with the items so the
    // preview can render them; nothing is persisted until the user changes the seeded selection.
    const [attribute, setAttribute] = useState<ObjRefInScope | undefined>(rankingFilter.attributes?.[0]);
    const [attributeItemsState, setAttributeItemsState] = useState<IDimensionalityItem[]>(attributes ?? []);
    // The host seeds the "out of" selection from the filter / insight defaults, which can resolve after this
    // dropdown has mounted. Re-seed when that prop changes, but only while the user has not diverged from the
    // previously seeded set, so a late-arriving seed is reflected without clobbering in-progress edits.
    const seededAttributesRef = useRef(attributes);
    useEffect(() => {
        if (seededAttributesRef.current === attributes) {
            return;
        }
        const previousSeed = seededAttributesRef.current ?? [];
        seededAttributesRef.current = attributes;
        setAttributeItemsState((current) =>
            areDimensionalitySetsEqual(current, previousSeed) ? (attributes ?? []) : current,
        );
    }, [attributes]);
    // Mirrors the measure value filter: when the filter has no "out of" attributes of its own but the insight
    // has some, the ranking currently follows the visualization's attributes and an informational note is
    // shown. The note is dismissed once the user changes the selection (the filter then carries its own set).
    const [isMigratedFilter, setIsMigratedFilter] = useState<boolean>(
        (rankingFilter.attributes?.length ?? 0) > 0 || (insightAttributes?.length ?? 0) === 0,
    );
    const handleAttributesChange = useCallback((items: IDimensionalityItem[]) => {
        setAttributeItemsState(items);
        setIsMigratedFilter(true);
    }, []);
    const [applyOnResult, setApplyOnResult] = useState(rankingFilter.applyOnResult ?? true);
    // A new filter prioritizes the strict ("+ flag") condition; an existing filter keeps its stored value.
    const [strictLimitOfRows, setStrictLimitOfRows] = useState(rankingFilter.strictLimitOfRows ?? false);

    const handleConditionSelect = useCallback(
        (selectedOperator: typeof operator, selectedStrictLimitOfRows: boolean) => {
            setOperator(selectedOperator);
            setStrictLimitOfRows(selectedStrictLimitOfRows);
        },
        [],
    );

    // Apply baseline for the "out of" attributes: the seeded selection in multi mode, the stored filter
    // otherwise. Keeping the seeded set as the baseline means reusing the insight defaults (unchanged)
    // leaves Apply disabled and persists nothing.
    const baselineAttributes = isAttributesSectionEnabled
        ? (attributes ?? []).map((item) => item.identifier)
        : (rankingFilter.attributes ?? []);

    const isAttributesSelectionInvalid =
        isAttributesSectionEnabled && isEmptyDimensionalityInvalid(attributeItemsState, insightAttributes);

    const selectedMeasure = measureItems.find((item) => areObjRefsEqual(item.ref, measure));
    const selectedAttribute = attributeItems.find((item) => areObjRefsEqual(item.ref, attribute));

    // The preview reflects the live "out of" attributes. Multi-attribute titles are carried by the items
    // (catalog-aware), joined into a single preview label.
    const previewAttribute: IAttributeDropdownItem | undefined = isAttributesSectionEnabled
        ? attributeItemsState.length > 0
            ? {
                  title: attributeItemsState.map((item) => item.title).join(", "),
                  ref: attributeItemsState[0].identifier,
              }
            : undefined
        : selectedAttribute;

    const getFilterState = useCallback((): IRankingFilter => {
        const attributeRefs = isAttributesSectionEnabled
            ? attributeItemsState.map((item) => item.identifier)
            : attribute
              ? [attribute]
              : [];
        const baseFilter = attributeRefs.length
            ? newRankingFilter(measure, attributeRefs, operator, value)
            : newRankingFilter(measure, operator, value);

        // Add applyOnResult / strictLimitOfRows only when their flags are enabled
        return {
            rankingFilter: {
                ...baseFilter.rankingFilter,
                ...(enableRankingWithMvf ? { applyOnResult } : {}),
                ...(enableRankingStrictLimit ? { strictLimitOfRows } : {}),
            },
        };
    }, [
        measure,
        isAttributesSectionEnabled,
        attributeItemsState,
        attribute,
        operator,
        value,
        enableRankingWithMvf,
        applyOnResult,
        enableRankingStrictLimit,
        strictLimitOfRows,
    ]);

    const applyHandler = () => {
        const filterState = getFilterState();
        onApply(filterState);
    };

    const handleApplyOnResultChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setApplyOnResult(event.target.checked);
        },
        [setApplyOnResult],
    );

    return (
        <div className="gd-dialog gd-dropdown overlay gd-rf-dropdown-body s-rf-dropdown-body">
            {isAttributesSectionEnabled ? null : (
                <div className="gd-rf-dropdown-header">
                    <FormattedMessage id="rankingFilter.topBottom" />
                </div>
            )}
            <div className="gd-rf-dropdown-section">
                {enableRankingStrictLimit ? (
                    <div className="gd-rf-dropdown-section-title gd-rf-dropdown-section-title-first">
                        <FormattedMessage id="rankingFilter.condition" />
                    </div>
                ) : null}
                <div
                    className={cx("gd-rf-value-section", {
                        "gd-rf-value-section--strict-limit": enableRankingStrictLimit,
                    })}
                >
                    <OperatorDropdown
                        selectedValue={operator}
                        selectedStrictLimitOfRows={strictLimitOfRows}
                        enableRankingStrictLimit={enableRankingStrictLimit}
                        limitValue={value}
                        onSelect={handleConditionSelect}
                    />
                    <ValueDropdown selectedValue={value} onSelect={setValue} />
                    {enableRankingStrictLimit ? null : (
                        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                            <span className="gd-icon-circle-question gd-rf-value-tooltip-icon s-rf-value-tooltip-icon" />
                            <Bubble
                                className={`bubble-primary gd-rf-tooltip-bubble s-rf-value-tooltip`}
                                alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
                            >
                                <FormattedMessage id="rankingFilter.valueTooltip" />
                            </Bubble>
                        </BubbleHoverTrigger>
                    )}
                </div>
                {isAttributesSectionEnabled ? (
                    // The growing "out of" pills scroll in a single dedicated container so that wheel
                    // events over the pills always scroll them. The condition row stays outside: the
                    // value input's suggestion menu renders inline (not portaled), so a scrollable
                    // ancestor around it would clip the open menu.
                    <div className="gd-rf-attributes-scroll-container">
                        {/* The section renders its own "Out of" header, chips, catalog picker and reset. */}
                        <RankingAttributesSection
                            attributes={attributeItemsState}
                            insightAttributes={insightAttributes}
                            catalogAttributes={catalogAttributes}
                            loadCatalogAttributes={loadCatalogAttributes}
                            onAttributesChange={handleAttributesChange}
                            isMigratedFilter={isMigratedFilter}
                        />
                    </div>
                ) : (
                    <>
                        <div className="gd-rf-dropdown-section-title">
                            <FormattedMessage id="rankingFilter.outOf" />
                        </div>
                        <AttributeDropdown
                            items={attributeItems}
                            selectedItemRef={attribute}
                            onSelect={setAttribute}
                            onDropDownItemMouseOver={onDropDownItemMouseOver}
                            onDropDownItemMouseOut={onDropDownItemMouseOut}
                            customGranularitySelection={customGranularitySelection}
                        />
                    </>
                )}
                <div className="gd-rf-dropdown-section-title">
                    <FormattedMessage id="rankingFilter.basedOn" />
                </div>
                <MeasureDropdown
                    items={measureItems}
                    selectedItemRef={measure}
                    onSelect={setMeasureIdentifier}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
                    renderMeasureDropdownBody={renderMeasureDropdownBody}
                />
                {enableRankingWithMvf ? (
                    <div className="gd-rf-apply-on-result">
                        <label
                            className="input-checkbox-label gd-rf-apply-on-result-checkbox"
                            data-testid="rf-apply-on-result"
                        >
                            <input
                                type="checkbox"
                                name="apply-on-result"
                                className="input-checkbox"
                                checked={applyOnResult}
                                onChange={handleApplyOnResultChange}
                            />
                            <span className="input-label-text">
                                {intl.formatMessage({
                                    id: "rankingFilter.applyOnResultLabel",
                                })}
                            </span>
                        </label>
                    </div>
                ) : null}
                <div className="gd-rf-dropdown-section-title">
                    <FormattedMessage id="rankingFilter.preview" />
                </div>
                <Preview
                    measure={selectedMeasure}
                    attribute={previewAttribute}
                    operator={operator}
                    value={value}
                    enableRankingStrictLimit={enableRankingStrictLimit}
                    strictLimitOfRows={strictLimitOfRows}
                />
            </div>
            <div className="gd-rf-dropdown-footer">
                <Button
                    className="gd-button-secondary gd-button-small s-rf-dropdown-cancel"
                    onClick={() => onCancel()}
                    value={intl.formatMessage({ id: "cancel" })}
                />
                <Button
                    className="gd-button-action gd-button-small s-rf-dropdown-apply"
                    onClick={applyHandler}
                    value={intl.formatMessage({ id: "apply" })}
                    disabled={
                        isAttributesSelectionInvalid ||
                        isApplyButtonDisabled(
                            // Compare against the seeded baseline so reusing the insight defaults (unchanged)
                            // keeps Apply disabled and does not persist the defaults.
                            {
                                rankingFilter: {
                                    ...rankingFilter,
                                    attributes: baselineAttributes.length ? baselineAttributes : undefined,
                                },
                            },
                            getFilterState(),
                            enableRankingWithMvf,
                            applyOnResult,
                            enableRankingStrictLimit,
                            strictLimitOfRows,
                        )
                    }
                />
            </div>
        </div>
    );
}
