#!/bin/bash
set -e
# we need this or rollup copy will freak out
if [ ! -d jsdoc_out ]; then
     mkdir jsdoc_out
fi
if [ ! -d node_modules ]; then
     yarn
fi
exec "$@"
