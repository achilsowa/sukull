#!/bin/bash

echo '' > $2
if [ -e "$1/$2.css" ]; then rm "$1/$2.css"
fi
if [ -e "$1/$2.min.css" ]; then rm "$1/$2.min.css"
fi
for file in `ls $1/*.css`
do
    cat $file >> "$1/$2.css"
done

java -jar yuicompressor-2.4.8.jar "$1/$2.css" > "$1/$2.min.css"

