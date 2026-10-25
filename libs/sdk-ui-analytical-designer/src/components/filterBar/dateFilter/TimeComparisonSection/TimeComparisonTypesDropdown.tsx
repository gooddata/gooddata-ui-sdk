// (C) 2007-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { defineMessage, useIntl } from "react-intl";
import { type Subscription } from "rxjs";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { Dropdown, DropdownButton, DropdownList } from "@gooddata/sdk-ui-kit";

import {
    DROPDOWN_ALIGN_POINTS,
    DROPDOWN_MIN_HEIGHT,
    getDateConfigurationDropdownHeight,
    subscribeEvents,
} from "../../../../utils/dropdown.js";
import { DropdownButtonWrapper } from "../../../DropdownButtonWrapper.js";

import { TimeComparisonTypesDropdownItem } from "./TimeComparisonTypesDropdownItem.js";

export interface ITimeComparisonTypesDropdownProps {
    supportedTypes: OverTimeComparisonType[];
    selectedType: OverTimeComparisonType;
    onSelect?: (selectedType: OverTimeComparisonType) => void;
    itemHeight: number;
    className?: string;
    defaultDialogHeight?: number;
    isAllTimeDateFilter: boolean;
    isPoPAvailable: boolean;
}

function getComparisonTypeDropdownMessageId(type: OverTimeComparisonType): string {
    switch (type) {
        case OverTimeComparisonTypes.NOTHING:
            return defineMessage({ id: "filter.compare.type.dropdown.nothing" }).id;
        case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
            return defineMessage({ id: "filter.compare.type.dropdown.same_period_previous_year" }).id;
        case OverTimeComparisonTypes.PREVIOUS_PERIOD:
            return defineMessage({ id: "filter.compare.type.dropdown.previous_period" }).id;
        default:
            return `filter.compare.type.dropdown.${type}`;
    }
}

export function TimeComparisonTypesDropdown({
    onSelect = () => {},
    selectedType,
    itemHeight,
    className = "s-compare-types-dropdown",
    defaultDialogHeight = DROPDOWN_MIN_HEIGHT,
    isAllTimeDateFilter,
    isPoPAvailable,
    supportedTypes,
}: ITimeComparisonTypesDropdownProps) {
    const intl = useIntl();

    const [state, setState] = useState({
        opened: false,
        width: 0,
        height: 0,
    });

    const subscribersRef = useRef<Subscription[]>(null);
    const buttonRef = useRef<HTMLElement>(null);
    const itemsRef = useRef<OverTimeComparisonType[]>(null);

    const setDataSource = () => {
        itemsRef.current = [OverTimeComparisonTypes.NOTHING, ...supportedTypes];
    };

    const getDialogHeight = () => {
        if (!buttonRef.current || !itemsRef.current) {
            return defaultDialogHeight;
        }

        const { top, height } = buttonRef.current.getBoundingClientRect();

        const dropdownBodyHeight = itemsRef.current.length * itemHeight;

        return getDateConfigurationDropdownHeight(top, height, dropdownBodyHeight);
    };

    const setDialogHeight = () => {
        setState((prev) => ({ ...prev, height: getDialogHeight() }));
    };

    const setButtonRef = (buttonRefElement: HTMLElement | null) => {
        if (buttonRefElement && buttonRef.current !== buttonRefElement) {
            buttonRef.current = buttonRefElement;
            setState((prev) => ({
                ...prev,
                width: buttonRefElement.getBoundingClientRect().width,
            }));
        }
    };

    const onOpenStateChanged = (opened: boolean) => {
        if (opened) {
            setState((prev) => ({ ...prev, opened, height: getDialogHeight() }));
        } else {
            setState((prev) => ({ ...prev, opened }));
        }
    };

    const renderDropdownButton = (toggleDropdown: () => void) => {
        const { opened } = state;

        const buttonClassName = classNames("s-comparison-types-button", `s-${selectedType}`, {
            "s-expanded": opened,
            "s-collapsed": !opened,
        });
        const title = intl.formatMessage({ id: getComparisonTypeDropdownMessageId(selectedType) });

        return (
            <DropdownButtonWrapper setRef={setButtonRef}>
                <DropdownButton
                    id="time-comparison-dropdown"
                    className={buttonClassName}
                    value={title}
                    onClick={toggleDropdown}
                />
            </DropdownButtonWrapper>
        );
    };

    useEffect(() => {
        subscribersRef.current = subscribeEvents(setDialogHeight);
        setDataSource();
        setDialogHeight();

        return () => {
            subscribersRef.current?.forEach((subscriber) => {
                subscriber.unsubscribe();
            });
            subscribersRef.current = null;
        };
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setDataSource();
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [supportedTypes]);

    const { height, width } = state;

    return (
        <Dropdown
            className={className}
            renderButton={({ toggleDropdown }) => renderDropdownButton(toggleDropdown)}
            onOpenStateChanged={onOpenStateChanged}
            alignPoints={DROPDOWN_ALIGN_POINTS}
            closeOnParentScroll
            closeOnMouseDrag
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="adi-compare-types-list s-compare-types-list"
                    itemHeight={itemHeight}
                    height={height}
                    width={width}
                    items={itemsRef.current}
                    renderItem={({ item }) => (
                        <TimeComparisonTypesDropdownItem
                            item={item}
                            selected={selectedType}
                            onClick={() => {
                                onSelect(item);
                                closeDropdown();
                            }}
                            isAllTimeDateFilter={isAllTimeDateFilter}
                            isPoPAvailable={isPoPAvailable}
                        />
                    )}
                />
            )}
        />
    );
}
