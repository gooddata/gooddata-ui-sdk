// (C) 2022 GoodData Corporation
import { throwMissingCallbackError } from "../utils/MissingComponent";
import { IAttributeFilterContextOwnState } from "./types";

export const DefaultContextOwnState: IAttributeFilterContextOwnState = {
    attributeFilterTitle: "",
    isApplyDisabled: false,
    onFilterPlaceholderApply: throwMissingCallbackError("onFilterPlaceholderApply", "AttributeFilterContext"),
};
