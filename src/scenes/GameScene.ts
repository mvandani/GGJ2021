import { Scene } from 'phaser';
import { GameMap } from '../map/GameMap';
import { Kid } from '../objects/Kid';
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

enum EnemyTypes {
    DUMB_DANGER_NOODLE,
    SMART_SNEK,
}

const followerOffset = {
    x: 10,
    y: -10
};

export class GameScene extends Phaser.Scene {
    // variables
    private fading: boolean;

    private skipLevelKey: Phaser.Input.Keyboard.Key;

    // Game state
    private state: GameState;

    private LEVELS = ['level1half',  'level2', 'level3', 'level4'];

    private level: string;

    private p1Keys: Object;
    private p2Keys: Object;
    private allowKeyInput: Boolean = true;

    private p1: Phaser.Physics.Arcade.Sprite;
    private p2: Phaser.Physics.Arcade.Sprite;
    
    private arePlayersJoined: Boolean = false;

    // The player that is leading the other. null if they are separated
    private leader: Phaser.Physics.Arcade.Sprite;

    private playerToKeys: Map<Phaser.Physics.Arcade.Sprite, Object> = new Map();

    private gameMap:GameMap;

    private enemies: Array<Phaser.Physics.Arcade.Image> = [];
    private kids: Array<Phaser.GameObjects.Sprite> = [];
    private crib: Phaser.Physics.Arcade.Image;

    // A map of enemy Images to enemyDefinitions (see below)
    private enemiesToDefintions: Map<Phaser.Physics.Arcade.Image, any> = new Map();
    
    private levelConfig: Object;

    // A lookup of enemy type enums to objects defining a type of enemy, which includes:
    // - Its asset type for this.physics.add.image
    // - Its update function, which is called each frame
    private enemyDefinitions: Object = {
        [EnemyTypes.DUMB_DANGER_NOODLE]: {
            assetType: "snake-01",
            update: (e: Phaser.Physics.Arcade.Image) => {
                // Anytime a dumb danger noodle cannot move in any direction or if it reaches
                // a location divisible by 50, it chooses a new direction to move in randomly.
                if((e.body.deltaX() === 0 && e.body.deltaY() === 0) || (Math.floor(e.x) % 50 === 0 || Math.floor(e.y) % 50 === 0)) {
                    const rando = Math.random();
                    if(rando < .25) {
                        e.setVelocityX(-300);
                        e.setVelocityY(0);
                    } else if(rando < .5) {
                        e.setVelocityX(300);
                        e.setVelocityY(0);
                    } else if(rando < .75) {
                        e.setVelocityX(0);
                        e.setVelocityY(-300);
                    } else {
                        e.setVelocityX(0);
                        e.setVelocityY(300);
                    }
                }
            }
        },
        [EnemyTypes.SMART_SNEK]: {
            assetType: "snake-02",
            update: (e: Phaser.Physics.Arcade.Image) => {
                // Smart sneks move toward p1 in either the x or y dimension (randomly decided) if they
                // cannot move any further in their current direction or if they reach a location divisble
                // by 50.
                if((e.body.deltaX() === 0 && e.body.deltaY() === 0) || (Math.floor(e.x) % 50 === 0 || Math.floor(e.y) % 50 === 0)) {
                    if(Math.random() > .5) {
                        e.setVelocityY(0);
                        const dx = e.x - this.p1.x;
                        if(dx < 0) {
                            e.setVelocityX(300);
                        } else if(dx > 0) {
                            e.setVelocityX(-300);
                        } else {
                            e.setVelocityX(0);
                        }
                    } else {
                        e.setVelocityX(0);
                        const dy = e.y - this.p1.y;
                        if(dy < 0) {
                            e.setVelocityY(300);
                        } else if(dy > 0) {
                            e.setVelocityY(-300);
                        } else {
                            e.setVelocityY(0);
                        }
                    }
                }
            }
        }
    };

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload(): void {
        console.log("Preloading");
    }

    init(data): void {
        // Starting level
        this.state = GameState.STARTING_LEVEL;

        this.skipLevelKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );
        // starts fading
        this.fading = true;

