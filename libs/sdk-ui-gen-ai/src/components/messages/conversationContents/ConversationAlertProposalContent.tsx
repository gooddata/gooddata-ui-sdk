// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type IAlertProposal } from "@gooddata/sdk-backend-spi";
import {
    type IAlertAnomalyDetectionGranularity,
    type IAlertAnomalyDetectionSensitivity,
    type IAlertTriggerInterval,
    type IAlertTriggerMode,
    type IAttribute,
    type IAutomationAlertComparisonCondition,
    type IAutomationAlertRelativeCondition,
    type IAutomationAnomalyDetectionCondition,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";
import { Typography, UiIcon, UiTag } from "@gooddata/sdk-ui-kit";

import type {
    IChatConversationLocalItem,
    IChatConversationMultipartLocalPart,
    TextContentObject,
} from "../../../model.js";
import { objRefToTextContentObject } from "../../completion/utils.js";
import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationAlertProposalContentProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    objects?: TextContentObject[];
    alertProposal: IAlertProposal | undefined;
    className?: string;
};

export function ConversationAlertProposalContent(props: ConversationAlertProposalContentProps) {
    const { objects, alertProposal, className } = props;
    const intl = useIntl();
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--alertProposal",
        className,
    );
    const classNamesCta = cx("gd-gen-ai-chat__conversation__item__content", className);

    if (!alertProposal) {
        return null;
    }

    return (
        <>
            <div className={classNames}>
                <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-header">
                    <UiIcon
                        type="alert"
                        size={14}
                        color="complementary-6"
                        backgroundSize={26}
                        backgroundColor="complementary-2"
                    />
                    <FormattedMessage id="gd.gen-ai.alert-proposal.title" />
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-frame">
                    <ul>
                        <AlertItem
                            markdown={false}
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.title" })}
                            description={alertProposal.title}
                            objects={objects}
                            bold
                        />
                        <FiltersPreview {...props} />
                        <NotificationChannelPreview {...props} />
                        <DashboardPreview {...props} />
                    </ul>
                    <AlertAttributes
                        attributes={alertProposal.alert?.execution.attributes}
                        objects={objects}
                    />
                    <ConditionsPreview {...props} />
                    <TriggerPreview {...props} />
                    <RecipientsPreview {...props} />
                </div>
            </div>
            {alertProposal.cta ? <div className={classNamesCta}>{alertProposal.cta}</div> : null}
        </>
    );
}

function FiltersPreview({ alertProposal, objects }: ConversationAlertProposalContentProps) {
    const intl = useIntl();

    return (
        <>
            {alertProposal?.alert?.execution.filters?.length ? (
                <AlertItem
                    bold
                    markdown
                    title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.filters" })}
                    description={alertProposal.alert.execution.filters.length.toString()}
                    objects={objects}
                />
            ) : null}
        </>
    );
}

function DashboardPreview({ alertProposal }: ConversationAlertProposalContentProps) {
    const intl = useIntl();

    return (
        <>
            {alertProposal?.dashboard?.id ? (
                <AlertReference
                    title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.dashboard" })}
                    forceType="dashboard"
                    ref={{ identifier: alertProposal.dashboard.id }}
                    refTitle={alertProposal.dashboard.title ?? ""}
                />
            ) : null}
        </>
    );
}

function NotificationChannelPreview({ alertProposal, objects }: ConversationAlertProposalContentProps) {
    const intl = useIntl();

    return (
        <>
            {alertProposal?.notificationChannel && alertProposal.notificationChannelTitle ? (
                <AlertItem
                    bold
                    markdown
                    title={intl.formatMessage({
                        id: "gd.gen-ai.alert-proposal.summary.notification-channel",
                    })}
                    description={alertProposal.notificationChannelTitle}
                    objects={objects}
                />
            ) : null}
        </>
    );
}

const triggerModeMessages = defineMessages<IAlertTriggerMode>({
    ["ALWAYS"]: {
        id: "sdk.ui.genAi.alertProposal.triggerMode.always",
    },
    ["ONCE"]: {
        id: "sdk.ui.genAi.alertProposal.triggerMode.once",
    },
    ["ONCE_PER_INTERVAL"]: {
        id: "sdk.ui.genAi.alertProposal.triggerMode.oncePerInterval",
    },
});

