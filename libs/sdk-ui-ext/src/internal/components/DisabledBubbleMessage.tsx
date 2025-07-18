// (C) 2019-2025 GoodData Corporation
import { memo, ReactNode } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { getTranslation } from "../utils/translations.js";
import { messages } from "../../locales.js";

export interface IBubbleMessageOwnProps {
    showDisabledMessage: boolean;
    alignPoints?: IAlignPoint[];
    messageId?: string;
    className?: string;
    children?: ReactNode;
}

export const DisabledBubbleMessage = memo(function DisabledBubbleMessage({
    className,
    alignPoints = [{ align: "cr cl" }],
    children,
    messageId = messages.notApplicable.id,
    showDisabledMessage,
}: IBubbleMessageOwnProps) {
    const intl = useIntl();

    const getBubbleClassNames = (): string => {
        return cx("bubble-primary", {
            invisible: !showDisabledMessage,
        });
    };

    return (
        <BubbleHoverTrigger className={className}>
            {children}
            <Bubble className={getBubbleClassNames()} alignPoints={alignPoints}>
                {getTranslation(messageId, intl)}
            </Bubble>
        </BubbleHoverTrigger>
    );
});

export default DisabledBubbleMessage;
