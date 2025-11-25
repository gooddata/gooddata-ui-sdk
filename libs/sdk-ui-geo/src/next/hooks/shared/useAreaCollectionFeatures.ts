// (C) 2025 GoodData Corporation

import { Dispatch, MutableRefObject, SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { IAnalyticalBackend, ICollectionItemsResult } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IGeoJsonFeature,
    ObjRef,
    attributeDisplayFormRef,
    isIdentifierRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { DataViewFacade, useBackend, useWorkspace } from "@gooddata/sdk-ui";

import { deriveCollectionBoundingBox } from "./geoCollectionBoundingBox.js";
import { IGeoCollectionMetadata, getLocationCollectionMetadata } from "../../utils/geoCollection.js";

interface IGeoCollectionOverride {
    collectionId?: string;
}

const COLLECTION_OVERRIDES: Record<string, IGeoCollectionOverride> = {
    region: {
        collectionId: "regions",
    },
};

function normalizeGeoCollectionMetadata(collectionId: string): { collectionId: string } {
    const override = COLLECTION_OVERRIDES[collectionId];

    if (!override) {
        return { collectionId };
    }

    return {
        collectionId: override.collectionId ?? collectionId,
    };
}

type CollectionStatus = "idle" | "loading" | "success" | "error";

interface ICollectionState {
    status: CollectionStatus;
    result?: ICollectionItemsResult;
    error?: unknown;
}

export interface IAreaCollectionFeatures {
    /**
     * Fetch status of the geo collection request.
     */
    status: CollectionStatus;
    /**
     * Loaded geo collection metadata (if any).
     */
    metadata?: IGeoCollectionMetadata;
    /**
     * Resolved GeoJSON features from the backend.
     */
    features?: IGeoJsonFeature[];
    /**
     * Bounding box covering the fetched features.
     */
    bbox?: number[];
    /**
     * Error from the last fetch attempt (if any).
     */
    error?: unknown;
}

function resolveareaDisplayFormRef(locationAttribute: IAttribute | undefined): ObjRef | undefined {
    if (!locationAttribute) {
        return undefined;
    }

    return attributeDisplayFormRef(locationAttribute);
}

function ensureIdleState(prev: ICollectionState): ICollectionState {
    if (prev.status === "idle" && !prev.result && !prev.error) {
        return prev;
    }

    return { status: "idle" };
}

interface IMetadataFetchArgs {
    backend?: IAnalyticalBackend;
    workspace?: string;
    areaDisplayFormRef?: ObjRef;
    fetchedMetadata: IGeoCollectionMetadata | null | undefined;
    metadataFromExecution?: IGeoCollectionMetadata;
    setFetchedMetadata: Dispatch<SetStateAction<IGeoCollectionMetadata | null | undefined>>;
}

function fetchCollectionMetadata(args: IMetadataFetchArgs): (() => void) | void {
    const {
        backend,
        workspace,
        areaDisplayFormRef,
        fetchedMetadata,
        metadataFromExecution,
        setFetchedMetadata,
    } = args;

    if (metadataFromExecution || !backend || !workspace || fetchedMetadata !== undefined) {
        return;
    }

    if (!areaDisplayFormRef) {
        return;
    }

    if (!isIdentifierRef(areaDisplayFormRef)) {
        setFetchedMetadata(null);
        return;
    }

    let cancelled = false;

    backend
        .workspace(workspace)
        .attributes()
        .getAttributeDisplayForm(areaDisplayFormRef)
        .then((displayForm) => {
            if (cancelled) {
                return;
            }

            const geoAreaConfig = displayForm.geoAreaConfig;
            if (geoAreaConfig?.collectionId) {
                const normalized = normalizeGeoCollectionMetadata(geoAreaConfig.collectionId);

                setFetchedMetadata(normalized);
            } else {
                setFetchedMetadata(null);
            }
        })
        .catch((_error) => {
            if (cancelled) {
                return;
            }

            setFetchedMetadata(null);
        });

    return () => {
        cancelled = true;
    };
}

function resolveMetadata(
    metadataFromExecution: IGeoCollectionMetadata | undefined,
    fetchedMetadata: IGeoCollectionMetadata | null | undefined,
): IGeoCollectionMetadata | undefined {
    if (metadataFromExecution) {
        return metadataFromExecution;
    }

    return fetchedMetadata === null ? undefined : fetchedMetadata;
}

function buildCacheKey(
    fingerprint: string | undefined,
    metadata: IGeoCollectionMetadata | undefined,
): string | undefined {
    if (!fingerprint || !metadata) {
        return undefined;
    }

    return [fingerprint, metadata.collectionId].join("|");
}

interface ICollectionItemsArgs {
    cacheKey?: string;
    cacheRef: MutableRefObject<Map<string, ICollectionItemsResult>>;
    dataView: DataViewFacade | null;
    locationAttribute: IAttribute | undefined;
    metadata: IGeoCollectionMetadata | undefined;
    setState: Dispatch<SetStateAction<ICollectionState>>;
}

function fetchCollectionItems(args: ICollectionItemsArgs): (() => void) | void {
    const { cacheKey, cacheRef, dataView, locationAttribute, metadata, setState } = args;

    if (!dataView || !locationAttribute || !metadata || !cacheKey) {
        setState(ensureIdleState);
        return;
    }

    if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        setState({
            status: "success",
            result: cached,
        });
        return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    dataView
        .getCollectionItemsForAttribute(locationAttribute, {
            collectionId: metadata.collectionId,
        })
        .then((result) => {
            if (cancelled) {
                return;
            }

            cacheRef.current.set(cacheKey, result);
            setState({
                status: "success",
                result,
            });
        })
        .catch((error) => {
            if (cancelled) {
                return;
            }

            setState({
                status: "error",
                error,
            });
        });

    return () => {
        cancelled = true;
    };
}

function buildResult(
    metadata: IGeoCollectionMetadata | undefined,
    state: ICollectionState,
): IAreaCollectionFeatures {
    if (!metadata) {
        return {
            status: "idle",
        };
    }

    if (state.status === "success") {
        const bbox = deriveCollectionBoundingBox(state.result?.features, state.result?.bbox);

        return {
            status: "success",
            metadata,
            features: state.result?.features ?? [],
            bbox,
        };
    }

    if (state.status === "error") {
        return {
            status: "error",
            metadata,
            error: state.error,
        };
    }

    return {
        status: state.status,
        metadata,
    };
}

/**
 * Loads geo collection geometries for the area location attribute.
 *
 * @remarks
 * The hook deduplicates requests using a local cache keyed by the execution fingerprint and collection metadata.
 * If the necessary metadata are missing, the hook stays idle and returns no features.
 *
 * @param dataView - Initial execution data view
 * @param locationAttribute - Attribute used for area locations
 * @returns collection features state
 *
 * @alpha
 */
export function useAreaCollectionFeatures(
    dataView: DataViewFacade | null,
    locationAttribute: IAttribute | undefined,
    backendOrUndefined?: IAnalyticalBackend,
    workspaceOrUndefined?: string,
): IAreaCollectionFeatures {
    const backendFromContext = useBackend();
    const workspaceFromContext = useWorkspace();
    const backend = backendOrUndefined ?? backendFromContext;
    const workspace = workspaceOrUndefined ?? workspaceFromContext;
    const metadataFromExecution = useMemo(() => {
        const raw = getLocationCollectionMetadata(dataView);
        if (!raw) {
            return undefined;
        }

        return normalizeGeoCollectionMetadata(raw.collectionId);
    }, [dataView]);
    const areaDisplayFormRef = useMemo(
        () => resolveareaDisplayFormRef(locationAttribute),
        [locationAttribute],
    );
    const areaDisplayFormRefKey = useMemo(
        () => (areaDisplayFormRef ? objRefToString(areaDisplayFormRef) : ""),
        [areaDisplayFormRef],
    );
    const [fetchedMetadata, setFetchedMetadata] = useState<IGeoCollectionMetadata | null | undefined>(
        undefined,
    );
    const fingerprint = dataView?.fingerprint();
    const cacheRef = useRef(new Map<string, ICollectionItemsResult>());
    const [state, setState] = useState<ICollectionState>({ status: "idle" });

    useEffect(() => {
        setFetchedMetadata(undefined);
    }, [areaDisplayFormRefKey, metadataFromExecution]);

    useEffect(() => {
        return fetchCollectionMetadata({
            backend,
            workspace,
            areaDisplayFormRef,
            fetchedMetadata,
            metadataFromExecution,
            setFetchedMetadata,
        });
    }, [backend, workspace, areaDisplayFormRef, fetchedMetadata, metadataFromExecution]);

    const metadata = resolveMetadata(metadataFromExecution, fetchedMetadata);
    const cacheKey = useMemo(() => buildCacheKey(fingerprint, metadata), [fingerprint, metadata]);

    useEffect(() => {
        return fetchCollectionItems({
            cacheKey,
            cacheRef,
            dataView,
            locationAttribute,
            metadata,
            setState,
        });
    }, [cacheKey, dataView, locationAttribute, metadata]);

    return buildResult(metadata, state);
}
