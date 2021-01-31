/// <reference path='./headers/phaser.d.ts'/>

/*
)(:;;..                                                           :
::::::::;.                                                    `.  :  .'
 ):(;;;;`;;                                                     `m$$m
'|:|:::::"_                                                   ''$$$$$$''
 /_| ::::'                                                    .' `$$'`.
:/  ::.;'          mdQQQb                                    '     :   `
:|__/::'        ---- 4SSEO                                         :
:(__/           \    \SSQ'                 __        ___   __
::               \ \Y \Sp                 (\\)______(\|/)_(//)
:L                \;\\_\                   |\\\\\\\\\\|/////|
:|              .;'  \\               mmNmmmNNmmm\\\\\|/////|
:|            .;'     \\            4OOOOOOOOOOOOOO\\\|///mm|
:|          .;'        \\          dVVVVVVOOOOOOOOOOOOOOOOOVVV   mmmOOOOm
:|  ____  .;'____       \\   ____ mmm ____ mOOOOVVVVVVVVVVVSSSSSSSSmmmOOOOm
:| / / _\_L / /  \ ______\\_/_/__\__ / /  \ qVVVVVVVVVVVVVVVSSSSSSSSSmmmOOOM
:|| | |____| | ++ |_________________| | ++ | VVVVVVVVVVVVVVVVSSSSSSSSSOOOOOOO
_| \_\__/   \_\__/          \_\__/   \_\__/ dOOOOOOOOOOOOOVVVSSSSSSSSSOOOOOOO
*/

import 'phaser';
import { Boot } from './scenes/Boot';
import { Credits } from './scenes/Credits';
import { MainMenu } from './scenes/MainMenu';
import { GameScene } from './scenes/GameScene';
import { MapBuilder } from './scenes/MapBuilder';
import { Instructions } from './scenes/Instructions';
import { LevelTransition } from './scenes/LevelTransition';
import { Victory } from './scenes/Victory';


// main game configuration
const config: GameConfig = {
  title: 'GGJ2021',
  width: 1500,
  height: 900,
  type: Phaser.WEBGL,
  parent: 'game',
  scene: [
    Boot,
    MainMenu,
    GameScene,
    MapBuilder,
    Instructions,
    Credits,
    LevelTransition,
    Victory,
  ],
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      //gravity: { y: 300 },
      debug: true
    }
  },
  backgroundColor: '#fff',
  render: { pixelArt: false, antialias: true, autoResize: false }
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  var game = new Game(config);
});
