// (C) 2019-2023 GoodData Corporation

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
     * Indicates whether backend supports bootstrap resource that returns initial app data.
     */
    supportsBootstrapResource?: boolean;

    /**
     * Indicates whether backends supports locking of metadata objects that prevents their edit by other
     * users than admins.
     */
    supportsMetadataObjectLocking?: boolean;

    /**
     * Indicates whether backend supports granular access controls of metadata objects or if permissions
     * are tied to the user role.
     */
    supportsGranularAccessControl?: boolean;

    /**
     * Indicates whether backend supports virtual "Everyone" group that is used when we want
     * to assign permissions for all current and future users of the platform.
     */
    supportsEveryoneUserGroupForAccessControl?: boolean;

    /**
     * Indicates whether backend supports non production data sets.
     */
    supportsNonProductionDatasets?: boolean;

    /**
     * Indicates whether backend supports executions listing all attribute values
     */
    supportsShowAllAttributeValues?: boolean;

    /**
     * Indicates whether backend supports separate numerical labels (display forms) for geo chart's latitude and longitude.
     * If false, string label with "latitude;longitude" values is expected.
     */
    supportsSeparateLatitudeLongitudeLabels?: boolean;

    /**
     * Indicates whether backends supports displaying message to inform workspace managers about having
     * access to the shared object.
     */
    canWorkspaceManagerSeeEverySharedObject?: boolean;

    /**
     * Indicates whether dackend supports enumerating datetime attributes.
     */
    supportsEnumeratingDatetimeAttributes?: boolean;

    /**
     * Indicates whether the UI supports hidden and locked filters.
     *
     * If set to true, the user interface (UI) provides functionality for managing hidden
     * and locked filters. If set to false or undefined, the UI does not support these features.
     */
    supportsHiddenAndLockedFiltersOnUI?: boolean;

    /**
     * Indicates whether the UI supports multiple interactions per attribute and measure.
     *
     * IF set to true, the user interface (UI) provides functionality for managing multiple interactions per attribute and measure.
     * If set to false or undefined, the UI does not support these features.
     */
    allowMultipleInteractionsPerAttributeAndMeasure?: boolean;

    /**
     * Indicates whether the UI supports attribute hierarchies.
     *
     * If set to true, the user interface (UI) provides functionality for managing attribute hierarchies
     * If set to false or undefined, the UI does not support attribute hierarchies features.
     */
    supportsAttributeHierarchies?: boolean;

    /**
     * Indicates whether backend supports setting connecting attribute in dependent filters.
     */
    supportsSettingConnectingAttributes?: boolean;

    /**
     * Indicates whether backend supports to keep selection of dependent filters.
     */
    supportsKeepingDependentFiltersSelection?: boolean;

    /**
     * Indicates whether backend supports to circular dependencies in dependent filters.
     */
    supportsCircularDependencyInFilters?: boolean;

    /**
     * Indicates whether backend supports to show elements filtered out by limiting filters.
     */
    supportsShowingFilteredElements?: boolean;

    /**
     * Indicates whether backend supports to set dependencies for single-select filters.
     */
    supportsSingleSelectDependentFilters?: boolean;

    /**
     * Indicates whether backend supports cross filtering.
     */
    supportsCrossFiltering?: boolean;

    /**
     * Catchall for additional capabilities
     */
    [key: string]: undefined | boolean | number | string;
}
