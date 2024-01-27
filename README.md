# TeeAssembler 2.0

TeeAssembler 2.0 is a script used for coloring a Teeworlds skin image the same way Teeworlds does and rendering the image in your browser using HTML, CSS and JavaScript.


## Contact

You can contact me on Discord for anything related to the project: .alexander_


## Credits

Thanks to [b0th](https://github.com/theobori) for helping me with the project.

Original project: [teeworlds-utilities](https://github.com/teeworlds-utilities/teeworlds-utilities).


## Demo

The demo website can be viewed [here](https://teeassembler.developer.li).


## Usage

```html
<!DOCTYPE html>
<html>
	<head>

		...

		<link rel='stylesheet' href='css/Tee.css'>

	</head>
	<body>

		...

	</body>

	<script src='js/color.js'></script>
	<script src='js/TeeAssembler.js'></script>
</html>
```

Add the styles in the `<head>` (optional) and the scripts after `<body>`.

### Initialization:

#### Manual Rendering

```html
<div class='tee'></div>
```

```js
const myTeeOptions = {
	container: document.querySelector('.teeassembler-tee'),
	imageLink: 'https://ddnet.org/skins/skin/default.png',
	bodyColor: 5288960,
	feetColor: 255,
	colorFormat: 'code'
}

const myTee = new TeeAssembler.Tee(myTeeOptions)
```

Notes:
- `myTeeOptions.container` can be omitted if we don't want to render the Tee or if we want to assign a container later.
- `bodyColor`, `feetColor` and `colorFormat` can be omitted if we don't want the Tee to have custom colors.

#### Automatic Rendering

Without custom colors

```html
<div class='tee' data-teeassembler-autoload data-teeassembler-skin_image='https://ddnet.org/skins/skin/default.png'></div>
```

With custom colors

```html
<div class='tee' data-teeassembler-autoload data-teeassembler-skin_image='https://ddnet.org/skins/skin/default.png' data-teeassembler-color_body='13149440' data-teeassembler-color_feet='255' data-teeassembler-color_format='code'></div>
```

Note: When using automatic rendering, the element will be given a random ID attribute which can be used to reference a Tee object using `TeeAssembler.array.tees.find(tee => tee.ID === myTee.ID)`

---
### Functions:

#### Retreive image blob URL:

```js
await myTee.api.functions.getTeeImage() // Original image
await myTee.api.functions.getTeeImage('255', '13149440', 'code') // Colored using Teeworlds color code format
await myTee.api.functions.getTeeImage('229, 99, 153', '255, 255, 255', 'rgb') // Colored using RGB format
await myTee.api.functions.getTeeImage('335, 71, 64', '0, 0, 100', 'hsl') // Colored using HSL format
```

---
#### Bind container:

```js
const myTeeContainer = document.querySelector('.teeassembler-tee')

myTee.bindContainer(myTeeContainer)
```

---
#### Unbind container:

```js
myTee.unbindContainer() // Remove the Tee from the container
myTee.unbindContainer(true) // Remove the whole container and free up the image blob object URL.
```

Note: If we want to move the Tee from one container to another we have to unbind the container first and then bind it to another.

---
#### Get resolution multiplier:

```js
myTee.getMultiplier()
```

---
#### Make the Tee look at the cursor:

```js
myTee.lookAtCursor()
```

---
#### Make the Tee stop looking at the cursor:

```js
myTee.dontLookAtCursor()
```

---
#### Make the Tee look at a fixed angle (degrees):

```js
myTee.lookAt(0) 	// Right
myTee.lookAt(90) 	// Down
myTee.lookAt(180) 	// Left
myTee.lookAt(270) 	// Up
```

Note: If you want the Tee to look right, the degrees can be omitted. `myTee.lookAt()`

---
### Properties:

```js
TeeAssembler.array.tees		// (Array) Loaded Tee classes
TeeAssembler.array.teeIDs	// (Array) Random IDs from Tee classes

myTee.container				// (HTMLElement) Container of rendered Tee
myTee.ID					// (String) Random ID of Tee

myTee.api.canvas			// (HTMLElement OR OffscreenCanvas) Canvas for modified Tee image
myTee.api.ctx				// (CanvasRenderingContext2D OR OffscreenCanvasRenderingContext2D) Canvas context
myTee.api.elements			// (Object) Tee body parts and their canvases

myTee.api.image.element		// (HTMLElement) Image element of the original image
myTee.api.image.link		// (String) Original image URL
myTee.api.image.url			// (String) Modified image blob URL 

myTee.bodyColor				// (String) Color of Tee body (undefined if not colored)
myTee.feetColor				// (String) Color of Tee feet (undefined if not colored)
myTee.colorFormat			// (String) Coloring mode ('code', 'rgb', 'hsl')
myTee.eyesAngle				// (String) Angle of eyes from center of the Tee in degrees
```

---

## Known issues

- Eyes are not perfectly aligned like in the game but it's close enough.


## License

Copyright (c) 2022–2024 Aleksandar Blažić and contributors

Licensed under the [MIT](https://github.com/AlexIsTheGuy/TeeAssembler-2.0/blob/main/LICENSE) license.
