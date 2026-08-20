// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode, useMemo, useState } from "react";

import { type IUiListboxInteractiveItem, type IUiListboxItem } from "../@ui/UiListbox/types.js";
import { UiListbox } from "../@ui/UiListbox/UiListbox.js";
import {
    DETAILED_ANNOUNCEMENT_THRESHOLD,
    UiSearchResultsAnnouncement,
} from "../@ui/UiSearchResultsAnnouncement/UiSearchResultsAnnouncement.js";
import { Dropdown, type IDropdownButtonRenderProps } from "../Dropdown/Dropdown.js";
import { DropdownButton } from "../Dropdown/DropdownButton.js";
import { Input } from "../Form/Input.js";
import { NoData } from "../NoData/NoData.js";
import { type IAlignPoint } from "../typings/positioning.js";

import { getTimezoneDisplayLabel, getTimezones, timezoneMatchesSearch } from "./timezones.js";

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];
const DROPDOWN_BODY_WIDTH = 300;
// ~10 rows of 28px compact list items visible before the list scrolls
const LIST_MAX_HEIGHT = 280;

/**
 * Special item rendered above the divider in {@link TimezoneSelect}, ahead of the curated
 * timezone list. Callers use these for entries like "Default" or "Device time zone".
 *
 * @internal
 */
export interface ITimezoneSelectSpecialItem {
    /**
     * Value emitted by onChange when this item is selected. Undefined typically represents
     * "no explicit timezone" (e.g. inherit the workspace setting).
     */
    id: string | undefined;

    /**
     * Display label of the item.
     */
    label: string;

    /**
     * Tooltip of the item.
     */
    tooltip?: string;
}

/**
 * Render props passed to a custom trigger renderer of {@link TimezoneSelect}.
 *
 * Extends the {@link IDropdownButtonRenderProps} contract of the underlying dropdown
 * (toggle/open/close callbacks, isOpen, buttonRef and accessibility props) with the
 * current selection so that custom triggers can display it.
 *
 * @internal
 */
export interface ITimezoneSelectButtonRenderProps extends IDropdownButtonRenderProps {
    /**
     * Human-readable label of the current selection: the matching special item label,
     * the friendly name of the selected timezone (e.g. "Prague"),
     * or the placeholder when nothing is selected.
     */
    buttonLabel: string;

    /**
     * Currently selected timezone ID (IANA ID, a special item ID or undefined).
     */
    value: string | undefined;

    /**
     * Whether the select is disabled. Custom triggers should reflect this state.
     */
    isDisabled?: boolean;
}

/**
 * All label props are required so that callers pass localized strings — the component
 * has no built-in English defaults to leak into the UI.
 *
 * @internal
 */
export interface ITimezoneSelectProps {
    /**
     * Currently selected timezone ID (IANA ID, a special item ID or undefined).
     */
    value?: string;

    /**
     * Called when the user selects a timezone.
     */
    onChange: (id: string | undefined) => void;

    /**
     * Items rendered above the divider, ahead of the curated timezone list.
     */
    specialItems?: ITimezoneSelectSpecialItem[];

    /**
     * Label of the dropdown button when nothing is selected and no special item matches.
     */
    placeholder?: string;

    /**
     * Placeholder of the search input.
     */
    searchPlaceholder: string;

    /**
     * Accessibility label of the search input and the listbox.
     */
    ariaLabel: string;

    /**
     * Id of the default dropdown trigger, so a visible `<label htmlFor>` can be associated
     * with it. Ignored when a custom trigger is rendered via `renderButton`.
     */
    id?: string;

    /**
     * Ids of elements describing the default dropdown trigger (`aria-describedby`), e.g. an
     * adjacent hint text. Ignored when a custom trigger is rendered via `renderButton`.
     */
    ariaDescribedBy?: string;

    /**
     * Label shown when the search yields no results.
     */
    noMatchLabel: string;

    isDisabled?: boolean;

    /**
     * Optional content rendered above the search input (e.g. a dialog-like header).
     */
    header?: ReactNode;

    /**
     * Whether to show tooltip for list items. Default is false.
     */
    showTooltip?: boolean;

    /**
     * Custom renderer of the dropdown trigger. When not provided, a standard dropdown
     * button showing the current selection is rendered.
     *
     * Use this to embed the select in surfaces where the default button does not fit,
     * e.g. as an item of an options menu. The renderer receives the dropdown render props
     * ({@link IDropdownButtonRenderProps}: toggleDropdown, isOpen, buttonRef, accessibility
     * props, ...) together with the current selection ({@link ITimezoneSelectButtonRenderProps}).
     */
    renderButton?: (props: ITimezoneSelectButtonRenderProps) => ReactNode;
}

type TimezoneListItemData = string | undefined;

// special items may carry an undefined id, so listbox entries need a synthetic unique id
const SPECIAL_ITEM_ID_PREFIX = "special-item-";

