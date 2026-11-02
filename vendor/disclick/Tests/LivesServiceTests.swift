import Foundation
final class LivesStub: URLProtocol {
 static var response: (Int, String) = (200,"{}")
 static var inspect: ((URLRequest)->Void)?
 override class func canInit(with request: URLRequest) -> Bool { true }
 override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
 override func startLoading() {
  Self.inspect?(request)
  let (code,json)=Self.response
  client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:code,httpVersion:nil,headerFields:nil)!,cacheStoragePolicy:.notAllowed)
  client?.urlProtocol(self,didLoad:Data(json.utf8)); client?.urlProtocolDidFinishLoading(self)
 }
 override func stopLoading() {}
}
@main struct LivesServiceTests {
 static func main() async throws {
  let cfg=URLSessionConfiguration.ephemeral; cfg.protocolClasses=[LivesStub.self]
  let s=LivesService(configuration:AuthConfiguration(url:"https://unit.invalid",key:"sb_publishable_test")!,urlSession:URLSession(configuration:cfg))
  LivesStub.response=(200,#"{"lives":5,"points":90,"day":"2026-10-29","settled":false,"rewarded":false}"#)
  LivesStub.inspect = { r in
   precondition(r.url?.path == "/rest/v1/rpc/life_action" && r.httpMethod == "POST")
   precondition(r.value(forHTTPHeaderField:"Authorization") == "Bearer access")
  }
  let b=try await s.action("status",token:"access"); assert(b.lives==5 && b.points==90)
  LivesStub.response=(400,#"{"message":"NO_LIVES"}"#)
  do { _ = try await s.action("begin",token:"access"); fatalError() } catch { assert(error as? LifeError == .empty) }
  LivesStub.response=(404,#"{"code":"PGRST202"}"#)
  do { _ = try await s.action("status",token:"access"); fatalError() } catch { assert(error as? LifeError == .setup) }
  LivesStub.response=(200,#"{"lives":100,"points":0,"day":"2026-10-29"}"#)
  do { _ = try await s.action("status",token:"access"); fatalError() } catch { assert(error as? LifeError == .server) }
  LivesStub.response=(401,"{}")
  do { _ = try await s.action("status",token:"access"); fatalError() } catch { assert(error as? LifeError == .auth) }
  LivesStub.response=(400,#"{"message":"ROUND_CLOSED"}"#)
  do { _ = try await s.action("loss",token:"access"); fatalError() } catch { assert(error as? LifeError == .roundExpired) }
  LivesStub.response=(400,#"{"message":"TEST_REWARDS_DISABLED"}"#)
  do { _ = try await s.action("test_reward",token:"access"); fatalError() } catch {
   assert((error as? LifeError)?.key == "lifeTestRewardDisabled", "test reward denial must not appear as sync failure")
  }
  print("Lives transport: 7 scenarios passed")
 }
}
