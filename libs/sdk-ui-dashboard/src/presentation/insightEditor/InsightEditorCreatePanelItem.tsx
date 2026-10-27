// (C) 2022-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT } from "@gooddata/sdk-ui-ext";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { useWidgetSelection } from "../../model/react/useWidgetSelection.js";
import { type ICreatePanelItemComponentProps } from "../componentDefinition/types.js";
import { DraggableCreatePanelItem } from "../dragAndDrop/DraggableCreatePanelItem.js";
import { type DraggableItem } from "../dragAndDrop/types.js";

const dragItem: DraggableItem = {
    type: "insight-placeholder",
    size: {
        gridWidth: INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
        gridHeight: INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT.height.default,
    },
};

function AddInsightPlaceholder() {
    return (
        <div className="add-item-placeholder add-insight-placeholder s-add-insight">
            <div className="add-item-placeholder__icon">
                <UiIcon type="visualization" size={18} layout="block" />
            </div>
            <FormattedMessage id="addPanel.insight" />
        </div>
    );
}

/**
 * The item of the edit mode panel that the user drags to the layout to create a new insight in the
 * embedded Analytical Designer.
 */
export function InsightEditorCreatePanelItem({
    WrapCreatePanelItemWithDragComponent,
    disabled,
}: ICreatePanelItemComponentProps) {
    const { deselectWidgets } = useWidgetSelection();
    return (
        <DraggableCreatePanelItem
            Component={AddInsightPlaceholder}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            disabled={disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
            onDragStart={() => deselectWidgets()}
        />
    );
}
