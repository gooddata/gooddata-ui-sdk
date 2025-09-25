// (C) 2025 GoodData Corporation

import cx from "classnames";

import { UiChip, UiTooltip } from "@gooddata/sdk-ui-kit";

import { KdaAttributeFilter } from "../../internalTypes.js";

interface IAttributeBarProps {
    attribute: KdaAttributeFilter;
}

export function AttributeBar(props: IAttributeBarProps) {
    const { title } = props.attribute;

    return (
        <div className={cx("gd-kda-dialog-bar__attribute")}>
            <UiTooltip
                arrowPlacement="top-start"
                content={title}
                optimalPlacement
                triggerBy={["hover", "focus"]}
                anchor={<UiChip label={title} isExpandable={false} isDeletable={true} />}
            />
        </div>
    );
}
