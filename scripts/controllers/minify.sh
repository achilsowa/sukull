#!/bin/bash

echo '' > $2
if [ -e "$1/$2.min.js" ]; then rm "$1/$2.min.js"
fi
for file in `ls $1/*.js`
do
    cat file >> $2
done

java -jar yuicompressor-x-y-z.jar $2 | "$1/$2.min.js"
