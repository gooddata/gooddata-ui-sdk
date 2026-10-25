// (C) 2007-2026 GoodData Corporation

import { type IExportConfig } from "@gooddata/sdk-backend-spi";

import { type IPropertiesMetaState } from "../store/properties/properties_meta_state.js";
import {
    getPropertiesMetaState,
    getVisualizationProperties,
    getVisualizationPropertiesControl,
} from "../store/properties/properties_selectors.js";
import { type IPropertiesState } from "../store/properties/properties_state.js";
import {
    getExtendedReferencePointProperties as getErpProperties,
    getExtendedReferencePointPropertiesControls as getErpPropertiesControls,
} from "../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../store/types.js";
import {
    type IStoredVisualizationProperties,
    type IVisualizationPropertiesControls,
} from "../typings/properties.js";

export const VisualizationPropertiesSelectors = {
    getGrandTotalsPosition,
    getProperties,
    getPropertiesMeta,
    getExtendedReferencePointProperties,
    getExtendedReferencePointPropertiesControls,
};

// The domain's own two subtrees are read through store/properties. The two accessors below keep
// their empty-object default: the extended reference point is ABSENT until a pluggable
// visualization reports one, and every consumer reads through it without a null check.
function getProperties(state: IAppState): IPropertiesState {
    return getVisualizationProperties(state);
}

function getPropertiesMeta(state: IAppState): IPropertiesMetaState {
    return getPropertiesMetaState(state);
}

function getGrandTotalsPosition(state: IAppState): IExportConfig["grandTotalsPosition"] {
    return getVisualizationPropertiesControl(state, "grandTotalsPosition");
}

/**
 * STABLE fallbacks, not literals. The extended reference point is absent until a pluggable
 * visualization reports one, and these two accessors are `createSelector` INPUTS — a fresh `{}` per
 * read would give every downstream selector a new input identity and defeat its memoization on every
 * state change.
 */
const EMPTY_PROPERTIES: IStoredVisualizationProperties = Object.freeze({});
const EMPTY_CONTROLS: IVisualizationPropertiesControls = Object.freeze({});

function getExtendedReferencePointProperties(state: IAppState): IStoredVisualizationProperties {
    return getErpProperties(state) || EMPTY_PROPERTIES;
}

function getExtendedReferencePointPropertiesControls(state: IAppState): IVisualizationPropertiesControls {
    return getErpPropertiesControls(state) || EMPTY_CONTROLS;
}
