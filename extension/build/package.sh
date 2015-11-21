#!/bin/bash
echo Packaging YouSearch Extension...
rm -rf out
mkdir out

cp -r ../root ./out/root

echo Marking analytics as release analytics
version=$(cat out/root/manifest.json | awk '/"version"/ {split($2, split_text, "\""); print split_text[2]}' )
sed -i 's/Development Event Tracking/Release Event Tracking v'$version'/g' out/root/popup.js

echo Zipping
zip_file=out/yousearch_extension_release.zip 
zip -q -r $zip_file out/root

echo $zip_file ready for upload


