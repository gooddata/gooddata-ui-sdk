// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../../shared/theme/index.js";
import { useMetricFormStatus } from "../hooks/useMetricFormStatus.js";

const useStyles = makeStyles()(() => {
    return {
        root: {
            a: {
                cursor: "pointer",
            },
        },
    };
});

export interface IEditMetricSaveMessageProps {
    onClick?: () => void;
    text?: string;
    className?: string;
}

export function EditMetricSaveMessage({
    onClick,
    text = "text",
    children,
    className,
}: PropsWithChildren<IEditMetricSaveMessageProps>) {
    const { classes } = useStyles();
    const { isError, validation } = useMetricFormStatus();
    const { critical, specials } = validation;
    const { isEmpty } = specials;

    return (
        <span className={className}>
            <BubbleHoverTrigger
                showDelay={0}
                hideDelay={100}
                eventsOnBubble
                className="gd-button save-button-trigger"
            >
                {children}
                {isError && (
                    <Bubble
                        className={classNames(
                            isEmpty ? "bubble-dark" : "bubble-negative",
                            classes.root,
                            "s-save-message",
                        )}
                        alignPoints={[{ align: "tc br", offset: { x: 0, y: -5 } }]}
                    >
                        {!isEmpty && (
                            <>
                                <FormattedMessage
                                    id="metricComponent.editMetricForm.errorsOnSave.start"
                                    values={{ save: text.toLowerCase() }}
                                />{" "}
                                <a onClick={onClick}>
                                    <FormattedMessage
                                        id="metricComponent.editMetricForm.errorsOnSave.count"
                                        values={{ count: critical.length }}
                                    />
                                </a>
                                .
                            </>
                        )}
                        {isEmpty && (
                            <FormattedMessage
                                id="metricComponent.editMetricForm.errorsOnSave.empty"
                                values={{ save: text.toLowerCase() }}
                            />
                        )}
                    </Bubble>
                )}
            </BubbleHoverTrigger>
        </span>
    );
}
