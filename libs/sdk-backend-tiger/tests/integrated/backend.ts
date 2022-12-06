// (C) 2022 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import tigerFactory, { TigerTokenAuthProvider } from "../../src";
import {} from "dotenv";
import invariant from "ts-invariant";

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
// class NoLoginAuthProvider extends TigerAuthProviderBase implements IAuthenticationProvider {
//     public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
//         await this.obtainCurrentPrincipal(context);

//         return this.principal!;
//     }
// }

function createBackend(): IAnalyticalBackend {
    /*
     * When running on CI, the whole ensemble shares a docker network where the mock backend is aliased as 'bear'.
     *
     * Does not work without the protocol within the `localhost` value.
     */
    // const credentials = config();
    // const hostname = (process.env.CI && "https://tiger") ?? "https://localhost";
    const hostname = process.env.HOST;
    const backend = tigerFactory({ hostname: `${hostname}` });
    // if (process.env.GD_TIGER_REC) {
    // const credentials = config();

    invariant(
        process.env.TIGER_API_TOKEN,
        "You have started integrated tests in recording mode - this mode requires " +
            "credentials in order to log into platform. The credentials must be stored in .env file located " +
            "in sdk-backend-tiger directory. This a dotenv file and should contain TIGER_API_TOKEN.",
    );

    const authProvider = new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN);
    // const authProvider = new TigerTokenAuthProvider("YWRtaW46Ym9vdHN0cmFwOkdkY05hczEyMw==");

    return backend.withAuthentication(authProvider);
    // }

    // return backend.withAuthentication(new NoLoginAuthProvider());
}

export function testBackend(): IAnalyticalBackend {
    if (!GlobalBackend) {
        GlobalBackend = createBackend();
    }

    return GlobalBackend;
}

export function testWorkspace(): string {
    // UI SDK Reference workspace ID
    const ws = process.env.WORKSPACE_ID;
    return "" + ws;
}
