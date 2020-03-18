#!/bin/sh
cd /Users/amari/Documents/前端开发学习/nodejs/blog_1/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log