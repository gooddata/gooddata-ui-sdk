// (C) 2025 GoodData Corporation

import { RefObject, useId } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { Typography, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useAddNewAttributeHandler } from "./hooks/useAddNewAttributeHandler.js";
import { useUnusedAttributes } from "./hooks/useUnusedAttributes.js";
import { AttributesDropdown } from "../../presentation/filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js";
import { useKdaState } from "../providers/KdaState.js";

export function AddFilterButton() {
    const intl = useIntl();
    const attributes = useUnusedAttributes();
    const { setState } = useKdaState();

    const tooltipText = intl.formatMessage({ id: "kdaDialog.dialog.filters.add.tooltip" });
    const searchAriaLabel = intl.formatMessage({ id: "kdaDialog.dialog.filters.search" });

    const ariaLabelledBy = useId();
    const attributesDropdownId = useId();
    const isAddButtonDisabled = attributes.length === 0;

    const { onSelectCallback } = useAddNewAttributeHandler();

    return (
        <AttributesDropdown
            id={attributesDropdownId}
            openOnInit={false}
            dateDatasets={[]}
            attributes={attributes}
            onSelect={onSelectCallback}
            onOpen={() => {
                setState({
                    addFilterDropdownOpen: true,
                });
            }}
            onClose={() => {
                setState({
                    addFilterDropdownOpen: false,
                });
            }}
            renderVirtualisedList
            accessibilityConfig={{
                ariaLabelledBy,
                searchAriaLabel,
            }}
            overlayPositionType="sameAsTarget"
            className="gd-kda-attribute-add-dropdown"
            DropdownButtonComponent={({ buttonRef, isOpen, onClick }) => (
                <UiTooltip
                    arrowPlacement="left"
                    triggerBy={["hover", "focus"]}
                    content={tooltipText}
                    anchor={
                        <UiIconButton
                            icon="plus"
                            label={tooltipText}
                            onClick={onClick}
                            size="small"
                            variant="tertiary"
                            isDisabled={isAddButtonDisabled}
                            ref={buttonRef as RefObject<HTMLButtonElement>}
                            accessibilityConfig={{
                                ariaLabel: tooltipText,
                                ariaControls: attributesDropdownId,
                                ariaExpanded: isOpen,
                                ariaHaspopup: "dialog",
                            }}
                        />
                    }
                />
            )}
            DropdownTitleComponent={() => (
                <div className="gd-automation-filters__dropdown-header">
                    <Typography tagName="h3" id={ariaLabelledBy}>
                        <FormattedMessage id="kdaDialog.dialog.filters.title" />
                    </Typography>
                </div>
            )}
            renderNoData={() => (
                <div className="gd-automation-filters__dropdown-no-filters">
                    <FormattedMessage id="kdaDialog.dialog.filters.noFilters" />
                </div>
            )}
        />
    );
}
