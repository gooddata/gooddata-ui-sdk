// (C) 2020-2026 GoodData Corporation

import { type MouseEvent } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { getMetricsEditorUrl } from "../../../utils/api.js";
import { getWorkspaceRef } from "../../../utils/uri.js";

interface ICreateMeasureLinkProps {
    projectId: string;
    disabled?: boolean;
}

export function CreateMeasureLink({ disabled, projectId }: ICreateMeasureLinkProps) {
    const workspacesRef = getWorkspaceRef(true);
    const buttonClassNames = classNames(
        "gd-button",
        "gd-button-link",
        "gd-icon-plus",
        "s-btn-create_calculated_measure",
        {
            disabled,
        },
    );

    const handleClick = (e: MouseEvent) => disabled && e.preventDefault();
    const tooltipMessageId = disabled
        ? defineMessage({ id: "catalog.add_calculated_measure_disabled" }).id
        : defineMessage({ id: "catalog.add_calculated_measure_long" }).id;

    return (
        <div className="create-measure-link-section">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <a
                    className={buttonClassNames}
                    href={disabled ? "" : getMetricsEditorUrl(projectId, null, workspacesRef)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                >
                    <FormattedMessage id="catalog.add_calculated_measure" />
                </a>
                <Bubble className="bubble-primary" alignPoints={[{ align: "cr bl" }]}>
                    <FormattedMessage id={tooltipMessageId} />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
