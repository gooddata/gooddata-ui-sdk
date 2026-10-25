// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { type DateFilterOption, type IUiRelativeDateFilterForm } from "@gooddata/sdk-ui-filters";
import { RelativeDateFilterForm } from "@gooddata/sdk-ui-filters/internal";

export interface IRelativeDateRangeProps {
    granularities: DateFilterGranularity[];
    selectedFilter: DateFilterOption;
    onChange: (filter: DateFilterOption) => void;
}

export function RelativeDateRange({ granularities, selectedFilter, onChange }: IRelativeDateRangeProps) {
    const intl = useIntl();
    return (
        <div className="subsection-wrap">
            <div className="subsection">
                <IntlWrapper locale={intl.locale}>
                    <RelativeDateFilterForm
                        availableGranularities={granularities}
                        selectedFilterOption={selectedFilter as IUiRelativeDateFilterForm}
                        onSelectedFilterOptionChange={onChange}
                        isMobile={false}
                        shouldOverlaySelectMenu
                    />
                </IntlWrapper>
            </div>
        </div>
    );
}
