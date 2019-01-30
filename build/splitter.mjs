var _ = {};

function areSVZ (a, b) {
    return a !== a ? b !== b : a === b;
}

function binary (fn) {
    return function (a, b) {
        return fn.call(this, a, b);
    };
}

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

function partial (fn, args) {
    return function () {
        if (!Array.isArray(args)) {
            return fn.apply(this, arguments);
        }
        var lastIdx = 0;
        var newArgs = [];
        var argsLen = args.length;
        for (var i = 0, boundArg; i < argsLen; i++) {
            boundArg = args[i];
            newArgs[i] = boundArg === _ ? arguments[lastIdx++] : boundArg;
        }
        for (var len = arguments.length; lastIdx < len; lastIdx++) {
            newArgs[i++] = arguments[lastIdx];
        }
        return fn.apply(this, newArgs);
    };
}

function identity (value) {
    return value;
}

var MAX_ARRAY_LENGTH = 4294967295;

function _toArrayLength (value) {
    return clamp(value, 0, MAX_ARRAY_LENGTH) >>> 0;
}

var generic = Function.bind.bind(Function.call);

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

function _makeReducer (step) {
    return function (arrayLike, accumulator, initialValue) {
        var len = _toArrayLength(arrayLike.length);
        var idx = step === 1 ? 0 : len - 1;
        var nCalls;
        var result;
        if (arguments.length === 3) {
            nCalls = len;
            result = initialValue;
        } else {
            if (len === 0) {
                throw new TypeError("Reduce of empty array-like with no initial value");
            }
            result = arrayLike[idx];
            idx += step;
            nCalls = len - 1;
        }
        for (; nCalls--; idx += step) {
            result = accumulator(result, arrayLike[idx], idx, arrayLike);
        }
        return result;
    };
}

var reduce = _makeReducer(1);

function _toInteger (value) {
    var n = +value;
    if (n !== n) {
        return 0;
    } else if (n % 1 === 0) {
        return n;
    } else {
        return Math.floor(Math.abs(n)) * (n < 0 ? -1 : 1);
    }
}

function slice (arrayLike, start, end) {
    var len = _toArrayLength(arrayLike.length);
    var begin = _toInteger(start);
    var upTo = _toInteger(end);
    if (begin < 0) {
        begin = begin < -len ? 0 : begin + len;
    }
    if (upTo < 0) {
        upTo = upTo < -len ? 0 : upTo + len;
    } else if (upTo > len) {
        upTo = len;
    }
    var resultLen = upTo - begin;
    var result = resultLen > 0 ? Array(resultLen) : [];
    for (var i = 0; i < resultLen; i++) {
        result[i] = arrayLike[begin + i];
    }
    return result;
}

var objectProtoToString = Object.prototype.toString;
function type (value) {
    return objectProtoToString.call(value).slice(8, -1);
}

function isIn (arrayLike, value) {
    var result = false;
    for (var i = 0, len = arrayLike.length; i < len; i++) {
        if (areSVZ(value, arrayLike[i])) {
            result = true;
            break;
        }
    }
    return result;
}

function uniquesBy (iteratee) {
    return function (arrayLike) {
        var result = [];
        for (var i = 0, len = arrayLike.length, seen = [], value; i < len; i++) {
            value = iteratee(arrayLike[i], i, arrayLike);
            if (!isIn(seen, value)) {
                seen.push(value);
                result.push(arrayLike[i]);
            }
        }
        return result;
    };
}

function dropFrom (arrayLike, n) {
    return slice(arrayLike, n, arrayLike.length);
}

var drop = _curry2(dropFrom, true);

function flatMap (array, iteratee) {
    return reduce(array, function (result, el, idx, arr) {
        var v = iteratee(el, idx, arr);
        if (!Array.isArray(v)) {
            v = [v];
        }
        for (var i = 0, len = v.length, rLen = result.length; i < len; i++) {
            result[rLen + i] = v[i];
        }
        return result;
    }, []);
}

var flatMapWith = _curry2(flatMap, true);

function _toNaturalIndex (idx, len) {
    idx = _toInteger(idx);
    return idx >= -len && idx < len ? idx < 0 ? idx + len : idx : NaN;
}

function getIndex (arrayLike, index) {
    var idx = _toNaturalIndex(index, _toArrayLength(arrayLike.length));
    return idx === idx ? arrayLike[idx] : void 0;
}

var getAt = _curry2(getIndex, true);

var head = getAt(0);

var last = getAt(-1);

function _argsToArrayFrom (idx) {
    return function () {
        var argsLen = arguments.length || idx;
        var len = argsLen - idx;
        var result = Array(len);
        for (var i = 0; i < len; i++) {
            result[i] = arguments[i + idx];
        }
        return result;
    };
}

var list = _argsToArrayFrom(0);

var tail = drop(1);

function _makeTypeErrorFor (value, desiredType) {
    return new TypeError("Cannot convert " + type(value).toLowerCase() + " to " + desiredType);
}

function pipe (functions) {
    if (!Array.isArray(functions)) {
        throw _makeTypeErrorFor(functions, "array");
    }
    var len = functions.length;
    return len ? function () {
        var result = functions[0].apply(this, arguments);
        for (var i = 1; i < len; i++) {
            result = functions[i].call(this, result);
        }
        return result;
    } : identity;
}

function unionBy (iteratee) {
    return pipe([binary(list), flatMapWith(drop(0)), uniquesBy(iteratee)]);
}

var union = unionBy(identity);

var zipWithIndex = mapWith(binary(list));

var _isOwnEnumerable = generic(Object.prototype.propertyIsEnumerable);

var hasOwn = generic(Object.prototype.hasOwnProperty);

var _search = generic(String.prototype.search);

const split = generic(String.prototype.split);
const splitBy = x => partial(split, [_, x]);
const splitByDot = splitBy(".");

export { split, splitBy, splitByDot };
