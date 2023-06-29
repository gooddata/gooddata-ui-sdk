// (C) 2020-2022 GoodData Corporation
import React, { useState, useCallback } from "react";
import { Button, BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { IRankingFilter, newRankingFilter, ObjRefInScope, areObjRefsEqual } from "@gooddata/sdk-model";
import { WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";
import { IMeasureDropdownItem, IAttributeDropdownItem, ICustomGranularitySelection } from "./types.js";
import { OperatorDropdown } from "./OperatorDropdown/OperatorDropdown.js";
import { ValueDropdown } from "./ValueDropdown/ValueDropdown.js";
import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown.js";
import { MeasureDropdown } from "./MeasureDropdown/MeasureDropdown.js";
import isEqual from "lodash/isEqual.js";
import xorWith from "lodash/xorWith.js";
import isEmpty from "lodash/isEmpty.js";
import noop from "lodash/noop.js";
import { Preview } from "./Preview.js";

const isApplyButtonDisabled = (filter: IRankingFilter, filterState: IRankingFilter) => {
    const rankingFilter = filter.rankingFilter;
    const rankingFilterState = filterState.rankingFilter;

    const operatorNotChanged = rankingFilter.operator === rankingFilterState.operator;
    const valueNotChanged = rankingFilter.value === rankingFilterState.value;
    const attributesNotChanged = isEmpty(
        xorWith(rankingFilter.attributes, rankingFilterState.attributes, isEqual),
    );
    const measureNotChanged = isEqual(rankingFilter.measure, rankingFilterState.measure);

    return operatorNotChanged && valueNotChanged && attributesNotChanged && measureNotChanged;
};

interface IRankingFilterDropdownBodyComponentOwnProps {
    measureItems: IMeasureDropdownItem[];
    attributeItems: IAttributeDropdownItem[];
    filter: IRankingFilter;
    onApply: (filter: IRankingFilter) => void;
    onCancel?: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
    enableRenamingMeasureToMetric?: boolean;
}

type RankingFilterDropdownBodyComponentProps = IRankingFilterDropdownBodyComponentOwnProps &
    WrappedComponentProps;

const RankingFilterDropdownBodyComponent: React.FC<RankingFilterDropdownBodyComponentProps> = ({
    measureItems,
    attributeItems,
    filter,
    onApply,
    onCancel,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    intl,
    enableRenamingMeasureToMetric,
}) => {
    const rankingFilter = filter.rankingFilter;
    const [value, setValue] = useState(rankingFilter.value);
    const [operator, setOperator] = useState(rankingFilter.operator);
    const [measure, setMeasureIdentifier] = useState(rankingFilter.measure);
    const [attribute, setAttributeIdentifier] = useState(rankingFilter.attributes?.[0]);

    const selectedMeasure = measureItems.find((item) => areObjRefsEqual(item.ref, measure));
    const selectedAttribute = attributeItems.find((item) => areObjRefsEqual(item.ref, attribute));

    const getFilterState = useCallback(() => {
        return attribute
            ? newRankingFilter(measure, [attribute], operator, value)
            : newRankingFilter(measure, operator, value);
    }, [measure, attribute, operator, value]);

    const applyHandler = () => {
        const filterState = getFilterState();
        onApply(filterState);
    };

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
                    enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
                />
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
                    disabled={isApplyButtonDisabled(filter, getFilterState())}
                />
            </div>
        </div>
    );
};

RankingFilterDropdownBodyComponent.defaultProps = {
    onCancel: noop,
};

export const RankingFilterDropdownBody = injectIntl(RankingFilterDropdownBodyComponent);
