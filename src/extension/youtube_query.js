/*
 * Youtube Utility
 *
 * Requires jQuery
 *
 */
 /*
search_service = new YoutubeSearchService();

search_service.setResponseHandler( response_handler );
search_service.executeQuery( search_string, results_per_page, startIndex );

function responseHandler(results) {
	var original_query = results.search_query;
	var results_count = results.count;
	
	for (entry in results.entries) {
		entry.content_url;
		entry.thumb_url;
		entry.link_url;
		entry.title;
		entry.view_count;
		entry.duration;
	}

}*/

	 
function YoutubeSearchQuery() {
	var _response_handler;
	var _search_string;
	
	/** Public Methods ******************************************************/
	this.setResponseHandler = function(response_handler) {
		_response_handler = response_handler;
	};
	
	this.executeQuery = function(search_string, start_index, results_per_page) {
		_search_string = search_string;

		if (search_string === "") {
			handle_empty_query();
			return;
		}

		var youtube = {
			BaseApiQuery : "https://www.googleapis.com/youtube/v3",
			ApiQuery : "/search?q=" + _search_string,
			DeveloperKey :"key=AIzaSyBYPUJZlP-QaxWaE79zEMZBvCKenWlNQws",
			ApiPart : "part=snippet&type=video"
		};

		var fullYoutubeQuery = youtube.BaseApiQuery + 
							   	youtube.ApiQuery  + "&" +
								youtube.DeveloperKey  + "&" +
								youtube.ApiPart;

		
		sendRequest(fullYoutubeQuery);
	};
	
	/** Private Methods *****************************************************/
	var handle_empty_query = function() {
		var results = {
			total_results : 0,
			entries : []
		};

		_response_handler("", results);
	}

	var sendRequest = function(http_request) {
		var xml_http_request = new XMLHttpRequest();
		
		xml_http_request.open("GET", http_request, true);
		xml_http_request.onreadystatechange = function() {
			if (xml_http_request.readyState == 4) {				
				try
				{
					var response = xml_http_request.responseText;
					var results = convertResponseTextIntoObject(response);
					_response_handler(_search_string, results);
					
				} catch (exception) {
					console.log("sendRequest Exception: " + exception);
				}
				
			}
		};

		xml_http_request.send();
		
	};
	
	var convertResponseTextIntoObject = function(response_text) {	
		var data = JSON.parse(response_text);	
		
		var results = {};
		results.total_results = data.pageInfo.totalResults;
		results.entries = [];
		
		// loop through search results
		var entries = data.items || [];
		
		for (var i = 0; i < entries.length; ++i) {
			var entry = entries[i];
			var video_id = entry.id.videoId;
			var result = {};
			result = {
						id:				video_id,
						title: 			entry.snippet.title.substring(0, 42),
						views:			5,
						duration: 		5,
						link_url: 		"https://www.youtube.com/watch?v=" + video_id,
						thumb_url:		entry.snippet.thumbnails.default.url,
						content_url: 	"http://www.google.com"
					  };
			
			var mins = Math.floor(result.duration / 60);
			var secs = (result.duration % 60).toFixed();
			if (secs < 10) secs = "0" + secs;
			result.duration = mins + ":" + secs;
			
			results.entries.push(result);			
		}
		
		return results;
	};
}


function YoutubeVideoLookupQuery() {
	var _response_handler;
	var _video_id;

	/** Public Methods ******************************************************/
	this.setResponseHandler = function(response_handler) {
		_response_handler = response_handler;
	};
	
	this.executeQuery = function(video_id) {
		_video_id = video_id;

		var youtube = {
			BaseApiQuery : "https://www.googleapis.com/youtube/v3",
			ApiQuery : "/videos?id=" + _video_id,
			DeveloperKey :"key=AIzaSyBYPUJZlP-QaxWaE79zEMZBvCKenWlNQws",
			ApiPart : "part=contentDetails,statistics"
		};

		var fullYoutubeQuery = youtube.BaseApiQuery + 
							   	youtube.ApiQuery  + "&" +
								youtube.DeveloperKey  + "&" +
								youtube.ApiPart;

		// var result = [];
		// _response_handler(_video_id, result);
		_sendRequest(fullYoutubeQuery);
	};
	
	/** Private Methods *****************************************************/
	var _sendRequest = function(http_request) {
		var xml_http_request = new XMLHttpRequest();
		
		xml_http_request.open("GET", http_request, true);
		xml_http_request.onreadystatechange = function() {
			if (xml_http_request.readyState == 4) {
				try
				{
					var response = xml_http_request.responseText;
					var result = _convertResponseTextIntoResult(response);
					_response_handler(_video_id, result);
					
				} catch (exception) {
					console.log("sendRequest Exception: " + exception);
				}
				
			}
		};
		
		xml_http_request.send();
		
	};

	var _convertResponseTextIntoResult = function(response_text) {
		var data = JSON.parse(response_text);	
		
		var results = {};
		results.total_results = data.pageInfo.totalResults;
		results.entries = [];
		
		// loop through search results
		var entry = data.items || [];
		var result = {};
		
		if (entry === []) {
			console.log("something went wrong - no results.")
		
		} else {
			var formattedDuration = VideoUnitConverter.durationFromISO8601ToString(
				entry[0].contentDetails.duration
			); 

			result = {
				id: _video_id,
				views: entry[0].statistics.viewCount,
				duration: formattedDuration
			};
		}

		return result;
	};

}

var VideoUnitConverter = {
	durationFromISO8601ToString : function(iso8601Duration) {
		// Unit tests for this exist under /tests
		// e.g. "iso8601Duration": "PT15M51S"
		//      15:51 (15 minutes, 51 seconds)
		// for more see https://en.wikipedia.org/wiki/ISO_8601#Durations.

		var iso = iso8601Duration;

		var hours_included = iso.indexOf("H") > -1;
		var minutes_included = iso.indexOf("M") > -1;
		var seconds_included = iso.indexOf("S") > -1;

		var return_value = "";

		if (hours_included) {
			return_value += VideoUnitConverter._padTimeWithZeros(
				iso.substring(iso.indexOf("T")+1, iso.indexOf("H"))
			);			
		};

		if (hours_included && minutes_included) {
			return_value += ":";
			return_value += VideoUnitConverter._padTimeWithZeros(
				iso.substring(iso.indexOf("H")+1, iso.indexOf("M"))
			);
		} else if (minutes_included) {
			return_value += VideoUnitConverter._padTimeWithZeros(
				iso.substring(iso.indexOf("T")+1, iso.indexOf("M"))
			);
		} else if (hours_included) {
			return_value += ":00";
		} else {
			return_value += "00";
		}

		return_value += ":";

		if (minutes_included && seconds_included) {
			return_value += VideoUnitConverter._padTimeWithZeros(
				iso.substring(iso.indexOf("M")+1, iso.indexOf("S"))
			);
		} else if (hours_included && seconds_included) {
			return_value += VideoUnitConverter._padTimeWithZeros(
				iso.substring(iso.indexOf("H")+1, iso.indexOf("S"))
			);
		} else if (seconds_included) {
			return_value += VideoUnitConverter._padTimeWithZeros(
				iso.substring(iso.indexOf("T")+1, iso.indexOf("S"))
			);
		} else {
			return_value += "00";
		}
		
		return return_value;
	},

	
	/** Private Methods *****************************************************/
	_padTimeWithZeros : function(time) {
		if (time.length == 1) {
			return "0" + time;
		} 
		return time;
	}
}