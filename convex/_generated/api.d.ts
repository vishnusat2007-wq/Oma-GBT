/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: {
  household: {
    load: FunctionReference<
      "query",
      "public",
      { secret: string },
      {
        householdId: string;
        memoryCount: number;
        payload: null | any;
        updatedAt: null | string;
      }
    >;
    save: FunctionReference<
      "mutation",
      "public",
      { payload: any; secret: string },
      { memoryCount: number; ok: true; updatedAt: string }
    >;
    wipe: FunctionReference<
      "mutation",
      "public",
      { secret: string },
      { householdId: string; ok: true }
    >;
  };
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {};

export declare const components: {};
