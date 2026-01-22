// (C) 2025-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo, useReducer } from "react";

import { isEqual } from "lodash-es";

import {
    type Identifier,
    type ObjectOrigin,
    type SemanticQualityIssueCode,
    SemanticQualityIssueCodeValues,
} from "@gooddata/sdk-model";

import { type ObjectType } from "../objectType/types.js";
import { useQualityReportState } from "../quality/QualityContext.js";
import { getQualityIssueIdsByCodes } from "../quality/utils.js";

interface IFilterParams<T> {
    values: T;
    isInverted: boolean;
}

interface IFilterStateBase {
    types: ObjectType[];
    origin: ObjectOrigin;
    createdBy: IFilterParams<string[]>;
    tags: IFilterParams<string[]>;
    qualityCodes: IFilterParams<SemanticQualityIssueCode[]>;
    isHidden: boolean | undefined;
}

interface IFilterState extends IFilterStateBase {
    // Derived state
    isModified: boolean;
}

interface IFilterActions {
    // Setters
    setTypes: (types: ObjectType[]) => void;
    setOrigin: (origin: ObjectOrigin) => void;
    setCreatedBy: (params: IFilterParams<string[]>) => void;
    setTags: (params: IFilterParams<string[]>) => void;
    setQualityCodes: (params: IFilterParams<SemanticQualityIssueCode[]>) => void;
    setIsHidden: (isHidden: boolean | undefined) => void;
    // Actions
    reset: () => void;
    toggleTag: (tag: string) => void;
}

type FilterReducerAction =
    | { type: "setTypes"; payload: ObjectType[] }
    | { type: "setOrigin"; payload: ObjectOrigin }
    | { type: "setCreatedBy"; payload: IFilterParams<string[]> }
    | { type: "setTags"; payload: IFilterParams<string[]> }
    | { type: "setQualityCodes"; payload: IFilterParams<SemanticQualityIssueCode[]> }
    | { type: "setIsHidden"; payload: boolean | undefined }
    | { type: "reset" }
    | { type: "toggleTag"; payload: string };

const initialState: IFilterStateBase = {
    types: [],
    origin: "ALL",
    createdBy: { values: [], isInverted: true },
    tags: { values: [], isInverted: true },
    qualityCodes: { values: [], isInverted: true },
    isHidden: undefined,
};

const initialFullState: IFilterState = {
    ...initialState,
    // Derived state
    isModified: false,
};

const initialActions: IFilterActions = {
    // Setters
    setTypes: () => {},
    setOrigin: () => {},
    setCreatedBy: () => {},
    setTags: () => {},
    setQualityCodes: () => {},
    setIsHidden: () => {},
    // Actions
    reset: () => {},
    toggleTag: () => {},
};

const FilterStateContext = createContext<IFilterState>(initialFullState);
const FilterActionsContext = createContext<IFilterActions>(initialActions);

export function FilterProvider({ children }: PropsWithChildren) {
    const [filters, dispatch] = useReducer(filterReducer, initialState);

    const state: IFilterState = useMemo(
        () => ({
            ...filters,
            // Derived state
            isModified: !isEqual(filters, initialState),
        }),
        [filters],
    );

    const actions: IFilterActions = useMemo(
        () => ({
            setTypes: (types) => dispatch({ type: "setTypes", payload: types }),
            setOrigin: (origin) => dispatch({ type: "setOrigin", payload: origin }),
            setCreatedBy: (params) => dispatch({ type: "setCreatedBy", payload: params }),
            setTags: (params) => dispatch({ type: "setTags", payload: params }),
            setQualityCodes: (params) => dispatch({ type: "setQualityCodes", payload: params }),
            setIsHidden: (hidden) => dispatch({ type: "setIsHidden", payload: hidden }),
            reset: () => dispatch({ type: "reset" }),
            toggleTag: (tag) => dispatch({ type: "toggleTag", payload: tag }),
        }),
        [],
    );

    return (
        <FilterStateContext.Provider value={state}>
            <FilterActionsContext.Provider value={actions}>{children}</FilterActionsContext.Provider>
        </FilterStateContext.Provider>
    );
}

function filterReducer(state: IFilterStateBase, action: FilterReducerAction): IFilterStateBase {
    switch (action.type) {
        // Setters
        case "setTypes": {
            if (isEqual(state.types, action.payload)) return state;
            return { ...state, types: action.payload };
        }
        case "setOrigin": {
            if (isEqual(state.origin, action.payload)) return state;
            return { ...state, origin: action.payload };
        }
        case "setCreatedBy": {
            if (isEqual(state.createdBy, action.payload)) return state;
            return { ...state, createdBy: action.payload };
        }
        case "setTags": {
            if (isEqual(state.tags, action.payload)) return state;
            return { ...state, tags: action.payload };
        }
        case "setQualityCodes": {
            if (isEqual(state.qualityCodes, action.payload)) return state;
            return { ...state, qualityCodes: action.payload };
        }
        case "setIsHidden": {
            if (isEqual(state.isHidden, action.payload)) return state;
            return { ...state, isHidden: action.payload };
        }
        // Actions
        case "reset": {
            return initialState;
        }
        case "toggleTag": {
            const tag = action.payload;
            const tags = state.tags.values;
            const nextTags = tags.includes(tag)
                ? tags.filter((currentTag) => currentTag !== tag)
                : [...tags, tag];
            return {
                ...state,
                tags: {
                    values: nextTags,
                    isInverted: nextTags.length === 0,
                },
            };
        }
        default: {
            return state;
        }
    }
}

export function useFilterState() {
    return useContext(FilterStateContext);
}

export function useFilterActions() {
    return useContext(FilterActionsContext);
}

/**
 * Hook that returns the derived quality ids from the quality codes filter state.
 */
export function useQualityFilter(): IFilterParams<Identifier[]> | undefined {
    const { qualityCodes } = useFilterState();
    const { issues } = useQualityReportState();
    const { values, isInverted } = qualityCodes;

    return useMemo(() => {
        if (values.length === 0 || issues.length === 0) {
            return undefined;
        }

        // Special handling for the artificial NONE option
        if (values.includes(SemanticQualityIssueCodeValues.NONE)) {
            const includedIds = getQualityIssueIdsByCodes(issues, values, "included");
            const excludedIds = getQualityIssueIdsByCodes(issues, values, "excluded");
            const ids = excludedIds.filter((id) => !includedIds.includes(id));
            return { values: ids, isInverted: !isInverted };
        }

        const ids = getQualityIssueIdsByCodes(issues, values, isInverted ? "excluded" : "included");
        return { values: ids, isInverted };
    }, [isInverted, values, issues]);
}
