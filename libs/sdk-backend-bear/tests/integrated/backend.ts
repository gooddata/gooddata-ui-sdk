// (C) 2020 GoodData Corporation

import {
    AuthenticatedPrincipal,
    AuthenticationContext,
    IAnalyticalBackend,
    IAuthenticationProvider,
} from "@gooddata/sdk-backend-spi";
import bearFactory, { BearAuthProviderBase, FixedLoginAndPasswordAuthProvider } from "../../src";
import { config } from "dotenv";
import { InvariantError } from "ts-invariant";

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
class NoLoginAuthProvider extends BearAuthProviderBase implements IAuthenticationProvider {
    public async authenticate(context: AuthenticationContext): Promise<AuthenticatedPrincipal> {
        await this.obtainCurrentPrincipal(context);

        return this.principal!;
    }
}

function createBackend(): IAnalyticalBackend {
    /*
     * When running on CI, the whole ensemble shares a docker network where the mock backend is aliased as 'bear'.
     */
    const hostname = (process.env.CI && "bear") ?? "localhost";
    const backend = bearFactory({ hostname: `${hostname}:8443` });

    if (process.env.GD_BEAR_REC) {
        const credentials = config();

        if (!credentials.parsed?.GD_USERNAME || !credentials.parsed?.GD_PASSWORD) {
            throw new InvariantError(
                "You have started integrated tests in recording mode - this mode requires " +
                    "credentials in order to log into platform. The credentials must be stored in .env file located " +
                    "in sdk-backend-bear directory. This a dotenv file and should contain GD_USERNAME and GD_PASSWORD.",
            );
        }

        const authProvider = new FixedLoginAndPasswordAuthProvider(
            credentials.parsed!.GD_USERNAME,
            credentials.parsed!.GD_PASSWORD,
        );

        return backend.withAuthentication(authProvider);
    }

    return backend.withAuthentication(new NoLoginAuthProvider());
}

export function testBackend(): IAnalyticalBackend {
    if (!GlobalBackend) {
        GlobalBackend = createBackend();
    }

    return GlobalBackend;
}

export function testWorkspace(): string {
    return "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf";
}
