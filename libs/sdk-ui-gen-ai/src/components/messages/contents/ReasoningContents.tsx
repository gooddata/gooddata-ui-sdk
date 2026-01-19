// (C) 2024-2026 GoodData Corporation

import { type ReasoningContents } from "../../../model.js";

export type ReasoningContentsProps = {
    content: ReasoningContents;
};

export function ReasoningContentsComponent({ content }: ReasoningContentsProps) {
    const groupedSteps = groupSteps(content.steps);

    return (
        <div className="gd-gen-ai-chat__reasoning">
            {groupedSteps.map((step, index) => (
                // NOTE: Change key index to ID (needs BE change)
                <div key={index} className="gd-gen-ai-chat__reasoning__step">
                    {step.title ? (
                        <div className="gd-gen-ai-chat__reasoning__headline">
                            <div className="gd-gen-ai-chat__reasoning__bullet"></div>
                            <div className="gd-gen-ai-chat__reasoning__content">
                                <div className="gd-gen-ai-chat__reasoning__title">
                                    <p>{step.title}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
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
            ))}
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
    const groups: { title?: string; thoughts: string[] }[] = [];
    let pendingThoughts: string[] = [];
    for (const step of steps) {
        const stepThoughts = getThoughts(step);
        const stepTitle = step.title?.trim() || undefined;
        const lastGroup = groups[groups.length - 1];

        if (stepTitle === undefined) {
            if (lastGroup) {
                lastGroup.thoughts.push(...stepThoughts);
            } else {
                pendingThoughts.push(...stepThoughts);
            }
            continue;
        }

        if (lastGroup?.title === stepTitle) {
            lastGroup.thoughts.push(...stepThoughts);
            continue;
        }

        groups.push({
            title: stepTitle,
            thoughts: pendingThoughts.length ? [...pendingThoughts, ...stepThoughts] : [...stepThoughts],
        });
        pendingThoughts = [];
    }
    if (groups.length === 0 && pendingThoughts.length) {
        groups.push({
            thoughts: pendingThoughts,
        });
    }
    return groups;
}
