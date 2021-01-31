/**
 * Main menu.
 */
export class Credits extends Phaser.Scene {
    private mainMenuKey: Phaser.Input.Keyboard.Key;
    private fading: boolean;

    constructor() {
        super({
            key: 'Credits'
        });
    }

    init() {
        this.mainMenuKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.mainMenuKey.isDown = false;
        this.fading = false;
    }

    create() {
        // Load background image
        // this.bg = this.add.sprite(0, 0, 'mainmenu-bg').setOrigin(0,0);

        // Default a default bg color
        this.cameras.main.setBackgroundColor(0x2c2727);

        const margin = 50;

        const jennyText = this.add.text(0,0,
            'Jenny Couture',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        jennyText.setPosition(
            (this.cameras.main.width / 4) - jennyText.displayWidth/2,
            (this.cameras.main.height / 4) - jennyText.displayHeight/2 + margin,
        );

        const mvdText = this.add.text(0,0,
            'Michael VanDaniker',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        mvdText.setPosition(
            (3 * this.cameras.main.width / 4) - mvdText.displayWidth/2,
            (this.cameras.main.height / 4) - mvdText.displayHeight/2 + margin,
        );

        const shahrukhText = this.add.text(0,0,
            'Shahrukh Mustakim',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        shahrukhText.setPosition(
            (this.cameras.main.width / 4) - shahrukhText.displayWidth/2,
            (3 * this.cameras.main.height / 4) - shahrukhText.displayHeight/2 - margin,
        );

        const toddText = this.add.text(0,0,
            'Todd Lees',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        toddText.setPosition(
            (3 * this.cameras.main.width / 4) - toddText.displayWidth/2,
            (3 * this.cameras.main.height / 4) - toddText.displayHeight/2 - margin,
        );

        const mainMenuText = this.add.text(0,0,
            'Press SPACE to return to the main menu',
            {
                fontFamily: 'Potta One',
                fontSize: 24,
                color: '#836767'
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
