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


// Array to hold callback functions
var g_callback;

function getPageInfo(callback) {
	console.log("getPageInfo");
	g_callback = callback;
	
	chrome.tabs.executeScript(null, {file: "context_script.js"});
};

chrome.extension.onRequest.addListener( function(request) {
	console.log("onRequest listener");
	console.log(g_callback);
	
	g_callback(request);
});
