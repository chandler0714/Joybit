import Foundation
@main struct LivesTests {
 static func main() {
  var s = LifeBalance(lives: 0, points: 90, day: "2026-10-29")
  s.refresh(day: "2026-10-30"); assert(s.lives == 5 && s.points == 90)
  s.refresh(day: "2026-10-30"); assert(s.lives == 5)
  s.refresh(day: "2026-10-28"); assert(s.day == "2026-10-30")
  s.lives = 12; s.refresh(day: "2026-10-31"); assert(s.lives == 12)
  assert(s.win()); assert(s.lives == 13 && s.points == 0)
  for _ in 0..<9 { assert(!s.win()) }; assert(s.points == 90)
  assert(s.win()); assert(s.lives == 14 && s.points == 0)
  s.lives = 99; s.points = 90; assert(!s.win()); assert(s.points == 0 && s.lives == 99)
  s.reward(); assert(s.lives == 99)
  s.lives = 0; s.lose(); assert(s.lives == 0); s.reward(); assert(s.lives == 1)
  s.lose(); assert(s.lives == 0)
  print("Life rules passed: daily boundary, rollback, retained balance, 10 wins, cap, loss floor, ad cap")
 }
}