        this.level = data.level;
        this.levelConfig = this.cache.json.get(this.level);

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
        this.anims.create({
            key: 'kid-idle',
            frames: this.anims.generateFrameNames('kid', { start: 0, end: 7 }),
            frameRate: 6,
            repeat: -1,
        });
        this.anims.create({
            key: 'kid-run',
            frames: this.anims.generateFrameNames('kid', { start: 8, end: 9 }),
            frameRate: 6,
            repeat: -1,
        });
    }

    create(): void {

        this.gameMap = new GameMap(this,0,0,this.level);

        this.anims.create({
            key: "cherry-left",
            frames: this.anims.generateFrameNumbers("cherry", {start: 0, end: 7}),
            frameRate: 24,
            repeat: -1,
        });
        const left = this.anims.create({
            key: "golden-left",
            frames: this.anims.generateFrameNumbers("golden", {start: 0, end: 7}),
            frameRate: 24,
            repeat: -1,
        });

        const p1Start = this.levelConfig["player1"]["start"];
        const p2Start = this.levelConfig["player2"]["start"];
        this.p1 = this.physics.add.sprite(p1Start[0] * 100 + 25, p1Start[1] * 100 + 25, "cherry");
        this.p1.play("cherry-left");
        
        this.p2 = this.physics.add.sprite(p2Start[0] * 100 + 25, p2Start[1] * 100 + 25, "golden");
        this.p2.play("golden-left");

        

        //this.p1 = this.physics.add.image(300, 600, 'mr-giggy');
        this.p1.setDisplaySize(50,34);

        //this.p2 = this.physics.add.image(700, 600, 'mrs-giggy');
        this.p2.setDisplaySize(50,34);


        this.physics.add.collider(this.p1, this.gameMap.wallGroup);
        this.physics.add.collider(this.p2, this.gameMap.wallGroup);

        // Map the players to the keys so we can loop over the players later and lookup which keybindings they have
        this.playerToKeys.set(this.p1, this.p1Keys);
        this.playerToKeys.set(this.p2, this.p2Keys);

        [this.p1, this.p2].forEach(p => p.setCollideWorldBounds(true));

        this.createKids();
        this.createEnemies();
        this.createCrib();
        
        // Listen for events from obejcts
        this.events.addListener('event', () => {
            // noop
        });

        this.input.keyboard.addListener('keydown-SHIFT', event => {
            if(!this.allowKeyInput) {
                return;
            }

            let summoner: Phaser.Physics.Arcade.Sprite;
            let summonee: Phaser.Physics.Arcade.Sprite;
            if(event.location === 1) { // Left shift
                summoner = this.p1;
                summonee = this.p2;
            } else if (event.location === 2) { // Right shift
                summonee = this.p1;
                summoner = this.p2;
            }

            // If the summoner is already the leader there is nothing to do.
            if(summoner === this.leader) {
                return;
            }

            this.leader = summoner;
            this.allowKeyInput = false;

            summoner.body.immovable = false;
            summonee.body.immovable = true; // Don't let walls catch the summonee

            summonee.setDepth(100);
            summoner.setDepth(101);
            
            // If the players are joined, swap their positions
            if(this.arePlayersJoined) {
                this.tweens.add({
                    targets: summoner,
                    x: summonee.x,
                    y: summonee.y,
                    duration: 500,
                });
                this.tweens.add({
                    targets: summonee,
                    x: summoner.x,
                    y: summoner.y,
                    duration: 500,
                    onComplete: () => {
                        this.allowKeyInput = true;
                    }
                });
            } else { // If the players are separeted moved the summonee behind the summoner
                this.tweens.add({
                    targets: summonee,
                    x: summoner.x + followerOffset.x,
                    y: summoner.y + followerOffset.y,
                    duration: 500,
                    onComplete: () => {
                        this.allowKeyInput = true;
                    }
                });
                this.arePlayersJoined = true;
            }
        });

        this.input.keyboard.addListener('keydown-SPACE', event => {
            if(!this.allowKeyInput) {
                return;
            }

            this.arePlayersJoined = false;
            this.leader = null;

            // Allow physics collisions for everyone
            this.p1.body.immovable = false;
            this.p2.body.immovable = false;
        });
    }

    createEnemies(): void {
        const enemyTypes = [
            EnemyTypes.DUMB_DANGER_NOODLE,
            EnemyTypes.DUMB_DANGER_NOODLE,
            EnemyTypes.DUMB_DANGER_NOODLE,
            EnemyTypes.SMART_SNEK,
            EnemyTypes.SMART_SNEK,
        ];

        enemyTypes.forEach(enemyType => {
            // Get the definition for this type of enemy
            const eDefinition = this.enemyDefinitions[enemyType];

            const e = this.physics.add.image(0,0, eDefinition.assetType);
            e.setDisplaySize(50,50);
            e.setCollideWorldBounds(true);
            this.physics.add.collider(e, this.gameMap.wallGroup);
            this.enemies.push(e);

            // Pair the enemy object with its definition
            this.enemiesToDefintions.set(e, eDefinition);
        });
    }

    createKids(): void {
        this.levelConfig["kids"].forEach(kidConfig => {
            const kid = new Kid({
                scene: this,
                x: kidConfig['start'][0] * 100 + 25,
                y: kidConfig['start'][1] * 100 + 25,
                key: 'kid',
                behaviorCode: kidConfig['behavior']
            });
            
            this.add.existing(kid);
            this.physics.add.collider(kid, this.gameMap.wallGroup);
            this.kids.push(kid);
        });
    }

    createCrib(): void {
        this.crib = this.physics.add.image(500, 800, "crib");
        this.crib.setDisplaySize(200,200);
    }

    updateEnemies(): void {
        this.enemies.forEach(e => {
            // Lookup the definition for this enemy...
            const eDefinition = this.enemiesToDefintions.get(e);

            // ... and call its update function
            eDefinition.update(e);
        });
    }

    // If the players are joined, return true if the arg key is pressed for either player.
    // If the players are separated, return true if the arg key is pressed for the arg player.
    isKeyDownForPlayer(key, player): Boolean {
        if(this.arePlayersJoined) {
            return this.p1Keys[key].isDown || this.p2Keys[key].isDown;
        } else {
            return this.playerToKeys.get(player)[key].isDown;
        }
    }

    updatePlayerPhysics(p: Phaser.Physics.Arcade.Sprite): void {
        const keys = this.playerToKeys.get(p);
        if(this.isKeyDownForPlayer(Controls.UP, p)) {
            p.setVelocityY(-300);
        }
        if(this.isKeyDownForPlayer(Controls.DOWN, p)) {
            p.setVelocityY(300);
        }
        if(this.isKeyDownForPlayer(Controls.LEFT, p)) {
            p.setVelocityX(-300);
            p.flipX = true;
        }
        if(this.isKeyDownForPlayer(Controls.RIGHT, p)) {
            p.setVelocityX(300);
            p.flipX = false;
        }
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
            this.fading = false;
        }
        this.runGame();

        [this.p1, this.p2].forEach(p => p.setVelocity(0));
        if(this.allowKeyInput) {
            if(this.arePlayersJoined) {
                // Move the leader and set the follower to be behind the leader
                const follower: Phaser.Physics.Arcade.Image = this.leader === this.p1 ? this.p2 : this.p1;
                this.updatePlayerPhysics(this.leader);

                let followerOffsetX = 10;
                let followerOffsetY = -10;
                if(this.isKeyDownForPlayer(Controls.UP, this.leader)) {
                    followerOffsetY = 0;
                }
                if(this.isKeyDownForPlayer(Controls.DOWN, this.leader)) {
                    followerOffsetY = -10;
                }
                if(this.isKeyDownForPlayer(Controls.LEFT, this.leader)) {
                    followerOffsetX = 10;
                }
                if(this.isKeyDownForPlayer(Controls.RIGHT, this.leader)) {
                    followerOffsetX = -10;
                }

                follower.setPosition(
                    this.leader.x + followerOffsetX,
                    this.leader.y + followerOffsetY
                );
                follower.flipX = this.leader.flipX;
            } else {
                [this.p1, this.p2].forEach(p => {
                    this.updatePlayerPhysics(p);
                });

                // The player closer to the bottom of the screen is drawn in front of the other
                if(this.p1.y < this.p2.y) {
                    this.p1.setDepth(100);
                    this.p2.setDepth(101);
                } else {
                    this.p2.setDepth(100);
                    this.p1.setDepth(101);
                }
            }
        }
        
        this.kids.forEach(kid => kid.update());

        this.updateEnemies();
    }

    private runGame() {

        if (Phaser.Input.Keyboard.JustDown(this.skipLevelKey)) {
            let nextLevel = this.LEVELS[this.LEVELS.indexOf(this.level) + 1];
            if (nextLevel) {
                this.scene.start('LevelTransition', {nextLevel: nextLevel});
            } else {
                this.scene.start('Victory');
            }
        }
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
