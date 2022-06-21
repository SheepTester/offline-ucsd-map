#!/bin/sh

deno bundle ./src/page/index.ts | terser --toplevel --mangle > ./static/main.js
