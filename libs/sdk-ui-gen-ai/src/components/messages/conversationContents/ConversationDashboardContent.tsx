// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import type { IDashboard } from "@gooddata/sdk-model";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";

export type ConversationDashboardContentProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    dashboard?: IDashboard | null;
    className?: string;
};

export function ConversationDashboardContent(props: ConversationDashboardContentProps) {
    const { className, dashboard } = props;
    const intl = useIntl();
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--dashboard",
        className,
    );

    if (!dashboard) {
        return null;
    }

    return (
        <div className={classNames}>
            <div className="gd-gen-ai-chat__conversation__item__content-dashboard-header">
                <UiIcon
                    type="dashboard"
                    size={14}
                    color="complementary-6"
                    backgroundSize={26}
                    backgroundColor="complementary-2"
                />
                <FormattedMessage id="gd.gen-ai.dashboard.title" />
            </div>
            <div className="gd-gen-ai-chat__conversation__item__content-dashboard-frame">
                <ul>
                    <li className="gd-gen-ai-chat__conversation__item__content-dashboard-item">
                        <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-title">
                            {intl.formatMessage({ id: "gd.gen-ai.dashboard.name" })}:
                        </div>
                        <div
                            className={cx(
                                "gd-gen-ai-chat__conversation__item__content-dashboard-item-description",
                                "gd-gen-ai-chat__conversation__item__content-dashboard-item-bold",
                            )}
                        >
                            <p>{dashboard.title}</p>
                        </div>
                    </li>
                    <li className="gd-gen-ai-chat__conversation__item__content-dashboard-item">
                        <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-title">
                            {intl.formatMessage({ id: "gd.gen-ai.dashboard.description" })}:
                        </div>
                        <div
                            className={
                                "gd-gen-ai-chat__conversation__item__content-dashboard-item-description"
                            }
                        >
                            <p>{dashboard.description}</p>
                        </div>
                    </li>
                </ul>
                <div className="gd-gen-ai-chat__conversation__item__content-dashboard-item-buttons">
                    <UiButton
                        label={intl.formatMessage({ id: "gd.gen-ai.dashboard.open-dashboard" })}
                        variant="tertiary"
                    />
                </div>
            </div>
        </div>
    );
}
