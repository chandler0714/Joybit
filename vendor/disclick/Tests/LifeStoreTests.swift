import SwiftUI
@MainActor final class AuthModel {
 var session: AuthSession? = AuthSession(access_token:"test",refresh_token:"refresh",expires_in:3600,user:AuthUser(id:"life-store-unit",email:nil))
 func restore() async {}
}
@MainActor final class RewardedAds { var usesTestAds = true; func present(ticket:UUID) async throws { throw LifeError.adCancelled } }
final class StoreStub: URLProtocol {
 static var expireRound = false; static var lossCalls = 0; static var failLoss = false; static var delayStatus = false
 override class func canInit(with request: URLRequest)->Bool { true }
 override class func canonicalRequest(for request:URLRequest)->URLRequest { request }
 override func startLoading() {
  let body = request.httpBody ?? request.httpBodyStream.map { stream -> Data in
   stream.open(); defer {stream.close()}; var data=Data(); var b=[UInt8](repeating:0,count:4096)
   while stream.hasBytesAvailable { let n=stream.read(&b,maxLength:b.count); if n<=0 {break}; data.append(contentsOf:b.prefix(n)) }; return data
  } ?? Data()
  let json=(try? JSONSerialization.jsonObject(with:body)) as? [String:Any]
  let action=json?["p_action"] as? String
  if action == "loss" { Self.lossCalls += 1 }
  let code = action == "loss" && Self.expireRound ? 400 : action == "loss" && Self.failLoss ? 500 : 200
  let text = code==200 ? #"{"lives":4,"points":0,"day":"2026-10-29","settled":true,"rewarded":false}"# : (Self.expireRound ? #"{"message":"ROUND_CLOSED"}"# : "{}")
  let respond = { [self] in
   client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:code,httpVersion:nil,headerFields:nil)!,cacheStoragePolicy:.notAllowed)
   client?.urlProtocol(self,didLoad:Data(text.utf8)); client?.urlProtocolDidFinishLoading(self)
  }
  if action == "status" && Self.delayStatus { DispatchQueue.global().asyncAfter(deadline:.now()+0.15,execute:respond) } else { respond() }
 }
 override func stopLoading() {}
}
@main struct LifeStoreTests {
 @MainActor static func main() async throws {
  let user="life-store-unit"; UserDefaults.standard.removePersistentDomain(forName:"com.xuanniaozhixu.steadydrop.progress."+user)
  let cfg=URLSessionConfiguration.ephemeral; cfg.protocolClasses=[StoreStub.self]
  let service=LivesService(configuration:AuthConfiguration(url:"https://unit.invalid",key:"sb_publishable_test")!,urlSession:URLSession(configuration:cfg))
  let auth=AuthModel(); let s=LifeStore(userID:user,service:service); s.connect(auth)
  let began=await s.begin(level:1,retry:false); assert(began)
  StoreStub.delayStatus=true
  let refreshing=Task { await s.refresh() }; try await Task.sleep(for:.milliseconds(30))
  await s.settle(won:false); await refreshing.value
  assert(StoreStub.lossCalls==1,"a finish during status sync must not disappear")
  StoreStub.delayStatus=false; StoreStub.failLoss=true
  let next=await s.begin(level:1,retry:false); assert(next)
  await s.settle(won:false)
  let recovered=LifeStore(userID:user,service:service); recovered.connect(auth)
  StoreStub.failLoss=false; await recovered.refresh()
  assert(StoreStub.lossCalls==3,"failed settlement must persist across relaunch and retry")
  let calls=StoreStub.lossCalls; await recovered.refresh(); assert(calls==StoreStub.lossCalls,"acknowledged result must not replay")
  let final=await recovered.begin(level:1,retry:false); assert(final)
  let before=StoreStub.lossCalls; let retried=await recovered.begin(level:1,retry:true); assert(retried && StoreStub.lossCalls==before+1)
  recovered.abandon(); let afterHome=await recovered.begin(level:1,retry:false); assert(afterHome && StoreStub.lossCalls==before+1)
  StoreStub.expireRound = true; await recovered.settle(won:false)
  StoreStub.expireRound = false
  let recoveredRound = await recovered.begin(level:1,retry:false); assert(recoveredRound,"closed round must not permanently block this device")
  UserDefaults.standard.removePersistentDomain(forName:"com.xuanniaozhixu.steadydrop.progress."+user)
  print("LifeStore passed: concurrent finish, persisted network retry, no duplicate acknowledgement, retry charges once, home free")
 }
}
