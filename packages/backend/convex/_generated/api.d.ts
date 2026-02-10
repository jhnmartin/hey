/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiEnrichment from "../aiEnrichment.js";
import type * as aiEnrichmentHelpers from "../aiEnrichmentHelpers.js";
import type * as eventCollaborators from "../eventCollaborators.js";
import type * as eventSeries from "../eventSeries.js";
import type * as eventTags from "../eventTags.js";
import type * as events from "../events.js";
import type * as invites from "../invites.js";
import type * as memberships from "../memberships.js";
import type * as organizations from "../organizations.js";
import type * as places from "../places.js";
import type * as profiles from "../profiles.js";
import type * as storage from "../storage.js";
import type * as tasks from "../tasks.js";
import type * as ticketTypes from "../ticketTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiEnrichment: typeof aiEnrichment;
  aiEnrichmentHelpers: typeof aiEnrichmentHelpers;
  eventCollaborators: typeof eventCollaborators;
  eventSeries: typeof eventSeries;
  eventTags: typeof eventTags;
  events: typeof events;
  invites: typeof invites;
  memberships: typeof memberships;
  organizations: typeof organizations;
  places: typeof places;
  profiles: typeof profiles;
  storage: typeof storage;
  tasks: typeof tasks;
  ticketTypes: typeof ticketTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
