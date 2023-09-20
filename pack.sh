
# Check if there are uncommitted changes in the Git repository
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ There are uncommitted changes! Commit them first as the script revers changes it will made to package.json files."
  exit 1
fi

map_lib_directory() {
  local input="$1"

  case "$input" in
    "sdk-backend-bear" | "sdk-ui-vis-commons" | "sdk-ui-filters" | "sdk-ui-geo" | "sdk-ui-all" | "sdk-ui-kit" | "api-client-bear" | "sdk-ui-ext" | "sdk-backend-tiger" | "sdk-ui-pivot" | "util" | "api-client-tiger" | "sdk-ui-web-components" | "sdk-ui-tests" | "sdk-ui" | "sdk-ui-dashboard" | "sdk-backend-spi" | "sdk-backend-mockingbird" | "sdk-embedding" | "sdk-ui-theme-provider" | "sdk-model" | "sdk-backend-base" | "sdk-ui-charts" | "sdk-ui-tests-e2e" | "api-model-bear" | "sdk-ui-loaders")
      echo "https://github.com/gooddata/gooddata-ui-sdk/raw/fast_track/libs/LIB_NAME/gooddata-LIB_NAME-0.0.0-dev.0.tgz"
      ;;
    "live-examples-workspace" | "i18n-toolkit" | "plugin-toolkit" | "dashboard-plugin-tests" | "dashboard-plugin-template" | "experimental-workspace" | "catalog-export" | "reference-workspace-mgmt" | "mock-handling" | "reference-workspace" | "app-toolkit" | "applink" | "react-app-template")
      echo "https://github.com/gooddata/gooddata-ui-sdk/raw/fast_track/tools/LIB_NAME/gooddata-LIB_NAME-0.0.0-dev.0.tgz"
      ;;
    *)
      >&2 echo "❌  Unknown SDK library/tool $input"
      exit 1
      ;;
  esac
}

# define a function to replace "workspace:*" dependencies
replace_workspace_dependencies() {
  local package_json="$1"
  local bundled_lib="$2"

  tmp_file=$(mktemp)

  echo "👷🏻 Replacing 'workspace:*' dependencies in $package_json..."

  while IFS= read -r line; do
    if [[ $line =~ ^[[:space:]]*\"(@gooddata/(.+))\":[[:space:]]*\"workspace:(.+)\"[[:space:]]*,?$ ]]; then
      dependency="${BASH_REMATCH[1]}"
      lib="${BASH_REMATCH[2]}"
      url_pattern=$(map_lib_directory $lib)
      new_line="        \"$dependency\": \"${url_pattern//LIB_NAME/$lib}\""
      echo "$new_line,"
    else
      echo "$line"
    fi
  done < "$package_json" > "$tmp_file"

  echo "⭐️ Updated $package_json with replaced 'workspace:*' dependencies"

  mv "$tmp_file" "$package_json"
}

# pack libs packages
for d in libs/*
    do    
        package=$(basename $d)
        [[ $package =~ ^(sdk-ui-tests|sdk-ui-tests-e2e|sdk-ui-web-components)$ ]] && continue
        echo "💪 Bundling $package"
        cd libs/$package
        replace_workspace_dependencies "package.json" $package
        npm pack
        cd -
    done

# pack tools packages
for d in tools/*    
    do    
        package=$(basename $d)
        [[ $package =~ ^(app-toolkit|applink|dashboard-plugin-template|dashboard-plugin-tests|experimental-workspace|live-examples-workspace|mock-handling|plugin-toolkit|react-app-template|reference-workspace-mgmt)$ ]] && continue
        echo "💪 Bundling $package"
        cd tools/$package
        replace_workspace_dependencies "package.json" $package
        npm pack
        cd -
    done

# revert all changes to package.json files, leave only tar balls
echo "♻️  Reverting changes made to package.json files..."
git checkout HEAD -- libs/*/package.json
git checkout HEAD -- tools/*/package.json

echo "⭐️ Publish is done"
