// (C) 2007-2021 GoodData Corporation
import { BooleanAsString, Timestamp, Email, Uri, TimeIso8601, DateString } from "../aliases";
import { GdcMetadata } from "../meta/GdcMetadata";

/**
 * @public
 */
export namespace GdcUser {
    export interface IAccountSetting {
        login?: Email | null;
        email?: Email | null;
        licence?: BooleanAsString;
        firstName: string;
        lastName: string;
        companyName?: string | null;
        position?: string | null;
        created?: Timestamp;
        updated?: Timestamp;
        timezone?: number | null;
        country?: string | null;
        phoneNumber?: string | null;
        old_password?: string;
        password?: string;
        verifyPassword?: string;
        authenticationModes?: Array<"SSO" | "PASSWORD">;
        ssoProvider?: string | null;
        language?: string;
        ipWhitelist?: string[] | null;
        effectiveIpWhitelist?: string[] | null;
        links?: {
            projects?: Uri;
            self?: Uri;
            domain?: Uri;
            auditEvents?: Uri;
        };
    }

    export interface IWrappedAccountSetting {
        accountSetting: IAccountSetting;
    }

    export interface IProfileSetting {
        currentProjectUri: Uri | null;
        releaseNotice: string[];
        hints: {
            [key: string]: boolean;
        };
        navigationState?: "collapsed" | "pinned" | "floating";
        projectSettings: {
            [projectUri: string]: {
                dashboard: Uri | null;
                tab: string | null;
                recentSearches: string[];
                introDisplayed?: boolean;
                manageReportsSettings?: {
                    folder?: string;
                    orderBy?: number;
                    tags?: string[];
                };
            };
        };
        npsLastParticipation?: Timestamp;
        separators?: ISeparators;
        defaults?: {
            projectUri: string;
            dashboardUri?: string;
            tabId?: string;
            links?: {
                self: Uri;
            };
        };
        links?: {
            self: Uri;
            profile: Uri;
        };
    }

    export interface IUISettings {
        applicationTitle: string;
        faviconUrl?: Uri | null;
        organizationName: string;
        displayFlashNews: boolean;
        logoUrl: Uri;
        displayProjects: boolean;
        displayAccountPage: boolean;
        isBranded: boolean;
        supportEmail?: string;
        supportForumUrl?: string;
        privacyPolicyUrl?: Uri;
        documentationUrl?: string;
        securityStatementUrl?: Uri;
        termsOfUseUrl?: Uri;
        trustUrl?: Uri;
        appleTouchIconUrl?: Uri;
        applicationBackgroundColor?: string;
        applicationBackgroundUrl?: Uri;
        skipClientRedirect?: boolean;
        hideRegistration?: boolean;
        largeLogoUrl?: Uri;
        brandColor?: string;
        headerColor?: string;
        activeColor?: string;
        highlightColor?: string;
        headerTextColor?: string;
        useOnboarding?: boolean;
        displayNPS?: boolean;
        walkMe?: string;
        walkMeEnvironment?: string;
        includeTrialSnippet?: string;
        ssoLogoutUrl?: Uri;
        ssoExpiredUrl?: Uri;
        ssoUnauthorizedUrl?: Uri;
        showSSOCustomUnauthorizedLoginPage?: boolean;
        showServiceProviderInitiatedLogin?: boolean;
    }

