# The Game Box
A web-based game box designed for two people, played together over dinner.

The core premise is:

> **How well do you actually know each other?**

The game creates funny, revealing, and occasionally argumentative interactions between two people. It should feel like a social game rather than a questionnaire.

The application is designed to be self-hosted and extensible. Game content should be data-driven so that new prompts, scenarios, rules, and game modes can be added without changing the core application.

---

# V1 Delivery Model (decided)

> **This section records the key architectural decision made while stress-testing the original draft. It supersedes the "Multiplayer Architecture," "Privacy," and "Room Flow" sections below, which are retained only as a description of a possible *future* online mode.**

**V1 is single-device, pass-and-play ("hotseat").** Two people share one phone or tablet and pass it across the table. There is **no server, no rooms, no room codes, and no network synchronization.**

## Why

- The original draft required *server-authoritative* game state and *private-until-reveal* submissions. Both require a trusted always-on backend — which **cannot** run on static hosting (GitHub Pages/Actions serve static files only; peer-to-peer would leak the hidden answer onto the other player's device).
- For a two-people-over-dinner game, a single device passed back and forth is a natural, low-friction fit — arguably more intimate than "open your phone, type a room code, join."
- Choosing pass-and-play collapses the entire architecture: no WebSockets, no room lifecycle, no reconnection, no backend, no hosting bill.

## Consequences

- **The game is a fully static site.** It deploys to **GitHub Pages** at **`games.scopinho.com/couples/`** (with `couples.scopinho.com` forwarding there), served directly from the repo's `main` branch (no build step, no Actions). Free, no backend, no Azure.
- **Privacy is handled physically.** When it's one player's turn to enter a private answer, the screen hides prior/opponent input; the device is then passed. The app must make it obvious when to pass and must not reveal a hidden answer on screen before the reveal phase.
- **"Each player on their own device" is explicitly deferred** to a future online mode (see Future Iterations). It was a *secondary* goal in the original draft, not a V1 requirement.
- **Project home:** a standalone **`game-box`** repository, separate from the Gatsby personal-site repo. It serves `games.scopinho.com`: a hub page at `/` and one folder per game collection (V1: `/couples/`).

---

# Product Goals

## Primary goals

- Create a fun game for exactly two players.
- Encourage players to make predictions about each other.
- Create moments of surprise when players discover that their assumptions about each other are wrong.
- Create funny arguments and playful disagreements.
- Work naturally while sitting together over dinner.
- Make individual rounds short enough that players can stop at any point.
- Make the game replayable without requiring a fixed finite question deck.
- Allow new content to be added independently from application code.
- Allow players to decide for themselves how they want to track scores.

## Secondary goals

- The application should feel polished and playful rather than like a prototype.
- Starting a game should be extremely simple.
- The game should support private answers before revealing them to the other player (handled in V1 by hiding on-screen input and passing the shared device).
- The game should maintain a clear distinction between information visible to both players and information visible only to one player.

## Deferred (was a secondary goal, now a future iteration)

- Each player interacting on their **own separate device**. V1 uses one shared device instead.

## Explicit non-goals for V1

- Do not build a large collection of game modes.
- Do not impose an inherent point/scoring system.
- Do not build accounts/authentication.
- Do not build matchmaking.
- Do not build a public database of players.
- Do not over-engineer the content management system.
- Do not add AI generation to the core gameplay yet.
- **Do not build a backend, rooms, room codes, or network multiplayer.** (Deferred to a future online mode.)

---

# Core Experience
The game is played by two people **sharing one device**.

A player starts a game and chooses which game to play.

The game proceeds through rounds.

Each round should make it obvious:

1. What is happening.
2. What the current player needs to do.
3. Whether the action is private (and the device should be passed) or public.
4. When the player should submit.
5. When the answer/reveal happens.
6. What happens next.

The application should never require players to understand the underlying technology.

---

# Game 1: Bet You Think I'll Say…

## Concept
A prediction game testing how accurately each player can predict the other person's thoughts, preferences, decisions, and reactions.

The fundamental mechanic:

> **One player answers a question. The other predicts what they will answer.**

Both answers are hidden until the reveal.

The game should alternate who is the "subject" and who is the "predictor" so that both players get equal opportunities.

In V1 this is a **sequential, single-device flow**: the subject answers privately, passes the device, the predictor answers privately, then the device is placed down for the shared reveal.

---

## Example Round
Prompt:

> You suddenly receive $10,000 with no restrictions on how you spend it.
>
> What's the first thing you buy?

Player A sees:

> **ANSWER FOR YOURSELF**

Player A enters:

> A really nice camera.

_(Player A passes the device to Player B.)_

Player B sees:

> **PREDICT THEIR ANSWER**

Player B enters:

> A new computer.

_(Device is placed down; both look.)_

The game reveals:

> **PLAYER A:** A really nice camera.
>
> **PLAYER B PREDICTED:** A new computer.
>
> ❌ Miss.

The players then proceed to the next round.

---

# Answer Types
V1 should primarily support free-text answers.

However, the game architecture should leave room for structured question types later:

- Free text
- Multiple choice
- Ranking
- Numeric estimate
- Yes/no
- Selection from a list
- Scenario + response

---

# Scoring
**The application does not impose a scoring system.**

Players may choose to:

- Keep score themselves.
- Use a physical score sheet.
- Make up their own scoring rules.
- Play without keeping score.
- Decide that certain rounds are worth more than others.
- Use any other system they find fun.

The application should therefore focus on facilitating the game rather than maintaining an official score.

If a future version provides optional scoring tools, they should be explicitly optional and should never be presented as the "correct" way to play.

---

# Prompt Categories
Prompts should be categorized so players can choose the type of experience they want.

## Know Me
Questions about personal preferences and characteristics.

Examples:

- What's my biggest irrational pet peeve?
- What am I secretly convinced I'm good at?
- What's something I would happily spend too much money on?
- What's one thing I would never want to give up?

## Hypothetical
Situations that reveal how someone thinks.

Examples:

- If I had to move to another country tomorrow, where would I go?
- If I suddenly became extremely wealthy, what would change first?
- If I could instantly master one skill, what would I choose?
- If I had to completely change careers tomorrow, what would I become?

## Relationship
Questions about the players' relationship.

Examples:

- What's something I think we do unusually well together?
- What's our most predictable recurring disagreement?
- What's something I think you understand about me better than most people?
- What do I think is our most underrated activity together?

## Ridiculous
Questions designed primarily to produce funny answers.

Examples:

- If I became a cult leader, what would my cult believe?
- What crime would I be most likely to accidentally commit?
- What would get me cancelled?
- If I were an animal in a heist movie, what would I be?

---

# Important Prompt Design Principle
Prompts should not simply ask:

> "What do you love about your partner?"

The game should generate **prediction tension**.

A good prompt makes both players think:

> "I have a pretty good idea what they're going to say."

And then creates a satisfying reveal.

The question should ideally have enough ambiguity that the predictor can genuinely be right or wrong.

---

# Game 2: Couples Court

## Concept
Players are presented with hypothetical situations involving couples.

Each player independently decides whether the person in the scenario is **guilty or not guilty**.

The important mechanic is that players do **not** initially know what the other person thinks.

They vote privately (in V1, one at a time on the shared device).

If both players agree, the case is immediately resolved.

If they disagree, they must debate the case.

The disagreement is the game.

---

# Example Round

## CASE #027

### The French Fry Incident
A couple goes out for dinner.

One person orders fries.

Their partner says:

> "I don't want any."

The fries arrive.

The partner proceeds to eat approximately 70% of them.

### THE QUESTION

> **Guilty or Not Guilty?**

Both players independently choose (privately, passing the device):

**GUILTY**

or

**NOT GUILTY**

The answers remain hidden until both players have submitted.

---

## Outcome A: Agreement
The game reveals:

> ### BOTH FOUND THEM GUILTY

The players can laugh, discuss the reasoning if they want, and move to the next case.

There is no mandatory debate.

The agreement itself is the result.

---

## Outcome B: Disagreement
The game reveals:

> ### DISAGREEMENT
> Player 1: **GUILTY**
>
> Player 2: **NOT GUILTY**

The application then transitions into:

> ## COURT IS NOW IN SESSION

The players debate the situation.

The application can provide optional prompts to help structure the argument.

Examples:

> **DEFEND YOUR VERDICT**
>
> Explain why you voted the way you did.

Then:

> **COUNTERARGUMENT**
>
> What is the strongest argument against your partner's verdict?

And potentially:

> **FINAL QUESTION**
>
> Has your position changed?

Players then make a final decision if desired.

The application does not need to determine a winner.

---

# Why the Court Works
The game is not primarily about determining whether someone is objectively guilty.

It is about discovering:

> **"Wait, you think that's okay?"**

The hypothetical situation creates a low-stakes way for players to discover differences in their values, expectations, boundaries, and sense of humor.

The best cases should therefore be:

- relatable
- slightly ambiguous
- defensible from both sides
- funny
- capable of producing genuine disagreement

---

# Court Case Categories

## Everyday Crimes
Low-stakes relationship offenses.

Examples:

- Stealing fries after saying you don't want any.
- Watching the next episode without your partner.
- Taking the better side of the bed.
- Saying "I'm ready" while still getting dressed.
- Taking too long to choose a restaurant.
- Finishing something without telling your partner.

## Relationship Etiquette
Situations involving expectations between partners.

## Social Crimes
Situations involving friends, family, parties, or social settings.

## Absurd Crimes
Completely ridiculous hypothetical offenses.

## Moral Gray Areas
Scenarios that are deliberately difficult to classify.

These should be used carefully: the goal is playful disagreement, not serious moral debate.

## Custom Cases
Cases created specifically for the couple.

These could eventually become one of the most valuable content types in the system.

---

# Court Case Design Principle
Cases should NOT have an objectively correct answer.

The game should deliberately present situations where reasonable people can disagree.

Avoid cases where:

- one person is clearly malicious
- the answer is obviously illegal
- the moral conclusion is completely unambiguous
- the subject matter is unnecessarily serious

The ideal case produces:

> "Obviously guilty."

followed by:

> "Wait, why do you think that?"

---

# Court Interaction
The application should facilitate the conversation rather than replace it.

The players should be talking to **each other**, not typing essays into the website.

The website primarily handles:

- presenting the case
- collecting private verdicts (one at a time on the shared device)
- revealing the verdicts
- identifying agreement/disagreement
- presenting optional debate prompts
- moving the game forward

The actual argument happens at the dinner table.

---

# Content System
Game content must be data-driven.

In V1, content is **static bundled data** (e.g. JSON shipped with the static site). No CMS, no database, no network fetch.

A Bet You Think I'll Say prompt should conceptually look like:

```
{
  "id": "bet_you_think_001",
  "game": "bet_you_think_ill_say",
  "category": "hypothetical",
  "prompt": "You suddenly receive $10,000 with no restrictions. What's the first thing you buy?",
  "difficulty": "medium"
}
```

A Couples Court case could look like:

```
{
  "id": "court_027",
  "game": "couples_court",
  "title": "The French Fry Incident",
  "category": "everyday_crimes",
  "scenario": "A couple goes out for dinner...",
  "verdict_question": "Is the person guilty of stealing fries?",
  "debate_prompts": [
    "Defend your verdict.",
    "What is the strongest argument against your partner's position?"
  ]
}
```

The exact schema can be refined during implementation.

The important requirement is:

> **Adding new content should not require changing application logic.**

---

# Content Management
The first implementation uses a simple **static bundled** content source (data files in the repo).

Do not build a sophisticated CMS for V1.

The architecture should make it possible to eventually support:

1. Static bundled content. *(V1)*
2. A database.
3. User-created prompts.
4. Custom couple-specific content.
5. Remote content updates.
6. AI-generated content.

---

# Architecture (V1)

The application is a **single static client** with a clear separation between game logic and UI.

Even though there is no server in V1, the game engine should still model the domain cleanly so that a future online mode can reuse the logic:

```
Game
Round
Phase
Prompt / Case
Submission
```

- **Game-specific logic lives separately from generic flow orchestration.** A shared "engine" advances rounds and phases; each game plugs in its own rules, content type, and reveal logic.
- **Phase is authoritative within the client.** The single client owns the current phase; the UI reflects it rather than each view deciding independently.
- **Submissions are held in local state** and only surfaced at the reveal phase. The UI must never render a still-private submission before reveal.

## Privacy (V1)

Answers and verdicts are temporarily private during a round. On a shared device this is enforced by:

- Showing a clear "pass the device to _____" hand-off screen between private inputs.
- Never displaying a hidden submission on screen until the reveal phase.
- Making the reveal a deliberate, explicit action ("Reveal").

---

# Game Flow (V1)

## Start
Player opens `couples.scopinho.com` and taps:

> START GAME

## Choose
Player selects:

> BET YOU THINK I'LL SAY

or

> COUPLES COURT

## Play
The game runs round-by-round on the shared device, prompting players to pass it for private input and place it down for reveals.

## Restart
The game can be restarted (new round / new game / switch game) **without reloading the page**.

---

# UX Principles
The game should feel:

- playful
- fast
- theatrical
- slightly irreverent
- polished
- easy to understand

Avoid:

- excessive menus
- long instructions
- complicated mandatory scoring
- excessive animations
- huge amounts of text
- unnecessary account creation

The players should be able to go from opening the website to playing a round within approximately one minute.

---

# Technical Direction

- **Static site**, served by **GitHub Pages** (deploy from branch, no build step) at `games.scopinho.com` from the `game-box` repo; this game lives at `/couples/`. A `CNAME` file pins the custom domain; `couples.scopinho.com` is a DNS-level forward.
- **Mobile-first.** The primary device is a phone passed across a dinner table: portrait layout, large tap targets, one-handed use, readable at arm's length, works with the on-screen keyboard open, respects safe areas (notch/home bar). Desktop/tablet is a secondary, scaled-up layout.
- **No backend, no database, no auth** in V1.
- Prioritize:
  1. Simple architecture.
  2. Clear separation between game logic and UI.
  3. Data-driven game content (static bundled data).
  4. Easy local development.
  5. Trivial self-hosting (it's just static files).
  6. Extensibility for future game modes.
  7. A clean domain model that a future online mode could reuse without a rewrite.
- **Stack (decided): plain HTML + CSS + vanilla JavaScript (ES modules).** No framework, no npm, no build step. Content is JSON. Engine tests run with `node --test`.

---

# V1 Definition of Done
A first implementation is successful when:

- Two players can start a game on a single shared device.
- Players can play **Bet You Think I'll Say** over multiple rounds.
- Players can play **Couples Court**.
- The subject/predictor roles alternate in Bet You Think I'll Say.
- Private answers/verdicts remain hidden on screen until the reveal, with a clear device-pass hand-off.
- Couples Court presents hypothetical couple situations and collects a guilty/not-guilty verdict from each player.
- Agreement immediately resolves the case; disagreement triggers a debate phase with optional prompts.
- The game can be restarted without reloading the page.
- Game content lives outside the core game logic (static bundled data).
- New prompts/cases can be added by editing data files only — no logic changes.
- The site deploys to GitHub Pages at `games.scopinho.com/couples/`, reachable via `couples.scopinho.com`.

Do NOT implement persistent history, AI-generated prompts, accounts, sophisticated analytics, mandatory scoring, **or any backend/room/networking** in V1 unless it falls out naturally from the architecture.

---

# Future Iterations
Potential future features, intentionally outside V1:

- **Two-device / online mode** with server-authoritative rooms, room codes, and private-until-reveal enforced server-side. *(This is what the "Multiplayer Architecture," "Privacy," and "Room Flow" notes below were originally describing.)*
- Persistent game history.
- Remembering previous answers and verdicts.
- Callbacks to previous rounds.
- Couple-specific/custom content.
- User-created prompts and cases.
- Additional game modes.
- Optional scoring/score tracking.
- AI-assisted prompt generation.
- More structured prompt types.
- Statistics and playful long-term insights.

---

# Appendix: Original Online-Mode Notes (deferred, not V1)

> Retained for reference. These describe the **future** two-device online mode, not the V1 pass-and-play build.

## Multiplayer Architecture (future)
A synchronized two-player room would contain: Room ID, Host, Two players, Current game, Current round, Current phase, Submissions, Game state. The server would be authoritative for game state; clients would not independently determine the current phase.

## Privacy (future)
The server would expose each private submission only to the appropriate player until the reveal phase, avoiding exposing private answers through the client.

## Room Flow (future)
Create → receive a short room code (e.g. `F7KQ`) and shareable URL → second player joins via code/URL → both appear in a lobby → host starts the chosen game.
