import { GameScene } from "../scenes/GameScene";
import { MapBuilder } from "../scenes/MapBuilder";

export interface ITile {
    i: string;
    r: number,
    b: string;
}

export class GameMap extends Phaser.GameObjects.Container {
    // Contains all the children. Used for "collision" detections
    //private children: FubarObject[];

    public TILE_SIZE: number = 100;

    public wallGroup: Phaser.Physics.Arcade.StaticGroup;

    public tiles;

    public isBuilding: boolean;

    private tileGroup: Phaser.GameObjects.Group;

    private mapKey: string;


    constructor(scene: Phaser.Scene, x: number, y: number, mapKey:string, isBuilding: boolean = false) {

        // all rooms shall use this
        super(scene, x, y, []);
        //this.children = [];
        let brown = this.scene.add.image(750,450,'brown');
        brown.setSize(1500, 900);
        brown.setDisplaySize(1500, 900);

        this.mapKey = mapKey;
        this.isBuilding = isBuilding;

        //this.setSize(300, 200);

        // Create background image

        this.wallGroup = this.scene.physics.add.staticGroup();
        this.loadTiles();
        //this.loadWalls();

    }

    update(): void {
    }

    createWall(props: any) {
        let wall = this.wallGroup.create(props.x, props.y, props.i) as Phaser.Physics.Arcade.Image;
        wall.setRotation(props.r || 0);
        wall.setOrigin(0);
        wall.setDisplaySize(props.w, props.h);
        wall.refreshBody();
        wall.setVisible(false);
        return wall;
    }

    loadWalls() {
        let wallsConfig = this.scene.cache.json.get('walls');
        wallsConfig.forEach(wall => this.createWall(wall));
    }

    createTileWall(x, y, horizontal=false) {
        let wall = this.scene.physics.add.staticImage(x, y, 'red-square');
        wall.setDisplaySize(!horizontal ? 5 : this.TILE_SIZE, !horizontal ? this.TILE_SIZE : 5);
        wall.refreshBody();
        this.wallGroup.add(wall);
        wall.setVisible(false);
        return wall;
    }

    createTileWalls(tile, tileConfig) {
        let offset = (this.TILE_SIZE / 2) - 2;
        if (tileConfig.b.includes('l')){
            tile.walls.push(this.createTileWall(tileConfig.x-offset, tileConfig.y));
        }
        if (tileConfig.b.includes('t')){
            tile.walls.push(this.createTileWall(tileConfig.x, tileConfig.y-offset, true));
        }
        if (tileConfig.b.includes('r')){
            tile.walls.push(this.createTileWall(tileConfig.x+offset, tileConfig.y));
        }
        if (tileConfig.b.includes('b')){
            tile.walls.push(this.createTileWall(tileConfig.x, tileConfig.y+offset, true));
        }
    }

    layTile(tileConfig, x, y) {
        let tile = this.tileGroup.create(x, y, tileConfig.i);

        tileConfig.x = x;
        tileConfig.y = y;
        tile.tileConfig = tileConfig;

        // handle collision
        tile.walls = [];
        if (tileConfig.b) {
            this.createTileWalls(tile, tileConfig);
        }

        tile.setRotation(tileConfig.r * Math.PI/2 || 0);
        tile.setDisplaySize(this.TILE_SIZE, this.TILE_SIZE);

        if (this.isBuilding) {
            tile.setInteractive();
            tile.on('pointerdown',  this.clickTile, tile);
        }

        return tile;
    }


    clickTile(a) {
        let tileConfig = (this as any).tileConfig;

        let gameMap = (((this as any).scene as MapBuilder).gameMap as GameMap)
        let walls = (this as any).walls;

        if (a.leftButtonDown()) {
            // Check to see if arrow keys are down to set walls
            let arrowKeys = ((this as any).scene as MapBuilder)['p2Keys'];
            let dirs = [arrowKeys[0].isDown, arrowKeys[1].isDown, arrowKeys[2].isDown, arrowKeys[3].isDown]
            if (dirs.includes(true)) {
                // remove walls
                walls.forEach(wall => wall.destroy());

                tileConfig.b = dirs.map((isDown, index) => isDown ? ['t','b','l','r'][index] : '').join('');
                gameMap.createTileWalls(this, tileConfig);
            } else {
                // If not setting walls, we're cycling through images
                let keys = ['vl1', 'vl2', 'vr1', 'vr2', 'vs', 'L', 'U', 'h', 'h2', 'nw1', 'nw2', 'blank'];
                tileConfig.i=  keys[(keys.indexOf((this as any).texture.key) + 1) % keys.length];
                (this as any).setTexture(tileConfig.i);
                this.setDisplaySize(gameMap.TILE_SIZE, gameMap.TILE_SIZE);
            }
        } else if (a.backButtonDown()) {
            // rotating
            tileConfig.r = (tileConfig.r + 1) % 4;
            this.setRotation(tileConfig.r * Math.PI/2 || 0);
        } else if (a.forwardButtonDown()) {
            // remove walls
            walls.forEach(wall => wall.destroy());
            tileConfig.b = '';
        }
    }

    layTileRow(row: Array<any>, rowIndex) {
        return row.map((tileConfig, tileIndex) => this.layTile(tileConfig, (tileIndex * this.TILE_SIZE) + this.TILE_SIZE/2, (rowIndex * this.TILE_SIZE) + this.TILE_SIZE/2));
    }

    loadTiles() {
        this.tileGroup = this.scene.add.group();
        let tilesConfig = this.scene.cache.json.get(this.mapKey);
        if (tilesConfig.tiles) {
            this.tiles = tilesConfig.tiles.map((row, rowIndex) => this.layTileRow(row, rowIndex));
        } else {
            this.tiles = [];
            for (let rowIndex = 0; rowIndex < tilesConfig.dimensions.height; rowIndex++) {
                let row = [];
                for (let colIndex = 0; colIndex < tilesConfig.dimensions.width; colIndex++) {
                    row.push(this.layTile({i:'blank',r:0,b:''}, (colIndex * this.TILE_SIZE) + this.TILE_SIZE/2, (rowIndex * this.TILE_SIZE) + this.TILE_SIZE/2));
                }
                this.tiles.push(row);
            }
        }
    }
}