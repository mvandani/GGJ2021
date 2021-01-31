/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private instructionsKey: Phaser.Input.Keyboard.Key;
    private creditsKey: Phaser.Input.Keyboard.Key;
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
        this.instructionsKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.I
        );
        this.creditsKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.C
        );
        this.startKey.isDown = false;
        this.fading = false;
    }

    create() {
        // Load background image
        // this.bg = this.add.sprite(0, 0, 'mainmenu-bg').setOrigin(0,0);

        // Default a default bg color
        this.cameras.main.setBackgroundColor(0x2c2727);

        const margin = 50;

        const startText = this.add.text(0,0,
            'Press SPACE to play!',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        startText.setPosition(
            this.cameras.main.centerX - startText.displayWidth/2,
            this.cameras.main.height - startText.displayHeight - margin * 3,
        );

        const instructionsText = this.add.text(0,0,
            'Press I for instructions',
            {
                fontFamily: 'Potta One',
                fontSize: 24,
                color: '#836767'
            }
        );
        instructionsText.setPosition(
            (this.cameras.main.width / 4) - instructionsText.displayWidth/2,
            this.cameras.main.height - instructionsText.displayHeight - margin,
        );
        
        const creditsText = this.add.text(0,0,
            'Press C for credits',
            {
                fontFamily: 'Potta One',
                fontSize: 24,
                color: '#836767'
            }
        );
        creditsText.setPosition(
            (3 * this.cameras.main.width / 4) - creditsText.displayWidth/2,
            this.cameras.main.height - creditsText.displayHeight - margin,
        );

        this.texts = [startText, instructionsText, creditsText];

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
            if (Phaser.Input.Keyboard.JustDown(this.startKey)) {
                //let fadeOutDuration: number = 500;
                //this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
                //this.fading = true;

                this.scene.start('GameScene', {level: 'level1half'});
            } else if (Phaser.Input.Keyboard.JustDown(this.instructionsKey)) {
                //let fadeOutDuration: number = 500;
                //this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
                //this.fading = true;

                this.scene.start('Instructions');
            } else if (Phaser.Input.Keyboard.JustDown(this.creditsKey)) {
                //let fadeOutDuration: number = 500;
                //this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
                //this.fading = true;
    
                this.scene.start('Credits');
            }
        }
    }
}
