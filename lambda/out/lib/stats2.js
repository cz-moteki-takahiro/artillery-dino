/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var L = require('lodash');
var sl = require('stats-lite');

module.exports = {
  create: create
};

function create() {
  return new Stats();
}

function Stats() {
  return this.reset();
}

Stats.prototype.addEntry = function (entry) {
  this._entries.push(entry);
  return this;
};

Stats.prototype.getEntries = function () {
  return this._entries;
};

Stats.prototype.newScenario = function () {
  this._generatedScenarios++;
  return this;
};

Stats.prototype.completedScenario = function () {
  this._completedScenarios++;
  return this;
};

Stats.prototype.addCode = function (code) {
  if (!this._codes[code]) {
    this._codes[code] = 0;
  }
  this._codes[code]++;
  return this;
};

Stats.prototype.addError = function (errCode) {
  if (!this._errors[errCode]) {
    this._errors[errCode] = 0;
  }
  this._errors[errCode]++;
  return this;
};

Stats.prototype.newRequest = function () {
  this._requestTimestamps.push(Date.now());
  return this;
};

Stats.prototype.completedRequest = function () {
  this._completedRequests++;
  return this;
};

Stats.prototype.addLatency = function (delta) {
  this._latencies.push(delta);
  return this;
};

Stats.prototype.addScenarioLatency = function (delta) {
  this._scenarioLatencies.push(delta);
  return this;
};

Stats.prototype.addMatch = function () {
  this._matches++;
  return this;
};

Stats.prototype.report = function () {
  var result = {};

  result.timestamp = new Date().toISOString();
  result.scenariosCreated = this._generatedScenarios;
  result.scenariosCompleted = this._completedScenarios;
  result.requestsCompleted = this._completedRequests;

  var latencies = L.map(this._entries, function (e) {
    return e[2];
  });

  result.latency = {
    min: round(L.min(latencies) / 1e6, 1),
    max: round(L.max(latencies) / 1e6, 1),
    median: round(sl.median(latencies) / 1e6, 1),
    p95: round(sl.percentile(latencies, 0.95) / 1e6, 1),
    p99: round(sl.percentile(latencies, 0.99) / 1e6, 1)
  };

  var startedAt = L.min(this._requestTimestamps);
  var now = Date.now();
  var count = L.size(this._requestTimestamps);
  var mean = Math.round(count / (Math.round((now - startedAt) / 10) / 100) * 100) / 100;

  result.rps = {
    count: count,
    mean: mean
  };

  result.scenarioDuration = {
    min: round(L.min(this._scenarioLatencies) / 1e6, 1),
    max: round(L.max(this._scenarioLatencies) / 1e6, 1),
    median: round(sl.median(this._scenarioLatencies) / 1e6, 1),
    p95: round(sl.percentile(this._scenarioLatencies, 0.95) / 1e6, 1),
    p99: round(sl.percentile(this._scenarioLatencies, 0.99) / 1e6, 1)
  };

  result.errors = this._errors;
  result.codes = this._codes;
  result.matches = this._matches;

  result.latencies = this.getEntries();

  return result;
};

Stats.prototype.reset = function () {
  this._entries = [];
  this._latencies = [];
  this._generatedScenarios = 0;
  this._completedScenarios = 0;
  this._codes = {};
  this._errors = {};
  this._requestTimestamps = [];
  this._completedRequests = 0;
  this._scenarioLatencies = [];
  this._matches = 0;
  return this;
};

Stats.prototype.free = function () {
  return this;
};

function round(number, decimals) {
  var m = Math.pow(10, decimals);
  return Math.round(number * m) / m;
}