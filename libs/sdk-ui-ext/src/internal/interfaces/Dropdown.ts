// (C) 2019-2022 GoodData Corporation
import { SingleSelectListItemType } from "@gooddata/sdk-ui-kit";

export interface IDropdownItem {
    title?: string;
    value?: string | number | boolean;
    type?: SingleSelectListItemType;
    icon?: string;
    info?: string;
}
