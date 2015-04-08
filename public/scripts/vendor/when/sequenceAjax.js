/** @license MIT License (c) copyright 2011-2013 original author or authors */

/**
 * sequence.js
 *
 * Run a set of task functions in sequence.  All tasks will
 * receive the same args.
 *
 * @author Brian Cavalier       & Borislav Ivanov
 * @author John Hann
 */

(function(define) {
define(function(require) {

	var when, slice;

	when = require('./when');
	slice = Array.prototype.slice;

	/**
	 * Run array of tasks in sequence with no overlap
     * @param context  the context in which the functions are going to be executed
	 * @param tasks {Array|Promise} array or promiseForArray of task functions
	 * @param [arrayOfArgs] {*} arguments from this array are going to be passed for each function of the corresponding index , for example tasks[1] , will receive arrayOfArgs[1] arguments
	 * @return {Promise} promise for an array containing
	 * the result of each task in the array position corresponding
	 * to position of the task in the tasks array
	 */
	return function sequence(context,tasks, arrayOfArgs) {
		var results = [];

        var i = -1;
		return when.all(arrayOfArgs).then(function(args) {
			return when.reduce(tasks, function(results, task) {
                i++;
				return when(task.call(context, args[i]), addResult);
			}, results);
		});

		function addResult(result) {
			results.push(result);
			return results;
		}
	};

});
})(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
);


