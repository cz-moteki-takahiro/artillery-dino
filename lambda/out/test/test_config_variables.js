'use strict';

const test = require('tape');
const runner = require('../lib/runner').runner;

test('config variables', function(t) {
  const script = require('./scripts/config_variables.json');
  const ee = runner(script);
  ee.on('done', function(stats) {
    t.assert(stats.aggregate.codes[200] > 0, 'there are 200s for /');
    t.assert(stats.aggregate.codes[404] > 0, 'there are 404s for /will/404');
    t.end();
  });
  ee.run();
});
