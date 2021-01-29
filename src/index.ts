import type { FieldDefinitionsTypes } from "./builder";
import { Builder } from "./builder";
import { AnyOperator, FieldTypeOperators } from "./operators";

export { and, or } from "./conditions";

type StringKeyOf<T> = Extract<keyof T, string>;
const BuiltinField = { $id: "RECORD_NUMBER" } as const;
type WithBuiltin<T> = T & typeof BuiltinField;

export function createBuilder(): {
  builder: Builder<any>;
  field: (fieldCode: string) => AnyOperator;
};
export function createBuilder<FieldDefs extends FieldDefinitionsTypes>(
  fd: FieldDefs
): {
  builder: Builder<WithBuiltin<FieldDefs>>;
  field: <FieldCode extends StringKeyOf<WithBuiltin<FieldDefs>>>(
    fieldCode: FieldCode
  ) => FieldTypeOperators[WithBuiltin<FieldDefs>[FieldCode]];
};
export function createBuilder<FieldDefs extends FieldDefinitionsTypes = any>(fd?: FieldDefs) {
  return {
    builder: new Builder<WithBuiltin<FieldDefs>>(),
    field: <FieldCode extends StringKeyOf<WithBuiltin<FieldDefs>>>(fieldCode: FieldCode) => {
      if (fd) {
        return new FieldTypeOperators[{ ...fd, ...BuiltinField }[fieldCode]](fieldCode);
      } else {
        return new AnyOperator(fieldCode);
      }
    },
  };
}
