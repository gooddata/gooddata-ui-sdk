// (C) 2024-2026 GoodData Corporation

import { type ReasoningContents } from "../../../model.js";

export type ReasoningContentsProps = {
    content: ReasoningContents;
};

export function ReasoningContentsComponent({ content }: ReasoningContentsProps) {
    const groupedSteps = groupSteps(content.steps);

    return (
        <div className="gd-gen-ai-chat__reasoning">
            {groupedSteps.map((step, index) => {
                // If no title is present, render thoughts without a headline.
                // NOTE: Change key index to ID (needs BE change)
                if (!step.title) {
                    return step.thoughts.length ? (
                        <div key={index} className="gd-gen-ai-chat__reasoning__thoughts">
                            {step.thoughts.map((thought, thoughtIndex) => (
                                <div key={thoughtIndex} className="gd-gen-ai-chat__reasoning__thought">
                                    <p>{thought}</p>
                                </div>
                            ))}
                        </div>
                    ) : null;
                }

                return (
                    <div key={index} className="gd-gen-ai-chat__reasoning__step">
                        <div className="gd-gen-ai-chat__reasoning__headline">
                            <div className="gd-gen-ai-chat__reasoning__bullet"></div>
                            <div className="gd-gen-ai-chat__reasoning__content">
                                <div className="gd-gen-ai-chat__reasoning__title">
                                    <p>{step.title}</p>
                                </div>
                            </div>
                        </div>
                        {step.thoughts.length ? (
                            <div className="gd-gen-ai-chat__reasoning__thoughts">
                                {step.thoughts.map((thought, thoughtIndex) => (
                                    <div key={thoughtIndex} className="gd-gen-ai-chat__reasoning__thought">
                                        <p>{thought}</p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function getThoughts(step: ReasoningContents["steps"][number]): string[] {
    return (
        step.thoughts
            ?.map((thought) => thought?.text?.trim())
            .filter((text): text is string => Boolean(text)) ?? []
    );
}

function groupSteps(steps: ReasoningContents["steps"]) {
    const groups: { title: string; thoughts: string[] }[] = [];
    for (const step of steps) {
        const stepThoughts = getThoughts(step);
        const lastGroup = groups[groups.length - 1];

        const shouldAppendToLastGroup = Boolean(lastGroup) && (!step.title || lastGroup.title === step.title);

        if (shouldAppendToLastGroup) {
            lastGroup.thoughts.push(...stepThoughts);
            continue;
        }

        groups.push({
            title: step.title,
            thoughts: [...stepThoughts],
        });
    }
    return groups;
}
