# Angler's Jigsaw v3.10.7

## v3.10.7 navigation update

- Fish Caught now has **Continue Fishing** at the top of the collection panel.
- The former bottom Continue Fishing button was removed to avoid duplicate navigation.
- Every species page now shows **Continue Fishing** immediately to the right of **Fish Caught**.
- Continue Fishing returns to an unfinished active puzzle when one exists; otherwise it opens the next level/piece-count selection.
- Puzzle mechanics, themes, audio, tray behavior, and progression are unchanged from v3.10.6.

# Angler's Jigsaw v3.10.6

## Changes
- Species profile pages now show all educational information immediately; there is no “More about this fish” disclosure.
- Added three environment themes: Deep Open Ocean, Sunken Pirate Ship, and Coral Reef. A theme is selected randomly when a new puzzle starts and remains unchanged while moving between Home, Fish Caught, species details, and the active game.
- PUSH/PULL toolbar input now responds on pointer-up (with keyboard click fallback) and renders high-count operations after the control has painted. PUSH uses the safe side-staging system, improving 72-piece reliability.
- Added a persistent horizontal Tackle Tray scrollbar/slider suitable for iPad. It is excluded from keyboard/input focus with `tabindex=-1` and `inputmode=none`.
- Service worker updated to v3.10.6 and now precaches both theme images.

## Changed files
- index.html
- css/styles.css
- js/app.js
- sw.js
- README.md
