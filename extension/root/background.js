function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
};

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
};

var options = {
	defaults : {
		"searchResultsPerPage" : "5"
	},

	getValueAsInt: function(option_name) {
		var value = options.getValueAsString(option_name);
		return parseInt(value);
		
	},
	
	getValueAsString: function(option_name) {
		assert(options.optionNameIsValid(option_name),
			   "Option name '" + option_name + "' is invalid");
		
		if (options.optionIsInLocalStorage(option_name)) {
			return localStorage[option_name];
			
		} else {
			return options.defaults[option_name];
			
		}	
	},
	
	saveValue: function(option_name, option_value) {
		assert(options.optionNameIsValid(option_name),
			   "Option name '" + option_name + "' is invalid");
			   
		localStorage[option_name] = option_value;
	},
	
	optionNameIsValid: function(option_name) {
		if (typeof options.defaults[option_name] != "undefined") {
			return true;
		} else {
			return false;
		}
	},
	
	optionIsInLocalStorage: function(option_name) {
		if (typeof localStorage[option_name] != "undefined") {
			return true;
		} else {
			return false;
		}
	}

};


// callback functions
var g_searchTextCallback;
var g_contextScriptInjectionStatusCallback;

function setSearchTextCallback(search_text_callback, context_script_injection_status_callback) {
	console.log("getPageInfo");
	g_searchTextCallback = search_text_callback;
	g_contextScriptInjectionStatusCallback = context_script_injection_status_callback;
	
	chrome.tabs.executeScript(null, {file: "context_script.js"}, onContextScriptInjected); 
};

function onContextScriptInjected(array_of_result) {

	var message = "";
	var success = false;

	// determine if script was successfully injected 
	if (typeof array_of_result != 'undefined') {
		success = true;
		message = "script injection succeeded.";
	} else {
		var failure_message = "script injection failed. ";

		if (typeof chrome.runtime.lastError != 'undefined' && 
			typeof chrome.runtime.lastError.message != 'undefined') {

			failure_message = "lastError = " + chrome.runtime.lastError.message;
		} else {
			failure_message = "error unknown";
		};

		success = false;
		message = failure_message;
	};

	g_contextScriptInjectionStatusCallback(success, message);
}

chrome.extension.onRequest.addListener( function(request) {
	console.log(g_searchTextCallback);
	
	g_searchTextCallback(request);
});
