#!/bin/bash

# Define the folder to exclude
EXCLUDE_DIR="./war/work"

# Set the number of spaces for indentation
INDENT_SPACES="2"

# Find all .jelly files, excluding the war/work directory
find . -name "*.jelly" -not -path "$EXCLUDE_DIR/*" | while read -r file; do
    echo "Processing and indenting $file"

    # Temporary file to store reformatted output
    TEMP_FILE="$file.tmp"

    # Separate the copyright comment (if it exists)
    awk 'NR==1,/-->/ {print > "'$TEMP_FILE'.header"; next} {print > "'$TEMP_FILE'"}' "$file"

    # Re-indent the non-header part of the file (replace leading tabs with spaces)
    perl -pe 's/^\t+/(" " x (length($&)*'$INDENT_SPACES'))/e' "$TEMP_FILE" > "$TEMP_FILE.indented"

    # Combine the header and the indented body
    if [ -f "$TEMP_FILE.header" ]; then
        cat "$TEMP_FILE.header" "$TEMP_FILE.indented" > "$file"
        rm "$TEMP_FILE.header"
    else
        mv "$TEMP_FILE.indented" "$file"
    fi

    # Clean up temporary files
    rm "$TEMP_FILE" "$TEMP_FILE.indented"

done

echo "All applicable .jelly files have been correctly indented, excluding the war/work directory and preserving copyright comments."