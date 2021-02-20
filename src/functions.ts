import { QueryFunction } from "./functions-internal";

export function LOGINUSER() {
  return new QueryFunction("LOGINUSER");
}

export function PRIMARY_ORGANIZATION() {
  return new QueryFunction("PRIMARY_ORGANIZATION");
}

export function TODAY() {
  return new QueryFunction("TODAY");
}

export function NOW() {
  return new QueryFunction("NOW");
}

export function FROM_TODAY(num: number, unit: "DAYS" | "WEEKS" | "MONTHS" | "YEARS") {
  return new QueryFunction("FROM_TODAY", String(num), unit);
}
