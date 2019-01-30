import * as _ from "lamb";

export const split = _.generic(String.prototype.split);

export const splitBy = x => _.partial(split, [_._, x]);
export const splitByDot = splitBy(".");
