// (C) 2019 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { DynamicSelect, IDynamicSelectProps } from "../DynamicSelect/DynamicSelect";
import { getRelativeDateFilterItems } from "../DynamicSelect/utils";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { defaultVisibleItemsRange } from "../Select/VirtualizedSelectMenu";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

interface IRelativeRangePickerProps {
    selectedFilterOption: ExtendedDateFilters.IRelativeDateFilterForm;
    onSelectedFilterOptionChange: (dateFilterOption: ExtendedDateFilters.DateFilterOption) => void;
    isMobile: boolean;
}

class RelativeRangePickerComponent extends React.Component<
    IRelativeRangePickerProps & WrappedComponentProps
> {
    private toFieldRef = React.createRef<DynamicSelect>();

    public render(): React.ReactNode {
        const { handleFromChange, handleToChange } = this;
        const { selectedFilterOption, intl, isMobile } = this.props;

        const mobileVisibleItemsRange = 5;

        const commonProps: IDynamicSelectProps = {
            visibleItemsRange: isMobile ? mobileVisibleItemsRange : defaultVisibleItemsRange,
            optionClassName: "s-relative-date-filter-option s-do-not-close-dropdown-on-click",
            getItems: value => {
                const items = getRelativeDateFilterItems(value, selectedFilterOption.granularity, intl);

                // separators are not needed in mobile as all the items have borders
                return isMobile ? items.filter(item => item.type !== "separator") : items;
            },
        };

        return (
            <div className="gd-relative-range-picker s-relative-range-picker">
                <DynamicSelect
                    value={selectedFilterOption.from}
                    onChange={handleFromChange}
                    placeholder={intl.formatMessage({ id: "filters.from" })}
                    className={cx(
                        "gd-relative-range-picker-picker",
                        "s-relative-range-picker-from",
                        isMobile && "gd-relative-range-picker-picker-mobile",
                    )}
                    {...commonProps}
                />
                <span className="gd-relative-range-picker-dash">&mdash;</span>
                <DynamicSelect
                    value={selectedFilterOption.to}
                    onChange={handleToChange}
                    placeholder={intl.formatMessage({ id: "filters.to" })}
                    className={cx(
                        "gd-relative-range-picker-picker",
                        "s-relative-range-picker-to",
                        isMobile && "gd-relative-range-picker-picker-mobile",
                    )}
                    {...commonProps}
                    ref={this.toFieldRef}
                />
            </div>
        );
    }

    private focusToField = (): void => {
        if (this.toFieldRef.current) {
            this.toFieldRef.current.focus();
        }
    };

    private handleFromChange = (from: number | undefined): void => {
        this.props.onSelectedFilterOptionChange({ ...this.props.selectedFilterOption, from });
        if (from !== undefined) {
            this.focusToField();
        }
    };

    private handleToChange = (to: number | undefined): void => {
        this.props.onSelectedFilterOptionChange({ ...this.props.selectedFilterOption, to });
    };
}

export const RelativeRangePicker = injectIntl(RelativeRangePickerComponent);
