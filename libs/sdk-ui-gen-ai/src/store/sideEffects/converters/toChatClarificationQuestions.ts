// (C) 2026 GoodData Corporation

import { type IChatConversationLocalItem } from "../../../model.js";
import { type ChatClarificationQuestion } from "../../events.js";

export function convertToChatClarificationQuestions(
    content: IChatConversationLocalItem["content"],
): ChatClarificationQuestion[] | undefined {
    return content.type === "multipart"
        ? content.parts
              .filter((part) => part.type === "clarifyingQuestions")
              .flatMap((part) =>
                  part.questions.map((question) => ({
                      text: question.text,
                      control: {
                          type: "singleChoice",
                          options: question.control.options.map((option) => ({
                              text: option.text,
                          })),
                      },
                  })),
              )
        : undefined;
}
