// (C) 2022-2026 GoodData Corporation

import { type MouseEvent, useEffect, useState } from "react";

import noop from "lodash-es/noop.js";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { type IExecutionResultLimitBreak } from "@gooddata/sdk-model";
import { getPartialDataWarningMessage } from "@gooddata/sdk-ui";
import { DialogBase, UiLink, WidgetNotice } from "@gooddata/sdk-ui-kit";

import { type IExecutionResultEnvelope } from "../../../../model/store/executionResults/types.js";

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
    const detailMessage = getPartialDataWarningMessage(limitBreaks, intl);

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
                        detail={<FormattedMessage {...detailMessage} />}
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
