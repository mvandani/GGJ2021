/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private texts: Phaser.GameObjects.Text[] = [];
    private fading: boolean;

    constructor() {
        super({
            key: 'MainMenu'
        });
    }

    init() {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.startKey.isDown = false;
        this.fading = false;
    }

    create() {
        // Load background image
        // this.bg = this.add.sprite(0, 0, 'mainmenu-bg').setOrigin(0,0);

        // Default a default bg color
        this.cameras.main.setBackgroundColor(0xffffff);

        // Start text (or others)
        this.texts.push(
            this.add.text(320,410,
                'Press Space',
                {
                    fontFamily: 'Digital',
                    fontSize: 30,
                    color: '#000'
                }
            )
        );

        // start playing music
        // this.music = this.sound.add('bg-music', {loop: true, volume: 1});
        // this.music.play();

        // Listen for when the camera is done fading after a selection has been chosen
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            // this.music.stop();
            this.scene.start('GameScene');
        });
    }

    update() {
        // If fadig is complete, listen for a key input and begin fading out
        if (!this.fading) {
            if (Phaser.Input.Keyboard.JustDown(this.startKey)) {
                let fadeOutDuration: number = 2000;
                this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
                this.fading = true;
            }
        }
    }
}
