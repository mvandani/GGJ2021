import { Scene } from 'phaser';
import { GameMap } from '../map/GameMap';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

enum Controls {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

export class MapBuilder extends Phaser.Scene {
    // variables
    private fading: boolean;

    // Game state
    private state: GameState;

    private p1Keys: Object;
    private p2Keys: Object;
    private allowKeyInput: Boolean = true;


    public gameMap:GameMap;

    constructor() {
        super({
            key: 'MapBuilder'
        });
    }

    preload(): void {
        console.log("Preloading");
    }

    init(): void {
        // Starting level
        this.state = GameState.STARTING_LEVEL;
        // starts fading
        this.fading = true;

        this.p1Keys = this.input.keyboard.addKeys({
            [Controls.UP]: Phaser.Input.Keyboard.KeyCodes.W,
            [Controls.DOWN]: Phaser.Input.Keyboard.KeyCodes.S,
            [Controls.LEFT]: Phaser.Input.Keyboard.KeyCodes.A,
            [Controls.RIGHT]: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.p2Keys = this.input.keyboard.addKeys({
            [Controls.UP]: Phaser.Input.Keyboard.KeyCodes.UP,
            [Controls.DOWN]: Phaser.Input.Keyboard.KeyCodes.DOWN,
            [Controls.LEFT]: Phaser.Input.Keyboard.KeyCodes.LEFT,
            [Controls.RIGHT]: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        });

        this.input.keyboard.addListener('keydown-SPACE', event => {
            console.log(JSON.stringify(this.gameMap.tiles.map(row => row.map(tile => tile.tileConfig))));
        });
    }

    create(): void {
        this.gameMap = new GameMap(this,0,0, 'newMap',true);

    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
            this.fading = false;
        }
        this.runGame();
    }

    private runGame() {
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
