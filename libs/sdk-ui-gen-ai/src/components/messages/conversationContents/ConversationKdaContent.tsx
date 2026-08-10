// (C) 2024-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IChatKdaDefinition } from "@gooddata/sdk-backend-spi";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { catalogItemsSelector, settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { setKeyDriverAnalysisAction } from "../../../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../../../store/types.js";
import { storeKdaReturnFocusFromActiveElement } from "../../../utils/kdaReturnFocus.js";
import { collectReferences } from "../../completion/references.js";
import { MarkdownComponent } from "../contents/Markdown.js";

import { useKdaDefinition, useKdaInfo } from "./useKdaDefinition.js";

export type ConversationKdaContentProps = {
    kda: IChatKdaDefinition;
    className?: string;
};

export function ConversationKdaContent({ className, kda }: ConversationKdaContentProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--kda",
        className,
    );
    const catalogItems = useSelector(catalogItemsSelector);
    const locale = useSelector((state: RootState) => settingsSelector(state)?.locale);
    const format = useSelector((state: RootState) => settingsSelector(state)?.responsiveUiDateFormat);

    const splitter = intl.formatMessage({ id: "gd.gen-ai.changeAnalysis.splitter" });

    const definition = useKdaDefinition(kda, format, locale);
    const { range, title } = useKdaInfo(catalogItems, definition, splitter);

    const text = intl.formatMessage({ id: "gd.gen-ai.kda.default_message" }, { range, title });
    const references = useMemo(() => {
        return collectReferences(text, catalogItems);
    }, [text, catalogItems]);

    const handleExplainTheChange = useCallback(() => {
        storeKdaReturnFocusFromActiveElement();
        dispatch(setKeyDriverAnalysisAction({ keyDriverAnalysis: definition }));
    }, [dispatch, definition]);

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
                    onClick={handleExplainTheChange}
                />
            </div>
        </div>
    );
}
