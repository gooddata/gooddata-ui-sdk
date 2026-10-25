// (C) 2007-2026 GoodData Corporation

import { type Ref, type SyntheticEvent, useMemo } from "react";

import classNames from "classnames";
import { uniqueId } from "lodash-es";

import { type ISeparators } from "@gooddata/sdk-ui";
import { type IDimensionalityItem, type WarningMessage, isWarningMessage } from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, ShortenedText } from "@gooddata/sdk-ui-kit";

import { type IMeasureValueFilter } from "../../store/filter_bar/filter_bar_types.js";

import { DropdownButtonValue } from "./measureValueFilter/DropdownButtonValue.js";

export interface IMeasureValueFilterDropdownButtonProps {
    measureTitle: string;
    sequenceNumber: number;
    filter: IMeasureValueFilter;
    isActive: boolean;
    usePercentage: boolean;
    warningMessage: WarningMessage;
    onClick: (event: SyntheticEvent) => void;
    /** the button element, which the dropdown is anchored to when it is opened without a click */
    buttonRef?: Ref<HTMLDivElement>;
    separators?: ISeparators;
    className?: string;
    isDraggedItem?: boolean;
    dimensionality?: IDimensionalityItem[];
}

const tooltipAlignPoints = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

const getWarningMessageClassName = (warningMessage: WarningMessage): string => {
    if (!warningMessage) {
        return null;
    }

    const baseClass = "adi-filter-warning s-filter-warning";

    if (typeof warningMessage === "string") {
        return `${baseClass} adi-filter-warning-low`;
    }

    switch (warningMessage.severity) {
        case "low":
            return `${baseClass} adi-filter-warning-low`;
        case "medium":
            return `${baseClass} adi-filter-warning-medium`;
        case "high":
            return `${baseClass} adi-filter-warning-high`;
    }
};

export function MeasureValueFilterDropdownButton({
    measureTitle,
    usePercentage,
    warningMessage,
    onClick,
    buttonRef,
    isActive,
    className,
    filter: { conditions },
    sequenceNumber,
    separators,
    isDraggedItem,
    dimensionality,
}: IMeasureValueFilterDropdownButtonProps) {
    // do not render the decorated sequence number when there's none
    // (filter is built for measure not in buckets)
    const sequenceNumberString = useMemo(
        () => (sequenceNumber === undefined ? "" : ` (M${sequenceNumber})`),
        [sequenceNumber],
    );
    const dialogId = useMemo(() => uniqueId("filter_"), []);
    const buttonClassNames = useMemo(
        () =>
            classNames(
                [
                    "dropdown-button",
                    "toggle-menu",
                    "adi-filter-button",
                    "s-filter-button",
                    "adi-measure-value-filter-button",
                    "gd-button",
                    "button-dropdown",
                    "gd-icon-right",
                    "gd-mvf-dropdown-toggle-button",
                    getWarningMessageClassName(warningMessage),
                    className,
                ],
                {
                    "is-active": isActive,
                },
            ),
        [warningMessage, className, isActive],
    );

    const getConfigurationClasses = () =>
        classNames(
            "adi-filter-selection",
            "adi-filter-button-bottom-line",
            "gd-mvf-configuration",
            "s-mvf-configuration",
        );

    const renderButton = () => (
        <div id={dialogId} ref={buttonRef} tabIndex={-1} className={buttonClassNames} onClick={onClick}>
            <div className="gd-button-text">
                <div className={"adi-filter-title s-attribute-filter-button-title s-mvf-measure-name"}>
                    <ShortenedText
                        tooltipAlignPoints={tooltipAlignPoints}
                        tooltipVisibleOnMouseOver={false}
                        displayTooltip={!isDraggedItem}
                    >
                        {`${measureTitle}${sequenceNumberString}`}
                    </ShortenedText>
                </div>
                <div className={getConfigurationClasses()}>
                    <b data-testid="mvf-configuration-value">
                        <DropdownButtonValue
                            conditions={conditions}
                            usePercentage={usePercentage}
                            separators={separators}
                            dimensionality={dimensionality}
                        />
                    </b>
                </div>
            </div>
        </div>
    );

    return warningMessage && !isDraggedItem ? (
        <BubbleHoverTrigger tagName={"div"} showDelay={200} hideDelay={0}>
            {renderButton()}
            {!isActive && (
                <Bubble alignPoints={[{ align: "bc tc" }]}>
                    {isWarningMessage(warningMessage) ? warningMessage.text : warningMessage}
                </Bubble>
            )}
        </BubbleHoverTrigger>
    ) : (
        renderButton()
    );
}
