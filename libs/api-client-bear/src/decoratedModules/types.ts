// (C) 2023 GoodData Corporation
import { ProjectModule } from "../project.js";
import { UserModule } from "../user.js";

/**
 * @alpha
 */
export type UserDecoratorFactory = (user: UserModule) => UserModule;

/**
 * @alpha
 */
export type ProjectDecoratorFactory = (user: ProjectModule) => ProjectModule;

/**
 * Provides factory functions for the different decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @alpha
 */
export type DecoratorFactories = {
    user?: UserDecoratorFactory;
    project?: ProjectDecoratorFactory;
};
