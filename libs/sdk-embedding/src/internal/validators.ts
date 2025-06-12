// (C) 2020 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import isArray from "lodash/isArray.js";

import { isObjRef } from "@gooddata/sdk-model";
import {
    IKdSetFilterParentsAttributeFilter,
    IKdSetFilterParentsDataBody,
    IKdSetFilterParentsItem,
    IKdSetFilterParentsItemParent,
    KdSetFilterParentsItemFilter,
} from "../iframe/EmbeddedKpiDashboard.js";

function isValidSetFilterParentsAttributeFilter(obj: unknown): obj is IKdSetFilterParentsAttributeFilter {
    if (isEmpty(obj)) {
        return false;
    }

    const { attributeFilter } = obj as IKdSetFilterParentsAttributeFilter;

    return isObjRef(attributeFilter?.displayForm);
}

function isValidSetFilterParentsItemFilter(obj: unknown): obj is KdSetFilterParentsItemFilter {
    return isValidSetFilterParentsAttributeFilter(obj);
}

function isValidSetFilterParentsItemParent(obj: unknown): obj is IKdSetFilterParentsItemParent {
    if (isEmpty(obj)) {
        return false;
    }

    const { connectingAttribute, parent } = obj as IKdSetFilterParentsItemParent;

    return isValidSetFilterParentsItemFilter(parent) && isObjRef(connectingAttribute);
}

function isValidSetFilterParentsItem(obj: unknown): obj is IKdSetFilterParentsItem {
    if (isEmpty(obj)) {
        return false;
    }

    const { filter, parents } = obj as IKdSetFilterParentsItem;

    return (
        isValidSetFilterParentsItemFilter(filter) &&
        isArray(parents) &&
        parents.every(isValidSetFilterParentsItemParent)
    );
}

export function isValidSetFilterParentsCommandData(obj: unknown): obj is IKdSetFilterParentsDataBody {
    if (isEmpty(obj)) {
        return false;
    }

    const { filters } = obj as IKdSetFilterParentsDataBody;
    if (!isArray(filters)) {
        return false;
    }

    return filters.every(isValidSetFilterParentsItem);
}
