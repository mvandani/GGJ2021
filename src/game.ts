/// <reference path='./headers/phaser.d.ts'/>

import 'phaser';
import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { GameScene } from './scenes/GameScene';
import { MapBuilder } from './scenes/MapBuilder';

// main game configuration
const config: GameConfig = {
  title: 'GGJ2021',
  width: 1500,
  height: 900,
  type: Phaser.WEBGL,
  parent: 'game',
  scene: [Boot, MainMenu, GameScene, MapBuilder],
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
      debug: false
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
