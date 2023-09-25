// (C) 2023 GoodData Corporation
import { UserModule } from "../user.js";

/**
 * @alpha
 */
export type UserDecoratorFactory = (user: UserModule) => UserModule;

/**
 * Provides factory functions for the different decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @alpha
 */
export type DecoratorFactories = {
    user?: UserDecoratorFactory;
};
