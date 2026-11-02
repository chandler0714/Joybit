#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
: "${ADS_TEST_SIMULATOR:?Set ADS_TEST_SIMULATOR to a booted disposable/test iOS simulator UUID}"
: "${ADS_SOURCE_PACKAGES:?Set ADS_SOURCE_PACKAGES to the resolved Xcode SourcePackages directory}"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
ads_workspace="$PWD/build/local-artifacts/ads-privacy-tests"
ads_configuration="${ADS_TEST_CONFIGURATION:-Debug}"
case "$ads_configuration" in Debug|Release) ;; *) echo 'Use Debug or Release' >&2; exit 2 ;; esac
mkdir -p "$ads_workspace/source"
cp -R SteadyDrop "$ads_workspace/source/"
cp -R SteadyDrop.xcodeproj "$ads_workspace/source/"
cp Tests/AdsPrivacyTests.swift "$ads_workspace/source/SteadyDrop/SteadyDropApp.swift"
xcodebuild -project "$ads_workspace/source/SteadyDrop.xcodeproj" -scheme SteadyDrop \
    -configuration "$ads_configuration" -sdk iphonesimulator -destination "id=$ADS_TEST_SIMULATOR" \
    -derivedDataPath "$ads_workspace/derived" -clonedSourcePackagesDirPath "$ADS_SOURCE_PACKAGES" \
    -disableAutomaticPackageResolution CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=- \
    PRODUCT_BUNDLE_IDENTIFIER=com.xuanniaozhixu.steadydrop.privacychecks \
    build > "$ads_workspace/build.log" 2>&1
xcrun simctl install "$ADS_TEST_SIMULATOR" "$ads_workspace/derived/Build/Products/$ads_configuration-iphonesimulator/SteadyDrop.app"
xcrun simctl launch --terminate-running-process --console "$ADS_TEST_SIMULATOR" \
    com.xuanniaozhixu.steadydrop.privacychecks > "$ads_workspace/result.log" 2>&1
cat "$ads_workspace/result.log"
rg -q '^PASS: real SDK ad service' "$ads_workspace/result.log"
