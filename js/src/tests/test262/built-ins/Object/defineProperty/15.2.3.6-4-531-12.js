// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 15.2.3.6-4-531-12
description: >
    Object.defineProperty will update [[Get]] and [[Set]] attributes
    of indexed accessor property successfully when [[Configurable]]
    attribute is true, 'O' is an Arguments object (8.12.9 step 11)
includes: [propertyHelper.js]
---*/


var obj = (function() {
  return arguments;
}());

obj.verifySetFunction = "data";
Object.defineProperty(obj, "0", {
  get: function() {
    return obj.verifySetFunction;
  },
  set: function(value) {
    obj.verifySetFunction = value;
  },
  configurable: true
});

obj.verifySetFunction1 = "data1";
var getFunc = function() {
  return obj.verifySetFunction1;
};
var setFunc = function(value) {
  obj.verifySetFunction1 = value;
};

Object.defineProperty(obj, "0", {
  get: getFunc,
  set: setFunc
});

verifyEqualTo(obj, "0", getFunc());

verifyWritable(obj, "0", "verifySetFunction1");

verifyProperty(obj, "0", {
  enumerable: false,
  configurable: true,
});

reportCompare(0, 0);
