// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 13.2-18-s
description: >
    StrictMode - writing a property named 'arguments' of function
    objects is not allowed outside the function
---*/

var foo = Function("'use strict';");

assert.throws(TypeError, function() {
    foo.arguments = 41;
});

reportCompare(0, 0);
