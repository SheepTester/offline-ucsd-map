#!/bin/sh

REMOTE=$(git remote get-url origin)
LAST_COMMIT=$(git rev-parse HEAD)

mkdir gh-pages-temp
cd ./gh-pages-temp/
git init
git remote add origin $REMOTE
git fetch origin --depth=1

cp -a ../static/ .
git reset --soft origin/gh-pages

git checkout -b gh-pages
git add .
git commit -m "Deploy $LAST_COMMIT

https://sheeptester.github.io/offline-ucsd-map/"
git push origin gh-pages

cd ..
rm -rf ./gh-pages-temp/

echo
echo "Soon to be deployed to https://sheeptester.github.io/offline-ucsd-map/"
echo "See progress at https://github.com/SheepTester/offline-ucsd-map/commits/gh-pages"
