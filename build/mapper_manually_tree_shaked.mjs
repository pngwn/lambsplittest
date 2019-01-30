function clamp (n, min, max) {
    n = +n;
    min = +min;
    max = +max;
    if (min > max) {
        return NaN;
    } else {
        return n < min ? min : n > max ? max : n;
    }
}

var MAX_ARRAY_LENGTH = 4294967295;

function _toArrayLength (value) {
    return clamp(value, 0, MAX_ARRAY_LENGTH) >>> 0;
}

function _curry2 (fn, isRightCurry) {
    return function (a) {
        return function (b) {
            return isRightCurry ? fn.call(this, b, a) : fn.call(this, a, b);
        };
    };
}

function map (arrayLike, iteratee) {
    var len = _toArrayLength(arrayLike.length);
    var result = Array(len);
    for (var i = 0; i < len; i++) {
        result[i] = iteratee(arrayLike[i], i, arrayLike);
    }
    return result;
}

var mapWith = _curry2(map, true);

function getIn (obj, key) {
    return obj[key];
}

var getKey = _curry2(getIn, true);

const mapWithA = mapWith(getKey("a"));

export { mapWithA };
