// |reftest| skip-if(!this.hasOwnProperty('Temporal')) -- Temporal is not enabled unconditionally
// Copyright (C) 2022 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-get-temporal.plaindate.prototype.yearofweek
description: Validate result returned from calendar yearOfWeek() method
features: [Temporal]
---*/

const badResults = [
  [Infinity, RangeError],
  [-Infinity, RangeError],
  [Symbol("foo"), TypeError],
  [7n, TypeError],
  [NaN, RangeError],
  ["string", TypeError],
  [{}, TypeError],
  [null, TypeError],
  [true, TypeError],
  [false, TypeError],
  [7.1, RangeError],
  [-0.1, RangeError],
  [NaN, RangeError],
  ["7", TypeError],
  ["7.5", TypeError],
  [{valueOf() { return 7; }}, TypeError],
];

badResults.forEach(([result, error]) => {
  const calendar = new class extends Temporal.Calendar {
    yearOfWeek() {
      return result;
    }
  }("iso8601");
  const instance = new Temporal.PlainDate(1981, 12, 15, calendar);
  assert.throws(error, () => instance.yearOfWeek, `${typeof result} ${String(result)} not converted to integer`);
});

const preservedResults = [
  -7,
];

preservedResults.forEach(result => {
  const calendar = new class extends Temporal.Calendar {
    yearOfWeek() {
      return result;
    }
  }("iso8601");
  const instance = new Temporal.PlainDate(1981, 12, 15, calendar);
  assert.sameValue(instance.yearOfWeek, result, `${typeof result} ${String(result)} preserved`);
});

reportCompare(0, 0);
