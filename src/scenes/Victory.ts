import { GameScene } from "./GameScene";

/**
 * Main menu.
 */
export class Victory extends Phaser.Scene {
    private mainMenuKey: Phaser.Input.Keyboard.Key;
    private fading: boolean;
    private nextLevel: string;

    constructor() {
        super({
            key: 'Victory'
        });
    }

    init(data) {
        this.mainMenuKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.mainMenuKey.isDown = false;
        this.fading = false;
        this.nextLevel = data.nextLevel;
        this.game.scene.remove('GameScene');
        this.game.scene.add('GameScene',GameScene);
    }

    create() {
        // Load background image
        // this.bg = this.add.sprite(0, 0, 'mainmenu-bg').setOrigin(0,0);

        // Default a default bg color
        this.cameras.main.setBackgroundColor(0x2c2727);

        const margin = 50;

        this.anims.create({
            key: "cherry-walk",
            frames: this.anims.generateFrameNumbers("cherry-walk", {start: 0, end: 6}),
            frameRate: 24,
            repeat: -1,
        });
        this.anims.create({
            key: "golden-walk",
            frames: this.anims.generateFrameNumbers("golden-walk", {start: 0, end: 6}),
            frameRate: 24,
            repeat: -1,
        });

        let left = this.physics.add.sprite((this.cameras.main.width / 4), (this.cameras.main.height / 4) - 68 + margin, "cherry");
        left.play("cherry-walk");
        left.setDisplaySize(200,136);
        left.setSize(200,136);
        left.refreshBody();
        
        let right = this.physics.add.sprite((3 * this.cameras.main.width / 4) , (this.cameras.main.height / 4) - 68 + margin, "golden");
        right.play("golden-walk");
        right.setDisplaySize(200,136);
        right.setSize(200,136);
        right.refreshBody();

        const winText = this.add.text(0,0,
            'You Beat The Game!',
            {
                fontFamily: 'Potta One',
                fontSize: 50,
                color: '#836767'
            }
        );
        winText.setPosition(
            (this.cameras.main.width / 2) - winText.displayWidth/2,
            (this.cameras.main.height / 4) - winText.displayHeight/2,
        );

        const nextLeveText = this.add.text(0,0,
            'Press SPACE to return to the main menu',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        nextLeveText.setPosition(
            (this.cameras.main.width / 2) - nextLeveText.displayWidth/2,
            (this.cameras.main.height / 2) - nextLeveText.displayHeight/2,
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
                this.scene.switch('MainMenu');
            }
        }
    }
}
