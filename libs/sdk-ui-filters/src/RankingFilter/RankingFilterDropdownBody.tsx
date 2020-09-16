// (C) 2020 GoodData Corporation
import React, { useState, useCallback } from "react";
import Button from "@gooddata/goodstrap/lib/Button/Button";
import { IRankingFilter, newRankingFilter, ObjRefInScope } from "@gooddata/sdk-model";
import { WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";
import { IMeasureDropdownItem, IAttributeDropdownItem } from "./types";
import { OperatorDropdown } from "./OperatorDropdown/OperatorDropdown";
import { ValueDropdown } from "./ValueDropdown/ValueDropdown";
import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown";
import { MeasureDropdown } from "./MeasureDropdown/MeasureDropdown";
import isEqual from "lodash/isEqual";
import xorWith from "lodash/xorWith";
import isEmpty from "lodash/isEmpty";
import noop from "lodash/noop";

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
    intl,
}) => {
    const rankingFilter = filter.rankingFilter;
    const [value, setValue] = useState(rankingFilter.value);
    const [operator, setOperator] = useState(rankingFilter.operator);
    const [measure, setMeasureIdentifier] = useState(rankingFilter.measure);
    const [attribute, setAttributeIdentifier] = useState(rankingFilter.attributes?.[0]);

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
                <OperatorDropdown selectedValue={operator} onSelect={setOperator} />
                <ValueDropdown selectedValue={value} onSelect={setValue} />
                <div className="gd-rf-dropdown-section-title">
                    <FormattedMessage id="rankingFilter.outOf" />
                </div>
                <AttributeDropdown
                    items={attributeItems}
                    selectedItemRef={attribute}
                    onSelect={setAttributeIdentifier}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
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
