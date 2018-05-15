#!/bin/bash
version=`npm version $1`
npm publish --access public --verbose
git push 
git push --tag
