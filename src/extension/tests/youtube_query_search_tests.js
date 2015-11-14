QUnit.module( "Youtube Query - Search Query Tests");

QUnit.test( "Search results are valid", function( assert ) {
    assert.expect(3);
    var done = assert.async();

    var query = new YoutubeSearchQuery();

    query.setResponseHandler( function(search_query, results) {
        assert.equal(search_query, "query", "Result query string and actual query string don't match");
        assert.ok(results.total_results > 0, "Result count is not > 0");
        assert.equal(results.entries.length, 5, "Result entries count is not 5");

        done();
    });

    query.executeQuery("query");
});

QUnit.test("Query can yield no results", function( assert ) {
    assert.expect(1);
    var done = assert.async();

    var query = new YoutubeSearchQuery();
    
    query.setResponseHandler( function(search_query, results) {
        assert.equal(results.total_results, 0, "Result count is 0");

        done();
    });
    
    query.executeQuery("asdfkjweacsdkl");
});


QUnit.test("Blank query yields no results", function( assert ) {
    assert.expect(1);
    var done = assert.async();

    var query = new YoutubeSearchQuery();
    
    query.setResponseHandler( function(search_query, results) {
        assert.equal(results.total_results, 0, "Result count should be 0");
        
        done();
    });
    
    query.executeQuery("");
});


QUnit.test("Ensure only videos are retrieved", function( assert ) {
    // The following test searches for the "School of Life" which is the
    // name of a popular Youtube channel.
    assert.expect(3);
    var done = assert.async();

    var query = new YoutubeSearchQuery();

    query.setResponseHandler( function(search_query, results) {
        // ensure that the video URL is valid and does not contain "undefined"
        assert.notEqual(results, undefined);
        assert.notEqual(results.entries, undefined);
        assert.notEqual(results.entries[0].id, undefined, "Video ID should not be undefined");
        
        done();
    });

    query.executeQuery("School of Life");
});

QUnit.test("Ensure First Page of Results Includes Next Page Token", function( assert ) {
    assert.expect(1);
    var done = assert.async();

    var query = new YoutubeSearchQuery();

    query.setResponseHandler( function(search_query, results) {
        // ensure that the video URL is valid and does not contain "undefined"
        assert.notEqual(results.next_page_token, undefined);
        done();
    });

    query.executeQuery("School of Life");
});

QUnit.test("Ensure Second Page of Results includes Previous and Next Tokens", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    var first_query = new YoutubeSearchQuery();

    first_query.setResponseHandler( function(search_query, first_results) {
        var second_query = new YoutubeSearchQuery();

        second_query.setResponseHandler( function(search_query, second_results) {
            // ensure that the video URL is valid and does not contain "undefined"
            assert.notEqual(second_results.next_page_token, undefined);
            assert.notEqual(second_results.prev_page_token, undefined);
            done();
        });

        second_query.executeQuery("School of Life", first_results.next_page_token);
    });

    first_query.executeQuery("School of Life");
});

QUnit.test("Ensure Search for Blank String has no page tokens", function( assert ) {
    assert.expect(2);
    var done = assert.async();

    var query = new YoutubeSearchQuery();

    query.setResponseHandler( function(search_query, first_results) {
        assert.equal(first_results.next_page_token, undefined);
        assert.equal(first_results.prev_page_token, undefined);
        done();
    });

    query.executeQuery("");
});

