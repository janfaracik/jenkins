#!/bin/bash

# Define the folder to exclude
EXCLUDE_DIR="./war/work"

# Set the number of spaces for indentation
INDENT_SPACES="2"

# Find all .jelly files, excluding the war/work directory
find . -name "*.jelly" -not -path "$EXCLUDE_DIR/*" | while read -r file; do
    echo "Processing and cleaning namespaces in $file"

    # Temporary file to store reformatted output
    TEMP_FILE="$file.tmp"

    # Separate the copyright comment (if it exists)
    awk 'NR==1,/-->/ {print > "'$TEMP_FILE'.header"; next} {print > "'$TEMP_FILE'"}' "$file"

    # Remove unused namespaces and perform indentation in the non-header part
    perl -0777 -pe '
        # 1. Match all namespace declarations (e.g., xmlns:l="...")
        my @namespaces = ($_) =~ /(xmlns:[^\s=]+="[^"]*")/g;

        # 2. Remove namespaces that are not used in the file
        foreach my $ns (@namespaces) {
            my ($prefix) = $ns =~ /xmlns:([^\s=]+)="[^"]*"/;
            if ($prefix && $_ !~ /<$prefix:/) {
                s/\s+$ns//g;
            }
        }

        # 3. Correctly indent lines, replacing leading tabs with spaces
        s/^\t+/(" " x (length($&)*'$INDENT_SPACES'))/egm;
    ' "$TEMP_FILE" > "$TEMP_FILE.cleaned"

    # Combine the header and the cleaned body
    if [ -f "$TEMP_FILE.header" ]; then
        cat "$TEMP_FILE.header" "$TEMP_FILE.cleaned" > "$file"
        rm "$TEMP_FILE.header"
    else
        mv "$TEMP_FILE.cleaned" "$file"
    fi

    # Clean up temporary files
    rm "$TEMP_FILE" "$TEMP_FILE.cleaned"

done

echo "All applicable .jelly files have been cleaned of unused namespaces and correctly indented."