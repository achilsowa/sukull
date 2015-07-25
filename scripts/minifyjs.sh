#!/bin/bash

echo '' > $2
if [ -e "$1/$2.js" ]; then rm "$1/$2.js"
fi
if [ -e "$1/$2.min.js" ]; then rm "$1/$2.min.js"
fi
for file in `ls $1/*.js`
do
    cat $file >> "$1/$2.js"
done

java -jar yuicompressor-2.4.8.jar "$1/$2.js" > "$1/$2.min.js"

