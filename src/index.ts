import type { FieldDefinitionsTypes, FieldTypes, ReferenceTable, Subtable } from "./builder";
import { Builder } from "./builder";
import { AnyOperator, FieldTypeOperators } from "./operators";
import type { KeysByValue, StringKeyOf } from "./type-utils";

export { and, or } from "./conditions";

const BuiltinField = { $id: "RECORD_NUMBER" } as const;
type WithBuiltin<T> = T & typeof BuiltinField;
type NormalFieldCodes<T extends FieldDefinitionsTypes> = Extract<
  KeysByValue<T, FieldTypes>,
  string
>;
type SubtableFieldCodes<T extends FieldDefinitionsTypes> = {
  [K in keyof T]: T[K] extends Subtable ? StringKeyOf<T[K]["$fields"]> : never;
}[keyof T];
type ConcatTableDotFieldCode<
  T extends FieldDefinitionsTypes,
  TableType extends Subtable | ReferenceTable
> = {
  [K in StringKeyOf<T>]: T[K] extends TableType ? `${K}.${StringKeyOf<T[K]["$fields"]>}` : never;
}[StringKeyOf<T>];
type RefTableFieldCodes<T extends FieldDefinitionsTypes> = ConcatTableDotFieldCode<
  T,
  ReferenceTable
>;
type FlattenFieldCodes<T extends FieldDefinitionsTypes> =
  | NormalFieldCodes<T>
  | SubtableFieldCodes<T>
  | RefTableFieldCodes<T>;

type NormalFields<T extends FieldDefinitionsTypes> = {
  [K in keyof T]: T[K] extends FieldTypes ? T[K] : never;
};
type FlattenRefTables<T extends FieldDefinitionsTypes> = {
  [K in RefTableFieldCodes<T>]: FlattenTableField<T, ReferenceTable, K>;
};
type FlattenSubtables<T extends FieldDefinitionsTypes> = {
  [K in ConcatTableDotFieldCode<T, Subtable> as K extends `${string}.${infer FieldCode}`
    ? FieldCode
    : never]: FlattenTableField<T, Subtable, K>;
};
type FlattenTableField<
  T extends FieldDefinitionsTypes,
  TableType extends Subtable | ReferenceTable,
  K extends ConcatTableDotFieldCode<T, TableType>
> = K extends `${infer TableCode}.${infer FieldCode}`
  ? TableCode extends keyof T
    ? T[TableCode] extends TableType
      ? FieldCode extends keyof Extract<T[TableCode], TableType>["$fields"]
        ? Extract<T[TableCode], TableType>["$fields"][FieldCode]
        : never
      : never
    : never
  : never;
type FlattenFields<T extends FieldDefinitionsTypes> = NormalFields<T> &
  FlattenSubtables<T> &
  FlattenRefTables<T>;

export function createBuilder(): {
  builder: Builder<any>;
  field: (fieldCode: string) => AnyOperator;
};
export function createBuilder<FieldDefs extends FieldDefinitionsTypes>(
  fd: FieldDefs
): {
  builder: Builder<WithBuiltin<FieldDefs>>;
  field: <FieldCode extends FlattenFieldCodes<WithBuiltin<FieldDefs>>>(
    fieldCode: FieldCode
  ) => WithBuiltin<FieldDefs>[FieldCode] extends FieldTypes
    ? Extract<FieldTypeOperators[WithBuiltin<FieldDefs>[FieldCode]], [any, any]>[0]
    : FieldCode extends keyof FlattenSubtables<FieldDefs>
    ? Extract<FieldTypeOperators[FlattenSubtables<FieldDefs>[FieldCode]], [any, any]>[1]
    : FieldCode extends keyof FlattenRefTables<FieldDefs>
    ? FieldTypeOperators[FlattenRefTables<FieldDefs>[FieldCode]][1]
    : never;
};
export function createBuilder<FieldDefs extends FieldDefinitionsTypes = any>(fd?: FieldDefs) {
  return {
    builder: new Builder<WithBuiltin<FlattenFields<FieldDefs>>>(),
    field: <FieldCode extends FlattenFieldCodes<WithBuiltin<FieldDefs>>>(fieldCode: FieldCode) => {
      if (!fd) {
        return new AnyOperator(fieldCode);
      }
      const fieldType = { ...fd, ...BuiltinField }[fieldCode];
      if (isFieldType(fieldType)) {
        return new FieldTypeOperators[toFieldType(fieldType)][0](fieldCode);
      }
      const subtableFieldType = findSubtableField(fd, fieldCode);
      if (subtableFieldType) {
        return new FieldTypeOperators[subtableFieldType][1](fieldCode);
      }
      const refTableFieldType = findRefTableField(fd, fieldCode);
      if (refTableFieldType) {
        return new FieldTypeOperators[refTableFieldType][1](fieldCode);
      }
      throw new TypeError(`Unexpected field code: ${fieldCode}`);
    },
  };
}

function isFieldType(fieldType: any): fieldType is FieldTypes {
  return fieldType in FieldTypeOperators;
}

function toFieldType<T extends FieldTypes>(fieldType: T): FieldTypes {
  return fieldType;
}

function findSubtableField<FieldDefs extends FieldDefinitionsTypes>(
  fd: FieldDefs,
  fieldCode: string
): FieldTypes | null {
  for (const [, props] of Object.entries(fd)) {
    if (typeof props === "object" && props.$type === "SUBTABLE") {
      for (const [code, fieldType] of Object.entries(props.$fields)) {
        if (code === fieldCode) {
          return fieldType;
        }
      }
    }
  }
  return null;
}

function findRefTableField<FieldDefs extends FieldDefinitionsTypes>(
  fd: FieldDefs,
  fieldCode: string
): FieldTypes | null {
  for (const [tableCode, props] of Object.entries(fd)) {
    if (typeof props === "object" && props.$type === "REFERENCE_TABLE") {
      for (const [code, fieldType] of Object.entries(props.$fields)) {
        if (`${tableCode}.${code}` === fieldCode) {
          return fieldType;
        }
      }
    }
  }
  return null;
}
