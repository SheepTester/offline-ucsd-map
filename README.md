# offline-ucsd-map

Blazing fast[^1] ⚡ version of the UCSD campus map 🗺 (https://maps.ucsd.edu/) that works offline 🌳.

[^1]: Obviously

Goals:

- Draws the map
  - Supports zooming, panning, and rotating the map
  - Loads and draws map image tiles as they come into view
  - May want to draw something aesthetic (e.g. static) for the void outside the drawn map area
- Touch- and mouse-friendly interactions
  - One finger for panning, two fingers for panning, zooming, and rotating
  - For mouse users, default to dragging for panning, scrolling for zooming, and offering a wheel button at the corner of the screen for rotating
  - May have the option to switch to relying on the scroll wheel for panning and zooming (default vertical, + shift for horizontal, + ctrl for zooming)
- Works offline
  - Uses a service worker to cache all the map image tiles
  - Progressive Web App
- Supports geolocation
  - Show user's location (if near enough to UCSD)
  - Currently maps.ucsd.edu's current location feature doesn't work because their iframe doesn't have the geolocation permission enabled
- Embeddable
  - I'll probably use this on a "Where is [building]" website later on
  - Could be used for animations/videos as well

Future goals:

- Show the landmarks and polyline regions on maps.ucsd.edu
  - Useful for finding water fountains

References for later:

- Fetching map tile images: [Get UCSD map tiles](https://sheeptester.github.io/words-go-here/misc/ucsd-map.html) ([source](https://github.com/SheepTester/words-go-here/blob/master/misc/ucsd-map.html))
- Interacting with the map: [Pan, rotate, and zoom an image](https://sheeptester.github.io/words-go-here/misc/pan-rotate-zoom.html) ([source](https://github.com/SheepTester/words-go-here/blob/master/misc/pan-rotate-zoom.html))
