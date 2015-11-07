module("Youtube Search Query Module");

asyncTest("Search results are valid", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(search_query, results) {
		equals(search_query, "query", "Result query string and actual query string don't match");
		ok(results.total_results > 0, "Result count is not > 0");
		equals(results.entries.length, 5, "Result entries count is not 5");
		
		start();
	});
	
	query.executeQuery("query", 1, 5);
});

asyncTest("Query can yield no results", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(search_query, results) {
		equals(results.total_results, 0, "Result count is 0");
		
		start();
	});
	
	query.executeQuery("asdfkjweacsdkl", 1, 5);
});

asyncTest("Blank query yields no results", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(search_query, results) {
		equals(results.total_results, 0, "Result count should be 0");
		
		start();
	});
	
	query.executeQuery("", 1, 5);
});

/*
asyncTest("Start index = 0", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(results) {
		equals(results.total_results, 0, "Result count is 0");
		
		start();
	});
	
	query.executeQuery("query", 0, 10);
});*/

