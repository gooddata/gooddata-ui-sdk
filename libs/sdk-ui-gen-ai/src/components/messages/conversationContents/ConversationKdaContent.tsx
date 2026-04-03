// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { connect, useSelector } from "react-redux";

import { type IChatKdaDefinition } from "@gooddata/sdk-backend-spi";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { useKdaDefinition, useKdaInfo } from "./useKdaDefinition.js";
import { catalogItemsSelector, settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { setKeyDriverAnalysisAction } from "../../../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../../../store/types.js";
import { collectReferences } from "../../completion/references.js";
import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationKdaContentProps = {
    kda: IChatKdaDefinition;
    className?: string;
    locale?: string;
    format?: string;
    setKeyDriverAnalysis?: typeof setKeyDriverAnalysisAction;
};

export function ConversationKdaContentCore({
    className,
    kda,
    format,
    locale,
    setKeyDriverAnalysis,
}: ConversationKdaContentProps) {
    const intl = useIntl();
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--kda",
        className,
    );
    const catalogItems = useSelector(catalogItemsSelector);

    const splitter = intl.formatMessage({ id: "gd.gen-ai.changeAnalysis.splitter" });

    const definition = useKdaDefinition(kda, format, locale);
    const { range, title } = useKdaInfo(catalogItems, definition, splitter);

    const text = intl.formatMessage({ id: "gd.gen-ai.kda.default_message" }, { range, title });
    const references = useMemo(() => {
        return collectReferences(text, catalogItems);
    }, [text, catalogItems]);

    return (
        <div className={classNames}>
            <MarkdownComponent allowMarkdown references={references}>
                {intl.formatMessage({ id: "gd.gen-ai.kda.default_message" }, { range, title })}
            </MarkdownComponent>
            <div className="gd-gen-ai-chat__conversation__item__content--kda__button">
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

const mapStateToProps = (state: RootState): Pick<ConversationKdaContentProps, "locale" | "format"> => {
    const settings = settingsSelector(state);
    return {
        locale: settings?.locale,
        format: settings?.responsiveUiDateFormat,
    };
};

export const ConversationKdaContent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ConversationKdaContentCore);
