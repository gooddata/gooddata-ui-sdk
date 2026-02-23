// (C) 2025-2026 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { StaticFilter } from "./StaticFilter.js";
import { filterCertification } from "../automation/testIds.js";

type CertificationOption = "certified" | "notCertified";

const options: CertificationOption[] = ["certified", "notCertified"];

const messages: Record<CertificationOption, MessageDescriptor> = defineMessages({
    certified: { id: "analyticsCatalog.filter.certification.certified" },
    notCertified: { id: "analyticsCatalog.filter.certification.notCertified" },
});

export function FilterCertification() {
    const intl = useIntl();
    const { setCertification } = useFilterActions();
    const { certification } = useFilterState();

    const selection: CertificationOption[] = useMemo(
        () => (certification === undefined ? [] : [certification ? "certified" : "notCertified"]),
        [certification],
    );

    const getItemTitle = useCallback(
        (item: CertificationOption) => intl.formatMessage(messages[item]),
        [intl],
    );

    const handleChange = (selection: CertificationOption[], isInverted: boolean) => {
        const included = isInverted ? options.filter((option) => !selection.includes(option)) : selection;
        if (included.length === 0 || included.length === options.length) {
            setCertification(undefined);
        } else {
            setCertification(included.includes("certified"));
        }
    };

    return (
        <StaticFilter
            label={intl.formatMessage({ id: "analyticsCatalog.filter.certification.title" })}
            options={options}
            selection={selection}
            isSelectionInverted={certification === undefined}
            onSelectionChange={handleChange}
            getItemTitle={getItemTitle}
            dataTestId={filterCertification}
            noDataMessage={null}
        />
    );
}

export const FilterCertificationMemo = memo(FilterCertification);
