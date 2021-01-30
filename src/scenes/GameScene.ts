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

const followerOffset = {
    x: 10,
    y: -10
};

export class GameScene extends Phaser.Scene {
    // variables
    private fading: boolean;

    // Game state
    private state: GameState;

    private p1Keys: Object;
    private p2Keys: Object;
    private allowKeyInput: Boolean = true;

    private p1: Phaser.Physics.Arcade.Image;
    private p2: Phaser.Physics.Arcade.Image;
    
    private arePlayersJoined: Boolean = false;

    // The player that is leading the other. null if they are separated
    private leader: Phaser.Physics.Arcade.Image;

    private playerToKeys: Map<Phaser.Physics.Arcade.Image, Object> = new Map();

    private wallGroup: Phaser.Physics.Arcade.StaticGroup;

    private tileGroup: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload(): void {
        console.log("Preloading");
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

    processCallback (pig:Phaser.Physics.Arcade.Image, ring:Phaser.Physics.Arcade.Image): boolean {
        if (pig.y > ring.getCenter().y)
        {
            return false;
        }
        return true;
    }

    createWall(props: any) {
        let wall = this.wallGroup.create(props.x, props.y, props.i) as Phaser.Physics.Arcade.Image;
        wall.setRotation(props.r || 0);
        wall.setOrigin(0);
        wall.setDisplaySize(props.w, props.h);
        wall.refreshBody();
        return wall;
    }

    loadWalls() {
        let wallsConfig = this.cache.json.get('walls');
        wallsConfig.forEach(wall => this.createWall(wall));
    }

    createTileWall(x, y, horizontal=false) {
        let wall = this.physics.add.staticImage(x, y, 'red-square');
        wall.setDisplaySize(!horizontal ? 5 : 100, !horizontal ? 100 : 5);
        wall.refreshBody();
        this.wallGroup.add(wall);
    }

    layTile(tileConfig, x, y) {
        if (!tileConfig.i)
            return null;
        let tile: Phaser.GameObjects.Image = this.tileGroup.create(x, y, tileConfig.i);

        // handle collision here too?
        if (tileConfig.b) {
            if (tileConfig.b.includes('l')){
                this.createTileWall(x-47, y)
            }
            if (tileConfig.b.includes('t')){
                this.createTileWall(x, y-47, true)
            }
            if (tileConfig.b.includes('r')){
                this.createTileWall(x+47, y)
            }
            if (tileConfig.b.includes('b')){
                this.createTileWall(x, y+47, true)
            }
        }

        tile.setRotation(tileConfig.r * Math.PI/2 || 0);
        return tile;
    }

    layTileRow(row: Array<any>, rowIndex) {
        row.map((tileConfig, tileIndex) => this.layTile(tileConfig, (tileIndex * 100) + 50, (rowIndex * 100) + 50));
    }

    loadTiles() {
        this.tileGroup = this.add.group();
        let tilesConfig = this.cache.json.get('tiles');
        tilesConfig.map((row, rowIndex) => this.layTileRow(row, rowIndex));
    }

    create(): void {
        // Create the background and main scene
        // this.add.sprite(0, 0, 'background').setOrigin(0, 0);

        this.wallGroup = this.physics.add.staticGroup();
        this.loadTiles();
        this.loadWalls();

        this.p1 = this.physics.add.image(300, 600, 'mr-giggy');
        this.p1.setDisplaySize(75,75);

        this.p2 = this.physics.add.image(700, 600, 'mrs-giggy');
        this.p2.setDisplaySize(75,75);

        this.physics.add.collider(this.p1, this.wallGroup);
        this.physics.add.collider(this.p2, this.wallGroup);
        this.wallGroup.toggleVisible();



        // Map the players to the keys so we can loop over the players later and lookup which keybindings they have
        this.playerToKeys.set(this.p1, this.p1Keys);
        this.playerToKeys.set(this.p2, this.p2Keys);

        [this.p1, this.p2].forEach(p => p.setCollideWorldBounds(true));


        // Listen for events from obejcts
        this.events.addListener('event', () => {
            // noop
        });

        this.input.keyboard.addListener('keydown-SHIFT', event => {
            if(!this.allowKeyInput) {
                return;
            }

            let summoner: Phaser.Physics.Arcade.Image;
            let summonee: Phaser.Physics.Arcade.Image;
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
            this.p1.body.immovable = false;
            this.p2.body.immovable = false;
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

    updatePlayerPhysics(p: Phaser.Physics.Arcade.Image): void {
        const keys = this.playerToKeys.get(p);
        if(this.isKeyDownForPlayer(Controls.UP, p)) {
            p.setVelocityY(-300);
        }
        if(this.isKeyDownForPlayer(Controls.DOWN, p)) {
            p.setVelocityY(300);
        }
        if(this.isKeyDownForPlayer(Controls.LEFT, p)) {
            p.setVelocityX(-300);
        }
        if(this.isKeyDownForPlayer(Controls.RIGHT, p)) {
            p.setVelocityX(300);
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
                follower.setPosition(
                    this.leader.x + followerOffset.x,
                    this.leader.y + followerOffset.y
                );
            } else {
                [this.p1, this.p2].forEach(p => {
                    this.updatePlayerPhysics(p);
                });
            }
        }
        
        // The player closer to the bottom of the screen is drawn in front of the other
        if(this.p1.y < this.p2.y) {
            this.p1.setDepth(100);
            this.p2.setDepth(101);
        } else {
            this.p2.setDepth(100);
            this.p1.setDepth(101);
        }
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
