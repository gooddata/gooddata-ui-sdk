// (C) 2023 GoodData Corporation

import { invariant } from "ts-invariant";

/**
 * Internal interface that contains JWT fields accessed by the authentication provider.
 * There can be other field (claims) in the token payload as well but these are not important for the
 * provider right now.
 */
export interface IJsonWebTokenPayload {
    /**
     * Number of seconds since the start of epoch when the token will expire.
     */
    exp: number;
    /**
     * Subject to which the token grants the access (ID of the Tiger user in our case).
     */
    sub: string;
}

/**
 * Decode provided JWT payload
 *
 * @param jwt - JWT that should be decoded. Expected JWT structure is "header.payload.signature".
 *
 * @returns object with claims decoded from provided JWT payload
 *
 * @throws when provided jwt is empty
 */
export const decodeJwtPayload = (jwt: string): IJsonWebTokenPayload => {
    invariant(jwt, "The provided token is empty");
    const base64UrlPayload = jwt.split(".")[1];
    const base64Payload = base64UrlPayload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64Payload)
            .split("")
            .map((ch) => "%" + ("00" + ch.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
    );
    return JSON.parse(jsonPayload);
};

/**
 * Compare subject from the new and previous JWT and compare if the subject is the same for both ("sub" claim)
 *
 * @param newJwt - new JWT
 * @param previousJwt - previous JWT
 *
 * @throws when "sub" claim does not equal in both compared JWTs
 */
export const validateJwt = (newJwt: string, previousJwt: string): void => {
    const previousPayload = decodeJwtPayload(previousJwt);
    const payload = decodeJwtPayload(newJwt);
    if (payload.sub !== previousPayload.sub) {
        throw new Error("The new JWT does not belong to the same subject as the previous one.");
    }
};

/**
 * Compute number of milliseconds till provided JWT expiration from the current time.
 * The returned value can be used for setTimeout function.
 *
 * @param jwt - JWT from which the expiration timestamp is extracted
 * @param secondsBeforeTokenExpirationToCallReminder - number of seconds subtracted from the final timeout
 * @param currentTimeInMilliseconds - current time in milliseconds
 *
 * @returns number of milliseconds between now and expiration of provided JWT, subtracted by provided number of seconds
 */
export const computeExpirationReminderTimeout = (
    jwt: string,
    secondsBeforeTokenExpirationToCallReminder: number,
    currentTimeInMilliseconds: number,
): number => {
    const payload = decodeJwtPayload(jwt);
    const millisecondsToReminder = secondsBeforeTokenExpirationToCallReminder * 1000;
    const epochMillisecondsToExpiration = payload.exp * 1000;
    return epochMillisecondsToExpiration - currentTimeInMilliseconds - millisecondsToReminder;
};
