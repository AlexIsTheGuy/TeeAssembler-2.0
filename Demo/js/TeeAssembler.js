/*

	TeeAssembler 2.0
	https://github.com/AlexIsTheGuy/TeeAssembler-2.0
	
	Copyright (c) 2022–2024 Aleksandar Blažić and contributors
	Released under the MIT license
	https://github.com/AlexIsTheGuy/TeeAssembler-2.0/blob/main/LICENSE

*/

const TeeAssembler = {
	randomID: (length = 16) => {
		const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
		let randomString = ''

		for (let i = 0; i < length; i++) {
			const randomPos = Math.floor(Math.random() * charSet.length)
			randomString += charSet.substring(randomPos, randomPos+1)
		}

		return randomString
	},
	skin: {
		size: {
			width: 256,
			height: 128
		},
		elements: {
			body: [0, 0, 96, 96],
			body_shadow: [96, 0, 96, 96],
			hand: [192, 0, 32, 32],
			hand_shadow: [224, 0, 32, 32],
			foot: [192, 32, 64, 32],
			foot_shadow: [192, 64, 64, 32],
			credits: [0, 96, 64, 32],
			default_eye: [64, 96, 32, 32],
			angry_eye: [96, 96, 32, 32],
			blink_eye: [128, 96, 32, 32],
			happy_eye: [160, 96, 32, 32],
			cross_eye: [192, 96, 32, 32],
			surprised_eye: [224, 96, 32, 32]
		}
	},
	array: {
		tees: [],
		teeIDs: []
	}
}

