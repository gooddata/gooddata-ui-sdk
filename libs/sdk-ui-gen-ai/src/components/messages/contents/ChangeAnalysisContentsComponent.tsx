// (C) 2024-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import { type ChangeAnalysisContents } from "../../../model.js";
import { settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { setKeyDriverAnalysisAction } from "../../../store/chatWindow/chatWindowSlice.js";
import { storeKdaReturnFocusFromActiveElement } from "../../../utils/kdaReturnFocus.js";

import { useKdaDefinition, useKdaInfo } from "./useKdaDefinition.js";

export type ChangeAnalysisContentsProps = {
    content: ChangeAnalysisContents;
    messageId: string;
    format?: string;
    useMarkdown?: boolean;
    locale?: string;
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
};

export function ChangeAnalysisContentsComponent({
    content,
}: Omit<ChangeAnalysisContentsProps, "locale" | "format" | "setKeyDriverAnalysis">) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const locale = settings?.locale;
    const format = settings?.responsiveUiDateFormat;

    const setKeyDriverAnalysis = useCallback(
        (...args: Parameters<typeof setKeyDriverAnalysisAction>) => {
            dispatch(setKeyDriverAnalysisAction(...args));
        },
        [dispatch],
    );

    const className = cx(
        "gd-gen-ai-chat__messages__content",
        "gd-gen-ai-chat__messages__content--changeAnalysis",
    );

    const splitter = intl.formatMessage({ id: "gd.gen-ai.changeAnalysis.splitter" });

    const definition = useKdaDefinition(content, format, locale);
    const { range, title } = useKdaInfo(definition, splitter);

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
                    onClick={() => {
                        storeKdaReturnFocusFromActiveElement();
                        setKeyDriverAnalysis({ keyDriverAnalysis: definition });
                    }}
                />
            </div>
        </div>
    );
}
