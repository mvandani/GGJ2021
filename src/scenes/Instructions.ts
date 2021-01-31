export class Instructions extends Phaser.Scene {
    private mainMenuKey: Phaser.Input.Keyboard.Key;
    private texts: Phaser.GameObjects.Text[] = [];
    private fading: boolean;

    constructor() {
        super({
            key: 'Instructions'
        });
    }

    init() {
        this.mainMenuKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.fading = false;
    }

    create() {
        // Load background image
        const bg = this.add.sprite(0, 0, 'help').setOrigin(0,0);

        // Default a default bg color
        this.cameras.main.setBackgroundColor(0x2c2727);

        const margin = 50;

        const mainMenuText = this.add.text(0,0,
            'Press SPACE to return to the main menu',
            {
                fontFamily: 'Potta One',
                fontSize: 24,
                color: '#ffe5c4'
            }
        );
        mainMenuText.setPosition(
            (this.cameras.main.width / 2) - mainMenuText.displayWidth/2,
            this.cameras.main.height - mainMenuText.displayHeight - margin,
        );

        // start playing music
        // this.music = this.sound.add('bg-music', {loop: true, volume: 1});
        // this.music.play();

        // Listen for when the camera is done fading after a selection has been chosen
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            // this.music.stop();
            //this.scene.start('GameScene');
        });

        //this.scene.start('GameScene');
    }

    update() {
        // If fadig is complete, listen for a key input and begin fading out
        if (!this.fading) {
            if (Phaser.Input.Keyboard.JustDown(this.mainMenuKey)) {
                //let fadeOutDuration: number = 500;
                //this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
                //this.fading = true;

                this.scene.switch('MainMenu');
            }
        }
    }
}
