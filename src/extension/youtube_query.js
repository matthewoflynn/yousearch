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
			ApiQuery : "/search?q=" + search_string,
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
		
		console.log("sendRequest()");
		
		xml_http_request.open("GET", http_request, true);
		xml_http_request.onreadystatechange = function() {
			if (xml_http_request.readyState == 4) {
				console.log("response received and ready");				
			
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
		
		console.log("sending http request");
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
