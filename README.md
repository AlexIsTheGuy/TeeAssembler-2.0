# TW-SkinColorer

## Credits

Thanks to [b0th#6474](https://github.com/theobori) for helping me with the project.

Original project: [tw-utils](https://github.com/theobori/tw-utils).

## Usage

Create a new variable with Tee() class and give it a link.
```js
let myTee = new Tee('https://api.skins.tw/database/skins/whis.png')
```

Retreive colored Base64 image.

```js
/*
Syntax:
  getTeeImage(player_color_body, player_color_feet, coloring_mode)
    
    player_color_body: Body color   - '229, 99, 153'  ; 335, 71, 64 ; '15644490'
    player_color_feet: Feet color   - '255, 255, 255' ; '0, 0, 100' ; '255'
    coloring_mode: Input color type - 'rgb'           ; 'hsl'       ; 'code'
    
*/
await myTee.getTeeImage(255,13149440,'code')
```
