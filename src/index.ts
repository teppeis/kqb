import type { FieldDefinitionsTypes } from "./builder";
import { Builder } from "./builder";
import { AnyOperator, FieldTypeOperators } from "./operators";

export { and, or } from "./conditions";

type StringKeyOf<T> = Extract<keyof T, string>;
const BuiltinField = { $id: "RECORD_NUMBER" } as const;

export function createBuilder<FieldDefs extends FieldDefinitionsTypes = any>(fd?: FieldDefs) {
  type MergedDefs = FieldDefs & typeof BuiltinField;
  return {
    builder: new Builder<MergedDefs>(),
    field: <FieldCode extends StringKeyOf<MergedDefs>>(fieldCode: FieldCode) => {
      return (fd
        ? new FieldTypeOperators[{ ...fd, ...BuiltinField }[fieldCode]](fieldCode)
        : new AnyOperator(fieldCode)) as string extends StringKeyOf<FieldDefs>
        ? AnyOperator
        : FieldTypeOperators[MergedDefs[FieldCode]];
    },
  };
}
