#! /usr/bin/env node -r esm

import {splitByDot} from "../build/splitter";

console.log(splitByDot("a.b.c.f.e."));
