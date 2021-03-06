#!/usr/bin/env bash
set -eux
declare currentDir=$(cd $(dirname $0);pwd)
declare dirName=$(basename "${currentDir}")
declare parentDir=$(dirname "${currentDir}")
declare exampleDir="${parentDir}/example"
# rm
trap "rm -rf ${currentDir}/clone-tmp" 0 1 2 3 15
rm -rf ${currentDir}/clone-tmp
# test
git clone https://github.com/azu/textlint-rule-abbr-within-parentheses.git ${currentDir}/clone-tmp
cd ${currentDir}/clone-tmp
git checkout -b 1.0.2 refs/tags/1.0.2
node ${parentDir}/bin/migrate-textlint-scripts-typescript.js
# success if exit 0
