// (C) 2024-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import {
    IDashboardAttributeFilter,
    IFilter,
    ISeparators,
    isAttributeFilter,
    isNegativeAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";
import {
    IntlWrapper,
    KdaDialog,
    KdaProvider,
    KdaStoreProvider,
    attributeFilterToDashboardAttributeFilter,
} from "@gooddata/sdk-ui-dashboard/internal";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import { ChangeAnalysisContents } from "../../../model.js";
import { RootState, settingsSelector } from "../../../store/index.js";

export type ChangeAnalysisContentsProps = {
    content: ChangeAnalysisContents;
    messageId: string;
    format?: string;
    useMarkdown?: boolean;
    separators?: ISeparators;
    locale?: string;
};

function ChangeAnalysisContentsComponentCore({
    content,
    separators,
    locale,
    format,
}: ChangeAnalysisContentsProps) {
    const intl = useIntl();
    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--changeAnalysis",
    );

    const splitter = intl.formatMessage({ id: "gd.gen-ai.changeAnalysis.splitter" });

    const definition = useKdaDefinition(content, format, locale);
    const { range, title } = useKdaInfo(definition, splitter);
    const [opened, setOpened] = useState(false);

    return (
        <div className={className}>
            <FormattedMessage
                id="gd.gen-ai.changeAnalysis.default_message"
                values={{
                    range,
                    title,
                    metric: (chunks) => {
                        return (
                            <div className="gd-gen-ai-chat__messages__content--changeAnalysis__metric">
                                <UiIcon type="metric" color="currentColor" />
                                {chunks}
                            </div>
                        );
                    },
                    b: (chunks) => <strong>{chunks}</strong>,
                }}
            />
            <div className="gd-gen-ai-chat__messages__content--changeAnalysis__button">
                <UiButton
                    label={intl.formatMessage({ id: "gd.gen-ai.changeAnalysis.explain_the_change" })}
                    variant="secondary"
                    iconBefore="explainai"
                    onClick={() => setOpened(true)}
                />
            </div>
            {opened ? (
                <IntlWrapper locale={intl.locale}>
                    <KdaStoreProvider>
                        <KdaProvider definition={definition} separators={separators}>
                            <KdaDialog
                                showCloseButton
                                locale={intl.locale}
                                onClose={() => setOpened(false)}
                            />
                        </KdaProvider>
                    </KdaStoreProvider>
                </IntlWrapper>
            ) : null}
        </div>
    );
}

function useKdaDefinition(content: ChangeAnalysisContents, format?: string, locale?: string) {
    const getFilter = useAttributeFilterMapper();
    const intl = useIntl();

    const measure = content.params.measure;

    const def: IKdaDefinition = useMemo(
        () => ({
            metric: {
                ...measure,
                measure: {
                    ...measure.measure,
                    title: measure.measure.title ?? measure.measure.alias ?? measure.measure.localIdentifier,
                },
            },
            metrics: [],
            dateAttribute: content.params.dateAttribute.attribute.displayForm,
            filters: content.params.filters.map(getFilter).filter(Boolean) as IDashboardAttributeFilter[],
            type: "previous_period",
            range: [
                {
                    date: content.params.referencePeriod,
                    value: undefined,
                    format: {
                        locale: locale ?? intl.locale,
                        pattern: format ?? "dd/MM/yyyy",
                    },
                },
                {
                    date: content.params.analyzedPeriod,
                    value: undefined,
                    format: {
                        locale: locale ?? intl.locale,
                        pattern: format ?? "dd/MM/yyyy",
                    },
                },
            ],
        }),
        [
            content.params.analyzedPeriod,
            content.params.dateAttribute.attribute.displayForm,
            content.params.filters,
            content.params.referencePeriod,
            format,
            getFilter,
            intl.locale,
            locale,
            measure,
        ],
    );

    return def;
}

function useKdaInfo(def: IKdaDefinition, splitter: string) {
    const title = def.metric.measure.title ?? def.metric.measure.alias ?? def.metric.measure.localIdentifier;

    const from = def.range[0];
    const to = def.range[1];
    const pattern = def.range[0].format?.pattern ?? "yyyy-MM-dd";

    const range = DateFilterHelpers.formatAbsoluteDateRange(
        new Date(from.date),
        new Date(to.date),
        pattern,
        splitter,
    );

    return {
        title,
        range,
    };
}

function useAttributeFilterMapper() {
    return useCallback((f: IFilter) => {
        if (isAttributeFilter(f)) {
            const ref = isNegativeAttributeFilter(f)
                ? f.negativeAttributeFilter.displayForm
                : f.positiveAttributeFilter.displayForm;
            const id = objRefToString(ref);
            return attributeFilterToDashboardAttributeFilter(f, `local_${id}`, undefined);
        }
        return null;
    }, []);
}

const mapStateToProps = (
    state: RootState,
): Pick<ChangeAnalysisContentsProps, "separators" | "locale" | "format"> => {
    const settings = settingsSelector(state);
    return {
        locale: settings?.locale,
        format: settings?.responsiveUiDateFormat,
        separators: settings?.separators,
    };
};

export const ChangeAnalysisContentsComponent = connect(
    mapStateToProps,
    {},
)(ChangeAnalysisContentsComponentCore);
