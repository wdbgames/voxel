import { Tile } from "./Tile.js";
import { TileVoid } from "./TileVoid.js";
import { TileDirt } from "./TileDirt.js";
import { TileGrass } from "./TileGrass.js";
import { TileStoneDeep } from "./TileStoneDeep.js";
import { TileGravity } from "./TileGravity.js";
import { TileStoneDeepDeep } from "./TileStoneDeepDeep.js";
import { TileLiquid } from "./TileLiquid.js";
import { TileLeaves } from "./TileLeaves.js";
import { TileLog } from "./TileLog.js";
import { TileVoidWall } from "./TileVoidWall.js";
import { TileStep } from "./TileStep.js";
import { TileLeafPile } from "./TileLeafPile.js";
import { TileSponge } from "./TileSponge.js";
import { TileGlass } from "./TileGlass.js";
import { TileCarpet } from "./TileCarpet.js";
import { TileSteam } from "./TileSteam.js";
import { TileData } from "./TileData.js";
import { TileBush } from "./TileBush.js";

export class TileRegisterer {
    tileAmount = 29;
    tiles = [];
    viscous = [];

    void = 0;
    stone = 1;
    dirt = 2;
    grass = 3;
    wood = 4;
    stoneDeep = 5;
    sand = 6;
    mud = 7;
    stoneDeepDeep = 8;
    water = 9;
    leaves = 10;
    log = 11;
    flesh = 12;
    metal = 13;
    voidWall = 14;
    lava = 15;
    rock = 16;
    roots = 17;
    step = 18;
    leafPile = 19;
    sponge = 20;
    pumice = 21;
    glass = 22;
    carpet = 23;
    steam = 24;
    data = 25;
    bush = 26;
    bushBerry = 27;
    stepDouble = 28;

    constructor() {
        this.tiles[this.void] = new TileVoid(0, 0);
        this.tiles[this.stone] = new Tile(5, 1);
        this.tiles[this.dirt] = new TileDirt(2, 3);
        this.tiles[this.grass] = new TileGrass([6, 6, 3, 2, 6, 6], 3);
        this.tiles[this.wood] = new Tile(4, 2);
        this.tiles[this.stoneDeep] = new TileStoneDeep(1, 1);
        this.tiles[this.sand] = new TileGravity(7, 3, this.sand);
        this.tiles[this.mud] = new Tile(8, 4);
        this.tiles[this.stoneDeepDeep] = new TileStoneDeepDeep(9, 1);
        this.tiles[this.water] = new TileLiquid(10, 7, 0.8, this.water);
        this.tiles[this.leaves] = new TileLeaves(11, 0);
        this.tiles[this.log] = new TileLog([12, 12, 13, 13, 12, 12], 2);
        this.tiles[this.flesh] = new Tile(14, 4);
        this.tiles[this.metal] = new Tile(15, 5);
        this.tiles[this.voidWall] = new TileVoidWall(0, 1);
        this.tiles[this.lava] = new TileLiquid(16, 9, 0.4, this.lava);
        this.tiles[this.rock] = new TileGravity(17, 3, this.rock);
        this.tiles[this.roots] = new TileDirt(18, 3);
        this.tiles[this.step] = new TileStep([29, 29, 28, 28, 29, 29], 1);
        this.tiles[this.leafPile] = new TileLeafPile(11, 0);
        this.tiles[this.sponge] = new TileSponge(20, 3, this.water);
        this.tiles[this.pumice] = new TileSponge(21, 1, this.lava);
        this.tiles[this.glass] = new TileGlass(22, 1);
        this.tiles[this.carpet] = new TileCarpet(23, 1);
        this.tiles[this.steam] = new TileSteam(24, 5);
        this.tiles[this.data] = new TileData(25, 5);
        this.tiles[this.bush] = new TileBush(26, 0, false);
        this.tiles[this.bushBerry] = new TileBush(27, 0, true);
        this.tiles[this.stepDouble] = new Tile(28, 1);

        for(let i = 0; i < this.tiles.length; ++i) {
            const tileViscosity = this.tiles[i].viscosity;
            if(tileViscosity != 0 && tileViscosity != 1) {
                this.viscous.push(i);
            }
        }
        console.log(this.viscous);
    }
}
