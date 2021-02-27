import { FieldTypeOperators } from "./operators";

type FieldTypeNames = keyof FieldTypeOperators;
const FieldTypesNames = Object.keys(FieldTypeOperators);
const BuiltinProperty = { $id: { type: "RECORD_NUMBER", code: "$id" } } as const;
type FieldsJsonType = {
  properties: {
    [fieldCode: string]: FieldProperties | UnusedFieldProperties;
  };
};
type FieldProperties = {
  type: FieldTypeNames;
  code: string;
};

type UnusedFieldProperties = {
  type: string;
  code: string;
};

type PropsWithBuitin<FieldsJson extends FieldsJsonType> = FieldsJson["properties"] &
  typeof BuiltinProperty;
type FieldTypeCodes<Props extends FieldsJsonType["properties"]> = {
  [Code in keyof Props]: Props[Code]["type"] extends FieldTypeNames ? Code : never;
}[keyof Props];
type FieldTypes<Props extends FieldsJsonType["properties"]> = {
  [Code in FieldTypeCodes<Props>]: Props[Code]["type"] extends FieldTypeNames
    ? Props[Code]["type"]
    : never;
};

export function convertFieldsJsonToDefs<FieldsJson extends FieldsJsonType>(
  fieldsJson: FieldsJson
): FieldTypes<PropsWithBuitin<FieldsJson>> {
  return Object.fromEntries(
    Object.entries({ ...fieldsJson.properties, ...BuiltinProperty })
      .map(([code, prop]) => [code, prop.type])
      .filter(([, type]) => FieldTypesNames.includes(type))
  );
}
