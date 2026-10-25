// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { isAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { ShortenedText, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IAdditionalDateFilterLabel } from "../../selectors/additional_date_filter_selector.js";
import { type EmptyDateValuesFilterMode } from "../../store/filter_bar/filter_bar_types.js";
import { type IDateFilterOption } from "../filterBar/dateFilter/dateFilterOptionFactory.js";
import { getAdditionalDateFilterEntries } from "../filterBar/dateFilter/FilterButton/AdditionalDateFilters.js";

const tooltipAlignPoints = [{ align: "bc tc" }];

export interface IMeasureDateFilterTitleProps {
    filter: IDateFilterOption;
    attributeTitle?: string;
    dateFormat: string;
    /** the metric's additional date filters, shown after the period like on the filter bar's button */
    additionalDateFilterLabels?: IAdditionalDateFilterLabel[];
    /** the metric's empty date values mode, worded like the filter bar's button (SelectedPresetName) */
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
}

interface ITitleProps extends IMeasureDateFilterTitleProps {
    /** "name: value" per additional date filter, in the AD locale */
    additionalFilterLines: string[];
    /** the AD translations the empty date values wording needs */
    emptyValuesLabel: string;
    exceptLabel: string;
}

function periodWithEmptyValues(
    periodTitle: string,
    isAllTime: boolean,
    mode: EmptyDateValuesFilterMode | undefined,
    emptyValuesLabel: string,
    exceptLabel: string,
): string {
    if (mode === "only") {
        return emptyValuesLabel;
    }
    if (mode === "exclude" && isAllTime) {
        return `${periodTitle} ${exceptLabel} ${emptyValuesLabel}`;
    }
    return periodTitle;
}

function Title({
    filter: { filterOption, excludeCurrentPeriod },
    attributeTitle,
    dateFormat,
    additionalFilterLines,
    emptyDateValuesFilterMode,
    emptyValuesLabel,
    exceptLabel,
}: ITitleProps) {
    const sdkIntl = useIntl();
    const periodTitle = periodWithEmptyValues(
        DateFilterHelpers.getDateFilterTitleUsingTranslator(
            DateFilterHelpers.applyExcludeCurrentPeriod(filterOption, excludeCurrentPeriod),
            sdkIntl,
            "full",
            dateFormat,
        ),
        isAllTimeDateFilterOption(filterOption),
        emptyDateValuesFilterMode,
        emptyValuesLabel,
        exceptLabel,
    );
    const lines = [
        attributeTitle ? `${attributeTitle}: ${periodTitle}` : periodTitle,
        ...additionalFilterLines,
    ];
    // the button stays one line; the tooltip lists each filter on its own line
    const text = lines.join(", ");

    if (additionalFilterLines.length === 0) {
        return (
            <ShortenedText className="shortened-text" tooltipAlignPoints={tooltipAlignPoints}>
                {text}
            </ShortenedText>
        );
    }

    // the shortened text already carries the full text for assistive technologies
    return (
        <UiTooltip
            anchor={
                <ShortenedText className="shortened-text" displayTooltip={false}>
                    {text}
                </ShortenedText>
            }
            content={
                <div className="s-metric-date-filter-tooltip">
                    {lines.map((line) => (
                        <div key={line}>{line}</div>
                    ))}
                </div>
            }
            triggerBy={["hover", "focus"]}
            arrowPlacement="left"
            optimalPlacement
            component="span"
            accessibilityHidden
        />
    );
}

/**
 * Metric date filter button label, formatted by the same SDK helper as the insight date filter button,
 * followed by the metric's additional date filters the way that button lists them. The helper reads
 * SDK translations, so it renders inside the SDK intl context; the additional filters' names and
 * selections are AD translations, so they are resolved outside it.
 */
export function MeasureDateFilterTitle(props: IMeasureDateFilterTitleProps) {
    const intl = useIntl();
    const additionalFilterLines = getAdditionalDateFilterEntries(
        props.additionalDateFilterLabels ?? [],
        false,
        intl,
    ).map(({ name, value }) => `${name}: ${value}`);
    const emptyValuesLabel = intl.formatMessage({ id: "filter.date.additional_filter.empty_values" });
    const exceptLabel = intl.formatMessage({ id: "gs.list.except" });
    return (
        <IntlWrapper locale={intl.locale}>
            <Title
                {...props}
                additionalFilterLines={additionalFilterLines}
                emptyValuesLabel={emptyValuesLabel}
                exceptLabel={exceptLabel}
            />
        </IntlWrapper>
    );
}
