#!bin/sh

set -x

npx tsc

mkdir -p build/function_source/
cp -r build/tsc/ build/function_source/
cp package.json package-lock.json build/function_source/

gcloud functions deploy postNotes --region=europe-west6 --project=notes-extension-425902 --source=build/function_source/ --trigger-http --runtime=nodejs20 --memory=256Mi --gen2 --allow-unauthenticated

gcloud functions deploy getNotes --region=europe-west6 --project=notes-extension-425902 --source=build/function_source/ --trigger-http --runtime=nodejs20 --memory=256Mi --gen2 --allow-unauthenticated