    export type ProjectPermission =
        | "canAccessIntegration"
        | "canAccessWorkbench"
        | "canAssignUserWithRole"
        | "canCreateAnalyticalDashboard"
        | "canCreateAttribute"
        | "canCreateAttributeGroup"
        | "canCreateAttributeLabel"
        | "canCreateColumn"
        | "canCreateComment"
        | "canCreateDataSet"
        | "canCreateDomain"
        | "canCreateETLFile"
        | "canCreateExecutionContext"
        | "canCreateFact"
        | "canCreateFilterSettings"
        | "canCreateFolder"
        | "canCreateHelp"
        | "canCreateMetric"
        | "canCreateProjectDashboard"
        | "canCreateProjectTemplates"
        | "canCreatePrompt"
        | "canCreateReport"
        | "canCreateReportDefinition"
        | "canCreateRole"
        | "canCreateScheduledMail"
        | "canCreateTable"
        | "canCreateTableDataLoad"
        | "canCreateVisualization"
        | "canCreateVisualizationClass"
        | "canEnrichData"
        | "canExecute"
        | "canExecuteRaw"
        | "canExportDashboard"
        | "canExportReport"
        | "canInitData"
        | "canInviteUserToProject"
        | "canListInvitationsInProject"
        | "canListUsersInProject"
        | "canMaintainProject"
        | "canMaintainUserFilter"
        | "canMaintainUserFilterRelation"
        | "canManageACL"
        | "canManageAnalyticalDashboard"
        | "canManageAttribute"
        | "canManageAttributeGroup"
        | "canManageAttributeLabel"
        | "canManageColumn"
        | "canManageComment"
        | "canManageDataSet"
        | "canManageDomain"
        | "canManageETLFile"
        | "canManageExecutionContext"
        | "canManageFact"
        | "canManageFilterSettings"
        | "canManageFolder"
        | "canManageHelp"
        | "canManageIntegration"
        | "canManageIsProduction"
        | "canManageMetric"
        | "canManageProject"
        | "canManageProjectDashboard"
        | "canManagePrompt"
        | "canManagePublicAccessCode"
        | "canManageReport"
        | "canManageReportDefinition"
        | "canManageScheduledMail"
        | "canManageTable"
        | "canManageTableDataLoad"
        | "canManageTranslations"
        | "canManageVisualization"
        | "canRefreshData"
        | "canSeeOtherUserDetails"
        | "canSeePublicAccessCode"
        | "canSetLocale"
        | "canSetProjectVariables"
        | "canSetStyle"
        | "canSetUserVariables"
        | "canSuspendUserFromProject"
        | "canUploadNonProductionCSV"
        | "canValidateProject";

    export interface ISeparators {
        decimal: string;
        thousand: string;
    }

    export interface IFeatureFlags {
        [key: string]: number | boolean | string;
    }

    export interface IProjectPermissions {
        permissions: {
            [permission in ProjectPermission]?: BooleanAsString;
        };
        links?: {
            project: Uri;
            user: Uri;
        };
    }

    export interface IProject {
        meta: GdcMetadata.IObjectMeta;
        content: {
            guidedNavigation: BooleanAsString;
            authorizationToken?: string | null;
            state?:
                | "PREPARING"
                | "PREPARED"
                | "LOADING"
                | "ENABLED"
                | "DISABLED"
                | "DELETED"
                | "ARCHIVED"
                | "MIGRATED";
            isPublic?: BooleanAsString;
            cluster?: string;
            driver?: "mysql" | "Pg" | "vertica";
            environment?: "PRODUCTION" | "DEVELOPMENT" | "TESTING";
        };
        links?: {
            self: Uri;
            users: Uri;
            userRoles?: Uri;
            userPermissions?: Uri;
            roles: Uri;
            invitations: Uri;
            ldm: Uri;
            ldm_thumbnail: Uri;
            metadata: Uri;
            publicartifacts: Uri;
            uploads?: Uri;
            templates: Uri;
            connectors: Uri;
            dataload: Uri;
            schedules: Uri;
            execute: Uri;
            clearCaches: Uri;
            projectFeatureFlags: Uri;
            config?: Uri;
        };
    }

    export interface IStatus {
        code:
            | "NEW"
            | "SCHEDULED"
            | "DOWNLOADING"
            | "DOWNLOADED"
            | "TRANSFORMING"
            | "TRANSFORMED"
            | "UPLOADING"
            | "UPLOADED"
            | "SYNCHRONIZED"
            | "ERROR"
            | "USER_ERROR";
        detail: string;
        description: string;
    }

    export interface ITemplateInfo {
        version: string;
        url: Uri | null;
        urn: string;
        connectorId?: string;
        createIntegration?: string;
    }

    export interface IProjectIcons {
        icon: string;
        integration: Uri;
    }

    export type DataUploadStatus = "PREPARED" | "RUNNING" | "OK" | "ERROR" | "WARNING";

    export interface IDataUploadInfo {
        statusesCount: {
            [status in DataUploadStatus]?: number;
        };
    }

    export interface IProcessBody {
        links: {
            self: Uri;
        };
        status: IStatus;
        started: TimeIso8601;
        finished: TimeIso8601;
    }

