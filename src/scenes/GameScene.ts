import { Scene } from 'phaser';

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

export class GameScene extends Phaser.Scene {
    // variables
    private fading: boolean;

    // Game state
    private state: GameState;

    private p1Keys: Object;
    private p2Keys: Object;

    private p1: Phaser.Physics.Arcade.Image;
    private p2: Phaser.Physics.Arcade.Image;

    private playerToKeys: Map<Phaser.Physics.Arcade.Image, Object> = new Map();

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload(): void {
        console.log("Preloading");
        this.load.image('mr-giggy', 'assets/images/mr-giggy.png');
        this.load.image('mrs-giggy', 'assets/images/mrs-giggy.png');
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
    }

    create(): void {
        // Create the background and main scene
        // this.add.sprite(0, 0, 'background').setOrigin(0, 0);

        this.p1 = this.physics.add.image(300, 600, 'mr-giggy');
        this.p2 = this.physics.add.image(700, 600, 'mrs-giggy');

        // Map the players to the keys so we can loop over the players later and lookup which keybindings they have
        this.playerToKeys.set(this.p1, this.p1Keys);
        this.playerToKeys.set(this.p2, this.p2Keys);

        [this.p1, this.p2].forEach(p => p.setCollideWorldBounds(true));


        // Listen for events from obejcts
        this.events.addListener('event', () => {
            // noop
        });
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
            this.fading = false;
        }
        this.runGame();

        [this.p1, this.p2].forEach(p => {
            p.setVelocity(0);

            const keys = this.playerToKeys.get(p);
            if(keys[Controls.UP].isDown) {
                p.setVelocityY(-300);
            }
            if(keys[Controls.DOWN].isDown) {
                p.setVelocityY(300);
            }
            if(keys[Controls.LEFT].isDown) {
                p.setVelocityX(-300);
            }
            if(keys[Controls.RIGHT].isDown) {
                p.setVelocityX(300);
            }
        });

        /*
        if(this.p1Keys[Controls.UP].isDown) {
            this.p1.setVelocityY(-300);
        }
        */
    }

    private runGame() {
        /*
        switch (this.state) {
            case GameState.STARTING_LEVEL:
                break;
            case GameState.AWAITING_INPUT:
                break;
            case GameState.ANIMATING:
                break;
        }
        */
       
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
