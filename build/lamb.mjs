var _ = {};

function always (value) {
    return function () {
        return value;
    };
}

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

function _makePartial3 (fn, shouldAritize) {
    return function (a, b) {
        var f = shouldAritize && arguments.length !== 2 ? binary(fn) : fn;
        return partial(f, [_, a, b]);
    };
}

var clampWithin = _makePartial3(clamp);

function identity (value) {
    return value;
}

function compose (a, b) {
    return arguments.length ? function () {
        return a.call(this, b.apply(this, arguments));
    } : identity;
}

var MAX_ARRAY_LENGTH = 4294967295;
var MAX_SAFE_INTEGER = 9007199254740991;

function _toArrayLength (value) {
    return clamp(value, 0, MAX_ARRAY_LENGTH) >>> 0;
}

function forEach (arrayLike, iteratee) {
    for (var i = 0, len = _toArrayLength(arrayLike.length); i < len; i++) {
        iteratee(arrayLike[i], i, arrayLike);
    }
}

var generic = Function.bind.bind(Function.call);

function isNull (value) {
    return value === null;
}

function isUndefined (value) {
    return value === void 0;
}

function isNil (value) {
    return isNull(value) || isUndefined(value);
}

function _curry2 (fn, isRightCurry) {
    return function (a) {
        return function (b) {
            return isRightCurry ? fn.call(this, b, a) : fn.call(this, a, b);
        };
    };
}

var isSVZ = _curry2(areSVZ);

function map (arrayLike, iteratee) {
    var len = _toArrayLength(arrayLike.length);
    var result = Array(len);
    for (var i = 0; i < len; i++) {
        result[i] = iteratee(arrayLike[i], i, arrayLike);
    }
    return result;
}

var mapWith = _curry2(map, true);

function partialRight (fn, args) {
    return function () {
        if (!Array.isArray(args)) {
            return fn.apply(this, arguments);
        }
        var lastIdx = arguments.length - 1;
        var argsLen = args.length;
        var boundArgs = Array(argsLen);
        var newArgs = [];
        for (var i = argsLen - 1, boundArg; i > -1; i--) {
            boundArg = args[i];
            boundArgs[i] = boundArg === _ ? arguments[lastIdx--] : boundArg;
        }
        for (i = 0; i <= lastIdx; i++) {
            newArgs[i] = arguments[i];
        }
        for (var j = 0; j < argsLen; j++) {
            newArgs[i++] = boundArgs[j];
        }
        return fn.apply(this, newArgs);
    };
}

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

var reduceWith = _makePartial3(reduce, true);

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

var sliceAt = _makePartial3(slice);

var objectProtoToString = Object.prototype.toString;
function type (value) {
    return objectProtoToString.call(value).slice(8, -1);
}

function appendTo (arrayLike, value) {
    return slice(arrayLike, 0, arrayLike.length).concat([value]);
}

var append = _curry2(appendTo, true);

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

var contains = _curry2(isIn, true);

function _groupWith (makeValue) {
    return function (arrayLike, iteratee) {
        var result = {};
        var len = arrayLike.length;
        for (var i = 0, element, key; i < len; i++) {
            element = arrayLike[i];
            key = iteratee(element, i, arrayLike);
            result[key] = makeValue(result[key], element);
        }
        return result;
    };
}

var count = _groupWith(function (a) {
    return a ? ++a : 1;
});

var countBy = _curry2(count, true);

function filter (arrayLike, predicate) {
    var len = arrayLike.length;
    var result = [];
    for (var i = 0; i < len; i++) {
        predicate(arrayLike[i], i, arrayLike) && result.push(arrayLike[i]);
    }
    return result;
}

