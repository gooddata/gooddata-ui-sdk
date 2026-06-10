// (C) 2022-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useEffect, useState } from "react";

import noop from "lodash-es/noop.js";
import {
    type FormatNumberOptions,
    FormattedMessage,
    type IntlShape,
    defineMessage,
    useIntl,
} from "react-intl";

import { type IExecutionResultLimitBreak, executionResultLimitTypeToKind } from "@gooddata/sdk-model";
import { DialogBase, UiLink, WidgetNotice } from "@gooddata/sdk-ui-kit";

import { type IExecutionResultEnvelope } from "../../../../model/store/executionResults/types.js";

type LimitBreakKind = "rows" | "columns" | "cells" | "unknown";
type KnownLimitBreaksByKind = Partial<Record<Exclude<LimitBreakKind, "unknown">, IExecutionResultLimitBreak>>;

const COMPACT_FORMAT_THRESHOLD = 10000;
const COMPACT_FORMATTING_OPTIONS: FormatNumberOptions = { style: "decimal", notation: "compact" };

interface IInsightWidgetWarningPartialResultProps {
    className: string;
    limitBreaks: IExecutionResultLimitBreak[];
    isExporting: boolean;
    isExportRawVisible: boolean;
    executionResult: IExecutionResultEnvelope;
    isLoading?: boolean;
    onExportRawCSV: () => void;
}

export function InsightWidgetWarningPartialResult({
    className,
    limitBreaks,
    isLoading,
    isExporting,
    isExportRawVisible,
    executionResult,
    onExportRawCSV,
}: IInsightWidgetWarningPartialResultProps) {
    const intl = useIntl();

    useEffect(() => {
        setIsOpen(true);
    }, [executionResult]);

    const [isOpen, setIsOpen] = useState<boolean>(true);

    const handleCloseOverlay = () => {
        setIsOpen(false);
    };

    const exportFullResult = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onExportRawCSV();
    };

    return (
        <>
            {isOpen && isLoading === false ? (
                <DialogBase
                    className={className}
                    onMouseUp={noop}
                    submitOnEnterKey={false}
                    isModal={false}
                    autofocusOnOpen={false}
                >
                    <WidgetNotice
                        type="warning"
                        message={<FormattedMessage id="partial_data_warning.title" />}
                        detail={getDetailMessage(limitBreaks, intl)}
                        detailAction={
                            isExportRawVisible ? (
                                <UiLink
                                    isDisabled={isExporting}
                                    variant="primary"
                                    href="#"
                                    onClick={exportFullResult}
                                >
                                    <FormattedMessage id="partial_data_warning.export_raw" />
                                </UiLink>
                            ) : undefined
                        }
                        expandLabel={<FormattedMessage id="partial_data_warning.show_details" />}
                        collapseLabel={<FormattedMessage id="partial_data_warning.hide_details" />}
                        onClose={handleCloseOverlay}
                        closeButtonLabel={intl.formatMessage(
                            defineMessage({ id: "partial_data_warning.close" }),
                        )}
                    />
                </DialogBase>
            ) : null}
        </>
    );
}

function getLimitBreakKind(limitBreak: IExecutionResultLimitBreak): LimitBreakKind {
    return executionResultLimitTypeToKind(limitBreak.limitType);
}

function formatLimit(limitBreak: IExecutionResultLimitBreak, intl: IntlShape): string {
    return formatLimitValue(limitBreak.limit, intl);
}

function formatOverflow(limitBreak: IExecutionResultLimitBreak, intl: IntlShape): string | undefined {
    if (typeof limitBreak.value !== "number") {
        return undefined;
    }

    const overflow = limitBreak.value - limitBreak.limit;
    return overflow > 0 ? formatLimitValue(overflow, intl) : undefined;
}

function formatLimitValue(value: number, intl: IntlShape): string {
    return value >= COMPACT_FORMAT_THRESHOLD
        ? intl.formatNumber(value, COMPACT_FORMATTING_OPTIONS)
        : intl.formatNumber(value);
}

