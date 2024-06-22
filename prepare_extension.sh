#!bin/sh

set -x

mkdir -p extension
cp manifest.json extension/
cp sidepanel.html extension/
rsync -r --delete dist/ extension/dist
rsync -r --delete css/ extension/css
rsync -r --delete images/ extension/images

rm -f extension.zip
zip -r extension.zip extension/*

# Mark the unpackaged manifest as the local build.
cat manifest.json | yarn run -s json -e 'this.version_name = "local"' > extension/manifest.json