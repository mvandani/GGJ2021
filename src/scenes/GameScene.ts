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

    private playerCooldownMap: Map<Phaser.Physics.Arcade.Sprite, boolean> = new Map();


    // sound effects
    private oinks: Array<Phaser.Sound.BaseSound>;
    private squeaks: Array<Phaser.Sound.BaseSound>;

    // The player that is leading the other. null if they are separated
    private leader: Phaser.Physics.Arcade.Sprite;

    private playerToKeys: Map<Phaser.Physics.Arcade.Sprite, Object> = new Map();

    private gameMap:GameMap;

    private enemies: Array<Phaser.Physics.Arcade.Sprite> = [];
    private kids: Array<Phaser.GameObjects.Sprite> = [];
    private crib: Phaser.Physics.Arcade.Image;

    // A map of enemy Images to enemyDefinitions (see below)
    private enemiesToDefintions: Map<Phaser.Physics.Arcade.Sprite, any> = new Map();
    
    private levelConfig: Object;
    private scoreText;
    private timerText;
    private livesText;
    private timeSpent: integer;
    private points: integer;
    private lives: integer;

    // A lookup of enemy type enums to objects defining a type of enemy, which includes:
    // - Its asset type for this.physics.add.image
    // - Its update function, which is called each frame
    private enemyDefinitions: Object = {
        [EnemyTypes.DUMB_DANGER_NOODLE]: {
            assetType: "snake-03",
            update: (e: Phaser.Physics.Arcade.Image) => {
                // Anytime a dumb danger noodle cannot move in any direction or if it reaches
                // a location divisible by 50, it chooses a new direction to move in randomly.
                if((e.body.deltaX() === 0 && e.body.deltaY() === 0) ) {
                    const rando = Math.random();
                    if(rando < .25) {
                        e.setVelocityX(-300);
                        e.setVelocityY(0);
                        e.setRotation(-Math.PI/2);
                    } else if(rando < .5) {
                        e.setVelocityX(300);
                        e.setVelocityY(0);
                        e.setRotation(Math.PI/2);
                    } else if(rando < .75) {
                        e.setVelocityX(0);
                        e.setVelocityY(-300);
                        e.setRotation(0);
                    } else {
                        e.setVelocityX(0);
                        e.setVelocityY(300);
                        e.setRotation(Math.PI);
                    }
                }
            }
        },
        [EnemyTypes.SMART_SNEK]: {
            assetType: "snake-04",
            update: (e: Phaser.Physics.Arcade.Image) => {
                // Smart sneks move toward p1 in either the x or y dimension (randomly decided) if they
                // cannot move any further in their current direction or if they reach a location divisble
                // by 50.
                if((e.body.deltaX() === 0 && e.body.deltaY() === 0) ) {
                    if(Math.random() > .5) {
                        e.setVelocityY(0);
                        const dx = e.x - this.p1.x;
                        if(dx < 0) {
                            e.setVelocityX(300);
                            e.setRotation(Math.PI/2);
                        } else if(dx > 0) {
                            e.setVelocityX(-300);
                            e.setRotation(-Math.PI/2);
                        } else {
                            e.setVelocityX(0);
                        }
                    } else {
                        e.setVelocityX(0);
                        const dy = e.y - this.p1.y;
                        if(dy < 0) {
                            e.setVelocityY(300);
                            e.setRotation(Math.PI);
                        } else if(dy > 0) {
                            e.setVelocityY(-300);
                            e.setRotation(0);
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
        this.timeSpent = 0;
        this.points = 0;
        this.lives = 3;

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


        this.oinks = ['oink1', 'oink2', 'oink3'].map(oink => this.sound.add(oink, {volume: 1.5}));
        this.squeaks = ['squeak1', 'squeak2'].map(squeak => this.sound.add(squeak, {volume: 1.5}));
    }

    create(): void {

        this.gameMap = new GameMap(this,0,0,this.level);

        this.anims.create({
            key: "cherry-idle",
            frames: this.anims.generateFrameNumbers("cherry-idle", {start: 0, end: 1}),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: "cherry-walk",
            frames: this.anims.generateFrameNumbers("cherry-walk", {start: 0, end: 6}),
            frameRate: 24,
            repeat: -1,
        });
        this.anims.create({
            key: "golden-idle",
            frames: this.anims.generateFrameNumbers("golden-walk", {start: 0, end: 1}),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: "golden-walk",
            frames: this.anims.generateFrameNumbers("golden-walk", {start: 0, end: 6}),
            frameRate: 24,
            repeat: -1,
        });
        this.anims.create({
            key: "snake-03",
            frames: this.anims.generateFrameNumbers("snake-03", {start: 0, end: 10}),
            frameRate: 24,
            repeat: -1,
        });
        this.anims.create({
            key: "snake-04",
            frames: this.anims.generateFrameNumbers("snake-04", {start: 0, end: 10}),
            frameRate: 24,
            repeat: -1,
        })

        this.scoreText = this.add.text(0,0,
            'Points: 0',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        this.timerText = this.add.text(500,0,
            'Time spent: 0',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        this.livesText = this.add.text(1000,0,
            'Lives: 3',
            {
                fontFamily: 'Potta One',
                fontSize: 30,
                color: '#836767'
            }
        );
        var timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timerText.setText("Time spent: " + this.timeSpent);
                this.timeSpent += 1;
            },
            callbackScope: this,
            loop: true
        });

        const p1Start = this.levelConfig["player1"]["start"];
        const p2Start = this.levelConfig["player2"]["start"];
        this.p1 = this.physics.add.sprite(p1Start[0] * 100 + 50, p1Start[1] * 100 + 50, "cherry");
        this.p1.play("cherry-walk");
        
        this.p2 = this.physics.add.sprite(p2Start[0] * 100 + 50, p2Start[1] * 100 + 50, "golden");
        this.p2.play("golden-walk");
        

        //this.p1 = this.physics.add.image(300, 600, 'mr-giggy');
        this.p1.setDisplaySize(75,51);
        this.p1.setSize(75, 51);
        this.p2.refreshBody();

        //this.p2 = this.physics.add.image(700, 600, 'mrs-giggy');
        this.p2.setDisplaySize(75,51);
        this.p2.setSize(75, 51);
        this.p2.refreshBody();


        this.physics.add.collider(this.p1, this.gameMap.wallGroup);
        this.physics.add.collider(this.p2, this.gameMap.wallGroup);

        // Map the players to the keys so we can loop over the players later and lookup which keybindings they have
        this.playerToKeys.set(this.p1, this.p1Keys);
        this.playerToKeys.set(this.p2, this.p2Keys);

        this.playerCooldownMap.set(this.p1, false);
        this.playerCooldownMap.set(this.p2, false);

        [this.p1, this.p2].forEach(p => p.setCollideWorldBounds(true));

        this.createCrib();
        this.createKids();
        this.createEnemies();
        
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
            EnemyTypes.SMART_SNEK,
        ];

        this.levelConfig["snakes"].forEach(snake => {
            // Get the definition for this type of enemy
            const eDefinition = this.enemyDefinitions[enemyTypes[snake['type']]];

            const e = this.physics.add.sprite(snake['start'][0] * 100 + 50, snake['start'][1] * 100 + 50, eDefinition.assetType);
            e.setDisplaySize(60,100);
            e.setCollideWorldBounds(true);
            this.physics.add.collider(e, this.gameMap.wallGroup);
            e.play(eDefinition.assetType);
            e.setSize(90,90 );
            e.refreshBody();
            this.enemies.push(e);

            // Pair the enemy object with its definition
            this.enemiesToDefintions.set(e, eDefinition);

            this.physics.add.overlap(e, this.p1, () => this.takeDamage(this.p1));
            this.physics.add.overlap(e, this.p2, () => this.takeDamage(this.p2));
        });
    }


    kidInCrib(kid, crib) {
        if(!kid.inCrib){
            kid.inCrib = true;
            this.oinks[Math.floor(Math.random() * Math.floor(3))].play();
            if ((this.p1 as any).kids) {
                let kidIndex = (this.p1 as any).kids.indexOf(kid);
                if (kidIndex > -1) {
                    (this.p1 as any).kids.splice(kidIndex, 1);
                }
            }
            if ((this.p2 as any).kids) {
                let kidIndex = (this.p2 as any).kids.indexOf(kid);
                if (kidIndex > -1)
                    (this.p2 as any).kids.splice(kidIndex, 1);
            }
            kid.behaviorCode = 0;
            this.points += 10 + Math.max(0, 30 - this.timeSpent);
            this.scoreText.setText("Points: " + this.points);
        }
    }

    isCoolingDown(player) {
        return this.playerCooldownMap.get(player);
    }

    takeDamage(player) {
        if(this.isCoolingDown(player)) {
            return;
        }
        else {
            this.playerCooldownMap.set(player, true);

            this.tweens.add({
                targets: player,
                alpha: {
                    from: 0,
                    to: 1,
                },
                duration: 100,
                repeat: 2,
                yoyo: true,
                onComplete: () => {
                    player.alpha = 1;
                    this.playerCooldownMap.set(player, false);
                }
            });
            this.lives = Math.max(0, this.lives - 1);
            this.livesText.setText("Lives: " + this.lives);
        }
    }

    pickupKid(kid, parent) {
        if(!kid.isHeld) {
            kid.isHeld = true;
            this.oinks[Math.floor(Math.random() * Math.floor(3))].play();
            if(!parent.kids)
                parent.kids = [];
            parent.kids.push(kid);
        }
    }

    createKids(): void {
        this.levelConfig["kids"].forEach(kidConfig => {
            const kid = new Kid({
                scene: this,
                x: kidConfig['start'][0] * 100 + 50,
                y: kidConfig['start'][1] * 100 + 50,
                key: 'kid',
                behaviorCode: kidConfig['behavior']
            });
            
            this.add.existing(kid);
            this.physics.add.collider(kid, this.gameMap.wallGroup);
            this.physics.add.overlap(kid, this.p1, this.pickupKid.bind(this));
            this.physics.add.overlap(kid, this.p2, this.pickupKid.bind(this));
            this.physics.add.overlap(kid, this.crib, this.kidInCrib.bind(this));
            this.kids.push(kid);
        });
    }

    createCrib(): void {
        const cribStart = this.levelConfig["crib"]["start"];
        this.crib = this.physics.add.image(cribStart[0] * 100 + 50, cribStart[1] * 100 + 50, "crib");
        this.crib.setDisplaySize(100, 100);
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
            
            [this.p1, this.p2].forEach((p: any) => {
                if(p.kids){
                    let followerOffsetX = 10;
                    let followerOffsetY = -10;
                    p.kids.forEach(kid => kid.setPosition(
                        p.x + followerOffsetX,
                        p.y + followerOffsetY
                    ));
                }
            })
        }

        if(this.isCoolingDown(this.p1)) {
            console.log("cooling down");
        } else {
            console.log("-")
        }

        if(this.isCoolingDown(this.p1)) {
            console.log("cooling down");
        } else {
            console.log("-")
        }
        
        this.kids.forEach(kid => kid.update());

        this.updateEnemies();
    }

    private runGame() {

        let nextLevel = this.LEVELS[this.LEVELS.indexOf(this.level) + 1];
        if (Phaser.Input.Keyboard.JustDown(this.skipLevelKey)) {
            if (nextLevel) {
                this.scene.start('LevelTransition', {nextLevel: nextLevel});
            } else {
                this.scene.start('Victory');
            }
        }

        let over = true;
        for (let i = 0; i < this.kids.length; i++) {
            over = over && (this.kids[i] as any).inCrib;
        }
        if (over) {
            this.scene.start('LevelTransition', {nextLevel: nextLevel});
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