{
	class Tee {
		constructor(args={}) {
			TeeAssembler.array.tees.push(this)

			args.imageLink = args.imageLink || 'https://ddnet.org/skins/skin/default.png'

			this.api = {
				functions: {...this.functions},
				teeEyesVariables: false,
				image: {
					element: new Image(),
					loaded: false,
				}
			}

			delete this.functions

			this.api.image.element.crossOrigin = ''
			this.api.image.link = args.imageLink
			this.eyesAngle = 0

			this.bodyColor = args.bodyColor || undefined,
			this.feetColor = args.feetColor || undefined,
			this.colorFormat = args.colorFormat || undefined

			let ID = args.ID || TeeAssembler.randomID()

			while(TeeAssembler.array.teeIDs.includes(ID) || document.getElementById(ID)) {
				ID = TeeAssembler.randomID()
			}

			this.ID = ID

			TeeAssembler.array.teeIDs.push(this.ID)

			this.api.functions.setContainer = async (container) => {
				if (!container instanceof HTMLElement) {
					throw Error(`Invalid element: container is not of type HTMLElement`)
				}

				this.container = container
				this.container.dataset.teeassemblerId = this.ID

				const fragment = document.createDocumentFragment()

				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-eyes_guide_line', false)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-eyes_guide_marker', false, '.teeassembler-eyes_guide_line')
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-body_shadow', true)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-back_foot_shadow', true)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-back_foot', true)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-body', true)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-eyes', false)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-left_eye', true, '.teeassembler-eyes')
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-right_eye', true, '.teeassembler-eyes')
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-front_foot_shadow', true)
				this.api.functions.createAndAppendTeeElements(fragment, 'teeassembler-front_foot', true)

				this.container.appendChild(fragment)

				const stylesheet = document.createElement('style')

				if (!this.api.image.url) {
					if (this.container.getAttribute('data-teeassembler-color_body') && this.container.getAttribute('data-teeassembler-color_feet')) {
						await this.api.functions.getTeeImage(this.container.getAttribute('data-teeassembler-color_body'), this.container.getAttribute('data-teeassembler-color_feet'), this.container.getAttribute('data-teeassembler-color_format') || 'code')
					}
					else if (this.bodyColor && this.feetColor) {
						await this.api.functions.getTeeImage(this.bodyColor, this.feetColor, this.colorFormat)
					}
					else {
						await this.api.functions.getTeeImage()
					}
				}

				stylesheet.textContent = `
					.teeassembler-tee[data-teeassembler-id='${this.ID}'] div[data-teeassembler-body_part] {
						background-image: url(${this.api.image.url});
						background-size: 256em 128em;
					}`

				const previousStylesheet = document.querySelectorAll(`.teeassembler-tee[data-teeassembler-id='${this.ID}'] style`)

				if (previousStylesheet) {
					previousStylesheet.forEach(stylesheet => {
						stylesheet.remove()
					})
				}

				this.container.appendChild(stylesheet)

				this.api.functions.lookAt(this.eyesAngle)
			}

			if (args.container) {
				this.api.functions.setContainer(args.container)
			}
		}
		functions = {
			loadImage: async (imageLink) => {
				this.api.image.element.src = imageLink

				await this.api.image.element.decode()

				this.api.canvas = 'OffscreenCanvas' in window ? new OffscreenCanvas(0, 0) : document.createElement('canvas')
				this.api.canvas.width = this.api.image.element.width
				this.api.canvas.height = this.api.image.element.height

				this.api.ctx = this.api.canvas.getContext('2d', {willReadFrequently: true})
				
				this.api.ctx.drawImage(this.api.image.element, 0, 0, this.api.canvas.width, this.api.canvas.height)

				this.api.image.loaded = true
			},
			setColor: async (canvasContext, imageData, color, colorFormat) => {
				const
				buffer = imageData.data,
				pixel = new Color(0, 0, 0, 0)

				// Apply color on every pixel of the image
				for (let byte = 0; byte < buffer.length; byte += 4) {
					// Get pixel and overwrite it
					pixel.r = buffer[byte]
					pixel.g = buffer[byte + 1]
					pixel.b = buffer[byte + 2]
					pixel.a = buffer[byte + 3]

					COLOR_MODE[colorFormat](pixel, color)

					// Replace the pixel in the buffer
					buffer[byte] = pixel.r
					buffer[byte + 1] = pixel.g
					buffer[byte + 2] = pixel.b
					buffer[byte + 3] = pixel.a
				}

				this.api.functions.setCanvas(canvasContext, buffer)
			},
			reorderBody: async (canvasContext, imageData) => {
				//	For the tee body
				//	Reorder that the average grey is 192,192,192
				//	https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263
				
				
				const
				buffer = imageData.data,
				frequencies = Array(256).fill(0),
				newWeight = 192,
				invNewWeight = 255 - newWeight

				let
				orgWeight = 0,
				byte

				// Find the most common frequence
				for (byte = 0; byte < buffer.length; byte += 4) {
					if (buffer[byte + 3] > 128) {
						frequencies[buffer[byte]]++
					}
				}

				for (let i = 1; i < 256; i++) {
					if (frequencies[orgWeight] < frequencies[i]) {
						orgWeight = i
					}
				}
				
				const invOrgWeight = 255 - orgWeight

				for (byte = 0; byte < buffer.length; byte += 4) {
					let value = buffer[byte]

					if (value <= orgWeight && orgWeight == 0) {
						continue
					}
					else if (value <= orgWeight) {
						value = Math.trunc(((value / orgWeight) * newWeight))
					}
					else if (invOrgWeight == 0) {
						value = newWeight
					}
					else {
						value = Math.trunc((((value - orgWeight) / invOrgWeight) * invNewWeight + newWeight))
					}

					buffer[byte] = value
					buffer[byte + 1] = value
					buffer[byte + 2] = value
				}

				this.api.functions.setCanvas(canvasContext, buffer)
			},
			createCanvas: (width = 0, height = 0) => {
				const canvas = 'OffscreenCanvas' in window ? new OffscreenCanvas(0, 0) : document.createElement('canvas')
				canvas.width = width
				canvas.height = height

				return canvas
			},
			setCanvas: (canvasContext, buffer) => {
				canvasContext.putImageData(new ImageData(buffer, canvasContext.canvas.width, canvasContext.canvas.height), 0, 0)
			},
			createAndAppendTeeElements: (parent, className, bodyPart, selector) => {
				const element = document.createElement('div')
				element.className = className
			
				if (bodyPart) {
					element.setAttribute('data-teeassembler-body_part', '')
				}

				if (selector) {
					parent.querySelector(selector).appendChild(element)
				}
				else {
					parent.appendChild(element)
				}
			},
			getBlob: async (canvas) => {
				let blob

				if (canvas instanceof OffscreenCanvas) {
					blob = await canvas.convertToBlob()
				}
				else {					
					blob = await (() => {
						return new Promise(r => {
							canvas.toBlob(r)
						})
					})()
				}

				return blob
			},
			isRatioLegal: () => {
				return this.api.image.element.width / this.api.image.element.height === TeeAssembler.skin.size.width / TeeAssembler.skin.size.height
			},
			getMultiplier: () => {
				return this.api.image.element.width / TeeAssembler.skin.size.width
			},
			getColorArg: (color, standard) => {
				if (Object.keys(COLOR_FORMAT).includes(standard) == false) {
					throw Error(`Invalid color format: ${standard}\nValid formats: rgb, hsl, code`)
				}
				color = COLOR_FORMAT[standard](color)

				return color
			},
			colorLimitForSkin: (color, limit = 52.5) => {	
				if (color[2] < limit) {
					color[2] = limit
				}

				return color
			},
			colorConvert: (color, standard) => {
				color = this.api.functions.getColorArg(color, standard)

				if (standard == 'rgb') {
					color = RGBToHSL(color[0], color[1], color[2])
				}

				// Preventing full black or full white skins
				color = this.api.functions.colorLimitForSkin(color)

				// Convert to RGB to apply the color
				color = HSLToRGB(color[0], color[1], color[2])

				return new Color(...color)
			},
			setColor2: async (canvasContext, color, standard, imageData, part) => {
				if (!canvasContext) {
					canvasContext = this.ctx
				}
				
				color = this.api.functions.colorConvert(color, standard)

				await this.api.functions.setColor(canvasContext, imageData, color, 'grayscale')

				if (part === 'body') {
					await this.api.functions.reorderBody(canvasContext, imageData)
				}

				await this.api.functions.setColor(canvasContext, imageData, color, 'default')
			},
			getTeeImage: async (player_color_body = 'none', player_color_feet = 'none', color_format = 'code') => {
				// TODO: Optimize this code
				await this.api.functions.loadImage(this.api.image.link)
				
				if (!this.api.functions.isRatioLegal()) {
					throw new Error('Image has wrong ratio.')
				}

				const
				multiplier = this.api.functions.getMultiplier(),
				body_parts = Object.keys(TeeAssembler.skin.elements)
				
				this.colorFormat = color_format || 'code'

				for (const part in body_parts) {
					const bodyPartCanvases = {}

					this.partMultiplied = TeeAssembler.skin.elements[body_parts[part]].map(x => x * multiplier)

					bodyPartCanvases[part] = this.api.functions.createCanvas(this.partMultiplied[2], this.partMultiplied[3])
					const currentCtx = bodyPartCanvases[part].getContext('2d')

					currentCtx.putImageData(this.api.ctx.getImageData(this.partMultiplied[0], this.partMultiplied[1], this.partMultiplied[2], this.partMultiplied[3]), 0, 0)
					this.api.image.data = currentCtx.getImageData(0, 0, this.partMultiplied[2], this.partMultiplied[3])

					if (player_color_body !== 'none' && player_color_feet !== 'none') {
						if (body_parts[part].includes('foot')) {
							await this.api.functions.setColor2(currentCtx, player_color_feet, color_format, this.api.image.data, body_parts[part])
						}
						else if (!body_parts[part].includes('credits')) {
							await this.api.functions.setColor2(currentCtx, player_color_body, color_format, this.api.image.data, body_parts[part])
						}
					}

					this.api.ctx.clearRect(this.partMultiplied[0], this.partMultiplied[1], this.partMultiplied[2], this.partMultiplied[3])
					this.api.ctx.drawImage(bodyPartCanvases[part], this.partMultiplied[0], this.partMultiplied[1])
				}

				if (this.api.canvas instanceof OffscreenCanvas) {
					this.api.ctx.drawImage(this.api.canvas.transferToImageBitmap(), 0, 0)
				}
				else {
					this.api.ctx.drawImage(await createImageBitmap(this.api.ctx.getImageData(0, 0, this.api.canvas.width, this.api.canvas.height)), 0, 0)
				}

				const blob = await this.api.functions.getBlob(this.api.canvas)
				this.api.image.url = URL.createObjectURL(blob)

				delete this.partMultiplied

				return this.api.image.url
			},
			bindContainer: (container) => {
				this.api.functions.setContainer(container)
			},
			unbindContainer: (deleteContainer = false) => {
				this.api.functions.dontLookAtCursor()
				
				Object.keys(this.container.dataset).forEach(dataset => {
					delete this.container.dataset[dataset]
				})
				
				if (deleteContainer) {
					URL.revokeObjectURL(this.api.image.url)
					this.api.image.loaded = false
					this.container.remove()
				}
				else {
					this.container.replaceChildren()
				}
				
				delete this.container
			},
			teeEyesTranslateFunction: () => {
				this.api.markerCoord = {
					x: this.api.marker.getBoundingClientRect().x,
					y: this.api.marker.getBoundingClientRect().y
				}

				this.api.scale = (this.container.getBoundingClientRect().width / this.container.offsetWidth) * Number(window.getComputedStyle(this.container).fontSize.replace('px', ''))
				this.api.teeEyes.style.transform = `translate(${(this.api.markerCoord.x - this.container.getBoundingClientRect().x) / this.api.scale}em, ${(this.api.markerCoord.y - this.container.getBoundingClientRect().y) / this.api.scale}em)`
			},
			setTeeEyesVariables: () => {
				this.api.teeEyesVariables = true

				this.api.line = document.querySelector(`.teeassembler-tee[data-teeassembler-id='${this.ID}'] .teeassembler-eyes_guide_line`)
				this.api.marker = document.querySelector(`.teeassembler-tee[data-teeassembler-id='${this.ID}'] .teeassembler-eyes_guide_marker`)
				this.api.teeEyes = document.querySelector(`.teeassembler-tee[data-teeassembler-id='${this.ID}'] .teeassembler-eyes`)
			},
			lookAtCursor: () => {
				this.api.functions.setTeeEyesVariables()
				this.api.functions.moveTeeEyesFunction = (e) => {
					const originCoord = {
						x: this.container.getBoundingClientRect().x + this.container.getBoundingClientRect().width/2,
						y: this.container.getBoundingClientRect().y + this.container.getBoundingClientRect().height/2
					}
					this.eyesAngle = Math.atan2(e.clientY - originCoord.y, e.clientX - originCoord.x) * 180 / Math.PI

					this.api.line.style.width = `${9.5 - (Math.sin(Math.PI / 180) * this.api.functions.roundToMultiple(this.eyesAngle) * 2)}em`
					this.api.line.style.transform = `translate(-1em, .5em) rotate(${this.eyesAngle}deg)`
					this.api.functions.teeEyesTranslateFunction()
				}

				document.addEventListener('mousemove', this.api.functions.moveTeeEyesFunction) 
			},
			dontLookAtCursor: () => {
				document.removeEventListener('mousemove', this.api.functions.moveTeeEyesFunction)
			},
			lookAt: (degrees = 0) => {
				this.eyesAngle = degrees

				this.api.functions.setTeeEyesVariables()
				this.api.line.style.width = `${9.5 - (Math.sin(Math.PI / 180) * this.api.functions.roundToMultiple(degrees) * 2)}em`
				this.api.line.style.transform = `translate(-1em, .5em) rotate(${degrees}deg)`

				// Default value to look right (0deg)
				this.api.teeEyes.style.transform = `translate(56.5em, 48.5em)`

				this.api.functions.teeEyesTranslateFunction()
			},
			roundToMultiple: (degrees = 0, multiple = 180) => {
				const quantizedAngle = Math.round(degrees / multiple) * multiple

				return Math.abs(degrees - quantizedAngle)
			}
		}
	}

	TeeAssembler.Tee = Tee
}

document.querySelectorAll('.teeassembler-tee[data-teeassembler-autoload]').forEach(el => {
	options = {
		container: el,
		imageLink: el.getAttribute('data-teeassembler-skin_image'),
		bodyColor: el.getAttribute('data-teeassembler-color_body'),
		feetColor: el.getAttribute('data-teeassembler-color_feet'),
		colorFormat: el.getAttribute('data-teeassembler-color_format')
	}
	new TeeAssembler.Tee(options)
})