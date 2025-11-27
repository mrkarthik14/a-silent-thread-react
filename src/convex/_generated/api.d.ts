/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agora from "../agora.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as calls from "../calls.js";
import type * as comments from "../comments.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as posts from "../posts.js";
import type * as presence from "../presence.js";
import type * as profile from "../profile.js";
import type * as search from "../search.js";
import type * as share from "../share.js";
import type * as typingIndicators from "../typingIndicators.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agora: typeof agora;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  bookings: typeof bookings;
  calls: typeof calls;
  comments: typeof comments;
  emails: typeof emails;
  files: typeof files;
  follows: typeof follows;
  http: typeof http;
  messages: typeof messages;
  posts: typeof posts;
  presence: typeof presence;
  profile: typeof profile;
  search: typeof search;
  share: typeof share;
  typingIndicators: typeof typingIndicators;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
