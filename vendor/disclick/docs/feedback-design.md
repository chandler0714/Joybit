# Feedback pass
Owner directly requested removal effects, physical impact feedback, pain after long falls, happy face and confetti on completion. Implement with SpriteKit shapes/actions, no external assets/dependencies.
- Removal: immediately remove collider, short flash/shrink on visual, rotating wood chips following ballistic paths, expanding ring. Decorative fragments have no physics bodies.
- Contacts: hero/wood/pad notifications, minimum impulse1.5 and90ms global cooldown; dust/rings plus brief camera shake scaled by impulse, haptic on stronger hits. No artificial forces applied to actual bodies.
- Expression: downward travel95pt with speed>100pt/s triggers pain; retain0.8s; support contact resets fall origin; victory overrides pain. Animate facial/skin visuals only, no scaling of physical collider.
- Victory: freeze physics, happy eyes/open smile, confetti cannons around hero, wait1.6s before showing existing success card; scene actions continue, duplicate contacts cannot trigger duplicate reward.
Plan: pure reaction/gate tests RED→GREEN; integrate visuals/contact hooks; build and simulator smoke test; verify removal, happy win/confetti visibility and unchanged progression. Real-device haptics and all-level balance need subsequent QA.
