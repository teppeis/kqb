import type { UnionToIntersection, ValuesType } from "utility-types";
import type { FieldDefinitionsTypes, FieldTypes, Subtable } from "./builder";
import { Builder } from "./builder";
import type { KeysByValue, StringKeyOf } from "./type-utils";
import { AnyOperator, FieldTypeOperators } from "./operators";

export { and, or } from "./conditions";

const BuiltinField = { $id: "RECORD_NUMBER" } as const;
type WithBuiltin<T> = T & typeof BuiltinField;
type NormalFieldCodes<P extends FieldDefinitionsTypes> = Extract<
  KeysByValue<P, FieldTypes>,
  string
>;
type SubtableFieldCodes<P extends FieldDefinitionsTypes> = {
  [K in keyof P]: P[K] extends Subtable ? StringKeyOf<P[K]["$fields"]> : never;
}[keyof P];
type FlattenFieldCodes<T extends FieldDefinitionsTypes> =
  | NormalFieldCodes<T>
  | SubtableFieldCodes<T>;

type NormalFields<P extends FieldDefinitionsTypes> = {
  [K in keyof P]: P[K] extends FieldTypes ? P[K] : never;
};
type FlattenSubtables<T extends FieldDefinitionsTypes> = UnionToIntersection<
  ValuesType<
    {
      [K in keyof T]: T[K] extends Subtable ? T[K]["$fields"] : never;
    }
  >
>;
type FlattenFields<P extends FieldDefinitionsTypes> = NormalFields<P> & FlattenSubtables<P>;

export function createBuilder(): {
  builder: Builder<any>;
  field: (fieldCode: string) => AnyOperator;
};
export function createBuilder<FieldDefs extends FieldDefinitionsTypes>(
  fd: FieldDefs
): {
  builder: Builder<WithBuiltin<FlattenFields<FieldDefs>>>;
  field: <FieldCode extends FlattenFieldCodes<WithBuiltin<FieldDefs>>>(
    fieldCode: FieldCode
  ) => WithBuiltin<FieldDefs>[FieldCode] extends string
    ? FieldTypeOperators[WithBuiltin<FlattenFields<FieldDefs>>[FieldCode]] extends Array<any>
      ? FieldTypeOperators[WithBuiltin<FlattenFields<FieldDefs>>[FieldCode]][0]
      : never
    : FieldTypeOperators[WithBuiltin<FlattenFields<FieldDefs>>[FieldCode]] extends Array<any>
    ? FieldTypeOperators[WithBuiltin<FlattenFields<FieldDefs>>[FieldCode]][1]
    : never;
};
export function createBuilder<FieldDefs extends FieldDefinitionsTypes = any>(fd?: FieldDefs) {
  return {
    builder: new Builder<WithBuiltin<FlattenFields<FieldDefs>>>(),
    field: <FieldCode extends FlattenFieldCodes<WithBuiltin<FieldDefs>>>(fieldCode: FieldCode) => {
      if (fd) {
        const effectiveDefs = { ...fd, ...BuiltinField };
        const index = typeof effectiveDefs[fieldCode] === "string" ? 0 : 1;
        return new FieldTypeOperators[flattenFieldDefs(effectiveDefs)[fieldCode]][index](fieldCode);
      } else {
        return new AnyOperator(fieldCode);
      }
    },
  };
}

function flattenFieldDefs<FieldDefs extends FieldDefinitionsTypes>(
  fd: FieldDefs
): Record<keyof FlattenFields<FieldDefs>, keyof FieldTypeOperators> {
  const result: Record<string, keyof FieldTypeOperators> = {};
  for (const [key, value] of Object.entries(fd)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (typeof value === "object" && value.$type === "SUBTABLE") {
      for (const [code, fieldType] of Object.entries(value.$fields)) {
        result[code] = fieldType;
      }
    } else {
      throw new TypeError(`Unexpected state`);
    }
  }
  return result as Record<keyof FlattenFields<FieldDefs>, keyof FieldTypeOperators>;
}
