// (C) 2007-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

import { compareSelector } from "../../../../selectors/over_time_comparison_selector.js";
import { DROPDOWN_ALIGN_POINTS } from "../../../../utils/dropdown.js";

import { ComparedMeasuresDropdownBody } from "./ComparedMeasuresDropdownBody.js";
import { type IComparedMeasure } from "./model/compared_measure_typing.js";

export interface IComparedMeasuresDropdownProps {
    listItemHeight: number;
    selectedMeasures?: string[];
    compatibleMeasures: IComparedMeasure[];
    selectedAllCompatible: boolean;
    onSelectionApplied?: (selectedMeasures: string[]) => void;
}

const state = {
    opened: false,
    width: 0,
};

export function ComparedMeasuresDropdown({
    listItemHeight,
    selectedMeasures = [],
    compatibleMeasures,
    onSelectionApplied = () => {},
}: IComparedMeasuresDropdownProps) {
    const intl = useIntl();
    const { incompatibleMeasurePresent } = useSelector(compareSelector);

    const dropdownApply = (selection: string[]) => {
        onSelectionApplied(selection);
    };

    const renderDropdownButton = (toggleDropdown: () => void) => {
        const { opened } = state;

        const compatibleMeasuresCount = compatibleMeasures.length;
        const selectedMeasuresCount = selectedMeasures.length;

        let title = "";
        if (selectedMeasuresCount === compatibleMeasuresCount) {
            title = intl.formatMessage({ id: "filter.compare.applied_on.all" });
        } else if (selectedMeasuresCount > 0) {
            title = intl.formatMessage(
                { id: "filter.compare.applied_on.other" },
                { count: selectedMeasuresCount },
            );
        }

        const className = classNames("s-compare-apply-measures-button", {
            "s-expanded": opened,
            "s-collapsed": !opened,
        });

        return (
            <DropdownButton
                id="time-comparison-measures-dropdown"
                disabled={!compatibleMeasuresCount}
                className={className}
                value={title}
                onClick={toggleDropdown}
            />
        );
    };

    const renderIncompatibleMessage = () => {
        if (!incompatibleMeasurePresent) {
            return null;
        }

        return (
            <div className="adi-compare-apply-incompatible s-compare-apply-incompatible">
                <FormattedMessage id="filter.compare.displaying_only_compatible" />
            </div>
        );
    };

    return (
        <div className="adi-compare-measures s-compare-apply-measures">
            <Dropdown
                renderButton={({ toggleDropdown }) => renderDropdownButton(toggleDropdown)}
                alignPoints={DROPDOWN_ALIGN_POINTS}
                closeOnOutsideClick
                renderBody={({ closeDropdown }) => (
                    <ComparedMeasuresDropdownBody
                        measures={compatibleMeasures}
                        listItemHeight={listItemHeight}
                        selectedMeasures={selectedMeasures}
                        onApply={(selection) => {
                            dropdownApply(selection);
                            closeDropdown();
                        }}
                        onClose={closeDropdown}
                    />
                )}
            />
            {renderIncompatibleMessage()}
        </div>
    );
}
