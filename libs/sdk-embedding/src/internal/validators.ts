// (C) 2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import isArray from "lodash/isArray";

import { EmbeddedKpiDashboard } from "../iframe/kd";
import { isObjRef } from "@gooddata/sdk-model";

function isValidSetFilterParentsAttributeFilter(
    obj: unknown,
): obj is EmbeddedKpiDashboard.ISetFilterParentsAttributeFilter {
    if (isEmpty(obj)) {
        return false;
    }

    const { attributeFilter } = obj as EmbeddedKpiDashboard.ISetFilterParentsAttributeFilter;

    return isObjRef(attributeFilter?.displayForm);
}

function isValidSetFilterParentsItemFilter(
    obj: unknown,
): obj is EmbeddedKpiDashboard.SetFilterParentsItemFilter {
    return isValidSetFilterParentsAttributeFilter(obj);
}

function isValidSetFilterParentsItemParent(
    obj: unknown,
): obj is EmbeddedKpiDashboard.ISetFilterParentsItemParent {
    if (isEmpty(obj)) {
        return false;
    }

    const { connectingAttribute, parent } = obj as EmbeddedKpiDashboard.ISetFilterParentsItemParent;

    return isValidSetFilterParentsItemFilter(parent) && isObjRef(connectingAttribute);
}

function isValidSetFilterParentsItem(obj: unknown): obj is EmbeddedKpiDashboard.ISetFilterParentsItem {
    if (isEmpty(obj)) {
        return false;
    }

    const { filter, parents } = obj as EmbeddedKpiDashboard.ISetFilterParentsItem;

    return (
        isValidSetFilterParentsItemFilter(filter) &&
        isArray(parents) &&
        parents.every(isValidSetFilterParentsItemParent)
    );
}

export function isValidSetFilterParentsCommandData(
    obj: unknown,
): obj is EmbeddedKpiDashboard.ISetFilterParentsDataBody {
    if (isEmpty(obj)) {
        return false;
    }

    const { filters } = obj as EmbeddedKpiDashboard.ISetFilterParentsDataBody;
    if (!isArray(filters)) {
        return false;
    }

    return filters.every(isValidSetFilterParentsItem);
}