function getLimitBreaksByKind(limitBreaks: IExecutionResultLimitBreak[]): KnownLimitBreaksByKind {
    return limitBreaks.reduce((result, limitBreak) => {
        const kind = getLimitBreakKind(limitBreak);
        if (kind !== "unknown" && !result[kind]) {
            result[kind] = limitBreak;
        }
        return result;
    }, {} as KnownLimitBreaksByKind);
}

function getRowsAndColumnsDetailMessage(
    rowLimitBreak: IExecutionResultLimitBreak,
    columnLimitBreak: IExecutionResultLimitBreak,
    intl: IntlShape,
): ReactNode {
    const values = {
        rowLimit: formatLimit(rowLimitBreak, intl),
        columnLimit: formatLimit(columnLimitBreak, intl),
        rowOverflow: formatOverflow(rowLimitBreak, intl),
        columnOverflow: formatOverflow(columnLimitBreak, intl),
    };

    if (values.rowOverflow && values.columnOverflow) {
        return <FormattedMessage id="partial_data_warning.rows_columns.description" values={values} />;
    }

    if (values.rowOverflow) {
        return (
            <FormattedMessage
                id="partial_data_warning.rows_columns.description.unknown_column_total"
                values={values}
            />
        );
    }

    if (values.columnOverflow) {
        return (
            <FormattedMessage
                id="partial_data_warning.rows_columns.description.unknown_row_total"
                values={values}
            />
        );
    }

    return (
        <FormattedMessage id="partial_data_warning.rows_columns.description.unknown_total" values={values} />
    );
}

function getRowsDetailMessage(rowLimitBreak: IExecutionResultLimitBreak, intl: IntlShape): ReactNode {
    const values = {
        rowLimit: formatLimit(rowLimitBreak, intl),
        rowOverflow: formatOverflow(rowLimitBreak, intl),
    };

    return values.rowOverflow ? (
        <FormattedMessage id="partial_data_warning.rows.description" values={values} />
    ) : (
        <FormattedMessage id="partial_data_warning.rows.description.unknown_total" values={values} />
    );
}

function getColumnsDetailMessage(columnLimitBreak: IExecutionResultLimitBreak, intl: IntlShape): ReactNode {
    const values = {
        columnLimit: formatLimit(columnLimitBreak, intl),
        columnOverflow: formatOverflow(columnLimitBreak, intl),
    };

    return values.columnOverflow ? (
        <FormattedMessage id="partial_data_warning.columns.description" values={values} />
    ) : (
        <FormattedMessage id="partial_data_warning.columns.description.unknown_total" values={values} />
    );
}

function getCellsDetailMessage(cellLimitBreak: IExecutionResultLimitBreak, intl: IntlShape): ReactNode {
    const values = {
        cellLimit: formatLimit(cellLimitBreak, intl),
        cellOverflow: formatOverflow(cellLimitBreak, intl),
    };

    return values.cellOverflow ? (
        <FormattedMessage id="partial_data_warning.cells.description" values={values} />
    ) : (
        <FormattedMessage id="partial_data_warning.cells.description.unknown_total" values={values} />
    );
}

function getDetailMessage(limitBreaks: IExecutionResultLimitBreak[], intl: IntlShape): ReactNode {
    const byKind = getLimitBreaksByKind(limitBreaks);
    const rowLimitBreak = byKind.rows;
    const columnLimitBreak = byKind.columns;

    if (rowLimitBreak) {
        return columnLimitBreak
            ? getRowsAndColumnsDetailMessage(rowLimitBreak, columnLimitBreak, intl)
            : getRowsDetailMessage(rowLimitBreak, intl);
    }

    if (columnLimitBreak) {
        return getColumnsDetailMessage(columnLimitBreak, intl);
    }

    const cellLimitBreak = byKind.cells;
    if (cellLimitBreak) {
        return getCellsDetailMessage(cellLimitBreak, intl);
    }

    return <FormattedMessage id="partial_data_warning.description" />;
}
