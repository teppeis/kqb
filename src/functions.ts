import type { Day, FromTodayUnit } from "./functions-internal";
import { QueryFunction } from "./functions-internal";

export function LOGINUSER() {
  return new QueryFunction("LOGINUSER");
}

export function PRIMARY_ORGANIZATION() {
  return new QueryFunction("PRIMARY_ORGANIZATION");
}

export function NOW() {
  return new QueryFunction("NOW");
}

export function TODAY() {
  return new QueryFunction("TODAY");
}

export function YESTERDAY() {
  return new QueryFunction("YESTERDAY");
}

export function TOMORROW() {
  return new QueryFunction("TOMORROW");
}

export function FROM_TODAY(num: number, unit: FromTodayUnit) {
  return new QueryFunction("FROM_TODAY", String(num), unit);
}

/**
 * Converts to the specified day in this week. Weeks start from a Sunday.
 *
 * @param day If nothing is specified, it converts to all days in this week.
 */
export function THIS_WEEK(day?: Day) {
  return new QueryFunction("THIS_WEEK", day ?? "");
}

/**
 * Converts to the specified day in the last week. Weeks start from a Sunday.
 *
 * @param day If nothing is specified, it converts to all days in the last week.
 */
export function LAST_WEEK(day?: Day) {
  return new QueryFunction("LAST_WEEK", day ?? "");
}

/**
 * Converts to the specified day in the next week. Weeks start from a Sunday.
 *
 * @param day If nothing is specified, it converts to all days in the next week.
 */
export function NEXT_WEEK(day?: Day) {
  return new QueryFunction("NEXT_WEEK", day ?? "");
}

/**
 * Converts to the month of when the API was initiated.
 *
 * @param date Numbers from 1-31: the day of the month. If the number does not exist, it will convert to the first day of the next month.
 * "LAST": the last day of the month.
 * If nothing is specified, it converts to all days in the month.
 */
export function THIS_MONTH(date?: "LAST" | number) {
  return new QueryFunction("THIS_MONTH", String(date ?? ""));
}

/**
 * Converts to the last month of when the API was initiated.
 *
 * @param date Numbers from 1-31: the day of the month. If the number does not exist, it will convert to the first day of the next month.
 * "LAST": the last day of the month.
 * If nothing is specified, it converts to all days in the month.
 */
export function LAST_MONTH(date?: "LAST" | number) {
  return new QueryFunction("LAST_MONTH", String(date ?? ""));
}

/**
 * Converts to the next month of when the API was initiated.
 *
 * @param date Numbers from 1-31: the day of the month. If the number does not exist, it will convert to the first day of the next month.
 * "LAST": the last day of the month.
 * If nothing is specified, it converts to all days in the month.
 */
export function NEXT_MONTH(date?: "LAST" | number) {
  return new QueryFunction("NEXT_MONTH", String(date ?? ""));
}

export function THIS_YEAR() {
  return new QueryFunction("THIS_YEAR");
}

export function LAST_YEAR() {
  return new QueryFunction("LAST_YEAR");
}

export function NEXT_YEAR() {
  return new QueryFunction("NEXT_YEAR");
}
