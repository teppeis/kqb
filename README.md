# kqb

Type-safe query builder for [Kintone](https://www.kintone.com)

[![npm version][npm-image]][npm-url]
![supported Node.js version][node-version]
![supported TypeScript version][ts-version]
[![ci status][ci-image]][ci-url]
![dependency count][deps-count-image]
![license][license]

## Why?

- Type-safe for your app schema
- Less typing with IDE completion
- Human readable and Prettier friendly

## Install

```console
$ npm install kqb
```

_Requires TypeScript >= 4.1 (for [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types))_

## Usage

```ts
import { createBuilder } from "kqb";

const fields = {
  name: "SINGLE_LINE_TEXT",
  age: "NUMBER",
} as const;

const { builder, field } = createBuilder(fields);
const query = builder
  .where(field("name").eq("foo"))
  .and(field("age").gt(20))
  .orderBy("age", "desc")
  .limit(100)
  .offset(200)
  .build();
console.log(query);
// name = "foo" and age > "20" order by age desc limit 100 offset 200
```

## API

This pacakge exports the following functions at the top level.

- `createBuilder`
- `and`
- `or`

```ts
import { createBuilder, and, or } from "kqb";
```

### `createBuilder(fields?): { builder, field }`

Returns a `builder` function and a `field` function.

The `fields` param is field definition JSON of your target kintone app.
The key is a field code and the value is a field type like:

```ts
const fields = {
  name: "SINGLE_LINE_TEXT",
  age: "NUMBER",
} as const;
// In TypeScript, you MUST use `as const`
```

According to this, kqb performs static type checking and runtime validation.

- Correct field codes
- Correct type of value to compare for the field type
- Condition operators available for the field type
- Only sortable fields can be used in `order by`

If `fields` are omitted, the checking is mostly disabled. See tips below.

All field types are supported:

- `CALC`
- `CHECK_BOX`
- `CREATED_TIME`
- `CREATOR`
- `DATE`
- `DATETIME`
- `DROP_DOWN`
- `FILE`
- `GROUP_SELECT`
- `LINK`
- `MODIFIER`
- `MULTI_LINE_TEXT`
- `MULTI_SELECT`
- `NUMBER`
- `ORGANIZATION_SELECT`
- `RADIO_BUTTON`
- `RECORD_NUMBER`
- `RICH_TEXT`
- `SINGLE_LINE_TEXT`
- `STATUS`
- `STATUS_ASSIGNEE`
- `TIME`
- `UPDATED_TIME`
- `USER_SELECT`
- `SUBTABLE`: see below
- `REFERENCE_TABLE`: see below

#### Subtables and Reference tables

Specify subtables and reference tables as follows:

```ts
const defs = {
  id: "NUMBER"
  name: "SINGLE_LINE_TEXT",
  history: {
    $type: "SUBTABLE",
    $fields: {
      date: "DATE",
      title: "SINGLE_LINE_TEXT",
    },
  },
  items: {
    $type: "REFERENCE_TABLE",
    $fields: {
      price: "NUMBER",
      count: "NUMBER",
    },
  },
} as const;
```

Note the following spec of Kintone.

- Fields in subtables and reference tables are not sortable.
- Use `in / not in` instead of `= / !=` for fields in subtables and reference tables.
- Use `"tableCode.fieldCode"` as field code for fields in reference tables like `field("items.price")` in the example above.

### `builder`

`builder` has the following methods.

- `.where(...condition[]): builder`
  - Same as `.and()`
- `.and(...condition[]): builder`
- `.or(...condition[]): builder`
- `.orderBy(fieldCode, direction): builder`
- `.orderBy(...[fieldCode, direction][]): builder`
  - `fieldCode`: a field code of sortable field types
  - `direction`: `"asc"` or `"desc"`
- `.offset(num): builder`
- `.limit(num): builder`
- `.build(): string`

`condition` is returned by `operator` methods.
You can get it from `field(fieldCode)` with method chain like:

```ts
builder.where(field("name").eq("Bob"), field("age").gt(20)).build();
// name = "Bob" and age > "20"
```

### `field(fieldCode): operator`

Returns a `operator` for the field with the `fieldCode`.
The `operator` has only those of the following methods that are available for the field type.

- `.eq(value)`: `"= value"`
- `.notEq(value)`: `"!= value"`
- `.gt(value)`: `"> value"`
- `.gtOrEq(value)`: `">= value"`
- `.lt(value)`: `"< value"`
- `.ltOrEq(value)`: `"<= value"`
- `.like(value)`: `"like value"`
- `.notLike(value)`: `"not like value"`
- `.in(...value[])`: `"in (value1, value2, ...)"`
- `.notIn(...value[])`: `"not in (value1, value2, ...)"`

### `and(...condition[])`, `or(...condition[])`

If you want to use nested conditions, use `and()` or `or()`.

```ts
import { createBuilder, and, or } from "kqb";

const fields = {
  foo: "NUMBER",
  bar: "NUMBER",
} as const;

const { builder, field } = createBuilder(fields);
const query = builder
  .where(or(field("foo").eq(1), field("bar").eq(2)))
  .and(or(field("foo").eq(3), field("bar").eq(4)))
  .or(and(field("foo").eq(5), field("bar").eq(6)))
  .build();
console.log(query);
// (foo = "1" or bar = "2") and (foo = "3" or bar = "4") or (foo = "5" and bar = "6")
```

### Query Functions

Kintone provides [query functions](https://developer.kintone.io/hc/en-us/articles/360019245194) like `TODAY()` and `LOGINUSER()`

```sql
created_time = TODAY() and creator in (LOGINUSER())
```

To use query functions, import them and specify them in query operators.

```ts
import { createBuilder, LOGINUSER, TODAY } from "kqb";

const fields = {
  created_time: "CREATED_TIME",
  creator: "CREATOR",
} as const;

const { builder, field } = createBuilder(fields);
const query = builder
  .where(field("created_time").eq(TODAY()))
  .and(field("creator").in(LOGINUSER()))
  .build();
console.log(query);
// created_time = TODAY() and creator in (LOGINUSER())
```

Also you can import all functions as namespace from `kqb/functions`.

```ts
import * as functions from "kqb/functions";
```

All query functions are supported:

- `LOGINUSER`
- `PRIMARY_ORGANIZATION`
- `NOW`
- `TODAY`
- `YESTERDAY`
- `TOMORROW`
- `FROM_TODAY`
- `THIS_WEEK`
- `LAST_WEEK`
- `NEXT_WEEK`
- `THIS_MONTH`
- `LAST_MONTH`
- `NEXT_MONTH`
- `THIS_YEAR`
- `LAST_YEAR`
- `NEXT_YEAR`

## Tips

### Non type-safe query building

If you just want to build a query and do not want type-safety, you can omit the field definition argument of `creatBuilder(fields?)`.
You can get the query string easily, but note that type checking will not raise an error if the query is logically wrong.
The operators has all methods and orderBy receives all fields, but potentially, it may not work.

```ts
const { builder, field } = createBuilder(); // omit the first argument
const query = builder
  .where(field("non_existent_field").gt(20))
  .and(
    field("number_field").like("can_not_actually_use_like_operator")
  )
  .orderBy("non_sortable_field", "asc")
  .build();
```

### Multiple fields in `order by`

There are two ways to do this.

```ts
const query = builder
  .orderBy("foo", "asc")
  .orderBy("bar", "desc")
  .build();
console.log(query);
// order by foo asc, bar desc

const query = builder
  .orderBy(["foo", "asc"], ["bar", "desc"])
  .build();
console.log(query);
// order by foo asc, bar desc
```

## License

MIT License: Teppei Sato &lt;teppeis@gmail.com&gt;

[npm-image]: https://badgen.net/npm/v/kqb?icon=npm&label=
[npm-url]: https://npmjs.org/package/kqb
[npm-downloads-image]: https://badgen.net/npm/dm/kqb
[deps-image]: https://badgen.net/david/dep/teppeis/kqb.svg
[deps-url]: https://david-dm.org/teppeis/kqb
[deps-count-image]: https://badgen.net/bundlephobia/dependency-count/kqb
[node-version]: https://badgen.net/npm/node/kqb
[ts-version]: https://badgen.net/badge/typescript/%3E=4.1?icon=typescript
[license]: https://badgen.net/npm/license/kqb
[ci-image]: https://github.com/teppeis/kqb/workflows/ci/badge.svg
[ci-url]: https://github.com/teppeis/kqb/actions?query=workflow%3Aci
