#! /usr/bin/env node -r esm

import * as _ from "../node_modules/lamb/dist/lamb.mjs";

const foo = (a, b, c) => a + b + c;
const sumABto3 = _.partial(foo, [_._, _._, 3]);

console.log(sumABto3(1,2)); // 6
console.log(sumABto3(4,5)); // 12
