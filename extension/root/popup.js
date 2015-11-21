
var yousearch_url = "http://yousearch.annahealy.ie/service.php";

function VideoSearchResultsBox(id, query_string, results_per_page, searchCompleteCallBack) {
	
	/** Setting up **********************************************************/
	var _youtube_search = new YoutubeSearchQuery();;
	var _search_results_start_index;
	var _id_string = "search-box-" + id;
	var _id_string_sel = "#" + _id_string;
	var _youtube_video_id = '';
	
	
	/** Public Methods ******************************************************/	
	this.executeQuery = function(start_index) {
		_search_results_start_index = start_index;	
		
		showSearchBox();
		
		_youtube_search.setResponseHandler(onYoutubeSearchComplete);
		_youtube_search.executeQuery(query_string, 
								     _search_results_start_index,
						   		     results_per_page);
		
	};
	
	this.getVideoId = function() {
		return _youtube_video_id;
	};
	
	
	/** Callback Methods *****************************************************/
	var onYoutubeSearchComplete = function(search_query, results) {
		
		// ensure that only the results of the most recent search are displayed
		//if (search_query == popup.mostRecentSearchQuery) {
			showResults(results);
			_youtube_video_id = results.entries['0'].id
				
		/*} else {
			console.log("old results being ignored");
			console.log("results.search_query = " + search_query);
			console.log("popup.mostRecentSearchQuery = " + popup.mostRecentSearchQuery);
		
		}*/
	};
	
	
	/** Private Methods *****************************************************/
	var showSearchBox = function() {
		var class_to_use = id % 2 ? "highlighted-row" : "";
		
		// show initial box with loading animation
		var html = '<tr id="' + _id_string + '" class="row ' + class_to_use + '">'
				 + 		'<td style="text-align: center" colspan="3">'
				 + 			'<img src="img/ajax-loader.gif" alt="Loading..."/>'; 
				 + 		'</td>'
				 + '</tr>';
		
		$('#results').append(html);
		$('#results-wrapper').show();
		
	};
	
	var showResults = function(results) { 
		
		// notify popup
		searchCompleteCallBack(id);
		
		// insert result into search box 
		var search_box = $(_id_string_sel);
		search_box.empty();
		
		
		var result = results.entries['0'];
		
		var $td_thumbnail_el = $('<td class="thumbnail">');
		$td_thumbnail_el.append('<div class="thumbnail-holder">'
							+ '<a>'
								+ '<img class="thumbnail" src="' + result.thumb_url + '"/>' 
								+ '<img class="play" src="img/Play Transparent.png"/>'
								+ '<div class="duration">' + result.duration + '</div>'
							+ '</a>'
						+ '</div>');
						
		search_box.append($td_thumbnail_el);
		
		var link_id = 'result' + id;
		var $td_result_el = $('<td>');
		var $a_result_el = $('<a class="title" id="' + link_id + '" href="#">' 
								+ result.title 
							+ '</a>');
		
		$td_result_el.append($a_result_el);
		$td_result_el.append('<br/><span>'
								+ result.views + ' views'
							+ '</span>');
		
		search_box.append($td_result_el);
		$('#'+link_id).click(
			function()
			{
				popup.openTab(result.link_url); 
			}
		);
		
	};
	
}