    export interface IZendesk4Integration {
        projectTemplate: Uri;
        active: boolean;
        lastFinishedProcess?: IProcessBody | null;
        lastSuccessfulProcess?: IProcessBody | null;
        runningProcess?: IProcessBody | null;
        links?: {
            self: Uri;
            processes: Uri;
            configuration: Uri;
        };
        ui?: object;
    }

    export interface IIntegration {
        projectTemplate: Uri;
        active: boolean;
    }

    export interface IStyleSettingsType {
        chartPalette: Array<{
            guid: string; // 1 - 256
            fill: {
                r: number;
                g: number;
                b: number;
            };
        }>;
        chartFont?: {
            family: string;
        };
    }

    export interface ITimezoneInfo {
        id: string;
        displayName: string;
        shortDisplayName: string;
        currentOffsetMs: number;
    }

    export interface IProjectLcm {
        clientId?: string;
        dataProductId?: string;
        segmentId?: string;
    }

    export interface IBootstrapResource {
        bootstrapResource: {
            accountSetting: IAccountSetting;
            profileSetting: IProfileSetting;
            hostnameBase: string;
            settings?: IUISettings;
            current?: {
                mapboxToken?: string;
                project: IProject | null;
                projectLcm?: IProjectLcm;
                featureFlags?: IFeatureFlags;
                projectPermissions: IProjectPermissions | null;
                projectTemplates: ITemplateInfo[] | null;
                projectIcons: IProjectIcons[] | null;
                dataUploadsInfo: IDataUploadInfo | null;
                loginMD5: string | null;
                integrations: Array<IIntegration | IZendesk4Integration>;
                projectStyleSettings?: IStyleSettingsType | null;
                clusterStatus?: "ONLINE" | "OFFLINE";
                requiresRedirect: boolean;
                timezone: ITimezoneInfo | null;
                analyticalDashboards?: Uri[] | null;
                walkMe?: string | null;
                walkMeEnvironment?: string | null;
                includeTrialSnippet?: string | null;
                clientSecret?: string;
                user?: {
                    passwordExpirationTimestamp?: DateString;
                };
            };
        };
    }

    export type UserListItemState = "ACTIVE" | "INACTIVE" | "PENDING";

    export interface IUserListItem {
        uri: Uri;
        login: Email;
        email: Email;
        firstName?: string | null;
        lastName?: string | null;
        roles?: Uri[];
        state?: UserListItemState;
        hasRequestedPermissions?: boolean;
    }

    /**
     * Request params for GET /gdc/project/\{projectId\}/userlist
     */
    export interface IGetUserListParams {
        /**
         * Sets starting point for the query. Backend WILL return no data if the offset is greater than
         * total number of items
         */
        offset?: number;
        /**
         * Sets number of items to return per page
         */
        limit?: number;
        /**
         * Structured prefix filter
         * - disjunctions are separated by colon (',')
         * - conjunctions are separated by space (' ')
         * - basic form match, if it matches as prefix to any of firstName, lastName and email
         */
        prefixSearch?: string;
        /**
         * Get only active / inactive / pending users
         * Default: "ACTIVE"
         */
        userState: UserListItemState;
        /**
         * Get only users of particular group
         * - empty string means to filter users not assigned to any group
         */
        groupId?: string;
        /**
         * When specified, each user list item will contain a flag that indicates
         * whether the particular user has the permission specified here or not.
         */
        indicatePermission?: string;
    }

    /**
     * Response for GET /gdc/project/\{projectId\}/userlist
     */
    export interface IGetUserListResponse {
        userList: {
            paging: {
                offset?: number | null;
                limit: number;
                next?: Uri | null;
                count: number;
                totalCount: number;
            };
            items: IUserListItem[];
        };
    }

    /**
     * Response for GET /gdc/account/profile/\{userId\}/settings/separators
     */
    export interface ISeparatorsResponse {
        separators: {
            decimal: string;
            thousand: string;
            links: {
                self: string;
            };
        };
    }

    export type UsersItemStatus = "ENABLED" | "DISABLED";

    export interface IUsersItem {
        content: {
            status?: UsersItemStatus;
            firstname?: string;
            lastname?: string;
            email?: Email;
            login?: Email;
            phonenumber?: string;
        };
        links?: {
            self: Uri;
            roles?: Uri;
            permissions?: Uri;
            projectRelUri?: Uri;
        };
    }
}
