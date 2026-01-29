// (C) 2020-2026 GoodData Corporation

import { type ChangeEvent, useCallback, useState } from "react";

import { isEmpty, isEqual, xorWith } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import {
    type IRankingFilter,
    type ObjRefInScope,
    areObjRefsEqual,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown.js";
import { MeasureDropdown } from "./MeasureDropdown/MeasureDropdown.js";
import { OperatorDropdown } from "./OperatorDropdown/OperatorDropdown.js";
import { Preview } from "./Preview.js";
import {
    type IAttributeDropdownItem,
    type ICustomGranularitySelection,
    type IMeasureDropdownItem,
} from "./types.js";
import { ValueDropdown } from "./ValueDropdown/ValueDropdown.js";

const isApplyButtonDisabled = (
    filter: IRankingFilter,
    filterState: IRankingFilter,
    enableRankingWithMvf: boolean,
    applyOnResult: boolean,
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

    return (
        operatorNotChanged &&
        valueNotChanged &&
        attributesNotChanged &&
        measureNotChanged &&
        applyOnResultNotChanged
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
}: IRankingFilterDropdownBodyComponentProps) {
    const intl = useIntl();

    const rankingFilter = filter.rankingFilter;
    const [value, setValue] = useState(rankingFilter.value);
    const [operator, setOperator] = useState(rankingFilter.operator);
    const [measure, setMeasureIdentifier] = useState(rankingFilter.measure);
    const [attribute, setAttributeIdentifier] = useState(rankingFilter.attributes?.[0]);
    const [applyOnResult, setApplyOnResult] = useState(rankingFilter.applyOnResult ?? true);

    const selectedMeasure = measureItems.find((item) => areObjRefsEqual(item.ref, measure));
    const selectedAttribute = attributeItems.find((item) => areObjRefsEqual(item.ref, attribute));

    const getFilterState = useCallback((): IRankingFilter => {
        const baseFilter = attribute
            ? newRankingFilter(measure, [attribute], operator, value)
            : newRankingFilter(measure, operator, value);

        // Add applyOnResult only when flag is enabled
        if (enableRankingWithMvf) {
            return {
                rankingFilter: {
                    ...baseFilter.rankingFilter,
                    applyOnResult,
                },
            };
        }

        return baseFilter;
    }, [measure, attribute, operator, value, enableRankingWithMvf, applyOnResult]);

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
            <div className="gd-rf-dropdown-header">
                <FormattedMessage id="rankingFilter.topBottom" />
            </div>
            <div className="gd-rf-dropdown-section">
                <div className="gd-rf-value-section">
                    <OperatorDropdown selectedValue={operator} onSelect={setOperator} />
                    <ValueDropdown selectedValue={value} onSelect={setValue} />
                    <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                        <span className="gd-icon-circle-question gd-rf-value-tooltip-icon s-rf-value-tooltip-icon" />
                        <Bubble
                            className={`bubble-primary gd-rf-tooltip-bubble s-rf-value-tooltip`}
                            alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
                        >
                            <FormattedMessage id="rankingFilter.valueTooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
                <div className="gd-rf-dropdown-section-title">
                    <FormattedMessage id="rankingFilter.outOf" />
                </div>
                <AttributeDropdown
                    items={attributeItems}
                    selectedItemRef={attribute}
                    onSelect={setAttributeIdentifier}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
                    customGranularitySelection={customGranularitySelection}
                />
                <div className="gd-rf-dropdown-section-title">
                    <FormattedMessage id="rankingFilter.basedOn" />
                </div>
                <MeasureDropdown
                    items={measureItems}
                    selectedItemRef={measure}
                    onSelect={setMeasureIdentifier}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
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
                    attribute={selectedAttribute}
                    operator={operator}
                    value={value}
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
                    disabled={isApplyButtonDisabled(
                        filter,
                        getFilterState(),
                        enableRankingWithMvf,
                        applyOnResult,
                    )}
                />
            </div>
        </div>
    );
}
