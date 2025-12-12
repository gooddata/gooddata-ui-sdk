// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import { type ChangeAnalysisContents } from "../../../model.js";
import { type RootState, setKeyDriverAnalysisAction, settingsSelector } from "../../../store/index.js";
import { useKdaDefinition, useKdaInfo } from "../../hooks/useKdaDefinition.js";

export type ChangeAnalysisContentsProps = {
    content: ChangeAnalysisContents;
    messageId: string;
    format?: string;
    useMarkdown?: boolean;
    locale?: string;
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
};

function ChangeAnalysisContentsComponentCore({
    content,
    locale,
    format,
    setKeyDriverAnalysis,
}: ChangeAnalysisContentsProps) {
    const intl = useIntl();
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
                        setKeyDriverAnalysis?.({ keyDriverAnalysis: definition });
                    }}
                />
            </div>
        </div>
    );
}

const mapDispatchToProps = {
    setKeyDriverAnalysis: setKeyDriverAnalysisAction,
};

const mapStateToProps = (state: RootState): Pick<ChangeAnalysisContentsProps, "locale" | "format"> => {
    const settings = settingsSelector(state);
    return {
        locale: settings?.locale,
        format: settings?.responsiveUiDateFormat,
    };
};

export const ChangeAnalysisContentsComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ChangeAnalysisContentsComponentCore);
