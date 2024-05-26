#!bin/sh

mkdir -p extension
cp manifest.json extension/
cp sidepanel.html extension/
rsync -r --delete dist/ extension/dist
rsync -r --delete css/ extension/css
rsync -r --delete images/ extension/images
