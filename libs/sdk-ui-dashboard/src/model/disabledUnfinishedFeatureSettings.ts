// (C) 2021-2022 GoodData Corporation
import { ISettings } from "@gooddata/sdk-backend-spi";

/**
 * As plugins now allow to use KD with some old version of UI SDK,
 * development of new features can not rely only on development feature flags:
 *
 * When new UI SDK version is release in the middle of feature development,
 * this not final version of feature can still be turned on
 * by its development platform setting later because some old plugin
 * is still using old UI SDK version on new KD.
 */

/**
 * Turns off development settings for unfinished features which cant be turned on in this version of UI SDK.
 * Add disabled FF for your feature, when it is not completed yet, but UI SDK needs to be released. It will prevent this feature from being accidentally turned on in WIP state by its platform setting when used in this version of UI SDK as part of old plugin.
 */
export const disabledUnfinishedFeatureSettings: ISettings = {};
