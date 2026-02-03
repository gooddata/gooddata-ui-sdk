// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { bem } from "../@ui/@utils/bem.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { UiListbox } from "../@ui/UiListbox/UiListbox.js";
import { Overlay } from "../Overlay/Overlay.js";

interface IDateDatasetOption {
    key: string;
    title: string;
}

interface IDateDatasetPickerItemProps {
    dateDatasetOptions: IDateDatasetOption[];
    selectedDateDatasetKey: string | undefined;
    isDropdownOpen: boolean;
    onSelect: (key: string) => void;
    onToggleDropdown: () => void;
    listboxId: string;
    dateAsLabel: string;
}

const { e } = bem("gd-ui-kit-catalog-item-picker");

export function DateDatasetPickerItem({
    dateDatasetOptions,
    selectedDateDatasetKey,
    isDropdownOpen,
    onSelect,
    onToggleDropdown,
    listboxId,
    dateAsLabel,
}: IDateDatasetPickerItemProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const selectedDatasetTitle =
        dateDatasetOptions.find((o) => o.key === selectedDateDatasetKey)?.title ?? "";

    return (
        <div className={e("date-dataset")}>
            <div className={e("date-dataset-label")}>{dateAsLabel}</div>
            <div
                className={e("date-dataset-control")}
                ref={buttonRef}
                onMouseDown={(event) => {
                    event.preventDefault();
                }}
            >
                <UiButton
                    variant="secondary"
                    size="small"
                    label={selectedDatasetTitle}
                    iconAfter={isDropdownOpen ? "navigateUp" : "navigateDown"}
                    onClick={onToggleDropdown}
                    dataTestId="s-catalog-item-picker-date-dataset-button"
                />
                {isDropdownOpen && buttonRef.current ? (
                    <Overlay
                        alignTo={buttonRef.current}
                        alignPoints={[
                            { align: "bl tl", offset: { x: 0, y: 4 } },
                            { align: "tl bl", offset: { x: 0, y: -4 } },
                        ]}
                        closeOnOutsideClick
                        closeOnEscape
                        onClose={onToggleDropdown}
                    >
                        <div className={e("date-dataset-dropdown")}>
                            <UiListbox
                                isCompact
                                items={dateDatasetOptions.map((o) => ({
                                    type: "interactive",
                                    id: o.key,
                                    stringTitle: o.title,
                                    data: undefined,
                                }))}
                                selectedItemId={selectedDateDatasetKey}
                                onSelect={(item) => {
                                    onSelect(item.id);
                                }}
                                shouldCloseOnSelect={false}
                                ariaAttributes={{
                                    id: `${listboxId}-date-dataset`,
                                    "aria-label": dateAsLabel,
                                }}
                                dataTestId="s-catalog-item-picker-date-dataset-list"
                            />
                        </div>
                    </Overlay>
                ) : null}
            </div>
        </div>
    );
}
