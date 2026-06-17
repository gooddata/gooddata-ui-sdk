// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { type IAlertProposal } from "@gooddata/sdk-backend-spi";
import { type IAttribute, type ObjRef } from "@gooddata/sdk-model";
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

export function ConversationAlertProposalContent({
    className,
    alertProposal,
    objects,
}: ConversationAlertProposalContentProps) {
    const intl = useIntl();
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--alertProposal",
        className,
    );

    if (!alertProposal) {
        return null;
    }

    return (
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
                        markdown
                        title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.title" })}
                        description={alertProposal.title}
                        objects={objects}
                    />
                    <AlertReference
                        title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.metric" })}
                        ref={alertProposal.baseMetric.id}
                        refTitle={alertProposal.baseMetric.title}
                        format={alertProposal.baseMetric.format}
                    />
                    {alertProposal.compareMetric ? (
                        <AlertReference
                            title={intl.formatMessage({
                                id: "gd.gen-ai.alert-proposal.summary.metric-compared",
                            })}
                            ref={alertProposal.compareMetric.id}
                            refTitle={alertProposal.compareMetric.title}
                            format={alertProposal.compareMetric.format}
                        />
                    ) : null}
                    {alertProposal.attributes?.length ? (
                        <AlertAttributes
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.attributes" })}
                            attributes={alertProposal.attributes}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.date ? (
                        <AlertReference
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.date" })}
                            ref={alertProposal.date.id}
                            refTitle={alertProposal.date.title}
                            forceType="date"
                        />
                    ) : null}
                    {alertProposal.filters?.length ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.filters" })}
                            description={alertProposal.filters.length.toString()}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.notificationChannel ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({
                                id: "gd.gen-ai.alert-proposal.summary.notification-channel",
                            })}
                            description={alertProposal.notificationChannel.name}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.dashboard ? (
                        <AlertReference
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.dashboard" })}
                            ref={alertProposal.dashboard.id}
                            refTitle={alertProposal.dashboard.title}
                        />
                    ) : null}

                    {alertProposal.operator ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.operator" })}
                            description={alertProposal.operator}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.arithmeticOperator ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({
                                id: "gd.gen-ai.alert-proposal.summary.arithmeticOperator",
                            })}
                            description={alertProposal.arithmeticOperator}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.threshold ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.threshold" })}
                            description={alertProposal.threshold.toString()}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.fromValue !== undefined && alertProposal.toValue !== undefined ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.range" })}
                            description={`${alertProposal.fromValue} - ${alertProposal.toValue}`}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.fromValue !== undefined && alertProposal.toValue === undefined ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.from" })}
                            description={alertProposal.fromValue.toString()}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.fromValue === undefined && alertProposal.toValue !== undefined ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.to" })}
                            description={alertProposal.toValue.toString()}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.granularity ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.granularity" })}
                            description={alertProposal.granularity}
                            objects={objects}
                        />
                    ) : null}
                    {alertProposal.sensitivity ? (
                        <AlertItem
                            bold
                            markdown
                            title={intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.sensitivity" })}
                            description={alertProposal.sensitivity}
                            objects={objects}
                        />
                    ) : null}
                </ul>

                {alertProposal.trigger ? (
                    <>
                        <Typography
                            tagName="p"
                            className="gd-gen-ai-chat__conversation__item__content-alertProposal-subheader"
                        >
                            {intl.formatMessage({ id: "gd.gen-ai.alert-proposal.summary.trigger" })}
                        </Typography>
                        <ul>
                            {alertProposal.trigger.trigger ? (
                                <AlertItem
                                    bold
                                    markdown
                                    title={intl.formatMessage({
                                        id: "gd.gen-ai.alert-proposal.summary.trigger.mode",
                                    })}
                                    description={alertProposal.trigger.trigger}
                                    objects={objects}
                                />
                            ) : null}
                            {alertProposal.trigger.interval ? (
                                <AlertItem
                                    bold
                                    markdown
                                    title={intl.formatMessage({
                                        id: "gd.gen-ai.alert-proposal.summary.trigger.interval",
                                    })}
                                    description={alertProposal.trigger.interval}
                                    objects={objects}
                                />
                            ) : null}
                            {alertProposal.trigger.cron ? (
                                <AlertItem
                                    markdown
                                    type="code"
                                    title={intl.formatMessage({
                                        id: "gd.gen-ai.alert-proposal.summary.trigger.cron",
                                    })}
                                    description={alertProposal.trigger.cron}
                                    objects={objects}
                                />
                            ) : null}
                            {alertProposal.trigger.timezone ? (
                                <AlertItem
                                    bold
                                    markdown
                                    title={intl.formatMessage({
                                        id: "gd.gen-ai.alert-proposal.summary.trigger.timezone",
                                    })}
                                    description={alertProposal.trigger.timezone}
                                    objects={objects}
                                />
                            ) : null}
                        </ul>
                    </>
                ) : null}

                {alertProposal.recipients?.length ? (
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
            </div>
        </div>
    );
}

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
    title: string;
    attributes: IAttribute[];
    objects?: TextContentObject[];
}

function AlertAttributes({ title, attributes, objects }: IAlertAttributesProps) {
    const rf = attributes
        .map((attribute) =>
            objRefToTextContentObject(attribute.attribute.displayForm, attribute.attribute.alias),
        )
        .filter(Boolean) as TextContentObject[];

    if (rf.length === 0) {
        return null;
    }

    return (
        <li className="gd-gen-ai-chat__conversation__item__content-alertProposal-item">
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-title">
                {title}:
            </div>
            <div className="gd-gen-ai-chat__conversation__item__content-alertProposal-item-description">
                <MarkdownComponent allowMarkdown references={[...(objects ?? []), ...rf]}>
                    {rf.map((rf) => `{${rf.type}/${rf.id}}`).join(" ")}
                </MarkdownComponent>
            </div>
        </li>
    );
}
