// (C) 2020 GoodData Corporation

/**
 * SDK descriptor
 */
export type SdkDescriptor = {
    /**
     * Absolute path to the root directory where SDK is located.
     */
    root: string;

    /**
     * Mapping of package name to SDK Package
     */
    packages: Record<string, SdkPackageDescriptor>;

    /**
     * Mapping of package dir (relative to SDK root) to SDK Package.
     */
    packagesByDir: Record<string, SdkPackageDescriptor>;

    /**
     * Inter-package dependency graph
     */
    dependencyGraph: DependencyGraph;
};

/**
 * SDK Package descriptor
 */
export type SdkPackageDescriptor = {
    /**
     * Type of package (library or tool)
     */
    type: "lib" | "tool";

    /**
     * Package name (@gooddata/api-client-bear)
     */
    packageName: string;

    /**
     * Absolute path to the package directory.
     */
    directory: string;

    /**
     * Package's installation directory, split to segments (['@gooddata', 'api-client-bear']
     */
    installDir: string[];

    /**
     * Package metadata from `rush.json`.
     */
    rushPackage: RushPackageDescriptor;
};

/**
 * Rush package metadata
 */
export type RushPackageDescriptor = {
    /**
     * Package name
     */
    packageName: string;

    /**
     * Relative path to the package folder (libs/api-client-bear)
     */
    projectFolder: string;

    /**
     * 3rd party dependency review category
     */
    reviewCategory: string;

    /**
     * Versioning policy name
     */
    versionPolicyName: string;

    /**
     * Indicates whether package should be published.
     */
    shouldPublish: boolean;
};

/**
 * Dependency graph between packages
 */
export type DependencyGraph = {
    /**
     * All nodes in the graph.
     */
    nodes: string[];

    /**
     * Nodes in a set for quick lookups.
     */
    nodesSet: Set<string>;

    /**
     * All edges - dependencies between packages.
     */
    edges: Dependency[];

    /**
     * Outgoing edges for each node. E.g. edges grouped by 'from'.
     */
    outgoing: Record<string, Dependency[]>;

    /**
     * Incoming edges for each node. E.g. edges grouped by 'to'.
     */
    incoming: Record<string, Dependency[]>;
};

export type DependencyType = "prod" | "dev" | "peer";

export const AllDepdencyTypes: DependencyType[] = ["prod", "dev", "peer"];

/**
 * Dependency between SDK packages.
 */
export type Dependency = {
    /**
     * Package which has dependency.
     */
    from: string;

    /**
     * The dependent package
     */
    to: string;

    /**
     * Type of dependency.
     */
    type: DependencyType;
};
