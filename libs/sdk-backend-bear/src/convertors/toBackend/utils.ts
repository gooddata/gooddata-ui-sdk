// (C) 2022 GoodData Corporation
import { invariant } from "ts-invariant";
import { IAttributeElements, isAttributeElementsByRef } from "@gooddata/sdk-model";

export function assertNoNulls(elements: IAttributeElements): void {
    const rawData = isAttributeElementsByRef(elements) ? elements.uris : elements.values;
    invariant(
        rawData.every((item) => item !== null),
        "Nulls are not supported as attribute element values or uris on bear",
    );
}
