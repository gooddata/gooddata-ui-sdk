// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type IChatConversationSkillActivatedContent } from "@gooddata/sdk-backend-spi";
import { UiChip } from "@gooddata/sdk-ui-kit";

export type ConversationSkillActivatedContentProps = {
    skills: IChatConversationSkillActivatedContent["skills"];
    className?: string;
    isLoading?: boolean;
};

export function ConversationSkillActivatedContent({
    className,
    skills,
}: ConversationSkillActivatedContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--skills",
        className,
    );

    return (
        <div className={classNames}>
            <div className="gd-gen-ai-chat__conversation__item__content--skills--header">
                <FormattedMessage id="gd.gen-ai.messages.skills" />
            </div>
            <div className="gd-gen-ai-chat__conversation__item__content--skills--content">
                {skills.map((skill, index) => (
                    <UiChip
                        key={index}
                        isDisabled
                        label={skill.title}
                        isActionable={false}
                        isDeletable={false}
                        isExpandable={false}
                        isActive={false}
                    />
                ))}
            </div>
        </div>
    );
}
