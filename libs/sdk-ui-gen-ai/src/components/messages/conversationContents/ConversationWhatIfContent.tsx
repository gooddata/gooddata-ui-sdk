// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";
import { type IWhatIfDefinition } from "../../../whatIf/whatIfMapping.js";

import { ConversationVisualizationContent } from "./ConversationVisualizationContent.js";

export type ConversationWhatIfContentProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    whatIf: IWhatIfDefinition | undefined;
    className?: string;
};

export function ConversationWhatIfContent({
    className,
    part,
    message,
    whatIf,
}: ConversationWhatIfContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--whatIf",
        className,
    );

    if (!whatIf) {
        return null;
    }

    return (
        <div className={classNames}>
            {whatIf.scenarios.map((scenario, index) => (
                <ConversationVisualizationContent
                    key={index}
                    message={message}
                    part={part}
                    scenario={scenario}
                    visualization={whatIf.insight}
                />
            ))}
        </div>
    );
}
