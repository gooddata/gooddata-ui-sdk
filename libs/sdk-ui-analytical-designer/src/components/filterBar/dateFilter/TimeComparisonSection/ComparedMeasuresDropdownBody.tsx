// (C) 2007-2026 GoodData Corporation

import { memo, useCallback, useState } from "react";

import { useIntl } from "react-intl";

import { Button, LegacyMultiSelectList } from "@gooddata/sdk-ui-kit";

import { ComparedMeasuresDropdownItem } from "./ComparedMeasuresDropdownItem.js";
import { type IComparedMeasure } from "./model/compared_measure_typing.js";

const MAX_LIST_ITEMS = 10;

export interface IComparedMeasuresDropdownBodyProps {
    selectedMeasures: string[];
    measures: IComparedMeasure[];
    onApply: (selectedMeasures: string[]) => void;
    onClose: () => void;
    listItemHeight: number;
}

export const ComparedMeasuresDropdownBody = memo(function ComparedMeasuresDropdownBody({
    selectedMeasures: initialSelectedMeasures,
    measures,
    onApply,
    onClose,
    listItemHeight,
}: IComparedMeasuresDropdownBodyProps) {
    const intl = useIntl();

    const [selectedMeasures, setSelectedMeasures] = useState(initialSelectedMeasures);

    const handleApply = useCallback(() => {
        onApply(selectedMeasures);
    }, [onApply, selectedMeasures]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const isMeasureSelected = useCallback(
        (measure: IComparedMeasure) => selectedMeasures.indexOf(measure.localIdentifier) > -1,
        [selectedMeasures],
    );

    const handleSelect = useCallback(
        (item: IComparedMeasure) => {
            const updatedSelection = isMeasureSelected(item)
                ? selectedMeasures.filter((localIdentifier) => localIdentifier !== item.localIdentifier)
                : [...selectedMeasures, item.localIdentifier];

            setSelectedMeasures(updatedSelection);
        },
        [selectedMeasures, isMeasureSelected],
    );

    const handleSelectAll = useCallback(() => {
        setSelectedMeasures(measures.map((item) => item.localIdentifier));
    }, [measures]);

    const handleSelectNone = useCallback(() => {
        setSelectedMeasures([]);
    }, []);

    const handleSelectOnly = useCallback((item: IComparedMeasure) => {
        setSelectedMeasures([item.localIdentifier]);
    }, []);

    const renderButtons = () => {
        const isDisabled = selectedMeasures.length === 0;

        return (
            <div className="adi-compare-measures-buttons">
                <Button
                    value={intl.formatMessage({ id: "filter.compare.apply_on.cancel" })}
                    className="gd-button-primary gd-button-small s-compare-apply-measures-cancel"
                    onClick={(e) => {
                        e.preventDefault();
                        handleClose();
                    }}
                />
                <Button
                    value={intl.formatMessage({ id: "filter.compare.apply_on.apply" })}
                    className="gd-button-action gd-button-small s-compare-apply-measures-apply"
                    disabled={isDisabled}
                    onClick={(e) => {
                        e.preventDefault();
                        handleApply();
                    }}
                />
            </div>
        );
    };

    const measuresCount = measures.length;
    const listHeight = (measuresCount > MAX_LIST_ITEMS ? MAX_LIST_ITEMS : measuresCount) * listItemHeight;

    return (
        <div className="gd-list adi-compare-measures-list s-compare-apply-measures-list">
            <LegacyMultiSelectList
                items={measures}
                itemsCount={measuresCount}
                itemHeight={listItemHeight}
                listItemClass={ComparedMeasuresDropdownItem}
                height={listHeight}
                width={200}
                isSelected={isMeasureSelected}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onSelectNone={handleSelectNone}
                onSelectOnly={handleSelectOnly}
            />
            {renderButtons()}
        </div>
    );
});
