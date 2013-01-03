<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

/*
 * secret.php specifies the following details:
 * 	$developer_key
 *	$oauto_key	   = "yousearch.example.com";
 *	$oauth_secret
 */
require_once 'secrets.php';


require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_YouTube');
Zend_Loader::loadClass('Zend_Gdata_AuthSub');


// --------------------------------------------------------------------------------------
// Authentication
// --------------------------------------------------------------------------------------
// start a new session 
session_start();


function getAuthSubRequestUrl()
{
    $next = 'http://yousearch.annahealy.ie/service.php?welcome';
    $scope = 'http://gdata.youtube.com';
    $secure = false;
    $session = true;
    return Zend_Gdata_AuthSub::getAuthSubTokenUri($next, $scope, $secure, $session);
}

function getAuthSubHttpClient()
{
    if (!isset($_SESSION['sessionToken']) && !isset($_GET['token']) ){
	/*	echo 'Please <a href="' . getAuthSubRequestUrl() . 
			 '">log in</a> to Youtube to use this service';*/
        return;
    } else if (!isset($_SESSION['sessionToken']) && isset($_GET['token'])) {
      $_SESSION['sessionToken'] = Zend_Gdata_AuthSub::getAuthSubSessionToken($_GET['token']);
    }
	
	

    $httpClient = Zend_Gdata_AuthSub::getHttpClient($_SESSION['sessionToken']);
    return $httpClient;
}

 
// --------------------------------------------------------------------------------------
// Playlist 
// --------------------------------------------------------------------------------------
function createPlaylist($yt)
{
	$date = new DateTime();
	$new_playlist_name = 'YouSearch Playlist ' . $date->format('Y-m-d H:i:s');;  
	
	$newPlaylist = $yt->newPlaylistListEntry();
	$newPlaylist->title = $yt->newTitle()->setText($new_playlist_name);
	$newPlaylist->summary = $yt->newDescription()->setText('Automatically created by YouSearch');
	// post the new playlist
	$postLocation = 'http://gdata.youtube.com/feeds/api/users/default/playlists';
	try {
	  $yt->insertEntry($newPlaylist, $postLocation);
	} catch (Zend_Gdata_App_Exception $e) {
	  echo "Exception: " . $e->getMessage();
	  return;
	}
	
	// Note: If the playlist was created successfully, the var 
	// representing the playlist returned by newPlaylistListEntry() 
	// does not include content. We have to retrieve the new 
	// playlist from Youtube via another API call.
	$user_playlists = $yt->getPlaylistListFeed('default');
	
	foreach ($user_playlists as $playlist) {
		if ($playlist->getTitle() == $newPlaylist->title) {
			$newPlaylist = $playlist;
		} 
	}
	
	return $newPlaylist;
}



// --------------------------------------------------------------------------------------
// Requests
// --------------------------------------------------------------------------------------
if (isset($_GET['is_user_authenticated']))
{
	if (getAuthSubHttpClient())
	{
		echo 'yes';	
	} else {
		// if not authenticated return the log-in page url 	
		echo getAuthSubRequestUrl();
	}
	
	exit(); 
}

if (isset($_GET['log_out']))
{
	unset ($_SESSION['sessionToken']);
	session_unregister ($sessionToken);	
	
	exit();
}

if (isset($_GET['welcome']))
{
	if (getAuthSubHttpClient()) 
	{
		echo "Thanks for adding YouSearch as an application. You can now create playlists!";
	}
	else 
	{
		echo "Something went wrong when logging into Youtube...";
	}
	
	exit();
}

if (isset($_GET['create_playlist']))
{
	$http_client = getAuthSubHttpClient();

	if ($http_client) 
	{
		$application_id = "YouSearch";
		$client_id = "";
		
		$yt = new Zend_Gdata_YouTube($http_client, $application_id, $client_id, $developer_key);
		$yt->setMajorProtocolVersion(2);

		$playlist = createPlaylist($yt);

		if ($playlist) 
		{
			// retrieve playlist parameters
			$videos = $_GET['videos'];
			$videos_list = explode(" ", $videos);
			
			// add videos 
			foreach ($videos_list as $video_id) {

				$postUrl = $playlist->getPlaylistVideoFeedUrl();
	
				// video entry to be added
				$videoEntryToAdd = $yt->getVideoEntry($video_id);
				
				// create a new Zend_Gdata_PlaylistListEntry, passing in the underling DOMElement of the VideoEntry
				$newPlaylistListEntry = $yt->newPlaylistListEntry($videoEntryToAdd->getDOM());
				
				try {
				  $yt->insertEntry($newPlaylistListEntry, $postUrl);
				} catch (Zend_App_Exception $e) {
				  echo $e->getMessage();
				}
			}
			
			// return url of play youtube playlist page
			$playlist_id = $playlist->getPlaylistId()->getText();
			$playlist_url = 'http://www.youtube.com/playlist?list=' . $playlist_id . '&playnext=1&feature=viewall';
			echo $playlist_url;
		}
		else {
			// handle failure to create playlist
		}
	}
	
	exit();
}

if (isset($_GET['delete_playlists'])) {
	
	$http_client = getAuthSubHttpClient();
	
	if ($http_client) 
	{
		$application_id = "YouSearch";
		$client_id = "";
		
		$yt = new Zend_Gdata_YouTube($http_client, $application_id, $client_id, $developer_key);
		$yt->setMajorProtocolVersion(2);
		
		echo "deleting playlists...." . '<br/>';
		
		if ($yt) {
			echo "yt is valid" . '</br>';
		}
		
		print 'getting my playlists' . '<br/>';
		$feed = "";
		try {
	    	$feed = $yt->getPlaylistListFeed('default');
			
			print 'have playlists - printing them now' . '<br/>';
			
			
		} catch (Zend_Gdata_App_Exception $e) {
		  	echo "Exception: " . $e->getMessage();
		  	return;
		}
		
		if ($feed !== "") {
			foreach($feed as $playlistEntry) {
				$playlist_title = $playlistEntry->getTitleValue(); 
	        	echo 'playlist: ' . $playlist_title . '</br>';
				
		        if (strpos($playlist_title, 'YouSearch') !== FALSE)
		        {
		        	echo 'Found a YouSearch playlist: ' . $playlist_title . '</br>';
				 
				    try {
				    	echo 'about to delete...' . '<br/>';
				        $response = $playlistEntry->delete();
						echo 'deleted successfully..';
				    } catch (Zend_Gdata_App_HttpException $httpException) {
				        print 'ERROR ' . $httpException->getMessage()
				            . ' HTTP details<br /><textarea cols="100" rows="20">'
				            . $httpException->getRawResponseBody()
				            . '</textarea><br />'
				            . '<a href="session_details.php">'
				            . 'click here to view details of last request</a><br />';
				        return;
				    } catch (Zend_Gdata_App_Exception $e) {
				        print 'ERROR - Could not delete the playlist: ' . $e->getMessage();
				        return;
				    }
	
		        }
				
		    }	
		}
			
		
		
		
	}
	
}



?>