var popup = {

	/** Initialisation ******************************************************/
	init: function() {
		popup.initEventTracking();
		popup.options = chrome.extension.getBackgroundPage().options;
		popup.searchResultsStartIndex = 0;
		popup.searchResultsPerPage = popup.options.getValueAsInt('searchResultsPerPage');
		
		popup.youtube = new YoutubeSearchQuery();
		popup.youtube.setResponseHandler(popup.onYoutubeSearchComplete);
	
		popup.setBackgroundPageListener();
		
		$("#clear-button").click(popup.clear_searchbox);
		$('#search-box').submit(function() {
			popup.searchbarSearch();
			return false;
		}); 
		$("#welcome a").click(popup.showInstructions);
		$("#welcome a").click(popup.trackShowInstructions);

		$( window ).unload(popup.handleUnload);
		
	},
	
	setBackgroundPageListener: function(){
		var bg = chrome.extension.getBackgroundPage();
		bg.setSearchTextCallback(popup.onSelectedTextReceived);
		
	},

	showInstructions: function() {
		$("#instructions").show();
		$("#welcome a").html("Hide Instructions");
		$("#welcome a").unbind();
		$("#welcome a").click(popup.hideInstructions);
		$("#welcome a").click(popup.trackHideInstructions);
	},

	hideInstructions: function() {
		$("#instructions").hide();
		$("#welcome a").html("Show Instructions");
		$("#welcome a").unbind();
		$("#welcome a").click(popup.showInstructions);
		$("#welcome a").click(popup.trackShowInstructions);

	},

	handleUnload: function() {
		popup.publishEvents();
	},

	/** Callback Methods ****************************************************/
	onSelectedTextReceived: function(selectedQuery, currentWebLocation) {
		popup.addTrackingEvent("onSelectedTextReceived query=\"" + selectedQuery + "\"");

		$('input[name|="search-text"]').attr("value", selectedQuery);
		
		var search_strings = selectedQuery.split('\n');
		var multiple_lines_in_string = search_strings.length > 1; 
		
		if (multiple_lines_in_string) {
			$("#loading").hide();
			popup.search_results = [];
			popup.search_results_remaining = 0;
			
			for (var i=0; i<search_strings.length; i++) {

				if (search_strings[i])
				{
					// the results index must ignore blank strings
					var result_index = popup.search_results_remaining;
					
					popup.search_results[result_index] = new VideoSearchResultsBox(i, search_strings[i], 1,
															popup.onOneVideoSearchCompleted);
					popup.search_results[result_index].executeQuery(1);				
					popup.search_results_remaining++;	
				}
			}
			
			popup.showSearchesRemaining();	

		} else if (selectedQuery.length > 0) {
			popup.startNewYoutubeSearch(selectedQuery);
		} else {
			// button clicked without text selected.
			console.log("button clicked without text selected.");
		}
	},

	onYoutubeSearchComplete: function(search_query, results) {
		
		// ensure that only the results of the most recent search are displayed
		if (search_query == popup.mostRecentSearchQuery) {
			$("#welcome").hide();
			$("#instructions").hide();
			$("#loading").hide();
			popup.appendSearchResults(results)
			$("#results-wrapper").show();
			popup.showResultsNav(results);
			
		} else {
			console.log("old results being ignored");
			console.log("results.search_query = " + search_query);
		
		}
	},

	onVideoLookupQueryComplete: function(video_id, result) {
		var video_tag = "video-id-" + video_id;
		$("#" + video_tag + " .duration").html(result.duration);
		$("#" + video_tag + " #views").html(result.views + " views");
	},
	
	onOneVideoSearchCompleted: function(id) {
		
		popup.search_results_remaining--;
		
		if (0 == popup.search_results_remaining) {
			popup.showGeneratePlaylistButton();
			
		} else {
			popup.showSearchesRemaining();
			
		}
		
	},
	
	/** Control Methods *****************************************************/	
	searchbarSearch: function() {
		var query = $('#search-bar input').attr('value');
		popup.addTrackingEvent("searchbarSearch \"" + query + "\"");

		popup.startNewYoutubeSearch(query);
	},
	
	startNewYoutubeSearch: function(query) {
		popup.searchResultsStartIndex = 1;
		popup.searchYoutube(query);
	},
	
	searchYoutube: function(query, page_token) {
		popup.mostRecentSearchQuery = query;

		popup.hideInstructions();
		popup.clearResultsAndPlayer();
		$("#loading").show();
		
		popup.youtube.executeQuery(query, page_token);
	},


	
	/** View Methods ********************************************************/	
	highlightRow: function(row) {
		$(row).addClass("highlighted-row");
		$(".play", row).show();
	},
	
	unHighlightRow: function(row) {
		$(row).removeClass("highlighted-row");
		$(".play", row).hide();
	},
	
	clearResultsAndPlayer: function() {
		$("#results-wrapper").hide();
		$('#results').empty();
		$('#player').empty();
	},
	
	appendSearchResults: function(results) {
		var $elements = $('<div>');
		var $table = $('<table>');
		var $tbody = $('<tbody>');
		
		
		$table.append($tbody);
		$('#results').append($table);
		
		for (var key in results.entries) {
			
			var result = results.entries[key];
			var video_id_tag = 'video-id-' + result.id;
			var html = '<tr id="' + video_id_tag + '">';
			
			html = html + '<td class="thumbnail">'
			 				+ '<div class="thumbnail-holder">'
								+ '<a>'
									+ '<img class="thumbnail" src="' + result.thumb_url + '"/>' 
									+ '<img class="play" src="img/Play Transparent.png"/>'
									+ '<div class="duration">...</div>'
								+ '</a>'
							+ '</div>'
					  	+ '</td>';
			
			html = html + '<td>'
							+ '<a class="title" href="#">' 
								+ result.title 
							+ '</a><br/>'
							+ '<span id="views">'
								+ '...'
							+ '</span>'
						+ '</td>';
			
			html = html + '</tr>';
			
			$tbody.append(html);
			
			$('#'+video_id_tag).mouseover(function() {
				popup.highlightRow(this)
			});
			$('#'+video_id_tag).mouseout(function() {
				popup.unHighlightRow(this)
			});
			$('#'+video_id_tag).click(function() {
				var result_link = result.link_url;				
				return function() {
					popup.addTrackingEvent("openedYoutube url=\"" + encodeURIComponent(result_link) + "\"");
					popup.openTab(result_link);
				};
				
			}());

			popup.queryYoutubeForFurtherInfomation(result.id);			
		}
		
	},

	queryYoutubeForFurtherInfomation: function(video_id) {
		var video_lookup = new YoutubeVideoLookupQuery();

		video_lookup.setResponseHandler(popup.onVideoLookupQueryComplete);
		video_lookup.executeQuery(video_id);
	},
	
	showResultsNav: function(results) {
		var linkToPreviousResults = "";
		var linkToNextResults = "";
		
		var goToPreviousPageId = 'go-to-previous-page';
		var goToNextPageId = 'go-to-next-page';
		
		if (typeof(results.prev_page_token) != "undefined") {
			popup.prev_page_token = results.prev_page_token;
			linkToPreviousResults = '<a id="' + goToPreviousPageId + '" class="prev_page" href="#">'
									+ '<img src="img/SweetiePlus/without-shadows/arrow-left-24-ns.png"/>'
								 + '</a>';
			
		} else {
			popup.prev_page_token = undefined;
		}
	
		
		if (typeof(results.next_page_token) != "undefined") {
			popup.next_page_token = results.next_page_token;
			linkToNextResults = '<a id="' + goToNextPageId + '" class="next_page" href="#">'
				   					+ '<img src="img/SweetiePlus/without-shadows/arrow-right-24-ns.png"/>'
				   			  + '</a>';
				   			  
		} else {
			popup.next_page_token = undefined;
		}
	
		var html = "<div id='results-nav'>"
						+ linkToPreviousResults + " "
				   		+ linkToNextResults
				   		+ "<br/>"
				   	+ "</div>";
		
		var playlist_control_bar = $('#results-control-bar');
		playlist_control_bar.empty();
		playlist_control_bar.append(html);
		playlist_control_bar.show();
		
		$('#'+goToPreviousPageId).click(popup.goToPreviousResultsPage);
		$('#'+goToNextPageId).click(popup.goToNextResultsPage);
		
	},
	
	showSearchesRemaining: function() {
		var playlist_control_bar = $('#results-control-bar');
		playlist_control_bar.empty();
		
		var html = '<img src="img/ajax-loader.gif" alt="Loading..."/> '
				 + popup.search_results_remaining
				 + ' searches remaining';
		
		playlist_control_bar.append(html);
		playlist_control_bar.show();
		
	},
	
	showGeneratePlaylistButton: function() {
		var playlist_control_bar = $('#results-control-bar');
		playlist_control_bar.empty();
		
		var html = '<a class="button" href="#" id="generate-playlist">Create Playlist</a>';
		
		playlist_control_bar.append(html);
		
		$("#generate-playlist").click(popup.generateAndStartPlaylist);
	},
	
	generateAndStartPlaylist: function() {
		// remove button and add spinner
		var playlist_control_bar = $('#results-control-bar');
		playlist_control_bar.empty();
		playlist_control_bar.append('<b>loading...</b>');
		
		_gaq.push(['_trackEvent', 'generating_playlist', true]);
		
		// check if app & user are authorised
		var authenticationAjaxRequest = $.get(
			yousearch_url + '?is_user_authenticated'
		)
		.success( function(response) {
			console.log('is_user_authenticated response:' + response);
			
			if ('yes' === response) {
				// user is authenticated
				console.log('user is authenticated');
				
				// generate "create playlist" request
				var create_playlist_request = yousearch_url 
					+ '?create_playlist&videos=';
				
				for (i=0; i<popup.search_results.length; i++) {
					console.log(create_playlist_request);
					
					video_id = popup.search_results[i].getVideoId();
					create_playlist_request += video_id;
					
					if (i<popup.search_results.length-1) {
						create_playlist_request += "+";
					}
				}
				
				// make request
				var createPlaylistAjaxRequest = $.get(
					create_playlist_request
				)
				.success( function(response) {
					
					playlist_control_bar.empty();
					
					if ('Error' == response) 
					{
						console.log('an error occurred on the server '
									+ 'when processing the request');
						
						playlist_control_bar.append('<b>Error!</b>');	
					} else {
						_gaq.push(['_trackEvent', 'playlist_created', popup.search_results.length]);
		
						console.log("playlist created. url = " + response);
						var html = '<a class="button" href="#" id="play-all-on-youtube">Play all on Youtube</a>';
						
						playlist_control_bar.append(html);
						
						$('#play-all-on-youtube').click(function() {
							popup.openTab(response);
						});
						
					}
					
				});
				
			} else {
				// user isn't authenticated
				console.log('user isn\'t authenticated');
				
				var html = '<a class="button" href="#" id="log-in">Log in</a>';
						 
				playlist_control_bar.empty();
				playlist_control_bar.append(html);
				
				$('#log-in').click(function(){
					popup.openTab(response);
				});
				
			}
			
			
 
		} )
		.error( function() {
			console.log('an error occurred contacting yousearch server');
		} );
		
		// create playlist on youtube
		

		
		// get list of videos
		
		// add each video to the playlist
		
		// start the playlist in a new tab


	},
	
	/** UI Control Methods **************************************************/
	openTab: function(urlToGoTo) {
		_gaq.push(['_trackEvent', 'opening_tab', urlToGoTo]);
		chrome.tabs.create({url: urlToGoTo});
		window.close();
	},
	
	goToNextResultsPage: function() {
		popup.searchYoutube(popup.mostRecentSearchQuery, popup.next_page_token);
	},
	
	goToPreviousResultsPage: function() {
		popup.searchYoutube(popup.mostRecentSearchQuery, popup.prev_page_token);
	},
	
	clear_searchbox: function() {
		popup.addTrackingEvent("clear_searchbox");

		$("#search-box input").val('');
		$("#results-wrapper").hide();
		$("#results-control-bar").hide();
		$("#welcome").show();
		popup.hideInstructions();
	},



	
	/** Event Tracking Methods **********************************************/
	initEventTracking: function() {
		popup.event_tracker = "Development Event Tracking. ";

		chrome.tabs.getSelected(null, function(tab) {
			popup.addTrackingEvent("URL=\"" + encodeURIComponent(tab.url) + "\"");
		});
	}, 

	addTrackingEvent: function(event_text) {
		popup.event_tracker += "[" + event_text + "]";
	},

	publishEvents: function() {
		xhttp = new XMLHttpRequest();
		xhttp.open("POST", "http://analytics.matt.ie", false);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("event=" + popup.event_tracker);
	},

	trackShowInstructions: function() {
		popup.addTrackingEvent("showInstructions");
	},

	trackHideInstructions: function() {
		popup.addTrackingEvent("hideInstructions");
	}

}

$(document).ready( function() {
	popup.init();
} );


