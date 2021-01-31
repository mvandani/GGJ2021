import { GameScene } from "./GameScene";

/**
 * Main menu.
 */
export class LevelTransition extends Phaser.Scene {
    private mainMenuKey: Phaser.Input.Keyboard.Key;
    private nextLevelKey: Phaser.Input.Keyboard.Key;
    private fading: boolean;
    private nextLevel: string;

    private score: integer;
    private totalScore: integer;

    constructor() {
        super({
            key: 'LevelTransition'
        });
    }

    init(data) {
        this.mainMenuKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );
        this.nextLevelKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.score = data.levelScore;
        this.totalScore = data.totalScore;

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

        let left = this.physics.add.sprite((this.cameras.main.width / 2), (this.cameras.main.height / 4) - 68 + margin, "cherry");
        left.play("cherry-walk");
        left.setDisplaySize(200,136);
        left.setSize(200,136);
        left.refreshBody();

        const winText = this.add.text(0,0,
            'You Did It!',
            {
                fontFamily: 'Potta One',
                fontSize: 50,
                color: '#836767'
            }
        );
        winText.setPosition(
            (this.cameras.main.width / 2) - winText.displayWidth/2,
            (this.cameras.main.height / 3) - winText.displayHeight/2,
        );
        const scoreText = this.add.text(0,0,
            'Level Score: ' + this.score,
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        scoreText.setPosition(
            (this.cameras.main.width / 2) - scoreText.displayWidth/2,
            (this.cameras.main.height / 3) - scoreText.displayHeight/2 + 50,
        );
        
        const totalScoreText = this.add.text(0,0,
            'Total Score: ' + this.totalScore,
            {
                fontFamily: 'Potta One',
                fontSize: 24,
                color: '#836767'
            }
        );
        totalScoreText.setPosition(
            (this.cameras.main.width / 2) - totalScoreText.displayWidth/2,
            (this.cameras.main.height / 3) - totalScoreText.displayHeight/2 + 80,
        );

        const nextLeveText = this.add.text(0,0,
            'Press SPACE to start the NEXT LEVEL',
            {
                fontFamily: 'Potta One',
                fontSize: 24,
                color: '#836767'
            }
        );
        nextLeveText.setPosition(
            (this.cameras.main.width / 2) - nextLeveText.displayWidth/2,
            (this.cameras.main.height / 2) - nextLeveText.displayHeight/2 + 60,
        );


        const mainMenuText = this.add.text(0,0,
            'Press ESC to return to the main menu',
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
                this.scene.switch('MainMenu');
            }
            if (Phaser.Input.Keyboard.JustDown(this.nextLevelKey)) {
                this.scene.start('GameScene', {level: this.nextLevel, totalScore: this.totalScore});
            }
        }
    }
}
