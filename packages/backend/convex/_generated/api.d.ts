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
import type * as http from "../http.js";
import type * as inviteEmails from "../inviteEmails.js";
import type * as invites from "../invites.js";
import type * as lib_geo from "../lib/geo.js";
import type * as memberships from "../memberships.js";
import type * as migrations_backfillVenueCoords from "../migrations/backfillVenueCoords.js";
import type * as orders from "../orders.js";
import type * as ordersHelpers from "../ordersHelpers.js";
import type * as organizations from "../organizations.js";
import type * as places from "../places.js";
import type * as profiles from "../profiles.js";
import type * as rsvps from "../rsvps.js";
import type * as savedEvents from "../savedEvents.js";
import type * as storage from "../storage.js";
import type * as stripeCheckout from "../stripeCheckout.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as tasks from "../tasks.js";
import type * as ticketTypes from "../ticketTypes.js";
import type * as tickets from "../tickets.js";

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
  http: typeof http;
  inviteEmails: typeof inviteEmails;
  invites: typeof invites;
  "lib/geo": typeof lib_geo;
  memberships: typeof memberships;
  "migrations/backfillVenueCoords": typeof migrations_backfillVenueCoords;
  orders: typeof orders;
  ordersHelpers: typeof ordersHelpers;
  organizations: typeof organizations;
  places: typeof places;
  profiles: typeof profiles;
  rsvps: typeof rsvps;
  savedEvents: typeof savedEvents;
  storage: typeof storage;
  stripeCheckout: typeof stripeCheckout;
  stripeWebhook: typeof stripeWebhook;
  tasks: typeof tasks;
  ticketTypes: typeof ticketTypes;
  tickets: typeof tickets;
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
