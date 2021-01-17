# kqb

Type-safe query builder for [Kintone](https://www.kintone.com).

## Design goal

- Type-safe for your app schema
- Less typing with IDE completion
- Human readable and Prettier friendly

## Install

```console
$ npm i kqb
```

## Usage

### Type-safe query building

```ts
import { createBuilder } from "kqb";

const fields = {
    name: "SINGLE_LINE_TEXT",
    age: "NUMBER",
} as const;

const { builder, field } = createBuilder(fields);
const query: string = builder
    .where(field("name").eq("foo"))
    .and(field("age").gt(20))
    .orderBy("age", "desc")
    .limit(100)
    .offset(200)
    .build();
console.log(query);
// name = "foo" and age > 20 order by age desc limit 100 offset 200
```

### Non type-safe query building

If you just want to build a query and do not want type-safety, you can omit the field definition argument of `creatBuilder()`.
Note that you can easily get the query string, but no type error will be thrown if the query is logically wrong.

```ts
const { builder, field } = createBuilder(); // omit the first argument
const query: string = builder
    .where(field("non_existent_field").gt(20))
    .and(field("number_field").like("can_not_actually_use_like_operator"))
    .orderBy("non_sortable_field", "desc")
    .build();
```

## License

MIT license
