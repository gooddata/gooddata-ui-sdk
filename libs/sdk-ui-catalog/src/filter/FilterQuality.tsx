// (C) 2025 GoodData Corporation

import { memo } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type SemanticQualityIssueCode, SemanticQualityIssueCodeValues } from "@gooddata/sdk-model";
import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useFilterActions } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";
import { useQualityReportState } from "../quality/QualityContext.js";

const dataTestId = `${testIds.filter}/quality`;

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
    const { setQualityIds } = useFilterActions();

    const options = [...new Set(issues.map((issue) => issue.code))];

    const handleChange = (selection: SemanticQualityIssueCode[]) => {
        const idSet: Set<string> = new Set();

        for (const issue of issues) {
            if (selection.includes(issue.code)) {
                for (const obj of issue.objects) {
                    idSet.add(obj.identifier);
                }
            }
        }

        setQualityIds([...idSet]);
    };

    if (status === "loading" || status === "pending") {
        return (
            <FilterGroupLayout title={<FormattedMessage id="analyticsCatalog.filter.qualityCodes.title" />}>
                <UiSkeleton itemsCount={1} itemWidth={54} itemHeight={27} itemBorderRadius={4} />
            </FilterGroupLayout>
        );
    }

    if (status === "error") {
        return null;
    }

    return (
        <FilterGroupLayout title={<FormattedMessage id="analyticsCatalog.filter.qualityCodes.title" />}>
            <StaticFilter
                options={options}
                onChange={handleChange}
                getItemKey={(code) => code}
                getItemTitle={(code) => {
                    const message = titleMessages[code];
                    return message ? intl.formatMessage(message) : code;
                }}
                dataTestId={dataTestId}
                header={<FormattedMessage id="analyticsCatalog.filter.qualityCodes.title" />}
                noDataMessage={<FormattedMessage id="analyticsCatalog.filter.qualityCodes.noOptions" />}
            />
        </FilterGroupLayout>
    );
}

export const FilterQualityMemo = memo(FilterQuality);
