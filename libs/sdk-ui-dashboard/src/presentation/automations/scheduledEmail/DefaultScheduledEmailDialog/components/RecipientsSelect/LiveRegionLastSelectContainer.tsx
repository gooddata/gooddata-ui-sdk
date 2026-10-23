// (C) 2026 GoodData Corporation

import { Children, type ReactElement } from "react";

import { type ContainerProps, components } from "react-select";

import { type IAutomationRecipient } from "@gooddata/sdk-model";

/**
 * React-select 5.x renders its hidden live region as the first child; rendering it last keeps screen readers
 * from stopping on it between the field label and the recipients. Guarded by RecipientsSelect.test.tsx.
 */
export function LiveRegionLastSelectContainer(
    props: ContainerProps<IAutomationRecipient, boolean>,
): ReactElement {
    const [liveRegion, ...rest] = Children.toArray(props.children);

    return (
        <components.SelectContainer {...props}>
            {rest}
            {liveRegion}
        </components.SelectContainer>
    );
}
