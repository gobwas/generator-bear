var assert = require('assert');
var generatorBear = require('../');

describe('generator-bear node module', function () {
	it('must have at least one test', function () {
		generatorBear();
		assert(false, 'I was too lazy to write any tests. Shame on me.');
	});
});