export type KeysByValue<T, ValueType> = {
  [Key in keyof T]: T[Key] extends ValueType ? Key : never;
}[keyof T];

export type StringKeyOf<T> = Extract<keyof T, string>;
