# offline-ucsd-map

Blazing fast[^1] ⚡ version of the UCSD campus map 🗺 (https://maps.ucsd.edu/) that works offline 🌳.

[^1]: Obviously.

Goals:

- [x] Draws the map
  - [x] Supports zooming, panning, and rotating the map
  - [x] Loads and draws map image tiles as they come into view
  - [ ] May want to draw something aesthetic (e.g. static) for the void outside the drawn map area
- [x] Touch- and mouse-friendly interactions
  - [x] One finger for panning, two fingers for panning, zooming, and rotating
  - [x] For mouse users, default to dragging for panning, scrolling for zooming, and offering a wheel button at the corner of the screen for rotating
  - [x] May have the option to switch to relying on the scroll wheel for panning and zooming (default vertical, + shift for horizontal, + ctrl for zooming)
- [ ] Works offline
  - [ ] Uses a service worker to cache all the map image tiles
  - [ ] Progressive Web App
- [ ] Supports geolocation
  - [ ] Show user's location (if near enough to UCSD)
  - [ ] Currently maps.ucsd.edu's current location feature doesn't work because their iframe doesn't have the geolocation permission enabled
- [ ] Embeddable
  - [ ] I'll probably use this on a "Where is [building]" website later on
  - [ ] Could be used for animations/videos as well

Future goals:

- [ ] Show the landmarks and polyline regions on maps.ucsd.edu
  - [ ] Useful for finding water fountains

References for later:

- Fetching map tile images: [Get UCSD map tiles][ucsd-map] ([source][ucsd-map-src])
- Interacting with the map: [Pan, rotate, and zoom an image][pan-rotate] ([source][pan-rotate-src])

[ucsd-map]: https://sheeptester.github.io/words-go-here/misc/ucsd-map.html
[ucsd-map-src]: https://github.com/SheepTester/words-go-here/blob/master/misc/ucsd-map.html
[pan-rotate]: https://sheeptester.github.io/words-go-here/misc/pan-rotate-zoom.html
[pan-rotate-src]: https://github.com/SheepTester/words-go-here/blob/master/misc/pan-rotate-zoom.html

## Development

Building requires [Deno] and [terser]. I use [nodemon] and [http-server], but alternatives probably exist.

[deno]: https://deno.land/
[terser]: https://terser.org/
[nodemon]: https://nodemon.io/
[http-server]: https://www.npmjs.com/package/http-server

```sh
# Install terser etc. (assumes you already have Deno)
$ npm install --global terser nodemon http-server

# Build
$ ./scripts/build.sh

# Watch for changes and rebuild (serve static/)
$ nodemon --watch ./src/ --ext ts --exec ./scripts/build.sh
# Local server to http://localhost:8080/
$ http-server ./static/

# Deploy
$ ./scripts/deploy.sh
```
