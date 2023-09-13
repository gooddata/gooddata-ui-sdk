for d in libs/*    
    do    
        package=$(basename $d)
        [[ $package =~ ^(sdk-ui-tests|sdk-ui-tests-e2e|sdk-ui-web-components)$ ]] && continue
        echo bundling $package
        cd libs/$package
        npm pack
        cd -
    done


for d in tools/*    
    do    
        package=$(basename $d)
        [[ $package =~ ^(app-toolkit|applink|dashboard-plugin-template|experimental-workspace|i18n-toolkit|live-examples-workspace|mock-handling|plugin-toolkit|react-app-template|reference-workspace-mgmt)$ ]] && continue
        echo bundling $package
        cd tools/$package
        npm pack
        cd -
    done
