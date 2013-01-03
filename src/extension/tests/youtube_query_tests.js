module("Youtube Search Query Module");

asyncTest("Search results are valid", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(results) {
		equals(results.search_query, "query", "Result query and actual query don't match");
		ok(results.total_results > 0, "Result count is not > 0");
		equals(results.entries.length, 10, "Result entries count is not 10");
		
		start();
	});
	
	query.executeQuery("query", 1, 10);
});

asyncTest("Query can yield no results", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(results) {
		equals(results.total_results, 0, "Result count is 0");
		
		start();
	});
	
	query.executeQuery("asdfkjweacsdkl", 1, 10);
});

asyncTest("Blank query yields no results", function() {
	var query = new YoutubeSearchQuery();
	
	query.setResponseHandler( function(results) {
		equals(results.total_results, 0, "Result count should be 0");
		
		start();
	});
	
	query.executeQuery("", 1, 10);
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