// exported for tests
export function buildListboxItems(
    specialItems: ITimezoneSelectSpecialItem[],
    searchString: string,
    showTooltip: boolean,
): IUiListboxItem<TimezoneListItemData>[] {
    const search = searchString.trim().toLowerCase();

    const specialListItems: IUiListboxInteractiveItem<TimezoneListItemData>[] = specialItems
        // keep the pre-filter index — getSelectedItemId derives the selected id from the
        // unfiltered array, so filtered-out items must not shift the ids of the remaining ones
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !search || item.label.toLowerCase().includes(search))
        .map(({ item, index }) => ({
            type: "interactive" as const,
            id: `${SPECIAL_ITEM_ID_PREFIX}${index}`,
            stringTitle: item.label,
            tooltip: showTooltip ? item.tooltip : undefined,
            data: item.id,
        }));

    const timezoneListItems: IUiListboxInteractiveItem<TimezoneListItemData>[] = getTimezones()
        .filter((timezone) => timezoneMatchesSearch(timezone, search))
        .map((timezone) => ({
            type: "interactive" as const,
            id: timezone.id,
            stringTitle: getTimezoneDisplayLabel(timezone.id),
            data: timezone.id,
        }))
        .sort((a, b) => {
            if (a.stringTitle < b.stringTitle) {
                return -1;
            }
            if (a.stringTitle > b.stringTitle) {
                return 1;
            }
            return 0;
        });

    return specialListItems.length > 0 && timezoneListItems.length > 0
        ? [...specialListItems, { type: "separator" }, ...timezoneListItems]
        : [...specialListItems, ...timezoneListItems];
}

// exported for tests
export function getSelectedItemId(
    value: string | undefined,
    specialItems: ITimezoneSelectSpecialItem[],
): string | undefined {
    const specialIndex = specialItems.findIndex((item) => item.id === value);
    if (specialIndex >= 0) {
        return `${SPECIAL_ITEM_ID_PREFIX}${specialIndex}`;
    }
    return value;
}

/**
 * Searchable dropdown for picking a timezone from the curated list, with optional special
 * items (e.g. "Default", "Device time zone") rendered above a divider.
 *
 * @internal
 */
export function TimezoneSelect({
    value,
    onChange,
    specialItems = [],
    placeholder = "",
    searchPlaceholder,
    ariaLabel,
    id,
    ariaDescribedBy,
    noMatchLabel,
    isDisabled,
    header,
    showTooltip = false,
    renderButton,
}: ITimezoneSelectProps): ReactElement {
    const [searchString, setSearchString] = useState("");

    const selectedSpecialItem = specialItems.find((item) => item.id === value);
    const buttonLabel = selectedSpecialItem
        ? selectedSpecialItem.label
        : value === undefined
          ? placeholder
          : getTimezoneDisplayLabel(value);

    const items = useMemo(
        () => buildListboxItems(specialItems, searchString, showTooltip),
        [specialItems, searchString, showTooltip],
    );
    const hasNoMatchingData = items.length === 0;

    // items may contain a separator between special items and the timezone list; only the
    // interactive entries are search results worth announcing
    const interactiveItems = useMemo(
        () =>
            items.filter(
                (item): item is IUiListboxInteractiveItem<TimezoneListItemData> =>
                    item.type === "interactive",
            ),
        [items],
    );

    return (
        <Dropdown
            closeOnParentScroll
            closeOnOutsideClick
            alignPoints={DROPDOWN_ALIGN_POINTS}
            className="gd-timezone-select s-timezone-select"
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    setSearchString("");
                }
            }}
            renderButton={(renderProps) =>
                renderButton ? (
                    renderButton({ ...renderProps, buttonLabel, value, isDisabled })
                ) : (
                    <DropdownButton
                        value={buttonLabel}
                        isOpen={renderProps.isOpen}
                        onClick={renderProps.toggleDropdown}
                        disabled={isDisabled}
                        id={id}
                        dropdownId={renderProps.dropdownId}
                        buttonRef={renderProps.buttonRef}
                        accessibilityConfig={{
                            ariaLabel,
                            ariaDescribedBy,
                            ariaExpanded: renderProps.isOpen,
                            popupType: "listbox",
                        }}
                        className="gd-timezone-select__button s-timezone-select-button customizable"
                    />
                )
            }
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <div className="gd-timezone-select__body s-timezone-select-body">
                    {header}
                    <div className="gd-timezone-select__search s-timezone-select-search">
                        <Input
                            value={searchString}
                            onChange={(newValue) => setSearchString(newValue.toString())}
                            placeholder={searchPlaceholder}
                            autofocus
                            clearOnEsc
                            isSearch
                            isSmall
                            onEscKeyPress={(event) => {
                                if (searchString) {
                                    event.stopPropagation();
                                } else {
                                    closeDropdown();
                                }
                            }}
                            accessibilityConfig={{
                                ariaLabel,
                            }}
                        />
                    </div>
                    <UiSearchResultsAnnouncement
                        totalResults={searchString ? interactiveItems.length : undefined}
                        resultValues={
                            interactiveItems.length <= DETAILED_ANNOUNCEMENT_THRESHOLD
                                ? interactiveItems.map((item) => item.stringTitle)
                                : undefined
                        }
                    />
                    {hasNoMatchingData ? (
                        <NoData hasNoMatchingData notFoundLabel={noMatchLabel} noDataLabel={noMatchLabel} />
                    ) : (
                        <UiListbox
                            // remount when the filter changes so the focused index cannot point
                            // past the end of a shortened result list, which would break keyboard selection
                            key={searchString}
                            width={DROPDOWN_BODY_WIDTH}
                            maxHeight={LIST_MAX_HEIGHT}
                            items={items}
                            selectedItemId={getSelectedItemId(value, specialItems)}
                            onSelect={(item) => {
                                onChange(item.data);
                            }}
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            isCompact
                            dataTestId="s-timezone-select-list"
                            itemDataTestId="s-timezone-select-item"
                        />
                    )}
                </div>
            )}
            overlayPositionType="sameAsTarget"
        />
    );
}
