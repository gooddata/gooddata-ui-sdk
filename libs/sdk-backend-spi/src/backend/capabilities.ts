// (C) 2019-2022 GoodData Corporation

/**
 * Analytical Backend communicates its capabilities via objects of this type. In return, the capabilities
 * can then be used by applications to enable / disable particular features.
 *
 * @public
 */
export interface IBackendCapabilities {
    /**
     * Indicates whether the backend is capable to address objects using URIs
     */
    supportsObjectUris?: boolean;

    /**
     * Indicates whether the backend is capable to calculate and include totals in the resulting data view.
     */
    canCalculateTotals?: boolean;

    /**
     * Indicates whether the backend is capable to calculate and include grand totals in the resulting data view.
     */
    canCalculateGrandTotals?: boolean;

    /**
     * Indicates whether the backend is capable to calculate and include subtotals in the resulting data view.
     */
    canCalculateSubTotals?: boolean;

    /**
     * Indicates whether the backend is capable to calculate and include native totals (aka rollups) in the resulting data view.
     */
    canCalculateNativeTotals?: boolean;

    /**
     * Indicates whether the backend is capable to sort the result data view.
     */
    canSortData?: boolean;

    /**
     * Indicates whether the backend can recognize attribute elements by URI.
     */
    supportsElementUris?: boolean;

    /**
     * Indicates maximum result dimensions that the backend is able to produce.
     */
    maxDimensions?: number;

    /**
     * Indicates whether backend can export data to CSV file.
     */
    canExportCsv?: boolean;

    /**
     * Indicates whether backend can export data to Excel.
     */
    canExportXlsx?: boolean;

    /**
     * Indicates whether backend can transform an existing result into a different shape / sorting / totals.
     */
    canTransformExistingResult?: boolean;

    /**
     * Indicates whether backend can execute an existing, persistent insight by reference.
     */
    canExecuteByReference?: boolean;

    /**
     * Indicates whether backend supports adding CSV datasets and switching between them.
     */
    supportsCsvUploader?: boolean;

    /**
     * Indicates whether backend supports ranking filters.
     */
    supportsRankingFilter?: boolean;

    /**
     * Indicates whether backend supports ranking filters in combination with measure value filters (in the same execution).
     */
    supportsRankingFilterWithMeasureValueFilter?: boolean;

    /**
     * Indicates whether backend supports element query parent filtering.
     */
    supportsElementsQueryParentFiltering?: boolean;

    /**
     * Indicates whether backend supports a special dashboard-specific KPI Widget.
     */
    supportsKpiWidget?: boolean;

    /**
     * Indicates whether backend supports Widget as standalone addressable entity.
     */
    supportsWidgetEntity?: boolean;

    /**
     * Indicates whether backend supports hyperlink attribute labels.
     */
    supportsHyperlinkAttributeLabels?: boolean;

    /**
     * Indicates whether backend supports returning of the valid elements (values) for generic date attributes (Day of Week, Month of Year, etc.).
     */
    supportsGenericDateAttributeElements?: boolean;

    /**
     * Indicates whether backend supports downloading of files that will be used for debugging.
     * Indicates whether backend supports retrieving of data that will be used for debugging.
     */
    supportsExplain?: boolean;

    /**
     * Indicates whether backend's identifiers are scoped to a type.
     *
     * @remarks
     * They are unique only on type level. When working with backend that has type scoped identifiers it is essential to provide
     * both `identifier` and `type` when using `IdentifierRef`.
     *
     * If not specified then assume identifiers do not require `type` information in order to exactly identify an object.
     */
    hasTypeScopedIdentifiers?: boolean;

    /**
     * Indicates whether backend supports control of access to the MD objects
     */
    supportsAccessControl?: boolean;

    /**
     * Indicates whether backend supports only strict access control.
     *
     * @remarks
     * It means that no one without proper permissions is able to get restricted MD object even knowing its URI.
     */
    usesStrictAccessControl?: boolean;

    /**
     * Indicates whether backend supports filtering object by owner/creator.
     */
    supportsOwners?: boolean;

    /**
     * Indicates whether backend allows objects with damaged references.
     */
    allowsInconsistentRelations?: boolean;

    /**
     * Indicates whether backend supports time granularities (gdc.time.minute, gdc.time.hour);
     */
    supportsTimeGranularities?: boolean;

    /**
     * Indicates whether backend supports hierarchical workspaces
     */
    supportsHierarchicalWorkspaces?: boolean;

    /**
     * Indicates whether backend supports custom color palettes.
     */
    supportsCustomColorPalettes?: boolean;

    /**
     * Indicates whether backend supports organization settings.
     */
    supportsOrganizationSettings?: boolean;

    /**
     * Indicates whether backend supports inline measures in execution.
     */
    supportsInlineMeasures?: boolean;

    /**
     * Catchall for additional capabilities
     */
    [key: string]: undefined | boolean | number | string;
}
