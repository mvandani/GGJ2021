import { Scene } from 'phaser';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export class GameScene extends Phaser.Scene {
    // variables
    private fading: boolean;

    // Game state
    private state: GameState;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init(): void {
        // Starting level
        this.state = GameState.STARTING_LEVEL;
        // starts fading
        this.fading = true;
    }

    create(): void {
        // Create the background and main scene
        // this.add.sprite(0, 0, 'background').setOrigin(0, 0);

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
    }

    private runGame() {
        switch (this.state) {
            case GameState.STARTING_LEVEL:
                break;
            case GameState.AWAITING_INPUT:
                break;
            case GameState.ANIMATING:
                break;
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
