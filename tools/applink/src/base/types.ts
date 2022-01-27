// (C) 2020 GoodData Corporation

/**
 * Descriptor for package sources
 */
export type SourceDescriptor = {
    /**
     * Absolute path to the root directory where SDK is located.
     */
    root: string;

    /**
     * Mapping of package name to SDK Package
     */
    packages: Record<string, PackageDescriptor>;

    /**
     * Mapping of package dir (relative to SDK root) to SDK Package.
     */
    packagesByDir: Record<string, PackageDescriptor>;

    /**
     * Inter-package dependency graph
     */
    dependencyGraph: DependencyGraph;
};

/**
 * SDK Package descriptor
 */
export type PackageDescriptor = {
    /**
     * Package name (e.g. `@gooddata/api-client-bear`)
     */
    packageName: string;

    /**
     * Absolute path to the package directory.
     */
    directory: string;

    /**
     * Package's installation directory, split to segments (e.g. `['@gooddata', 'api-client-bear']`)
     */
    installDir: string[];

    /**
     * Package's package.json - as read directly from the package's directory.
     */
    packageJson: PackageJson;

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
 * Minimalistic typing for the package json. Contains just the properties that applink needs.
 */
export type PackageJson = {
    version: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    files?: string[];
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

export type TargetDescriptor = {
    /**
     * Absolute path to the directory in which the target resides.
     */
    root: string;

    /**
     * All dependencies on source packages which were found in the target's node_modules
     */
    dependencies: TargetDependency[];
};

/**
 * Describes application's dependency on an SDK library.
 */
export type TargetDependency = {
    /**
     * Absolute path to the directory within app's node_modules where the SDK dependency is installed
     */
    directory: string;

    /**
     * The version of installed dependency.
     */
    version: string;

    /**
     * Package JSON of the installed package.
     */
    packageJson: PackageJson;

    /**
     * Full information about the source SDK package on which the app depends.
     */
    pkg: PackageDescriptor;
};