function not (predicate) {
    return function () {
        return !predicate.apply(this, arguments);
    };
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

var uniques = uniquesBy(identity);

function difference (arrayLike, other) {
    var isNotInOther = partial(not(isIn), [other]);
    return uniques(filter(arrayLike, isNotInOther));
}

function dropFrom (arrayLike, n) {
    return slice(arrayLike, n, arrayLike.length);
}

var drop = _curry2(dropFrom, true);

function _getNumConsecutiveHits (arrayLike, predicate) {
    var idx = 0;
    var len = arrayLike.length;
    while (idx < len && predicate(arrayLike[idx], idx, arrayLike)) {
        idx++;
    }
    return idx;
}

function dropWhile (predicate) {
    return function (arrayLike) {
        return slice(arrayLike, _getNumConsecutiveHits(arrayLike, predicate), arrayLike.length);
    };
}

function _makeArrayChecker (defaultResult) {
    return function (arrayLike, predicate) {
        for (var i = 0, len = arrayLike.length; i < len; i++) {
            if (defaultResult ^ !!predicate(arrayLike[i], i, arrayLike)) {
                return !defaultResult;
            }
        }
        return defaultResult;
    };
}

var everyIn = _makeArrayChecker(true);

var every = _curry2(everyIn, true);

var filterWith = _curry2(filter, true);

function findIndex (arrayLike, predicate) {
    var result = -1;
    for (var i = 0, len = arrayLike.length; i < len; i++) {
        if (predicate(arrayLike[i], i, arrayLike)) {
            result = i;
            break;
        }
    }
    return result;
}

function find (arrayLike, predicate) {
    var idx = findIndex(arrayLike, predicate);
    return idx === -1 ? void 0 : arrayLike[idx];
}

var findWhere = _curry2(find, true);

var findIndexWhere = _curry2(findIndex, true);

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

function _flatten (array, isDeep, output, idx) {
    for (var i = 0, len = array.length, value, j, vLen; i < len; i++) {
        value = array[i];
        if (!Array.isArray(value)) {
            output[idx++] = value;
        } else if (isDeep) {
            _flatten(value, true, output, idx);
            idx = output.length;
        } else {
            vLen = value.length;
            output.length += vLen;
            for (j = 0; j < vLen; j++) {
                output[idx++] = value[j];
            }
        }
    }
    return output;
}

var _makeArrayFlattener = _curry2(function (isDeep, array) {
    return Array.isArray(array) ? _flatten(array, isDeep, [], 0) : slice(array, 0, array.length);
});

var flatten = _makeArrayFlattener(true);

function _toNaturalIndex (idx, len) {
    idx = _toInteger(idx);
    return idx >= -len && idx < len ? idx < 0 ? idx + len : idx : NaN;
}

function getIndex (arrayLike, index) {
    var idx = _toNaturalIndex(index, _toArrayLength(arrayLike.length));
    return idx === idx ? arrayLike[idx] : void 0;
}

var getAt = _curry2(getIndex, true);

var group = _groupWith(function (a, b) {
    if (!a) {
        return [b];
    }
    a[a.length] = b;
    return a;
});

var groupBy = _curry2(group, true);

var head = getAt(0);

var index = _groupWith(function (a, b) {
    return b;
});

var indexBy = _curry2(index, true);

var init = partial(slice, [_, 0, -1]);

function insert (arrayLike, index, element) {
    var result = slice(arrayLike, 0, arrayLike.length);
    result.splice(index, 0, element);
    return result;
}

var insertAt = _makePartial3(insert);

function intersection (a, b) {
    var result = [];
    var lenA = a.length;
    if (lenA && b.length) {
        for (var i = 0; i < lenA; i++) {
            !isIn(result, a[i]) && isIn(b, a[i]) && result.push(a[i]);
        }
    }
    return result;
}

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

function partition (arrayLike, predicate) {
    var result = [[], []];
    var len = arrayLike.length;
    for (var i = 0, el; i < len; i++) {
        el = arrayLike[i];
        result[predicate(el, i, arrayLike) ? 0 : 1].push(el);
    }
    return result;
}

var partitionWith = _curry2(partition, true);

function getIn (obj, key) {
    return obj[key];
}

var getKey = _curry2(getIn, true);

function pluck (arrayLike, key) {
    return map(arrayLike, getKey(key));
}

var pluckKey = compose(mapWith, getKey);

function pullFrom (arrayLike, values) {
    return values ? filter(arrayLike, function (element) {
        return !isIn(values, element);
    }) : slice(arrayLike, 0, arrayLike.length);
}

var pull = _curry2(pullFrom, true);

var reduceRight = _makeReducer(-1);

var reduceRightWith = _makePartial3(reduceRight, true);

function reverse (arrayLike) {
    var len = _toArrayLength(arrayLike.length);
    var result = Array(len);
    for (var i = 0, ofs = len - 1; i < len; i++) {
        result[i] = arrayLike[ofs - i];
    }
    return result;
}

function rotate (arrayLike, amount) {
    var len = arrayLike.length;
    var shift = amount % len;
    return slice(arrayLike, -shift, len).concat(slice(arrayLike, 0, -shift));
}

var rotateBy = _curry2(rotate, true);

function _setIndex (arrayLike, idx, value, updater) {
    var result = slice(arrayLike, 0, arrayLike.length);
    var n = _toNaturalIndex(idx, result.length);
    if (n === n) {
        result[n] = arguments.length === 4 ? updater(arrayLike[n]) : value;
    }
    return result;
}

var setAt = _makePartial3(_setIndex);

function aritize (fn, arity) {
    return function () {
        var n = _toInteger(arity);
        var args = list.apply(null, arguments).slice(0, n);
        for (var i = args.length; i < n; i++) {
            args[i] = void 0;
        }
        return fn.apply(this, args);
    };
}

var setIndex = aritize(_setIndex, 3);

var shallowFlatten = _makeArrayFlattener(false);

var someIn = _makeArrayChecker(false);

var some = _curry2(someIn, true);

function _compareWith (criteria) {
    return function (a, b) {
        var len = criteria.length;
        var criterion = criteria[0];
        var result = criterion.compare(a.value, b.value);
        for (var i = 1; result === 0 && i < len; i++) {
            criterion = criteria[i];
            result = criterion.compare(a.value, b.value);
        }
        if (result === 0) {
            result = a.index - b.index;
        }
        return criterion.isDescending ? -result : result;
    };
}

function _comparer (a, b) {
    var result = 0;
    if (typeof a !== typeof b) {
        a = String(a);
        b = String(b);
    }
    if (!areSVZ(a, b)) {
        result = a > b || a !== a ? 1 : -1;
    }
    return result;
}

function _sorter (reader, isDescending, comparer) {
    if (typeof reader !== "function" || reader === identity) {
        reader = null;
    }
    if (typeof comparer !== "function") {
        comparer = _comparer;
    }
    return {
        isDescending: isDescending === true,
        compare: function (a, b) {
            if (reader) {
                a = reader(a);
                b = reader(b);
            }
            return comparer(a, b);
        }
    };
}

function _makeCriterion (criterion) {
    return criterion && typeof criterion.compare === "function" ? criterion : _sorter(criterion);
}

function _makeCriteria (sorters) {
    return sorters && sorters.length ? map(sorters, _makeCriterion) : [_sorter()];
}

function sort (arrayLike, sorters) {
    var criteria = _makeCriteria(sorters);
    var len = _toArrayLength(arrayLike.length);
    var result = Array(len);
    for (var i = 0; i < len; i++) {
        result[i] = { value: arrayLike[i], index: i };
    }
    result.sort(_compareWith(criteria));
    for (i = 0; i < len; i++) {
        result[i] = result[i].value;
    }
    return result;
}

function _getInsertionIndex (array, element, comparer, start, end) {
    if (array.length === 0) {
        return 0;
    }
    var pivot = (start + end) >> 1;
    var result = comparer(
        { value: element, index: pivot },
        { value: array[pivot], index: pivot }
    );
    if (end - start <= 1) {
        return result < 0 ? pivot : pivot + 1;
    } else if (result < 0) {
        return _getInsertionIndex(array, element, comparer, start, pivot);
    } else if (result === 0) {
        return pivot + 1;
    } else {
        return _getInsertionIndex(array, element, comparer, pivot, end);
    }
}

function sortedInsert (arrayLike, element, sorters) {
    var result = slice(arrayLike, 0, arrayLike.length);
    if (arguments.length === 1) {
        return result;
    }
    var criteria = _makeCriteria(sorters);
    var idx = _getInsertionIndex(result, element, _compareWith(criteria), 0, result.length);
    result.splice(idx, 0, element);
    return result;
}

var sorter = partial(_sorter, [_, false, _]);

var sorterDesc = partial(_sorter, [_, true, _]);

var sortWith = _curry2(sort, true);

var tail = drop(1);

function takeFrom (arrayLike, n) {
    return slice(arrayLike, 0, n);
}

var take = _curry2(takeFrom, true);

function takeWhile (predicate) {
    return function (arrayLike) {
        return slice(arrayLike, 0, _getNumConsecutiveHits(arrayLike, predicate));
    };
}

function transpose (arrayLike) {
    var minLen = MAX_ARRAY_LENGTH;
    var len = _toArrayLength(arrayLike.length);
    if (len === 0) {
        return [];
    }
    for (var j = 0, elementLen; j < len; j++) {
        elementLen = _toArrayLength(arrayLike[j].length);
        if (elementLen < minLen) {
            minLen = elementLen;
        }
    }
    var result = Array(minLen);
    for (var i = 0, el; i < minLen; i++) {
        el = result[i] = Array(len);
        for (j = 0; j < len; j++) {
            el[j] = arrayLike[j][i];
        }
    }
    return result;
}

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

function updateAt (index, updater) {
    return function (arrayLike) {
        return _setIndex(arrayLike, index, null, updater);
    };
}

var updateIndex = partial(_setIndex, [_, _, null, _]);

function zip (a, b) {
    return transpose([a, b]);
}

var zipWithIndex = mapWith(binary(list));

function application (fn, args) {
    return fn.apply(this, Object(args));
}

var apply = _curry2(application);

var applyTo = _curry2(application, true);

function _asPartial (fn, argsHolder) {
    return function () {
        var argsLen = arguments.length;
        var lastIdx = 0;
        var newArgs = [];
        for (var i = 0, len = argsHolder.length, boundArg; i < len; i++) {
            boundArg = argsHolder[i];
            newArgs[i] = boundArg === _ && lastIdx < argsLen ? arguments[lastIdx++] : boundArg;
        }
        while (lastIdx < argsLen) {
            newArgs[i++] = arguments[lastIdx++];
        }
        for (i = 0; i < argsLen; i++) {
            if (arguments[i] === _) {
                return _asPartial(fn, newArgs);
            }
        }
        for (i = 0, len = newArgs.length; i < len; i++) {
            if (newArgs[i] === _) {
                newArgs[i] = void 0;
            }
        }
        return fn.apply(this, newArgs);
    };
}

function asPartial (fn) {
    return _asPartial(fn, []);
}

function collect (functions) {
    if (!Array.isArray(functions)) {
        throw _makeTypeErrorFor(functions, "array");
    }
    return function () {
        return map(functions, applyTo(arguments));
    };
}

function _currier (fn, arity, isRightCurry, isAutoCurry, argsHolder) {
    return function () {
        var holderLen = argsHolder.length;
        var argsLen = arguments.length;
        var newArgsLen = holderLen + (argsLen > 1 && isAutoCurry ? argsLen : 1);
        var newArgs = Array(newArgsLen);
        for (var i = 0; i < holderLen; i++) {
            newArgs[i] = argsHolder[i];
        }
        for (; i < newArgsLen; i++) {
            newArgs[i] = arguments[i - holderLen];
        }
        if (newArgsLen >= arity) {
            return fn.apply(this, isRightCurry ? newArgs.reverse() : newArgs);
        } else {
            return _currier(fn, arity, isRightCurry, isAutoCurry, newArgs);
        }
    };
}

function _curry3 (fn, isRightCurry) {
    return function (a) {
        return function (b) {
            return function (c) {
                return isRightCurry ? fn.call(this, c, b, a) : fn.call(this, a, b, c);
            };
        };
    };
}

function _curry (fn, arity, isRightCurry, isAutoCurry) {
    if (arity >>> 0 !== arity) {
        arity = fn.length;
    }
    if (isAutoCurry && arity > 1 || arity > 3) {
        return _currier(fn, arity, isRightCurry, isAutoCurry, []);
    } else if (arity === 2) {
        return _curry2(fn, isRightCurry);
    } else if (arity === 3) {
        return _curry3(fn, isRightCurry);
    } else {
        return fn;
    }
}

function curry (fn, arity) {
    return _curry(fn, arity, false);
}

function curryable (fn, arity) {
    return _curry(fn, arity, false, true);
}

function curryableRight (fn, arity) {
    return _curry(fn, arity, true, true);
}

function curryRight (fn, arity) {
    return _curry(fn, arity, true);
}

function debounce (fn, timespan) {
    var timeoutID;
    return function () {
        var args = arguments;
        var debounced = function () {
            timeoutID = null;
            fn.apply(this, args);
        }.bind(this);
        clearTimeout(timeoutID);
        timeoutID = setTimeout(debounced, timespan);
    };
}

function flip (fn) {
    return function () {
        var args = list.apply(null, arguments).reverse();
        return fn.apply(this, args);
    };
}

function getArgAt (idx) {
    return function () {
        return arguments[_toNaturalIndex(idx, arguments.length)];
    };
}

var _argsTail = _argsToArrayFrom(1);

function _invoker (boundArgs, methodName, target) {
    var method = target[methodName];
    if (typeof method !== "function") {
        return void 0;
    }
    var boundArgsLen = boundArgs.length;
    var ofs = 3 - boundArgsLen;
    var len = arguments.length - ofs;
    var args = Array(len);
    for (var i = 0; i < boundArgsLen; i++) {
        args[i] = boundArgs[i];
    }
    for (; i < len; i++) {
        args[i] = arguments[i + ofs];
    }
    return method.apply(target, args);
}

function invoker (methodName) {
    return partial(_invoker, [_argsTail.apply(null, arguments), methodName]);
}

function invokerOn (target) {
    return partial(_invoker, [[], _, target]);
}

function mapArgs (fn, mapper) {
    return pipe([list, mapWith(mapper), apply(fn)]);
}

function tapArgs (fn, tappers) {
    return function () {
        var len = arguments.length;
        var tappersLen = tappers.length;
        var args = [];
        for (var i = 0; i < len; i++) {
            args.push(i < tappersLen ? tappers[i](arguments[i]) : arguments[i]);
        }
        return fn.apply(this, args);
    };
}

function throttle (fn, timespan) {
    var result;
    var lastCall = 0;
    return function () {
        var now = Date.now();
        if (now - lastCall >= timespan) {
            lastCall = now;
            result = fn.apply(this, arguments);
        }
        return result;
    };
}

function unary (fn) {
    return function (a) {
        return fn.call(this, a);
    };
}

function adapter (functions) {
    if (!Array.isArray(functions)) {
        throw _makeTypeErrorFor(functions, "array");
    }
    return function () {
        var len = functions.length;
        var result;
        for (var i = 0; i < len; i++) {
            result = functions[i].apply(this, arguments);
            if (!isUndefined(result)) {
                break;
            }
        }
        return result;
    };
}

function _checkPredicates (checkAll) {
    return function (predicates) {
        if (!Array.isArray(predicates)) {
            throw _makeTypeErrorFor(predicates, "array");
        }
        return function () {
            for (var i = 0, len = predicates.length, result; i < len; i++) {
                result = predicates[i].apply(this, arguments);
                if (checkAll && !result) {
                    return false;
                } else if (!checkAll && result) {
                    return true;
                }
            }
            return checkAll;
        };
    };
}

var allOf = _checkPredicates(true);

var anyOf = _checkPredicates(false);

function areSame (a, b) {
    return a === 0 && b === 0 ? 1 / a === 1 / b : areSVZ(a, b);
}

function case_ (predicate, fn) {
    return function () {
        return predicate.apply(this, arguments) ? fn.apply(this, arguments) : void 0;
    };
}

function condition (predicate, trueFn, falseFn) {
    return function () {
        return (predicate.apply(this, arguments) ? trueFn : falseFn).apply(this, arguments);
    };
}

function gt (a, b) {
    return a > b;
}

function gte (a, b) {
    return a >= b;
}

var is = _curry2(areSame);

var isGT = _curry2(gt, true);

var isGTE = _curry2(gte, true);

function lt (a, b) {
    return a < b;
}

var isLT = _curry2(lt, true);

function lte (a, b) {
    return a <= b;
}

var isLTE = _curry2(lte, true);

function unless (predicate, fn) {
    return function (value) {
        return predicate.call(this, value) ? value : fn.call(this, value);
    };
}

function when (predicate, fn) {
    return function (value) {
        return predicate.call(this, value) ? fn.call(this, value) : value;
    };
}

function sum (a, b) {
    return a + b;
}

var add = _curry2(sum, true);

function subtract (a, b) {
    return a - b;
}

var deduct = _curry2(subtract, true);

function divide (a, b) {
    return a / b;
}

var divideBy = _curry2(divide, true);

function generate (start, len, iteratee) {
    var result = [start];
    for (var i = 0, limit = len - 1; i < limit; i++) {
        result.push(iteratee(result[i], i, result));
    }
    return result;
}

function isFinite_ (value) {
    return type(value) === "Number" && isFinite(value);
}

function isInteger (value) {
    return type(value) === "Number" && value % 1 === 0;
}

function isSafeInteger (value) {
    return isInteger(value) && Math.abs(value) <= MAX_SAFE_INTEGER;
}

function modulo (a, b) {
    return a - (b * Math.floor(a / b));
}

function multiply (a, b) {
    return a * b;
}

var multiplyBy = _curry2(multiply, true);

function randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function _forceToNumber (value) {
    var n = +value;
    return n === n ? n : 0;
}

function range (start, limit, step) {
    start = _forceToNumber(start);
    limit = _forceToNumber(limit);
    step = arguments.length === 3 ? _forceToNumber(step) : 1;
    if (step === 0) {
        return limit === start ? [] : [start];
    }
    var len = Math.max(Math.ceil((limit - start) / step), 0);
    var result = Array(len);
    for (var i = 0, last = start; i < len; i++) {
        result[i] = last;
        last += step;
    }
    return result;
}

function remainder (a, b) {
    return a % b;
}

var _isOwnEnumerable = generic(Object.prototype.propertyIsEnumerable);

function _safeEnumerables (obj) {
    var result = [];
    for (var key in obj) {
        result.push(key);
    }
    return result;
}

function _isEnumerable (obj, key) {
    return key in Object(obj) && (_isOwnEnumerable(obj, key) || ~_safeEnumerables(obj).indexOf(key));
}

function _getPathKey (target, key, includeNonEnumerables) {
    if (includeNonEnumerables && key in Object(target) || _isEnumerable(target, key)) {
        return key;
    }
    var n = +key;
    var len = target && target.length;
    return n >= -len && n < len ? n < 0 ? n + len : n : void 0;
}

function _getPathInfo (obj, parts, walkNonEnumerables) {
    if (isNil(obj)) {
        throw _makeTypeErrorFor(obj, "object");
    }
    var target = obj;
    var i = -1;
    var len = parts.length;
    var key;
    while (++i < len) {
        key = _getPathKey(target, parts[i], walkNonEnumerables);
        if (isUndefined(key)) {
            break;
        }
        target = target[key];
    }
    return i === len ? { isValid: true, target: target } : { isValid: false, target: void 0 };
}

function _toPathParts (path, separator) {
    return String(path).split(separator || ".");
}

function getPathIn (obj, path, separator) {
    return _getPathInfo(obj, _toPathParts(path, separator), true).target;
}

function checker (predicate, message, keyPaths, pathSeparator) {
    return function (obj) {
        var getValues = partial(getPathIn, [obj, _, pathSeparator]);
        return predicate.apply(obj, map(keyPaths, getValues)) ? [] : [message, keyPaths];
    };
}

var _unsafeKeyListFrom = _curry2(function (getKeys, obj) {
    if (isNil(obj)) {
        throw _makeTypeErrorFor(obj, "object");
    }
    return getKeys(obj);
});

var enumerables = _unsafeKeyListFrom(_safeEnumerables);

function fromPairs (pairsList) {
    var result = {};
    forEach(pairsList, function (pair) {
        result[pair[0]] = pair[1];
    });
    return result;
}

var getPath = _makePartial3(getPathIn);

function has (obj, key) {
    if (typeof obj !== "object" && !isUndefined(obj)) {
        obj = Object(obj);
    }
    return key in obj;
}

var hasKey = _curry2(has, true);

var hasOwn = generic(Object.prototype.hasOwnProperty);

var hasOwnKey = _curry2(hasOwn, true);

function hasKeyValue (key, value) {
    return function (obj) {
        return isUndefined(value) ? has(obj, key) && obj[key] === value : areSVZ(value, obj[key]);
    };
}

function hasPathValue (path, value, separator) {
    return function (obj) {
        var pathInfo = _getPathInfo(obj, _toPathParts(path, separator), true);
        return pathInfo.isValid && areSVZ(pathInfo.target, value);
    };
}

function _immutable (obj, seen) {
    if (seen.indexOf(obj) === -1) {
        seen.push(Object.freeze(obj));
        forEach(Object.getOwnPropertyNames(obj), function (key) {
            var value = obj[key];
            if (typeof value === "object" && !isNull(value)) {
                _immutable(value, seen);
            }
        });
    }
    return obj;
}

function immutable (obj) {
    return _immutable(obj, []);
}

var _safeKeys = compose(Object.keys, Object);

var keys = _unsafeKeyListFrom(_safeKeys);

function keySatisfies (predicate, key) {
    return function (obj) {
        return predicate.call(this, obj[key]);
    };
}

function make (names, values) {
    var result = {};
    var valuesLen = values.length;
    for (var i = 0, len = names.length; i < len; i++) {
        result[names[i]] = i < valuesLen ? values[i] : void 0;
    }
    return result;
}

function mapValues (source, fn) {
    if (isNil(source)) {
        throw _makeTypeErrorFor(source, "object");
    }
    var result = {};
    for (var key in source) {
        result[key] = fn(source[key], key, source);
    }
    return result;
}

var mapValuesWith = _curry2(mapValues, true);

function _merge (getKeys, a, b) {
    return reduce([a, b], function (result, source) {
        forEach(getKeys(source), function (key) {
            result[key] = source[key];
        });
        return result;
    }, {});
}

var merge = partial(_merge, [enumerables]);

var mergeOwn = partial(_merge, [keys]);

var _keyToPairIn = _curry2(function (obj, key) {
    return [key, obj[key]];
});

var _pairsFrom = _curry2(function (getKeys, obj) {
    return map(getKeys(obj), _keyToPairIn(obj));
});

var ownPairs = _pairsFrom(keys);

var _valuesFrom = _curry2(function (getKeys, obj) {
    return map(getKeys(obj), function (key) {
        return obj[key];
    });
});

var ownValues = _valuesFrom(keys);

var pairs = _pairsFrom(enumerables);

function pathExistsIn (obj, path, separator) {
    return _getPathInfo(obj, _toPathParts(path, separator), true).isValid;
}

var pathExists = _makePartial3(pathExistsIn);

function pathSatisfies (predicate, path, separator) {
    return function (obj) {
        var pathInfo = _getPathInfo(obj, _toPathParts(path, separator), true);
        return predicate.call(this, pathInfo.target);
    };
}

function pick (source, whitelist) {
    var result = {};
    for (var i = 0, len = whitelist.length, key; i < len; i++) {
        key = whitelist[i];
        if (has(source, key)) {
            result[key] = source[key];
        }
    }
    return result;
}

function pickIf (predicate) {
    return function (source) {
        if (isNil(source)) {
            throw _makeTypeErrorFor(source, "object");
        }
        var result = {};
        for (var key in source) {
            if (predicate(source[key], key, source)) {
                result[key] = source[key];
            }
        }
        return result;
    };
}

var pickKeys = _curry2(pick, true);

function rename (source, keysMap) {
    keysMap = Object(keysMap);
    var result = {};
    var oldKeys = enumerables(source);
    for (var prop in keysMap) {
        if (~oldKeys.indexOf(prop)) {
            result[keysMap[prop]] = source[prop];
        }
    }
    for (var i = 0, len = oldKeys.length, key; i < len; i++) {
        key = oldKeys[i];
        if (!(key in keysMap || key in result)) {
            result[key] = source[key];
        }
    }
    return result;
}

var renameKeys = _curry2(rename, true);

function renameWith (fn) {
    return function (source) {
        return rename(source, fn(source));
    };
}

function _setIn (source, key, value) {
    var result = {};
    for (var prop in source) {
        result[prop] = source[prop];
    }
    result[key] = value;
    return result;
}

function setIn (source, key, value) {
    if (isNil(source)) {
        throw _makeTypeErrorFor(source, "object");
    }
    return _setIn(source, key, value);
}

var setKey = _makePartial3(setIn);

function _isArrayIndex (target, key) {
    var n = +key;
    return Array.isArray(target) && n % 1 === 0 && !(n < 0 && _isEnumerable(target, key));
}

function _setPathIn (obj, parts, value) {
    var key = parts[0];
    var partsLen = parts.length;
    var v;
    if (partsLen === 1) {
        v = value;
    } else {
        var targetKey = _getPathKey(obj, key, false);
        v = _setPathIn(
            isUndefined(targetKey) ? targetKey : obj[targetKey],
            slice(parts, 1, partsLen),
            value
        );
    }
    return _isArrayIndex(obj, key) ? _setIndex(obj, key, v) : _setIn(obj, key, v);
}

function setPathIn (source, path, value, separator) {
    if (isNil(source)) {
        throw _makeTypeErrorFor(source, "object");
    }
    return _setPathIn(source, _toPathParts(path, separator), value);
}

function setPath (path, value, separator) {
    return function (source) {
        return setPathIn(source, path, value, separator);
    };
}

function skip (source, blacklist) {
    if (isNil(source)) {
        throw _makeTypeErrorFor(source, "object");
    }
    var result = {};
    var props = make(blacklist, []);
    for (var key in source) {
        if (!(key in props)) {
            result[key] = source[key];
        }
    }
    return result;
}

var skipIf = compose(pickIf, not);

var skipKeys = _curry2(skip, true);

var _tearFrom = _curry2(function (getKeys, obj) {
    return reduce(getKeys(obj), function (result, key) {
        result[0].push(key);
        result[1].push(obj[key]);
        return result;
    }, [[], []]);
});

var tear = _tearFrom(enumerables);

var tearOwn = _tearFrom(keys);

function updateIn (source, key, updater) {
    return _isEnumerable(source, key) ?
        _setIn(source, key, updater(source[key])) :
        _merge(enumerables, source, {});
}

var updateKey = _makePartial3(updateIn);

function updatePathIn (source, path, updater, separator) {
    var parts = _toPathParts(path, separator);
    var pathInfo = _getPathInfo(source, parts, false);
    if (pathInfo.isValid) {
        return _setPathIn(source, parts, updater(pathInfo.target));
    } else {
        return Array.isArray(source) ? slice(source, 0, source.length) : _merge(enumerables, source, {});
    }
}

function updatePath (path, updater, separator) {
    return function (source) {
        return updatePathIn(source, path, updater, separator);
    };
}

function validate (obj, checkers) {
    return reduce(checkers, function (errors, _checker) {
        var result = _checker(obj);
        result.length && errors.push(result);
        return errors;
    }, []);
}

var validateWith = _curry2(validate, true);

var values = _valuesFrom(enumerables);

function _repeat (source, times) {
    var result = "";
    for (var i = 0; i < times; i++) {
        result += source;
    }
    return result;
}

function _getPadding (source, char, len) {
    if (!isNil(source) && type(source) !== "String") {
        source = String(source);
    }
    return _repeat(String(char)[0] || "", Math.ceil(len - source.length));
}

function padLeft (source, char, len) {
    return _getPadding(source, char, len) + source;
}

function padRight (source, char, len) {
    return source + _getPadding(source, char, len);
}

function repeat (source, times) {
    if (isNil(source)) {
        throw _makeTypeErrorFor(source, "string");
    }
    return _repeat(source, Math.floor(times));
}

var _search = generic(String.prototype.search);

function testWith (pattern) {
    return function (s) {
        return _search(s, pattern) !== -1;
    };
}

function isInstanceOf (constructor) {
    return function (obj) {
        return obj instanceof constructor;
    };
}

function isType (typeName) {
    return function (value) {
        return type(value) === typeName;
    };
}

export { _, always, areSVZ, binary, clamp, clampWithin, compose, forEach, generic, identity, isNil, isNull, isSVZ, isUndefined, map, mapWith, partial, partialRight, reduce, reduceWith, slice, sliceAt, type, append, appendTo, contains, count, countBy, difference, drop, dropFrom, dropWhile, every, everyIn, filter, filterWith, find, findIndex, findWhere, findIndexWhere, flatMap, flatMapWith, flatten, getAt, getIndex, group, groupBy, head, index, indexBy, init, insert, insertAt, intersection, isIn, last, list, partition, partitionWith, pluck, pluckKey, pull, pullFrom, reduceRight, reduceRightWith, reverse, rotate, rotateBy, setAt, setIndex, shallowFlatten, some, someIn, sort, sortedInsert, sorter, sorterDesc, sortWith, tail, take, takeFrom, takeWhile, transpose, union, unionBy, uniques, uniquesBy, updateAt, updateIndex, zip, zipWithIndex, application, apply, applyTo, asPartial, aritize, collect, curry, curryable, curryableRight, curryRight, debounce, flip, getArgAt, invoker, invokerOn, mapArgs, pipe, tapArgs, throttle, unary, adapter, allOf, anyOf, areSame, case_ as case, condition, gt, gte, is, isGT, isGTE, isLT, isLTE, lt, lte, not, unless, when, add, deduct, divide, divideBy, generate, isFinite_ as isFinite, isInteger, isSafeInteger, modulo, multiply, multiplyBy, randomInt, range, remainder, subtract, sum, checker, enumerables, fromPairs, getIn, getKey, getPath, getPathIn, has, hasKey, hasOwn, hasOwnKey, hasKeyValue, hasPathValue, immutable, keys, keySatisfies, make, mapValues, mapValuesWith, merge, mergeOwn, ownPairs, ownValues, pairs, pathExists, pathExistsIn, pathSatisfies, pick, pickIf, pickKeys, rename, renameKeys, renameWith, setIn, setKey, setPath, setPathIn, skip, skipIf, skipKeys, tear, tearOwn, updateIn, updateKey, updatePath, updatePathIn, validate, validateWith, values, padLeft, padRight, repeat, testWith, isInstanceOf, isType };
