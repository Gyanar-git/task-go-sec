#!/bin/bash

echo "Export the following env vars to run this script:
ENTPLUS_PASSWORD
ENTPLUS_USER
JPD_URL
JPD_PASSWORD (defaults to 'password')
JPD_USER (defaults to 'admin')"

jpd_pass="$JPD_PASSWORD"
jpd_user="$JPD_USER"

if [ -z "$JPD_URL" ]; then
  echo "must set JPD_URL"
  exit 1
fi

if [ -z "$JPD_USER" ]; then
  echo "must set JPD_USER"
  exit 1
fi

if [ -z "$ENTPLUS_PASSWORD" ]; then
  echo "must set ENTPLUS_PASSWORD"
  exit 1
fi

if [ -z "$ENTPLUS_USER" ]; then
  echo "must set ENTPLUS_USER"
  exit 1
fi

if [ -z "$JPD_USER" ]; then
  export jpd_user="admin"
  echo "falling back to default jpd user: ${jpd_user}"
fi

if [ -z "$JPD_PASSWORD" ]; then
  export jpd_pass="password"
  echo "falling back to default jpd password: ${jpd_pass}"
fi

if ! command -v jf &> /dev/null
then
    echo "jfrog cli could not be found. This script is only compatible with jfrog cli v2. It should be callable as 'jf'".
    exit 1
fi

# add entplus creds to repo specs
tmp=$(mktemp)
jq ".username = \"${ENTPLUS_USER}\" | .password = \"${ENTPLUS_PASSWORD}\"" ./remote.template.json > "$tmp" && mv "$tmp" ./remote.json
jq ".username = \"${ENTPLUS_USER}\" | .password = \"${ENTPLUS_PASSWORD}\"" ./npmRemote.template.json > "$tmp" && mv "$tmp" ./npmRemote.json

# make repos
jf rt repo-create ./local.json --user "$JPD_USER" --password "$JPD_PASSWORD" --url "$JPD_URL/artifactory"
jf rt repo-create ./remote.json --user "$JPD_USER" --password "$JPD_PASSWORD" --url "$JPD_URL/artifactory"
jf rt repo-create ./virtual.json --user "$JPD_USER" --password "$JPD_PASSWORD" --url "$JPD_URL/artifactory"
jf rt repo-create ./npmRemote.json --user "$JPD_USER" --password "$JPD_PASSWORD" --url "$JPD_URL/artifactory"
jf rt repo-create ./npmVirtual.json --user "$JPD_USER" --password "$JPD_PASSWORD" --url "$JPD_URL/artifactory"

rm ./npmRemote.json
rm ./remote.json

echo "success"

