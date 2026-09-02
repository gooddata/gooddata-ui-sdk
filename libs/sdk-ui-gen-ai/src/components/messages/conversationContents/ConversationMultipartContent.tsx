// (C) 2024-2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type TextContentObject,
} from "../../../model.js";
import { loadWhatIfScenarios } from "../../../whatIf/whatIfMapping.js";

import { ConversationAlertProposalContent } from "./ConversationAlertProposalContent.js";
import { ConversationDashboardContent } from "./ConversationDashboardContent.js";
import { ConversationKdaContent } from "./ConversationKdaContent.js";
import { ConversationSearchContent } from "./ConversationSearchContent.js";
import { ConversationTextContent } from "./ConversationTextContent.js";
import { ConversationVisualizationContent } from "./ConversationVisualizationContent.js";
import { ConversationWhatIfContent } from "./ConversationWhatIfContent.js";

export type ConversationMultipartContentProps = {
    message: IChatConversationLocalItem;
    parts: IChatConversationMultipartLocalPart[];
    references: TextContentObject[];
};

export function ConversationMultipartContent({
    message,
    parts,
    references,
}: ConversationMultipartContentProps) {
    const intl = useIntl();
    const whatIf = loadWhatIfScenarios(parts);

    return (
        <>
            {parts?.map((part: IChatConversationMultipartLocalPart, index) => {
                if (part.type === "text") {
                    return (
                        <ConversationTextContent
                            useMarkdown
                            key={index}
                            text={part.text}
                            objects={[...(part.objects ?? []), ...references]}
                        />
                    );
                }
                if (part.type === "alertProposal") {
                    return (
                        <ConversationAlertProposalContent
                            key={index}
                            message={message}
                            part={part}
                            alertProposal={part.alertProposal}
                            objects={[...(part.objects ?? []), ...references]}
                        />
                    );
                }
                if (part.type === "visualization" && !whatIf) {
                    return part.visualization ? (
                        <ConversationVisualizationContent
                            key={index}
                            message={message}
                            part={part}
                            visualization={part.visualization}
                        />
                    ) : (
                        <div key={index} className="gd-gen-ai-chat__messages__content--error">
                            {intl.formatMessage({ id: "gd.gen-ai.visualization.unavailable" })}
                        </div>
                    );
                }
                if (part.type === "searchResults") {
                    return (
                        <ConversationSearchContent
                            key={index}
                            results={part.searchResults}
                            relationships={part.relationships}
                            keywords={part.keywords}
                        />
                    );
                }
                if (part.type === "kda") {
                    return <ConversationKdaContent key={index} kda={part.kda} />;
                }
                if (part.type === "whatIf") {
                    return (
                        <ConversationWhatIfContent
                            key={index}
                            message={message}
                            part={part}
                            whatIf={whatIf}
                        />
                    );
                }
                if (part.type === "dashboard") {
                    return (
                        <ConversationDashboardContent
                            key={index}
                            message={message}
                            part={part}
                            dashboard={part.dashboard}
                            insights={part.insights}
                            saved={part.saved}
                        />
                    );
                }
                // Add more multipart types if needed
                return null;
            })}
        </>
    );
}
