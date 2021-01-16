# kqb

Type-safe query builder for [Kintone](https://www.kintone.com).

## Design goal

- Type safe for your app schema
- Less typing with IDE completion
- Human readable and Prettier friendly

## Install

```console
$ npm i kqb
```

## Usage

```ts
import { createBuilder } from "kqb";

type FieldDefs = {
    name: "SINGLE_LINE_TEXT";
    age: "NUMBER";
};

const { builder, field } = createBuilder<FieldDefs>();
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

## License

MIT license
