#! /usr/bin/env node -r esm

import {mapWithA} from "../build/mapper";

console.log(
    mapWithA([{a: 1}, {a: 2}, {a: 3}, {a: 4}])
);
