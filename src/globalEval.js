'use strict';

import { async } from 'metal';
import dom from './dom';

/**
 * Utility functions for running javascript code in the global scope.
 */
class globalEval {
	/**
	 * Evaluates the given string in the global scope.
	 * @param {string} text
	 * @return {Element} script
	 */
	static run(text) {
		var script = document.createElement('script');
		script.text = text;
		document.head.appendChild(script).parentNode.removeChild(script);
		return script;
	}

	/**
	 * Evaluates the given javascript file in the global scope.
	 * @param {string} src The file's path.
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @return {Element} script
	 */
	static runFile(src, opt_callback) {
		var script = document.createElement('script');
		script.src = src;

		var callback = function() {
			script.parentNode.removeChild(script);
			opt_callback && opt_callback();
		};
		dom.on(script, 'load', callback);
		dom.on(script, 'error', callback);
		document.head.appendChild(script);

		return script;
	}

	/**
	 * Evaluates the code referenced by the given script element.
	 * @param {!Element} script
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @return {Element} script
	 */
	static runScript(script, opt_callback) {
		var callback = function() {
			opt_callback && opt_callback();
		};
		if (script.type && script.type !== 'text/javascript') {
			async.nextTick(callback);
			return;
		}
		if (script.parentNode) {
			script.parentNode.removeChild(script);
		}
		if (script.src) {
			return globalEval.runFile(script.src, opt_callback);
		} else {
			async.nextTick(callback);
			return globalEval.run(script.text);
		}
	}

	/**
	 * Evaluates any script tags present in the given element.
	 * @params {!Element} element
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 */
	static runScriptsInElement(element, opt_callback) {
		var scripts = element.querySelectorAll('script');
		if (scripts.length) {
			globalEval.runScriptsInOrder(scripts, 0, opt_callback);
		} else if (opt_callback) {
			async.nextTick(opt_callback);
		}
	}

	/**
	 * Runs the given scripts elements in the order that they appear.
	 * @param {!NodeList} scripts
	 * @param {number} index
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 */
	static runScriptsInOrder(scripts, index, opt_callback) {
		globalEval.runScript(scripts.item(index), function() {
			if (index < scripts.length - 1) {
				globalEval.runScriptsInOrder(scripts, index + 1, opt_callback);
			} else if (opt_callback) {
				async.nextTick(opt_callback);
			}
		});
	}
}

export default globalEval;