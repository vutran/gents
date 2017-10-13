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
