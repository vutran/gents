# gents

> Generate TypeScript definitions from JSON.

## Install

```
$ npm i -D gents
```

## Usage

```typescript
import gents from 'gents';

const json = `{ "user_id": 1 }`;

const def = gents(json, User);
// interface User {
//     user_id: number;
// }
```

## Related

- [gents-cli](https://github.com/vutran/gents-cli/) - CLI tool for this module

## License

MIT © [Vu Tran](https://github.com/vutran/)
