# Streets of Rage 2 - Comprehensive Game Design Research

## Table of Contents
1. [Hardware & Technical Foundation](#1-hardware--technical-foundation)
2. [Core Gameplay Mechanics](#2-core-gameplay-mechanics)
3. [Combat System Details](#3-combat-system-details)
4. [Enemy Types & AI Patterns](#4-enemy-types--ai-patterns)
5. [Level Structure](#5-level-structure)
6. [Visual Style & Art](#6-visual-style--art)
7. [HUD & UI](#7-hud--ui)
8. [Two-Player Mechanics](#8-two-player-mechanics)
9. [Sound Design](#9-sound-design)
10. [Difficulty & Progression](#10-difficulty--progression)

---

## 1. Hardware & Technical Foundation

### Sega Genesis / Mega Drive Specs
- **Resolution**: 320x224 pixels (H40 mode, the standard for SoR2)
- **Color palette**: 9-bit RGB = 512 possible colors
- **On-screen colors**: 61 simultaneous (4 palette lines x 16 colors each, minus shared transparent slots)
- **Palette structure**: 4 palettes of 16 entries each (15 usable colors + 1 transparent per palette)
- **Tile size**: 8x8 pixels (fundamental unit for both backgrounds and sprites)
- **Sprite limit**: 80 sprites on screen, 20 sprites per scanline, max 320 sprite pixels per scanline
- **Max hardware sprite size**: 4x4 tiles = 32x32 pixels (characters are assembled from multiple sprites)
- **Background planes**: 2 tilemap planes (Plane A foreground, Plane B background) + sprite layer
- **Scrolling modes**: Per-scanline, per-tile (8px rows), or per-block (16px rows) - horizontal and vertical independently
- **CPU**: Motorola 68000 at 7.67 MHz
- **Sound**: Yamaha YM2612 FM synth (6 channels) + Texas Instruments SN76489 PSG (4 channels)
- **Frame rate**: 60 fps (NTSC), 50 fps (PAL)

### SoR2-Specific Technical Choices
- Ancient (developer) rewrote the engine from SoR1 for smoother gameplay
- Larger character sprites than SoR1 (Axel is ~77 pixels tall, compared to smaller SoR1 sprites)
- Characters are composed of multiple hardware sprites tiled together
- Shadow/highlight mode available for lighting effects (halves RGB values for shadow, halves + adds for highlight)
- ROM size: 16 Mbit (2 MB), allowing extensive use of PCM samples for voice and SFX

---

## 2. Core Gameplay Mechanics

### Movement
- **8-directional movement** on a 2.5D plane (left/right scrolling + up/down for depth on the "street")
- Characters walk in all 8 directions at the same speed
- **No run/dash** for most characters; **Skate is the only character who can dash** (double-tap forward)
- Walk speed is deliberately slow relative to screen width - a character crosses roughly 1/3 of the screen width in about 2 seconds
- Characters move on a Y-axis depth plane (roughly the bottom 60% of the screen represents the walkable "floor")
- Vertical movement is slightly slower than horizontal to create the isometric perspective illusion

### Character Stats (rated 1-3)

| Character | Power | Technique | Speed | Jump | Stamina |
|-----------|-------|-----------|-------|------|---------|
| Axel      | 2     | 3         | 2     | 1    | 2       |
| Blaze     | 2     | 2         | 2     | 2    | 2       |
| Max       | 3     | 2         | 1     | 1    | 3       |
| Skate     | 1     | 2         | 3     | 3    | 1       |

### Jump System
- Press C to jump
- Characters have a fixed arc jump (no air control for horizontal movement)
- **Jump kick** (press B during jump): standard diagonal-down kick
- **Drop attack** (press Down + B during jump): downward attack, character-specific
- Jumping provides brief invulnerability during startup frames
- Jump attacks knock down enemies on hit

### Health / Lives System
- **Player health bar**: 104 HP (full bar)
- **Starting lives**: 3 (configurable 1-9 in Options)
- **Extra lives from score**: awarded at 20,000 points, 50,000 points, then every 100,000 points thereafter
- **1UP pickups**: rare, found in destructible objects
- **Health recovery between sections**: both characters receive 8 HP at each scene transition
- **Death**: when HP reaches 0, lose a life and respawn with full health (brief invincibility on respawn)
- **Game Over**: when all lives are lost; player can continue (resets score) or quit
- **Continues**: limited number (varies by platform; Genesis original has a set amount)

### Health Pickups
- **Apple**: restores 32 HP
- **Chicken/Turkey**: full health restore (found in breakable objects)
- **1UP**: extra life (very rare)
- Found inside breakable objects (trash cans, barrels, phone booths, crates)

### Score Pickups
- **Money bag**: 1,000 points
- **Gold bar**: 5,000 points
- **Time bonus**: awarded at end of each stage based on remaining timer

### Timer
- Each stage has a countdown timer (typically starts around 3-4 minutes per section)
- Running out of time costs a life
- Timer resets at each sub-section transition within a stage
- Time bonus awarded at stage completion based on remaining time

---

## 3. Combat System Details

### Basic Combo Chain (Axel Example)
Pressing B repeatedly near an enemy chains into a **5-hit combo**:

| Hit | Attack         | Damage | Properties    |
|-----|----------------|--------|---------------|
| 1   | Jab            | 6 HP   | No knockdown  |
| 2   | Jab            | 6 HP   | No knockdown  |
| 3   | Straight punch | 8 HP   | No knockdown  |
| 4   | Low sidekick   | 10 HP  | No knockdown  |
| 5   | High sidekick  | 14 HP  | **Knockdown** |

**Total combo damage: 44 HP** (enough to kill basic Galsia enemies)

Each character has a unique combo sequence:
- **Axel**: Jab > Jab > Straight > Low Kick > High Kick (knockdown)
- **Blaze**: Jab > Jab > Backfist > Knee > Side Kick (knockdown)
- **Max**: Punch > Punch > Headbutt (knockdown) - shorter chain, higher damage per hit
- **Skate**: Jab > Jab > Jab > Uppercut (knockdown) - fast but weak

### Slow Combo Technique
If you **wait briefly between presses**, you can repeat just the first hit of the combo indefinitely without triggering the knockdown finisher. This keeps the enemy in hitstun, allowing infinite chip damage without knocking them away. Essential advanced technique.

### Grab / Grapple System
- **Auto-grab**: walking into an enemy from the front automatically initiates a grab (no button press needed)
- Once grabbed, the player has several options:

| Action | Input | Effect |
|--------|-------|--------|
| Punch flurry | Press B repeatedly | Multiple hits while holding enemy |
| Power blow | Press B (hold) | Single strong hit, knocks away |
| Throw forward | Press Forward + B | Flings enemy forward |
| Throw backward | Press Back + B | Vault over enemy, throw behind |
| Suplex/Slam | Varies by character | Most damaging grab move |

- **Max's Atomic Drop** (grab + specific input): the most powerful move in the entire game
- Max lacks "Power throw" and "Flurry 2" but compensates with superior grab damage
- Grabbed enemies can be used as weapons against other enemies (thrown into groups)
- You cannot grab enemies from behind; you must approach face-to-face

### Blitz Attacks (Dash Attacks)
- Input: **Forward, Forward + B** (double-tap direction then attack)
- Each character has a unique blitz attack:
  - **Axel - Grand Upper**: rushing uppercut, 3 hits, 24+4+20 = 48 HP total
  - **Blaze - Kikousho (Fireball)**: energy projectile, 1 hit, damage varies by distance (44 HP close, down to 12 HP far)
  - **Max - Thunder Tackle**: charging shoulder tackle
  - **Skate - Corkscrew Kick**: spinning aerial kick
- Blitz attacks have **no health cost** (unlike specials)
- They have startup vulnerability before the active frames

### Special Attacks
Two types per character, activated with the **A button**:

**Stationary Special** (press A while standing still):
- Hits enemies in all directions around the character
- Only drains health **if it connects** with an enemy
- Provides **invincibility frames** during execution
- Can be used **during hitstun** (defensive escape tool)
- Examples: Axel's Dragon Wing, Blaze's Embukyaku, Max's Knuckle Bomb, Skate's Double Spin Kick

**Directed Special** (press A while holding a direction):
- Moves the character in a direction while attacking
- **Always drains health**, whether it hits or not
- Also provides invincibility frames
- Examples: Axel's Dragon Smash, Blaze's Kikousho, Max's Thunder Tackle, Skate's Corkscrew Kick

**Health cost rule**: if your health is too low, you cannot use special attacks at all.

### Back Attack
- Input: **B + C simultaneously** (attack + jump together)
- Character performs a backwards strike without turning around
- Essential for dealing with enemies behind you
- Does not consume health
- Provides some invulnerability

### Weapon System

| Weapon | Attack Style | Notes |
|--------|-------------|-------|
| Knife | Stab forward | Fast, good range, can be thrown |
| Lead Pipe | Overhead swing | Good damage and range, hits above and forward |
| Katana/Sword | Horizontal slash | Best range of melee weapons |
| Kunai | Throwing weapon | Projectile, consumed on use |
| Grenade | Explosive | Detonates on impact or after timer, area damage |

- Weapons are **picked up from the ground** (press B near a dropped weapon)
- Weapons can be **swung** (B) or **thrown** (Forward + A, or press A)
- Weapons are **dropped when the player is knocked down**
- Enemies (particularly Galsia and Donovan) also carry and use weapons
- Skate is described as "extremely dangerous with the knife"
- Max's pipe swing hits behind him as well as forward

---

## 4. Enemy Types & AI Patterns

### General Enemy AI Architecture

Beat-em-up enemy AI (as used in SoR2 and the genre) follows these core principles:

#### Position Slot System
- Two invisible **"slots"** exist flanking the player (one left, one right)
- These slots are the **target positions** enemies move toward
- Slot distance varies: close when aggressive, far when passive
- Enemies try to line up with the player's Y position (depth) before approaching horizontally

#### Aggression Token System
- A global **"aggression capacity"** limits how many enemies can attack simultaneously
- Typically only **1-2 enemies attack at once**, while others circle/wait
- When an enemy enters attack range, it checks a global counter/list
- If the list is full, the enemy enters a **passive/queueing state** (circling, pacing)
- If a slot is available, the enemy **claims a token** and enters attack mode
- Tokens are released after an attack or after a timeout
- This creates the classic "enemies politely take turns" feel

#### Behavior States
Enemies cycle through these states:
1. **Idle/Spawn**: enter screen, brief pause
2. **Approach**: walk toward a position slot near the player
3. **Ready/Circle**: in range but waiting for aggression token
4. **Attack**: execute attack pattern
5. **Recover**: post-attack cooldown, may retreat
6. **Knocked down / Stunned**: hit reaction
7. **Death**: defeat animation

#### Facing & Awareness
- Some enemies behave differently based on **whether the player is looking at them**
- Enemies facing the player tend to be more defensive/cautious
- Enemies behind the player are more likely to rush in and attack
- Enemies detect player attack hitboxes and may **back away** or **block** when sensing danger

#### Movement Patterns
- **Direct approach**: walk straight toward position slot (basic enemies like Galsia)
- **Semi-continuous**: mostly continuous movement with brief pauses or sidesteps (Donovan)
- **Circle/orbit**: move in arcs around target point rather than straight lines (Signal)
- **Stutter movement**: short quick bursts of movement (ninjas, acrobats)
- **RNG timing**: approach behavior randomized with timers (~4-5 seconds per decision cycle in SoR1, likely similar in SoR2)

### Enemy Roster

#### Galsia (Basic Thug)
- **HP**: Low (dies to one full combo, approximately 40-48 HP on Normal)
- **First appears**: Stage 1-1
- **Behavior**: Most common enemy. Walks toward player, throws simple punches. Can carry weapons (knife, pipe). Very basic AI - direct approach, attacks when in range.
- **Variants**: Multiple color/name variants throughout the game
- **Key trait**: Sometimes one is found sleeping on a bench and wakes up when you approach

#### Donovan (Bald Thug)
- **HP**: Low-medium
- **First appears**: Stage 1-1
- **Behavior**: Slightly tougher than Galsia. Can perform uppercuts. Carries weapons. More likely to block or evade.
- **Attack pattern**: Walk in, punch/uppercut, retreat briefly

#### Signal / Y. Signal (Mohawk Punk)
- **HP**: Medium
- **First appears**: Stage 1 area
- **Behavior**: More mobile than basic thugs. Can perform **throws** and **sliding attacks**. Often circles around the player.
- **Key trait**: Slide kick gives good approach range

#### Electra (Whip Fighter)
- **HP**: High (for a regular enemy)
- **First appears**: Stage 1-2 (sub-boss)
- **Behavior**: Uses whip to **electrocute** players at medium range. Can perform jump kicks. Very annoying when paired with other enemies. High HP makes her durable.
- **Key trait**: Whip has excellent range, electrifies on hit

#### Rider (Biker)
- **HP**: N/A (vehicle-based)
- **First appears**: Stage 2-1
- **Behavior**: Rides motorcycles across the screen. One-hit knockdown on contact. Must be timed/avoided or attacked as they pass. Some throw grenades.
- **Key trait**: Cannot be grabbed; must be struck while passing

#### Hakuyo (Martial Artist)
- **HP**: Medium-high
- **First appears**: Stage 2-2 (sub-boss)
- **Behavior**: Kung-fu fighter. Uses kicks and martial arts combos. More defensive - will block attacks and counterattack.
- **Key trait**: Blocks player combos, counters with kicks

#### Mifune / Kusanagi (Ninja)
- **HP**: Medium
- **First appears**: Stage 3-2 (sub-boss)
- **Behavior**: Extremely fast and mobile. Jumps frequently. Throws **kunai** projectiles. Can grab and throw the player. Uses swords for melee. Distracts with movement, then attacks.
- **Key trait**: High mobility, projectile attacks, grab capability

#### Big Ben (Heavy)
- **HP**: High
- **First appears**: Stage 4-2 (sub-boss)
- **Behavior**: Large, heavyset enemies. Despite size, can perform **body splashes** (jumping belly flop). Can **breathe fire** at medium range. Will charge/run at the player.
- **Key trait**: Fire breath, body splash, hard to stagger

#### Eagle (Kickboxer)
- **HP**: Medium-high
- **First appears**: Stage 5-2 (sub-boss)
- **Behavior**: Muay Thai fighters. **Constantly blocks** player attacks. Uses long-range punches, kicks, and knee jumps. Very defensive, waits for openings.
- **Key trait**: Blocks frequently, must be grabbed or attacked from behind

#### Jack (Knife Sub-boss)
- **HP**: Medium
- **Appears**: 3 times throughout the game
- **Behavior**: Carries **unlimited knives**. Throws knives as projectiles and slashes in melee. Fast and aggressive.
- **Key trait**: Ranged knife throwing, appears as recurring sub-boss

#### Vehelits (Alien)
- **HP**: Medium
- **Appears**: Stage 3-4 only (Alien Building, unique encounter)
- **Behavior**: Bounces around the screen to headbutt players. Erratic movement pattern. **Explodes on defeat**.
- **Key trait**: Unique bouncing movement, explosion on death

### Boss Roster (8 stages = 8 bosses)

| Stage | Boss | Fighting Style |
|-------|------|----------------|
| 1 | **Barbon** | Bar owner, uses punches, kicks, and grabs |
| 2 | **Jet** | Jetpack fighter, flies around the screen, low HP for a boss |
| 3 | **Zamza** (+ Lizardian) | Claw-wielding acrobat, jumps frequently, can suplex |
| 4 | **Abadede** | Massive wrestler, charges across screen, very high HP |
| 5 | **R. Bear (Rocky Bear)** | Pro wrestler, uses diving splashes, clotheslines, invincible stance |
| 6 | **Souther/Stealth** | Ninja boss, extremely fast, throws projectiles |
| 7 | **Particle & Molecule** | Twin robots, fought together |
| 8 | **Shiva** (mini-boss) then **Mr. X** (final boss) | Shiva is a martial artist; Mr. X uses a gun + subordinates |

### Boss AI Patterns (General)
- Bosses have **multiple health bars** (visually one bar that depletes and refills)
- Boss falls down after each "bar" is depleted, damage does not carry over between bars
- Bosses are invincible during certain animations (getting up, certain attacks)
- Most bosses alternate between: **approach > attack pattern > recovery > retreat > repeat**
- Bosses often have **super armor** (don't flinch from weak attacks)
- Wrestlers (R. Bear, Abadede) have an **invincible stance** that pushes players away when attacked too much

---

## 5. Level Structure

### Overview
- **8 stages** total
- Each stage is divided into **3-5 sub-sections** separated by scene transitions
- Average playtime: ~40-60 minutes for a full run
- Stages alternate between scrolling sections and arena/room encounters

### Scrolling Mechanics
- **Standard scrolling**: screen scrolls right (or occasionally left/up/down) as the player moves forward. The screen only advances when all current enemies are defeated and the player walks to the edge.
- **Forced scrolling**: some sections (elevator sequences, conveyor belts) auto-scroll, and enemies arrive continuously.
- **Arena/room lock**: screen stops scrolling, enemies spawn in waves, must clear all enemies to proceed. Indicated by the screen refusing to scroll further.
- **Vertical sections**: elevator levels scroll vertically (enemies drop in from above/sides).

### Stage Breakdown

**Stage 1 - Downtown / The Streets**
- Section 1: City street at night (standard scroll right)
- Section 2: Dark alley (narrower path)
- Section 3: Inside a bar (destructible tables, chairs, bottles)
- Section 4: Back alley behind bar
- **Boss**: Barbon (in the bar area)

**Stage 2 - Bridge / Under Construction**
- Section 1: Bridge approach (bikers attack)
- Section 2: Construction zone
- Section 3: Bridge underpass
- **Boss**: Jet

**Stage 3 - Amusement Park**
- Section 1: Park entrance (Galsia sleeping on bench)
- Section 2: Arcade (playable Bare Knuckle arcade cabinets in background, money bags hidden in machines)
- Section 3: Pirate ship ride (vertical elevator section - enemies drop from above, first elevator level)
- Section 4: Alien building (unique enemy: Vehelits)
- **Boss**: Zamza

**Stage 4 - Stadium / Ball Park**
- Section 1: Stadium exterior
- Section 2: Baseball field
- Section 3: Arena interior
- **Boss**: Abadede

**Stage 5 - Ship / Cargo**
- Section 1: Dock area
- Section 2: Ship deck
- Section 3: Ship interior (narrow corridors)
- **Boss**: R. Bear (Rocky Bear)

**Stage 6 - Jungle / Island**
- Section 1: Beach/jungle entrance
- Section 2: Jungle path
- Section 3: Jungle ruins
- **Boss**: Souther/Stealth

**Stage 7 - Factory / Munitions Plant**
- Section 1: Factory exterior
- Section 2: Factory interior (moving floors, conveyor belts, hazards/traps)
- Section 3: Elevator shaft (forced vertical scroll, continuous enemy waves)
- **Boss**: Particle & Molecule (twin robots)

**Stage 8 - Syndicate Stronghold**
- Section 1: Building exterior/entrance
- Section 2: Interior halls
- Section 3: Boss rush (re-fight previous bosses)
- Section 4: Final room
- **Mini-boss**: Shiva
- **Final Boss**: Mr. X

### Section Transition
- Brief pause, screen fades or scrolls to new area
- Both players receive 8 HP recovery at each transition
- "GO" arrow appears on screen pointing in the direction to proceed
- Timer resets for new section

---

## 6. Visual Style & Art

### Character Proportions
- Characters are approximately **77 pixels tall** (Axel's height)
- Roughly **3.5-4 head-tall** proportions (semi-realistic, not super-deformed)
- Characters occupy about **1/3 of the screen height**
- Wider/more muscular builds than SoR1 (influence from Street Fighter II character design)
- Max is the tallest/widest character; Skate is the shortest

### Sprite Construction
- Built from **8x8 pixel tiles**
- Each character sprite is assembled from multiple hardware sprites (typically 6-12 tiles wide by 10+ tiles tall)
- 15 colors per sprite palette + transparent
- Characters use warm skin tones, bold primary colors for clothing
- Player 2 gets **alternate color palette** when both players choose the same character

### Animation Approach
- Walk cycle: approximately **6-8 frames** per direction
- Idle: **2-4 frames** (subtle breathing/bob animation)
- Jab: **3-4 frames** (very fast, priority on responsiveness)
- Full combo: each hit has **3-5 frames** of animation
- Knockdown/fall: **4-6 frames**
- Getting up: **3-4 frames** (invincibility during this)
- Special moves: **6-12 frames** (more elaborate animation)
- Design docs show Axel and Blaze had 2 pages of move sketches, Max and Skate had 3 pages each

### Art Direction (Ayano Koshiro, age 22)
- **Ayano Koshiro** was primary artist/art director
- Enemy pixel art was initially outsourced but had to be redrawn in-house due to quality issues
- Strong influence from Street Fighter II (the team was playing it extensively during development)
- Urban noir aesthetic: dark streets, neon lights, gritty city environments

### Color Palette Style
- **Dark, moody backgrounds** with rich blues, purples, and dark greens for nighttime city
- **Warm highlights**: neon signs in pink, orange, and yellow
- **Character sprites**: saturated primary colors to stand out against dark backgrounds
  - Axel: white shirt, blue jeans (iconic)
  - Blaze: red outfit
  - Max: black vest, jeans
  - Skate: yellow/green outfit
- **Enemies**: color-coded by variant (palette swaps indicate difficulty increase)
- Heavy use of **shadow/darkness** in backgrounds with bright character sprites creating contrast
- Stage variety: city streets (dark blues), amusement park (vibrant), jungle (greens), factory (industrial grays)

### Parallax Scrolling
- Uses Genesis Plane A (foreground) and Plane B (background) for parallax depth
- **Multiple scroll rates** using per-scanline or per-tile scroll modes:
  - Distant city skyline scrolls slowest
  - Mid-ground buildings scroll at medium speed
  - Foreground/floor scrolls 1:1 with player
- Some stages have 3-4 apparent parallax layers achieved through clever scanline scrolling tricks
- Stage 1 bridge section is noted for particularly impressive parallax
- Floor plane uses a slight perspective distortion (narrower at top) to enhance depth

### Visual Effects
- **Hit sparks**: white flash sprites on impact
- **Shadow/highlight mode**: used for lighting effects in some stages
- **Screen flash**: brief white flash on powerful hits
- **Knockdown dust**: small dust cloud when enemies hit the ground
- **Fire/explosion effects**: for grenades, fire-breathing enemies, special moves

---

## 7. HUD & UI

### In-Game HUD Layout

```
+--------------------------------------------------+
| P1 [AXEL]  ||||||||||||  SCORE: 012400    3:00   |
|            [health bar]         LIVES: 3         |
|                                                  |
|                                                  |
|              (gameplay area)                     |
|                                                  |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

### HUD Elements (Top of Screen)

**Player 1 Info (top-left)**:
- Character name (e.g., "AXEL")
- **Health bar**: horizontal bar, yellow/green when full, transitions to orange then red as health decreases
- Star icons or segments may indicate remaining sub-bars
- Lives counter (number or small character head icons)

**Player 2 Info (top-right in 2P mode)**:
- Same layout as P1, mirrored to top-right

**Score**: displayed numerically, typically 6-7 digits

**Timer**: countdown in seconds, displayed center-top or near score

**Enemy Health Bar**: appears at bottom of screen (or near the enemy) when fighting bosses/sub-bosses. Enemy name displayed alongside it.

### UI Screens

**Title Screen**: Sega logo > game title with "Press Start"

**Character Select**: 4 character portraits arranged horizontally, stats displayed (Power/Technique/Speed/Jump/Stamina as star ratings)

**Options Menu**: Difficulty (Easy/Normal/Hard/Hardest/Mania), Lives (1-9), Sound Test

**Stage Intro**: Stage number and name displayed briefly before gameplay starts

**Game Over**: "GAME OVER" with continue countdown timer, option to continue or end

**Stage Clear**: Score tally showing time bonus, displayed after boss defeat

---

## 8. Two-Player Mechanics

### Co-op Mode
- **Simultaneous 2-player** on the same screen (couch co-op)
- Both players share the same scrolling camera - screen only advances when both players are near the right edge
- If one player moves too far ahead, the other is blocked by the screen edge
- Camera follows the average position of both players with bias toward the leading player

### Friendly Fire
- **Yes, friendly fire is ON by default**
- Players can hit each other with all attacks (punches, kicks, specials, weapons)
- This is both a feature and a challenge - requires coordination
- Throws can hit your partner
- Some players intentionally use friendly fire for certain exploits (knocking partner to grant invincibility frames)
- ROM hacks exist specifically to disable friendly fire

### Team Attacks
- Players can grab and **throw each other** (vault attacks)
- Team attack damage: 8 HP per team throw variant
- Coordinating throws into enemy groups is a valid strategy

### Versus Mode
- Separate **1v1 fighting mode** (not in the story campaign)
- Single-screen arena combat
- Best of 3 rounds (first to 2 wins)
- Players select from the same 4 characters
- Alternate color schemes when both choose the same character

### Shared Resources
- Health pickups and items can be **contested** - whoever walks over them first gets them
- Score is tracked **independently** per player
- Extra lives earned independently
- When one player loses all lives, they cannot rejoin until the other player also gets a game over (and continues)

---

## 9. Sound Design

### Composers
- **Yuzo Koshiro** (primary composer, also did SoR1)
- **Motohiro Kawashima** (co-composer)

### Music Style
- **Early '90s electronic club music**: house, techno, "death techno"
- Influences cited by Koshiro: **The Orb, The Prodigy, Eon**
- Composed using **MML (Music Macro Language)** programmed on a **PC-8801** for precise FM synthesis control
- "Beyond what MIDI allows" - direct FM parameter programming
- The sequel is described as a "remix/arrangement" evolution from SoR1's style

### Composition Process
- Koshiro composed by watching gameplay visuals: "I'd see the visuals in front of me while writing, getting hints from the way characters move and the atmosphere of the graphics"
- Equipment chain: **Akai S-1100 sampler** (recording) > **Mac** (gain adjustments) > **PC-98** (MIDI transfer) > Sega proprietary tools (ADPCM conversion to Mega Drive format)
- MML was acknowledged as "very difficult" but producing a unique charm in game music

### Sound Effects
- **Hit effects**: punchy impact sounds using PCM samples. "Sound effects really are the lifeblood of action games" - the team prioritized psychologically impactful fighting sounds
- **Voice samples**: Koshiro personally recorded at midnight: "I'd grab my mic in the middle of the night and yell out the special moves"
  - Character attack grunts ("HAAAH!", "HYAAH!")
  - Special move callouts
  - Pain/hit reaction sounds
  - Boss-specific voices
- **Sampled sources**: The "Voice Collection" track sampled from:
  - Mikey Dread's "Operator's Choice"
  - Simon Harris's "Fx & Scratches (Vol. 7)"
- The 16 Mbit ROM enabled extensive PCM sampling for "punches/kicks" that previous cartridge sizes couldn't support

### SFX Categories
- **Punch/kick impacts**: sharp, satisfying thwack sounds (different for weak vs strong hits)
- **Knockdown thud**: heavier impact when enemy hits the ground
- **Weapon sounds**: metal clang (pipe), slash (knife/sword), explosion (grenade)
- **Environmental**: glass breaking, wood smashing (destructible objects)
- **UI sounds**: menu select, pause, life pickup chime, "GO" indicator
- **Special move effects**: whoosh/energy sounds accompanying visual effects
- **Enemy death**: groan/cry sound + body hitting floor

### Track Listing Highlights
- Each of the 8 stages has a unique BGM track
- Boss encounters have their own battle theme
- Title screen, character select, game over, and ending all have dedicated music
- Music seamlessly loops during gameplay

---

## 10. Difficulty & Progression

### Difficulty Levels
1. **Very Easy** (unlockable via options code)
2. **Easy**
3. **Normal** (default)
4. **Hard**
5. **Hardest**
6. **Mania** (unlockable, extreme difficulty)

### Difficulty Scaling
- Higher difficulties increase:
  - Enemy HP values
  - Enemy aggression (attack more frequently, shorter cooldowns)
  - Enemy damage dealt to player
  - Number of simultaneous enemies
  - Boss attack frequency and pattern complexity
- Mania difficulty: enemies have significantly more HP, attack relentlessly, and environmental hazards are more punishing

### Progression Design
- Stages introduce enemy types gradually:
  - Stage 1: Galsia, Donovan (basic)
  - Stage 2: Signal, Riders (mobility)
  - Stage 3: Mifune/ninjas (speed + range)
  - Stage 4-5: Big Ben, Eagle (defense + power)
  - Stage 6-8: All types mixed, sub-boss enemies become regular encounters
- Boss difficulty ramps steadily
- Health pickups are **evenly paced** throughout each stage
- Food is typically placed just before boss encounters
- Final stage features a **boss rush** (re-fighting previous bosses) before the final encounter

### Game Completion
- Beating the game shows an ending cutscene
- Different endings may exist based on difficulty level completed
- High score table at game over
- No save system (designed to be completed in a single session, ~45-60 minutes)

---

## Key Design Takeaways for Game Development

1. **Combat responsiveness is king**: attacks must feel instant. Jabs are 3-4 frames to active hitbox.
2. **The aggression token system** prevents enemies from feeling unfair - only 1-2 attack at once while others circle.
3. **Position slots** create the classic "enemies approach from both sides" pattern without feeling random.
4. **Grab > attack > knockdown** is more satisfying than just hitting - the grab system adds depth and strategy.
5. **Combo enders knock down** - this creates natural rhythm (combo > enemy gets up > reposition > combo again).
6. **Special moves as defensive tools**: invincibility frames during specials give players a panic button at the cost of health.
7. **Walking into enemies = grab** is elegant design - no extra button needed.
8. **Health pickups paced with difficulty** - generous enough to keep players going, rare enough to maintain tension.
9. **Stage variety through sub-sections** - each stage tells a mini-story through environmental changes.
10. **Enemy palette swaps** extend the roster cheaply while clearly communicating "harder version" to the player.

---

## Sources

- [Streets of Rage 2 - Wikipedia](https://en.wikipedia.org/wiki/Streets_of_Rage_2)
- [Streets of Rage 2 - StrategyWiki Gameplay](https://strategywiki.org/wiki/Streets_of_Rage_2/Gameplay)
- [Streets of Rage 2 - StrategyWiki Enemies](https://strategywiki.org/wiki/Streets_of_Rage_2/Enemies)
- [Streets of Rage 2 - StrategyWiki Characters](https://strategywiki.org/wiki/Streets_of_Rage_2/Characters)
- [Streets of Rage 2 - Fandom Wiki](https://streetsofrage.fandom.com/wiki/Streets_of_Rage_2)
- [Streets of Rage 2 Art & Design Docs - Game Anim](https://www.gameanim.com/2020/04/21/streets-of-rage-2-art-and-design-docs/)
- [Streets of Rage Composer Interview - Shmuplations](https://shmuplations.com/sormusic/)
- [Streets of Rage 2 Move List FAQ by Truncated - GameFAQs](https://gamefaqs.gamespot.com/genesis/563344-streets-of-rage-2/faqs/16911)
- [Streets of Rage 2 Walkthrough by CNash - GameFAQs](https://gamefaqs.gamespot.com/genesis/563344-streets-of-rage-2/faqs/2862)
- [Sega Genesis VDP Graphics Guide - Mega Cat Studios](https://megacatstudios.com/blogs/retro-development/sega-genesis-mega-drive-vdp-graphics-guide-v1-2a-03-14-17)
- [Streets of Rage 2 Sprites - The Spriters Resource](https://www.spriters-resource.com/genesis_32x_scd/sor2/)
- [Beat 'em Up Enemy AI Cheat Sheet - Cohost/Boghog](https://cohost.org/boghog/post/4974594-beat-em-up-cheat-sh)
- [Streets of Rage 2 - BitvInt Analysis](https://bitvint.com/pages/streets-of-rage-2)
- [Co-Optimus - Streets of Rage 2 Co-Op Info](https://www.co-optimus.com/game/1685/classic/streets-of-rage-2.html)
- [Proto:Streets of Rage 2 - The Cutting Room Floor](https://tcrf.net/Proto:Streets_of_Rage_2_(Genesis))
