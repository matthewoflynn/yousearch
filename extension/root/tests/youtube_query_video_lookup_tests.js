QUnit.module( "Youtube Query - Video Lookup Tests" );

QUnit.test( "Video Lookup Returns views and duration", function( assert ) {
    assert.expect(3);
    var done = assert.async();

    var video_lookup_query = new YoutubeVideoLookupQuery();
    video_lookup_query.setResponseHandler( function(video_id, result) {
    	assert.ok(video_id.length > 0, "video_id should be populated");
    	assert.ok(result.views > 10, "Video should have > 10 views");
    	assert.ok(result.duration.length > 0, "Video should have a duration");
		done();
    });
        
	video_lookup_query.executeQuery("9bZkp7q19f0");

});

QUnit.test( "Video Lookup Returns duration with correct format", function( assert ) {
    assert.expect(1);
    var done = assert.async();

    var video_lookup_query = new YoutubeVideoLookupQuery();
    video_lookup_query.setResponseHandler( function(video_id, result) {
    	assert.equal(result.duration, "04:13", "Duration is not correct");
    	done();
    });
        
	video_lookup_query.executeQuery("9bZkp7q19f0");
});

QUnit.test( "Video format converstion should work for various times", function( assert ) {
	var f = VideoUnitConverter.durationFromISO8601ToString;
	
	assert.equal(f("PT1H"), "01:00:00");
	assert.equal(f("PT1M"), "01:00");
	assert.equal(f("PT1S"), "00:01");
	assert.equal(f("PT10H"), "10:00:00");
	assert.equal(f("PT10M"), "10:00");
	assert.equal(f("PT10S"), "00:10");
	assert.equal(f("PT1H2M"), "01:02:00");
	assert.equal(f("PT10H20M"), "10:20:00");
	assert.equal(f("PT10H20S"), "10:00:20");
	assert.equal(f("PT1H2M3S"), "01:02:03");
	assert.equal(f("PT10H20M30S"), "10:20:30");
});