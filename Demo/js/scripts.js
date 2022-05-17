/*

	TeeAssembler 2.0

	Made by: Aleksandar Blazic
	
*/

let linkInput = document.querySelector('.externalSkin'),
loadButton = document.querySelector('.externalSkinButton'),
template = document.querySelector('.template'),
bodyColorInput = document.querySelector('.bodyInput'),
feetColorInput = document.querySelector('.feetInput'),
templateStyle = document.createElement('style'),
teeStyle = document.createElement('style'),
lastInput,
myTee

loadButton.addEventListener('click', async() => {
	myTee = new Tee(linkInput.value)
	let img
	if (bodyColorInput.value === '' || feetColorInput.value === '') {
		img = await myTee.getTeeImage()
	}
	else {
		img = await myTee.getTeeImage(bodyColorInput.value,feetColorInput.value)
	}
	if (lastInput !== linkInput.value) {
		templateStyle.innerHTML = `
			.template div {
				background-image: url(${linkInput.value});
			}`
		document.head.appendChild(templateStyle)
	}
	teeStyle.innerHTML = `
		.tee div:not(.eyes), .eyes div {
			background-image: url(${img});
		}`
	document.head.appendChild(teeStyle)
	lastInput = linkInput.value
})