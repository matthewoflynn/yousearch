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
		var youtubeAPIQuery = "http://gdata.youtube.com/feeds/api/videos?"
							  + "format=5"
							  + "&alt=json" 
							  + "&max-results=" + results_per_page
							  + "&start-index=" + start_index
							  + "&q=" + search_string;		
		
		sendRequest(youtubeAPIQuery);
	};
	
	/** Private Methods *****************************************************/
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
				
		var results = {};
		
		
		
		// parse results
		var data = JSON.parse(response_text);	
		var feed = data.feed;
		
		results.search_query = _search_string;
		results.total_results = feed.openSearch$totalResults.$t;
		results.entries = [];
		
		// loop through entries
		var entries = feed.entry || [];
		
		for (var i = 0; i < entries.length; ++i) {
			var entry = entries[i];
			var video_id = entry.id.$t.substring(42);
			var result = {};
			result = {
						id:				video_id,
						title: 			entry.title.$t,
						views:			entry.yt$statistics.viewCount,
						duration: 		entry.media$group.yt$duration.seconds,
						link_url: 		entry.link[0]['href'],
						thumb_url:		entry.media$group.media$thumbnail[1].url,
						content_url: 	entry.media$group.media$content[0].url
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
