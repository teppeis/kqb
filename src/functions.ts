import { QueryFunction } from "./functions-internal";

export function TODAY() {
  return new QueryFunction("TODAY");
}

export function NOW() {
  return new QueryFunction("NOW");
}

export function LOGINUSER() {
  return new QueryFunction("LOGINUSER");
}

export function FROM_TODAY(num: number, unit: "DAYS" | "WEEKS" | "MONTHS" | "YEARS") {
  return new QueryFunction("FROM_TODAY", String(num), unit);
}
