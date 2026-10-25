// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useState } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { getPartialDataWarningMessage } from "@gooddata/sdk-ui";
import { UiLink, WidgetNotice } from "@gooddata/sdk-ui-kit";

import { showDialogExportCsv } from "../../actions/export_report_actions.js";
import { getInsightForRawExport } from "../../selectors/insight_selectors.js";
import { getExecutionLimitBreaks } from "../../selectors/report_selector.js";
import { type AppDispatch } from "../../store/types.js";

export function PartialDataWarning() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const insight = useSelector(getInsightForRawExport);
    const limitBreaks = useSelector(getExecutionLimitBreaks);
    const [isDismissed, setIsDismissed] = useState(false);
    const detailMessage = getPartialDataWarningMessage([...limitBreaks], intl);

    useEffect(() => {
        setIsDismissed(false);
    }, [insight]);

    const exportFullResult = useCallback(
        (event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            dispatch(showDialogExportCsv("raw"));
        },
        [dispatch],
    );

    if (!limitBreaks.length || isDismissed) {
        return null;
    }

    return (
        <div className="adi-partial-data-warning-container" data-testid="partial-data-warning-container">
            <WidgetNotice
                type="warning"
                message={<FormattedMessage id="partial_data_warning.title" />}
                detail={<FormattedMessage {...detailMessage} />}
                detailAction={
                    <UiLink
                        variant="primary"
                        href="#"
                        onClick={exportFullResult}
                        dataTestId="partial-data-warning-export-raw"
                    >
                        <FormattedMessage id="partial_data_warning.export_raw" />
                    </UiLink>
                }
                expandLabel={<FormattedMessage id="partial_data_warning.show_details" />}
                collapseLabel={<FormattedMessage id="partial_data_warning.hide_details" />}
                onClose={() => setIsDismissed(true)}
                closeButtonLabel={intl.formatMessage(defineMessage({ id: "partial_data_warning.close" }))}
            />
        </div>
    );
}
