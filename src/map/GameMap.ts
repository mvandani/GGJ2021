import { GameScene } from "../scenes/GameScene";

export interface ITile {
    i: string;
    r: number,
    b: string;
}

export class GameMap extends Phaser.GameObjects.Container {
    // Contains all the children. Used for "collision" detections
    //private children: FubarObject[];

    public wallGroup: Phaser.Physics.Arcade.StaticGroup;

    private tileGroup: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, x: number, y: number) {

        // all rooms shall use this
        super(scene, x, y, []);
        //this.children = [];

        //this.setSize(300, 200);

        // Create background image

        this.wallGroup = this.scene.physics.add.staticGroup();
        this.loadTiles();
        this.loadWalls();
        this.wallGroup.toggleVisible();
    }

    update(): void {
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
        let wallsConfig = this.scene.cache.json.get('walls');
        wallsConfig.forEach(wall => this.createWall(wall));
    }

    createTileWall(x, y, horizontal=false) {
        let wall = this.scene.physics.add.staticImage(x, y, 'red-square');
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
        this.tileGroup = this.scene.add.group();
        let tilesConfig = this.scene.cache.json.get('tiles');
        tilesConfig.map((row, rowIndex) => this.layTileRow(row, rowIndex));
    }
    
}