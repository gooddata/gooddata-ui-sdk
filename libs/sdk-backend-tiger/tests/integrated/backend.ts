// (C) 2022 GoodData Corporation

import {
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    IAnalyticalBackend,
    IAuthenticationProvider,
} from "@gooddata/sdk-backend-spi";
import tigerFactory, { TigerAuthProviderBase, TigerTokenAuthProvider } from "../../src/index.js";
import { config } from "dotenv";
import { invariant } from "ts-invariant";

let GlobalBackend: IAnalyticalBackend | undefined;

/*
 * This implementation of authentication provider is used when integrated tests run against mock data.
 *
 * The login itself is not needed in this context: recordings are done against live server while authenticated,
 * the authentication information is not saved anywhere and does not figure in the recordings.
 *
 * The recordings are matched against requests purely based on payload & no auth headers or cookies.
 * There is no state on the wiremock server.
 */
class NoLoginAuthProvider extends TigerAuthProviderBase implements IAuthenticationProvider {
    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        await this.obtainCurrentPrincipal(context);

        return this.principal!;
    }
}

function createBackend(): IAnalyticalBackend {
    /*
     * When running on CI, the whole ensemble shares a docker network where the mock backend is aliased as 'bear'.
     *
     * Does not work without the protocol within the `localhost` value.
     */

    let hostname = (process.env.CI && "https://tiger") ?? "https://localhost";
    if (process.env.HOST) {
        hostname = process.env.HOST;
    }
    const port = process.env.HOST ? "" : ":8442";
    const backend = tigerFactory({ hostname: `${hostname}${port}` });
    let authProvider;

    if (process.env.GD_TIGER_REC) {
        const credentials = config();
        invariant(
            credentials.parsed?.TIGER_API_TOKEN,
            "You have started integrated tests in recording mode - this mode requires " +
                "credentials in order to log into platform. The credentials must be stored in .env file located " +
                "in sdk-backend-tiger directory. This a dotenv file and should contain TIGER_API_TOKEN.",
        );
        authProvider = new TigerTokenAuthProvider(credentials.parsed.TIGER_API_TOKEN);
    } else if (process.env.TIGER_API_TOKEN) {
        authProvider = new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN);
    } else {
        authProvider = new NoLoginAuthProvider();
    }

    return backend.withAuthentication(authProvider);
}

export function testBackend(): IAnalyticalBackend {
    if (!GlobalBackend) {
        GlobalBackend = createBackend();
    }

    return GlobalBackend;
}

export function testWorkspace(): string {
    // UI SDK Reference workspace ID
    const workspace: string = process.env.WORKSPACE_ID ?? getRecordingsWorkspaceId();
    return workspace;
}

function getRecordingsWorkspaceId() {
    return "2b7da2afb0d34f4397481c4d2a2d50b0";
}

export function sanitizeKeyWithNewValue(result: object, key: string, newValue: string) {
    const fixtureContent = JSON.stringify(result);
    return JSON.parse(fixtureContent, (k, v) => (k === key ? newValue : v));
}

function sanitizeWorkspaceId(result: object) {
    if (process.env.WORKSPACE_ID) {
        const workspace: string = process.env.WORKSPACE_ID;
        const dataString = JSON.stringify(result, null, 2).replace(
            new RegExp(workspace, "g"),
            getRecordingsWorkspaceId(),
        );
        return JSON.parse(dataString);
    }
    return result;
}

export function sanitizeWorkspace(result: object, key: string, newValue: string) {
    const newResult = sanitizeKeyWithNewValue(result, key, newValue);
    return sanitizeWorkspaceId(newResult);
}

export function sortToOrder(json: any) {
    for (let i = 0; i < json.items.length; i++) {
        const currentObject = json.items[i];
        for (const [objectKeys, objectValues] of Object.entries(currentObject)) {
            sortByKey(currentObject, objectKeys, objectValues, "id");
            sortByKey(currentObject, objectKeys, objectValues, "granularity");
            if (typeof objectValues === "object" && !Array.isArray(objectValues)) {
                for (const [keys, values] of Object.entries(currentObject[objectKeys])) {
                    sortByKey(currentObject[objectKeys], keys, values, "id");
                }
            }
        }
    }
    return json;
}

function sortByKey(object: any, key: any, value: any, sortBy: string) {
    if (Array.isArray(value) && value.length >= 2) {
        switch (sortBy) {
            case "id":
                if (Object.keys(object[key][0]).includes(sortBy)) {
                    object[key].sort((a: any, b: any) => a.id.localeCompare(b.id));
                }
                break;
            case "granularity":
                if (Object.keys(object[key][0]).includes(sortBy)) {
                    object[key].sort((a: any, b: any) => a.granularity.localeCompare(b.granularity));
                }
                break;
            default:
                break;
        }
    }
}
