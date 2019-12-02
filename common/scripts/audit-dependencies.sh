#!/bin/bash

cd common/temp

echo "Executing 'pnpm audit' of all dependencies used in all projects"

./pnpm-local/node_modules/.bin/pnpm audit || echo "Audit failed. See pnpm-debug-from-audit.log in repository root."

# if something goes wrong pnpm may leave its debug file around.. rush is quite strict about contents of the
# common/temp directory and will complain that there is some log file hanging around.
if [ -f "pnpm-debug.log" ]; then
    mv "pnpm-debug.log" "../../pnpm-debug-from-audit.log"
fi

# force new line (successfull pnpm audit message does not end with it)
echo
