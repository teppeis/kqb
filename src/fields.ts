import { FieldTypeOperators } from "./operators";

type FieldTypeNames = keyof FieldTypeOperators;
const FieldTypesNames = Object.keys(FieldTypeOperators);
const BuiltinProperty = { $id: { type: "RECORD_NUMBER", code: "$id" } } as const;
type WithBuiltin<T> = T & typeof BuiltinProperty;
type FieldsJsonType = {
  properties: {
    [fieldCode: string]: FieldProperties | SubtableProperties | UnusedFieldProperties;
  };
};
type FieldProperties = {
  type: FieldTypeNames;
  code: string;
};

type SubtableProperties = {
  type: "SUBTABLE";
  code: string;
  fields: {
    [fieldCode: string]: FieldProperties;
  };
};

type UnusedFieldProperties = {
  type: "REFERENCE_TABLE" | "CATEGORY";
  code: string;
};

type FieldTypeCodes<Props extends FieldsJsonType["properties"]> = {
  [Code in keyof Props]: Props[Code]["type"] extends FieldTypeNames | "SUBTABLE"
    ? Code
    : never;
}[keyof Props];

type FieldTypes<Props extends FieldsJsonType["properties"]> = {
  [Code in FieldTypeCodes<Props>]: Props[Code] extends { type: FieldTypeNames }
    ? Props[Code]["type"]
    : Props[Code] extends { type: "SUBTABLE" }
      ? {
          $type: "SUBTABLE";
          $fields: FieldTypes<Props[Code]["fields"]>;
        }
      : never;
};

export function convertFieldsJsonToDefs<FieldsJson extends FieldsJsonType>(
  fieldsJson: FieldsJson,
): FieldTypes<WithBuiltin<FieldsJson["properties"]>> {
  return convertFieldsJsonPropsToDefs(fieldsJson.properties);
}

function isSubtableProp(entry: [string, any]): entry is [string, SubtableProperties] {
  return entry[1]?.type === "SUBTABLE";
}

function isNormalFieldProp(entry: [string, any]): entry is [string, FieldProperties] {
  return FieldTypesNames.includes(entry[1]?.type);
}

function convertFieldsJsonPropsToDefs<
  FieldsJsonProps extends FieldsJsonType["properties"],
>(fieldsJsonProps: FieldsJsonProps): FieldTypes<WithBuiltin<FieldsJsonProps>> {
  const normalProps = Object.fromEntries(
    Object.entries({ ...fieldsJsonProps, ...BuiltinProperty })
      .filter(isNormalFieldProp)
      .map(([code, prop]) => [code, prop.type]),
  );

  const subtableProps = Object.fromEntries(
    Object.entries(fieldsJsonProps)
      .filter(isSubtableProp)
      .map(([code, prop]) => [
        code,
        {
          $type: "SUBTABLE",
          $fields: convertFieldsJsonPropsToDefs(prop.fields),
        } as const,
      ]),
  );

  return { ...normalProps, ...subtableProps } as FieldTypes<WithBuiltin<FieldsJsonProps>>;
}