const triggerIntervalMessages = defineMessages<IAlertTriggerInterval>({
    ["DAY"]: {
        id: "sdk.ui.genAi.alertProposal.triggerInterval.day",
    },
    ["WEEK"]: {
        id: "sdk.ui.genAi.alertProposal.triggerInterval.week",
    },
    ["MONTH"]: {
        id: "sdk.ui.genAi.alertProposal.triggerInterval.month",
    },
    ["QUARTER"]: {
        id: "sdk.ui.genAi.alertProposal.triggerInterval.quarter",
    },
    ["YEAR"]: {
        id: "sdk.ui.genAi.alertProposal.triggerInterval.year",
    },
});

function TriggerPreview({ alertProposal, objects }: ConversationAlertProposalContentProps) {
    const intl = useIntl();

    return (
        <>
            {alertProposal?.schedule || alertProposal?.alert ? (
                <>
                    <Typography
                        tagName="p"
                        className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
                    >
                        {intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.trigger" })}
                    </Typography>
                    <ul>
                        {alertProposal.alert?.trigger.mode ? (
                            <AlertItem
                                bold
                                markdown
                                title={intl.formatMessage({
                                    id: "gd.gen-ai.alert-proposal.summary.trigger.mode",
                                })}
                                description={intl.formatMessage(
                                    triggerModeMessages[alertProposal.alert.trigger.mode],
                                )}
                                objects={objects}
                            />
                        ) : null}
                        {alertProposal.alert?.trigger.interval ? (
                            <AlertItem
                                bold
                                markdown
                                title={intl.formatMessage({
                                    id: "gd.gen-ai.alert-proposal.summary.trigger.interval",
                                })}
                                description={intl.formatMessage(
                                    triggerIntervalMessages[alertProposal.alert.trigger.interval],
                                )}
                                objects={objects}
                            />
                        ) : null}
                        {alertProposal.schedule?.cron ? (
                            <AlertItem
                                markdown
                                type="code"
                                title={intl.formatMessage({
                                    id: "gd.gen-ai.alert-proposal.summary.trigger.cron",
                                })}
                                description={alertProposal.schedule.cron}
                                objects={objects}
                            />
                        ) : null}
                        {alertProposal.schedule?.timezone ? (
                            <AlertItem
                                bold
                                markdown
                                title={intl.formatMessage({
                                    id: "gd.gen-ai.alert-proposal.summary.trigger.timezone",
                                })}
                                description={alertProposal.schedule.timezone}
                                objects={objects}
                            />
                        ) : null}
                    </ul>
                </>
            ) : null}
        </>
    );
}

function RecipientsPreview({ alertProposal }: ConversationAlertProposalContentProps) {
    const intl = useIntl();

    return (
        <>
            {alertProposal?.recipients?.length ? (
                <>
                    <Typography
                        tagName="p"
                        className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
                    >
                        {intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.recipients" })}
                    </Typography>
                    {alertProposal.recipients.map((recipient, index) => (
                        <UiTag key={index} label={recipient.name ?? recipient.id} />
                    ))}
                </>
            ) : null}
        </>
    );
}

function ConditionsPreview(props: ConversationAlertProposalContentProps) {
    const { alertProposal } = props;
    const intl = useIntl();

    if (alertProposal?.alert?.condition.type === "comparison") {
        return (
            <>
                <Typography
                    tagName="p"
                    className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
                >
                    {intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.condition-comparison" })}
                </Typography>
                <ComparisonConditionPreview {...props} condition={alertProposal.alert.condition} />
            </>
        );
    }
    if (alertProposal?.alert?.condition.type === "relative") {
        return (
            <>
                <Typography
                    tagName="p"
                    className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
                >
                    {intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.condition-relative" })}
                </Typography>
                <RelativeConditionPreview {...props} condition={alertProposal.alert.condition} />
            </>
        );
    }
    if (alertProposal?.alert?.condition.type === "anomalyDetection") {
        return (
            <>
                <Typography
                    tagName="p"
                    className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
                >
                    {intl.formatMessage({
                        id: "gd.gen-ai.alert-proposal.summary.condition-anomalyDetection",
                    })}
                </Typography>
                <AnomalyConditionPreview {...props} condition={alertProposal.alert.condition} />
            </>
        );
    }
    return null;
}

function ComparisonConditionPreview({
    condition,
}: ConversationAlertProposalContentProps & { condition: IAutomationAlertComparisonCondition }) {
    const { left, right, operator } = condition;

    return (
        <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-condition">
            <Operand item={left} />
            <Operator operator={operator} />
            <Operand item={right} />
        </div>
    );
}

const adMessages = defineMessages<IAlertAnomalyDetectionGranularity | IAlertAnomalyDetectionSensitivity>({
    ["HOUR"]: {
        id: "sdk.ui.genAi.alertProposal.granularity.hour",
    },
    ["DAY"]: {
        id: "sdk.ui.genAi.alertProposal.granularity.day",
    },
    ["WEEK"]: {
        id: "sdk.ui.genAi.alertProposal.granularity.week",
    },
    ["MONTH"]: {
        id: "sdk.ui.genAi.alertProposal.granularity.month",
    },
    ["QUARTER"]: {
        id: "sdk.ui.genAi.alertProposal.granularity.quarter",
    },
    ["YEAR"]: {
        id: "sdk.ui.genAi.alertProposal.granularity.year",
    },
    ["LOW"]: {
        id: "sdk.ui.genAi.alertProposal.senstivity.low",
    },
    ["MEDIUM"]: {
        id: "sdk.ui.genAi.alertProposal.senstivity.medium",
    },
    ["HIGH"]: {
        id: "sdk.ui.genAi.alertProposal.senstivity.high",
    },
});

function AnomalyConditionPreview({
    condition,
}: ConversationAlertProposalContentProps & { condition: IAutomationAnomalyDetectionCondition }) {
    const intl = useIntl();
    const { measure, granularity, sensitivity, dataset } = condition;

    return (
        <>
            {dataset ? (
                <ul>
                    <AlertReference
                        title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.date" })}
                        refTitle={isIdentifierRef(dataset) ? dataset.identifier : dataset.uri}
                        ref={dataset}
                        forceType="date"
                    />
                </ul>
            ) : null}
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-anomaly">
                <Operand item={measure} />{" "}
                <FormattedMessage
                    id={adMessages[granularity].id}
                    values={{
                        b: (c) => <strong>{c}</strong>,
                    }}
                />{" "}
                <FormattedMessage
                    id={adMessages[sensitivity].id}
                    values={{
                        b: (c) => <strong>{c}</strong>,
                    }}
                />
            </div>
        </>
    );
}

function RelativeConditionPreview({
    condition,
}: ConversationAlertProposalContentProps & { condition: IAutomationAlertRelativeCondition }) {
    const { measure, threshold, operator } = condition;

    return (
        <>
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-condition">
                <Operand item={measure.left} />
                <Operator operator={measure.operator} />
                <Operand item={measure.right} />
            </div>
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-condition">
                <Operator operator={operator} />
                <Operand item={threshold} suffix="%" />
            </div>
        </>
    );
}

function Operand({
    item,
    suffix,
}: {
    item: IAutomationAlertComparisonCondition["left"] | IAutomationAlertComparisonCondition["right"];
    suffix?: string;
}) {
    if (typeof item === "number") {
        return (
            <div className="alertProposal-operand-number">
                {item}
                {suffix}
            </div>
        );
    }

    const rf = objRefToTextContentObject({ identifier: item.id, type: "measure" }, item.title, "metric");
    if (rf) {
        return (
            <div className="alertProposal-operand">
                <MarkdownComponent allowMarkdown references={[rf]}>
                    {`{${rf.type}/${rf.id}}`}
                </MarkdownComponent>
            </div>
        );
    }

    return null;
}

const operatorMessages = defineMessages({
    ["LESS_THAN"]: {
        id: "sdk.ui.genAi.alertProposal.operator.lessThan",
    },
    ["LESS_THAN_OR_EQUAL_TO"]: {
        id: "sdk.ui.genAi.alertProposal.operator.lessThanOrEqualTo",
    },
    ["GREATER_THAN"]: {
        id: "sdk.ui.genAi.alertProposal.operator.greaterThan",
    },
    ["GREATER_THAN_OR_EQUAL_TO"]: {
        id: "sdk.ui.genAi.alertProposal.operator.greaterThanOrEqualTo",
    },
    ["EQUAL_TO"]: {
        id: "sdk.ui.genAi.alertProposal.operator.equalTo",
    },
    ["INCREASES_BY"]: {
        id: "sdk.ui.genAi.alertProposal.operator.increasesBy",
    },
    ["DECREASES_BY"]: {
        id: "sdk.ui.genAi.alertProposal.operator.decreasesBy",
    },
    ["CHANGES_BY"]: {
        id: "sdk.ui.genAi.alertProposal.operator.changesBy",
    },
    ["DIFFERENCE"]: {
        id: "sdk.ui.genAi.alertProposal.operator.difference",
    },
    ["CHANGE"]: {
        id: "sdk.ui.genAi.alertProposal.operator.change",
    },
});

function Operator({
    operator,
}: {
    operator:
        | IAutomationAlertComparisonCondition["operator"]
        | IAutomationAlertRelativeCondition["operator"]
        | IAutomationAlertRelativeCondition["measure"]["operator"];
}) {
    const intl = useIntl();

    return <div>{intl.formatMessage(operatorMessages[operator])}</div>;
}

// utils

interface IAlertItemProps {
    title: string;
    description: string;
    markdown: boolean;
    bold?: boolean;
    type?: "normal" | "code";
    objects?: TextContentObject[];
}

function AlertItem({ markdown, title, description, objects, bold, type = "normal" }: IAlertItemProps) {
    return (
        <li className="gd-gen-ai-chat__conversation__item__content-alertProposal-item">
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-title">
                {title}:
            </div>
            <div
                className={cx("gd-gen-ai-chat__conversation__item__content-alertProposal-item-description", {
                    bold,
                })}
            >
                {type === "normal" ? (
                    <MarkdownComponent allowMarkdown={markdown} references={objects}>
                        {description}
                    </MarkdownComponent>
                ) : null}
                {type === "code" ? <code>{description}</code> : null}
            </div>
        </li>
    );
}

interface IAlertReferenceProps {
    title: string;
    ref: ObjRef;
    refTitle: string;
    format?: string;
    forceType?: TextContentObject["type"];
}

function AlertReference({ title, ref, refTitle, format, forceType }: IAlertReferenceProps) {
    const rf = objRefToTextContentObject(ref, refTitle, forceType);

    if (!rf) {
        return null;
    }

    return (
        <li className="gd-gen-ai-chat__conversation__item__content-alertProposal-item">
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-title">
                {title}:
            </div>
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-description">
                <MarkdownComponent allowMarkdown references={[rf]}>
                    {`{${rf.type}/${rf.id}}`}
                </MarkdownComponent>
            </div>
            {format ? (
                <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-format">
                    ({format})
                </div>
            ) : null}
        </li>
    );
}

interface IAlertAttributesProps {
    attributes?: IAttribute[];
    objects?: TextContentObject[];
}

function AlertAttributes({ attributes, objects }: IAlertAttributesProps) {
    const intl = useIntl();
    const rf = (attributes
        ?.map((attribute) =>
            objRefToTextContentObject(attribute.attribute.displayForm, attribute.attribute.alias),
        )
        .filter(Boolean) ?? []) as TextContentObject[];

    if (rf.length === 0) {
        return null;
    }

    return (
        <>
            <Typography
                tagName="p"
                className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
            >
                {intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.attributes" })}
            </Typography>
            <ul>
                {rf.map((rf, i) => (
                    <li className="gd-gen-ai-chat__conversation__item__content-alertProposal-item" key={i}>
                        <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-description">
                            <MarkdownComponent allowMarkdown references={[...(objects ?? []), rf]}>
                                {`{${rf.type}/${rf.id}}`}
                            </MarkdownComponent>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
