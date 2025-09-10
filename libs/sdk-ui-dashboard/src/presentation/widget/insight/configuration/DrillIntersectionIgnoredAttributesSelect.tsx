// (C) 2020-2025 GoodData Corporation

import React, { useState } from "react";

import cx from "classnames";
import differenceBy from "lodash/differenceBy.js";
import { FormattedMessage } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    Dropdown,
    IIconProps,
    Icon,
    InvertableSelect,
    InvertableSelectItem,
} from "@gooddata/sdk-ui-kit";

import { DRILL_TARGET_TYPE } from "../../../drill/types.js";

const { Date: DateIcon, Attribute: AttributeIcon, QuestionMark: QuestionMarkIcon } = Icon;

const ALIGN_POINTS = [
    { align: "cr tl", offset: { x: 3, y: 0 } },
    { align: "bc tl", offset: { x: 3, y: 0 } },
    { align: "tc bl", offset: { x: 3, y: 0 } },
    { align: "tc br", offset: { x: 3, y: 0 } },
    { align: "bc tr", offset: { x: 3, y: 0 } },
];

/**
 * @internal
 */
export interface IDrillIntersectionIgnoredAttributesSelectOption {
    id: string;
    title: string;
    type: "attribute" | "date";
}

/**
 * @internal
 */
export interface IDrillIntersectionIgnoredAttributesSelectProps {
    options: IDrillIntersectionIgnoredAttributesSelectOption[];
    initialSelection?: IDrillIntersectionIgnoredAttributesSelectOption[];
    onApply: (selection: IDrillIntersectionIgnoredAttributesSelectOption[]) => void;
    drillTargetType?: DRILL_TARGET_TYPE;
}

/**
 * @internal
 */
export function DrillIntersectionIgnoredAttributesSelect({
    options,
    initialSelection = [],
    onApply,
    drillTargetType,
}: IDrillIntersectionIgnoredAttributesSelectProps) {
    const [isInverted, setIsInverted] = useState(true);
    const [selection, setSelection] =
        useState<IDrillIntersectionIgnoredAttributesSelectOption[]>(initialSelection);

    const appliedSelection = isInverted ? selection : differenceBy(options, selection, "id");
    const shownSelection = isInverted ? differenceBy(options, appliedSelection, "id") : selection;

    return (
        <Dropdown
            onOpenStateChanged={(open) => {
                if (!open) {
                    onApply(appliedSelection);
                }
            }}
            renderBody={() => {
                return (
                    <InvertableSelect
                        className="gd-drill-intersection-ignored-attributes-select"
                        onSelect={(items, isInverted) => {
                            setSelection(items);
                            setIsInverted(isInverted);
                        }}
                        items={options}
                        getItemTitle={(item) => item.title}
                        getItemKey={(item) => item.id}
                        isInverted={isInverted}
                        selectedItems={selection}
                        totalItemsCount={options.length}
                        renderItem={({ title, item, onSelect, onDeselect, isSelected }) => {
                            const isDisabled =
                                item.type === "date" &&
                                drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;

                            let iconComponent: React.ComponentType<IIconProps> = () => null;
                            if (item.type === "date") {
                                iconComponent = DateIcon;
                            } else if (item.type === "attribute") {
                                iconComponent = AttributeIcon;
                            }
                            const IconComponent = iconComponent;
                            return (
                                <InvertableSelectItem
                                    title={title}
                                    renderOnly={() => <></>}
                                    isDisabled={isDisabled}
                                    isSelected={!isDisabled && isSelected}
                                    icon={
                                        <IconComponent
                                            className={cx(
                                                "gd-drill-intersection-ignored-attributes-select-item-icon",
                                                `gd-drill-intersection-ignored-attributes-select-item-icon-${item.type}`,
                                            )}
                                        />
                                    }
                                    onClick={() => {
                                        if (isDisabled) {
                                            return;
                                        }
                                        if (isSelected) {
                                            onDeselect();
                                        } else {
                                            onSelect();
                                        }
                                    }}
                                />
                            );
                        }}
                        renderStatusBar={() => <></>}
                        renderSearchBar={() => (
                            <div className="gd-drill-intersection-ignored-attributes-select-title">
                                <FormattedMessage id="configurationPanel.drillConfig.drillIntersectionIgnoredAttributes.dropdown.title" />
                                <BubbleHoverTrigger>
                                    <QuestionMarkIcon
                                        className="gd-drill-intersection-ignored-attributes-select-title-tooltip"
                                        width={12}
                                        height={12}
                                    />
                                    <Bubble alignPoints={ALIGN_POINTS}>
                                        <div className="gd-drill-intersection-ignored-attributes-select-title-tooltip-content">
                                            <FormattedMessage id="configurationPanel.drillConfig.drillIntersectionIgnoredAttributes.dropdown.tooltip" />
                                        </div>
                                    </Bubble>
                                </BubbleHoverTrigger>
                            </div>
                        )}
                    />
                );
            }}
            renderButton={({ toggleDropdown, isOpen }) => {
                let title: React.ReactNode = "";
                if (isInverted && selection.length === 0) {
                    title = (
                        <FormattedMessage id="configurationPanel.drillConfig.drillIntersectionIgnoredAttributes.dropdown.all" />
                    );
                } else if (
                    (!isInverted && selection.length === 0) ||
                    (isInverted && selection.length === options.length)
                ) {
                    title = (
                        <FormattedMessage id="configurationPanel.drillConfig.drillIntersectionIgnoredAttributes.dropdown.none" />
                    );
                } else {
                    title = shownSelection.map((s) => s.title).join(", ");
                }
                return (
                    <Button
                        onClick={toggleDropdown}
                        iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                        size="small"
                        variant="primary"
                        className={cx(
                            "gd-drill-intersection-ignored-attributes-select-button",
                            "button-dropdown",
                            "dropdown-button",
                            {
                                "gd-is-open": isOpen,
                                "is-active": isOpen,
                            },
                        )}
                    >
                        <BubbleHoverTrigger>
                            {title}
                            <Bubble>{title}</Bubble>
                        </BubbleHoverTrigger>
                    </Button>
                );
            }}
        />
    );
}
