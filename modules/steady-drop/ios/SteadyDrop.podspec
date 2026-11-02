Pod::Spec.new do |s|
  s.name = 'SteadyDrop'
  s.version = '1.0.0'
  s.summary = 'Native Steady Drop game for Joybit'
  s.license = { :type => 'Private' }
  s.author = 'Joybit'
  s.homepage = 'https://github.com/chandler0714/disclick'
  s.source = { :path => '.' }
  s.platform = :ios, '17.0'
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'Google-Mobile-Ads-SDK', '13.11.0'
  s.dependency 'GoogleUserMessagingPlatform'
  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
