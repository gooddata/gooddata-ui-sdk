// (C) 2022-2026 GoodData Corporation

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";
import { ShortenedText, UiIcon } from "@gooddata/sdk-ui-kit";

import { AttributeFilterDetailsBubble } from "./AttributeFilterDetailsBubble.js";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext.js";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext.js";
import { type AttributeFilterMode } from "../../filterModeTypes.js";

/**
 * Props for AttributeFilterDropdownHeader component.
 *
 * @internal
 */
export interface IAttributeFilterDropdownHeaderProps {
    /**
     * Title of the attribute filter.
     */
    title?: string;

    /**
     * Current filter mode (elements or text).
     */
    currentFilterMode?: AttributeFilterMode;

    /**
     * Available filter modes.
     */
    availableInternalFilterModes?: AttributeFilterMode[];

    /**
     * Callback when filter mode changes.
     */
    onFilterModeChange?: (mode: AttributeFilterMode) => void;

    /**
     * Attribute metadata (for details bubble).
     */
    attribute?: IAttributeMetadataObject;

    /**
     * Display form (label) used by the filter (for details bubble).
     */
    label?: IAttributeDisplayFormMetadataObject;

    /**
     * Callback to load sample elements when the details bubble opens.
     */
    requestHandler?: (labelRef: ObjRef) => Promise<{ elements: IAttributeElement[]; totalCount: number }>;

    /**
     * Labels for "Values as" menu section.
     */
    labels?: IAttributeDisplayFormMetadataObject[];

    /**
     * Currently selected label ref.
     */
    selectedLabelRef?: ObjRef;

    /**
     * Callback when label is changed.
     */
    onLabelChange?: (labelRef: ObjRef) => void;
}

/**
 * Header of the attribute filter dropdown with title and filter mode menu.
 *
 * @internal
 */
export function AttributeFilterDropdownHeader({
    title,
    currentFilterMode,
    availableInternalFilterModes,
    onFilterModeChange,
    attribute,
    label,
    requestHandler,
    labels,
    selectedLabelRef,
    onLabelChange,
}: IAttributeFilterDropdownHeaderProps) {
    const { FilterModeMenuComponent } = useAttributeFilterComponentsContext();
    const { hideTooltips } = useAttributeFilterContext();

    const showDetailsBubble = attribute && label && requestHandler;

    return (
        <div className="gd-attribute-filter-dropdown-header s-attribute-filter-dropdown-header">
            <div className="gd-attribute-filter-dropdown-header__title">
                <ShortenedText
                    className="gd-attribute-filter-dropdown-header__title-text"
                    tooltipAlignPoints={[{ align: "tc bc" }]}
                    ellipsisPosition="end"
                >
                    {title ?? ""}
                </ShortenedText>
                {hideTooltips ? null : (
                    <span className="gd-attribute-filter-dropdown-header__title-icon">
                        {showDetailsBubble ? (
                            <AttributeFilterDetailsBubble
                                attribute={attribute}
                                label={label}
                                requestHandler={requestHandler}
                            />
                        ) : (
                            <UiIcon
                                type="question"
                                size={12}
                                color="complementary-7"
                                accessibilityConfig={{ ariaHidden: true }}
                            />
                        )}
                    </span>
                )}
            </div>
            <FilterModeMenuComponent
                currentMode={currentFilterMode ?? "elements"}
                availableModes={availableInternalFilterModes}
                onModeChange={onFilterModeChange ?? (() => {})}
                labels={labels}
                selectedLabelRef={selectedLabelRef}
                onLabelChange={onLabelChange}
                hideTooltips={hideTooltips}
            />
        </div>
    );
}
