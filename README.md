YouSearch
=========
Chrome extension for searching Youtube. In future, it is intended that it can automatically generate Youtube playlists based on a list of search terms. 

Features
--------
  * Single Item Highlighted Search
    Highlight the search term on the webpage and click the YouSearch icon. The results will be presented in the pop-up.
  * Future Features Defined in Backlog.md

Running Extension Locally
-------------------------
  1. Clone this repo locally.
  2. On the Chrome extensions page (chrome://extensions) there is a "Developer mode" 
     checkbox. Check it. 
  3. Click "Load unpacked extension..." 
  4. Select the /extension/root folder under the clone.
  5. The YouSearch Extension should appear in the top-right of Chrome.
    
Releasing A New Version
-----------------------
  1. Open the /extension/build folder
  2. Using a bash shell, run ./package.sh
  3. All going well, the package will be made ready for release.
     Read the script output to see location of the zip.
  4. Publish the app via http://chrome.google.com/webstore/developer
