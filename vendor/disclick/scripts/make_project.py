from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
def uid(s): return hashlib.sha1(s.encode()).hexdigest()[:24].upper()
objects=[]
def obj(name, value):
    objects.append(f'{uid(name)} = {{ {value} }};')
    return uid(name)
sources=sorted((root/'SteadyDrop').rglob('*.swift'))
refs=[]; builds=[]
for source in sources:
    relative=source.relative_to(root).as_posix()
    ref=obj(relative, f'isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{relative}"; sourceTree = "<group>";')
    refs.append(ref)
    builds.append(obj('build'+relative, f'isa = PBXBuildFile; fileRef = {ref};'))
assetRef=obj('asset', 'isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = SteadyDrop/Resources/Assets.xcassets; sourceTree = \"<group>\";')
refs.append(assetRef)
assetBuild=obj('asset-build',f'isa = PBXBuildFile; fileRef = {assetRef};')
privacyRef=obj('privacy-manifest', 'isa = PBXFileReference; lastKnownFileType = text.xml; path = SteadyDrop/Resources/PrivacyInfo.xcprivacy; sourceTree = "<group>";')
refs.append(privacyRef)
privacyBuild=obj('privacy-manifest-build',f'isa = PBXBuildFile; fileRef = {privacyRef};')
product=obj('product','isa = PBXFileReference; explicitFileType = wrapper.application; path = SteadyDrop.app; sourceTree = BUILT_PRODUCTS_DIR;')
products=obj('products',f'isa = PBXGroup; children = ({product},); name = Products; sourceTree = "<group>";')
main=obj('group',f'isa = PBXGroup; children = ({",".join(refs)},{products},); sourceTree = "<group>";')
sourcePhase=obj('sources',f'isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ({",".join(builds)},); runOnlyForDeploymentPostprocessing = 0;')
adsPackage=obj('ads-package','isa = XCRemoteSwiftPackageReference; repositoryURL = "https://github.com/googleads/swift-package-manager-google-mobile-ads.git"; requirement = { kind = exactVersion; version = 13.11.0; };')
adsProduct=obj('ads-product',f'isa = XCSwiftPackageProductDependency; package = {adsPackage}; productName = GoogleMobileAds;')
adsBuild=obj('ads-build',f'isa = PBXBuildFile; productRef = {adsProduct};')
frameworks=obj('frameworks',f'isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = ({adsBuild},); runOnlyForDeploymentPostprocessing = 0;')
resources=obj('resources',f'isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = ({assetBuild},{privacyBuild},); runOnlyForDeploymentPostprocessing = 0;')
def configs(prefix, settings):
    ids=[]
    for name in ['Debug','Release']:
        extra='SWIFT_OPTIMIZATION_LEVEL = "-Onone"; DEBUG_INFORMATION_FORMAT = dwarf;' if name=='Debug' else 'SWIFT_COMPILATION_MODE = wholemodule; SWIFT_OPTIMIZATION_LEVEL = "-O";'
        if prefix == 'project' and name == 'Debug': extra += ' SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;'
        ids.append(obj(prefix+name, f'isa = XCBuildConfiguration; buildSettings = {{ {settings} {extra} }}; name = {name};'))
    return obj(prefix+'list',f'isa = XCConfigurationList; buildConfigurations = ({",".join(ids)},); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;')
projectConfigs=configs('project','IPHONEOS_DEPLOYMENT_TARGET = 17.0; SDKROOT = iphoneos; CLANG_ENABLE_MODULES = YES; SWIFT_VERSION = 5.0;')
targetConfigs=configs('target','''PRODUCT_NAME = "$(TARGET_NAME)"; PRODUCT_BUNDLE_IDENTIFIER = com.xuanniaozhixu.steadydrop; GENERATE_INFOPLIST_FILE = YES; INFOPLIST_FILE = SteadyDrop/Resources/Info.plist; ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon; INFOPLIST_KEY_CFBundleDisplayName = "Steady Drop"; INFOPLIST_KEY_UILaunchScreen_Generation = YES; INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES; INFOPLIST_KEY_UISupportedInterfaceOrientations = UIInterfaceOrientationPortrait; TARGETED_DEVICE_FAMILY = 1; CURRENT_PROJECT_VERSION = 2; MARKETING_VERSION = 0.1.0; CODE_SIGN_ENTITLEMENTS = SteadyDrop/SteadyDrop.entitlements; OTHER_LDFLAGS = "-ObjC"; CODE_SIGN_STYLE = Automatic; DEVELOPMENT_TEAM = KMY94A6RM7; SWIFT_EMIT_LOC_STRINGS = YES; INFOPLIST_KEY_ITSAppUsesNonExemptEncryption = NO;''')
target=obj('target',f'isa = PBXNativeTarget; buildConfigurationList = {targetConfigs}; buildPhases = ({sourcePhase},{frameworks},{resources},); buildRules = (); dependencies = (); packageProductDependencies = ({adsProduct},); name = SteadyDrop; productName = SteadyDrop; productReference = {product}; productType = "com.apple.product-type.application";')
project=obj('project',f'isa = PBXProject; attributes = {{ LastSwiftUpdateCheck = 2600; LastUpgradeCheck = 2600; }}; buildConfigurationList = {projectConfigs}; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = (en,ja,ko,Base,); packageReferences = ({adsPackage},); mainGroup = {main}; productRefGroup = {products}; projectDirPath = ""; projectRoot = ""; targets = ({target},);')
out=root/'SteadyDrop.xcodeproj';out.mkdir(exist_ok=True)
(out/'project.pbxproj').write_text('// !$*UTF8*$!\n{ archiveVersion = 1; classes = {}; objectVersion = 56; objects = {\n'+'\n'.join(objects)+f'\n}}; rootObject = {project}; }}\n')
schemes=out/'xcshareddata/xcschemes';schemes.mkdir(parents=True,exist_ok=True)
(schemes/'SteadyDrop.xcscheme').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3"><BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target}" BuildableName="SteadyDrop.app" BlueprintName="SteadyDrop" ReferencedContainer="container:SteadyDrop.xcodeproj"/></BuildActionEntry></BuildActionEntries></BuildAction><LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target}" BuildableName="SteadyDrop.app" BlueprintName="SteadyDrop" ReferencedContainer="container:SteadyDrop.xcodeproj"/></BuildableProductRunnable></LaunchAction><AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/></Scheme>''')
print('Generated SteadyDrop.xcodeproj')
