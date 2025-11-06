// (C) 2025 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type SemanticQualityIssueCode, SemanticQualityIssueCodeValues } from "@gooddata/sdk-model";
import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";
import { useQualityReportState } from "../quality/QualityContext.js";
import { getQualityIssueCodes } from "../quality/utils.js";

const titleMessages: { [key in SemanticQualityIssueCode]?: MessageDescriptor } = defineMessages({
    [SemanticQualityIssueCodeValues.IDENTICAL_TITLE]: {
        id: "analyticsCatalog.quality.title.identicalTitle",
    },
    [SemanticQualityIssueCodeValues.IDENTICAL_DESCRIPTION]: {
        id: "analyticsCatalog.quality.title.identicalDescription",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_TITLE]: {
        id: "analyticsCatalog.quality.title.similarTitle",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_DESCRIPTION]: {
        id: "analyticsCatalog.quality.title.similarDescription",
    },
    [SemanticQualityIssueCodeValues.UNKNOWN_ABBREVIATION]: {
        id: "analyticsCatalog.quality.title.unknownAbbreviation",
    },
});

export function FilterQuality() {
    const intl = useIntl();
    const { issues, status } = useQualityReportState();
    const { qualityCodes } = useFilterState();
    const { setQualityCodes } = useFilterActions();

    const options = useMemo(() => getQualityIssueCodes(issues), [issues]);

    const getItemTitle = useCallback(
        (code: SemanticQualityIssueCode) => {
            const message = titleMessages[code];
            return message ? intl.formatMessage(message) : code;
        },
        [intl],
    );

    if (status === "pending") {
        return <UiSkeleton itemsCount={1} itemWidth={98} itemHeight={27} itemBorderRadius={4} />;
    }

    if (status === "error") {
        return null;
    }

    function handleChange(codes: SemanticQualityIssueCode[], isInverted: boolean) {
        setQualityCodes({ values: codes, isInverted });
    }

    return (
        <StaticFilter
            label={intl.formatMessage({ id: "analyticsCatalog.filter.qualityCodes.title" })}
            options={options}
            selection={qualityCodes.values}
            isSelectionInverted={qualityCodes.isInverted}
            onSelectionChange={handleChange}
            getItemTitle={getItemTitle}
            dataTestId={testIds.filterQuality}
            noDataMessage={<FormattedMessage id="analyticsCatalog.filter.qualityCodes.noOptions" />}
        />
    );
}

export const FilterQualityMemo = memo(FilterQuality);
