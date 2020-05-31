// HTML ELEMENTS

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasdiv = document.getElementById("canvasdiv");

const nextbutton = document.getElementById("nextbutton");
const startbutton = document.getElementById("startbutton");
const fasterbutton = document.getElementById("fasterbutton");
const slowerbutton = document.getElementById("slowerbutton");
const clearbutton = document.getElementById("clearbutton");
const randombutton = document.getElementById("randombutton");
const selectinput = document.getElementById("selectinput");

const binput = document.getElementById("Binput");
const sinput = document.getElementById("Sinput");

const population = document.getElementById("population");
const generation = document.getElementById("generation");

// COLORS

const livingColor = "#000050";
const deadColor = "#F0F0F0";
const killColor = "#DFDAF0";
const bornColor = "#FF0040";
const buttonActiveColor = "#CCC";
const buttonInactiveColor = "#707080";

// SCALE

const scale = 8;
const cols = Math.floor(canvas.width / scale);
const rows = Math.floor(canvas.height / scale);

// CELL CLASS

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = deadColor;
        this.living = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        if (this.living) {
            ctx.fillStyle = deadColor;
            ctx.fillRect(this.x * scale + 1, this.y * scale + 1, scale - 1, scale - 1);
            ctx.fillStyle = this.color;
        }
        ctx.fillRect(this.x * scale + 1, this.y * scale + 1, scale - 1, scale - 1);
    }

    kill() {
        if (this.living) {
            this.living = false;
            this.color = killColor;
            population.textContent--;
        }
    }

    born() {
        if (!this.living) {
            this.living = true;
            this.color = bornColor;
            population.textContent++;
        }
    }

    swap() {
        if (this.living == true) {
            this.kill();
        } else {
            this.born();
        }
    }
}

// HELPER FUNCTIONS

function makeCellArray(cols, rows) {
    const array = new Array(cols);
    for (let i = 0; i < cols; i++) {
        array[i] = new Array(rows);
        for (let j = 0; j < rows; j++) {
            array[i][j] = new Cell(i, j);
        }
    }
    return array;
}

// GAME CLASS

class Game {
    // constructor
    constructor(BornRule, SurviveRule) {
        this.array = makeCellArray(cols, rows);

        this.BornRule = BornRule;
        this.SurviveRule = SurviveRule;

        this.running = false;

        canvas.addEventListener("mousedown", this.drawPixel.bind(this));

        startbutton.onclick = this.startstop.bind(this);
        fasterbutton.onclick = this.faster.bind(this);
        slowerbutton.onclick = this.slower.bind(this);
        nextbutton.onclick = this.next.bind(this);
        clearbutton.onclick = this.clear.bind(this);
        randombutton.onclick = this.randomize.bind(this);
        selectinput.onclick = this.presetSelector.bind(this);
        binput.oninput = this.changebornrule.bind(this);
        sinput.oninput = this.changesurviverule.bind(this);

        document.addEventListener("keydown", this.logLivingCoords.bind(this));

        this.presets = [];

        this.xcenter = Math.floor(cols / 2);
        this.ycenter = Math.floor(rows / 2);

        this.wait = 30;
    }

    // input methods

    drawPixel(e) {
        if (this.running == false) {
            const x = e.clientX - canvas.offsetLeft;
            const y = e.clientY - canvas.offsetTop;
            const i = Math.floor(x / scale);
            const j = Math.floor(y / scale);
            if (i >= 0 && i < cols && j >= 0 && j < rows) {
                const cell = this.array[i][j];
                cell.swap();
                cell.draw();
            }
        }
    }

    stop() {
        this.running = false;
        startbutton.value = "Start";
        nextbutton.style.color = buttonActiveColor;
        binput.disabled = false;
        sinput.disabled = false;
    }

    start() {
        this.running = true;
        startbutton.value = "Pause";
        nextbutton.style.color = buttonInactiveColor;
        binput.disabled = true;
        sinput.disabled = true;

        requestAnimationFrame(this.gameloop.bind(this));
    }

    startstop() {
        if (this.running == true) {
            this.stop();
        } else {
            this.start();
        }
    }

    faster() {
        this.wait = Math.max(0, this.wait - 20);
        if (this.wait == 0) {
            fasterbutton.style.color = buttonInactiveColor;
        }
    }

    slower() {
        if (this.wait == 0) {
            fasterbutton.style.color = buttonActiveColor;
        }
        this.wait += 20;
    }

    clear() {
        this.stop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.array.forEach((col) =>
            col.forEach((cell) => {
                cell.kill();
                cell.color = deadColor;
            })
        );
        this.draw();
        population.textContent = "0";
        generation.textContent = "0";
    }

    randomize() {
        this.clear();
        this.array.forEach((col, i) =>
            col.forEach((cell, j) => {
                const rand = Math.floor(2 * Math.random());
                if (rand == 0) {
                    cell.kill();
                } else {
                    cell.born();
                }
            })
        );
        this.draw();
    }

    presetSelector() {
        const index = selectinput.selectedIndex;
        const preset = this.presets[index];
        preset.draw(this);
    }

    changebornrule() {
        this.BornRule = binput.value.split("").map((x) => parseInt(x));
    }

    changesurviverule() {
        this.SurviveRule = sinput.value.split("").map((x) => parseInt(x));
    }

    // draw and update methods

    draw() {
        this.array.forEach((col) => col.forEach((cell) => cell.draw()));
    }

    next() {
        const bornlist = [];
        const killlist = [];

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const cell = this.array[i][j];
                const n = this.neighborNumber([i, j]);
                if (cell.living == false && this.BornRule.indexOf(n) >= 0) {
                    bornlist.push(cell);
                } else if (cell.living == true && this.SurviveRule.indexOf(n) == -1) {
                    killlist.push(cell);
                } else {
                    if (cell.living) {
                        cell.color = livingColor;
                    } else {
                        cell.color = deadColor;
                    }
                    cell.draw();
                }
            }
        }

        killlist.forEach((cell) => {
            cell.kill();
            cell.draw();
        });

        bornlist.forEach((cell) => {
            cell.born();
            cell.draw();
        });

        if (parseInt(population.textContent) == 0) {
            this.stop();
            return;
        }

        generation.textContent++;
    }

    // neighbor computation

    neighborNumber(coord) {
        return this.livingNeighbors(coord).length;
    }

    livingNeighbors(coord) {
        return this.neighbors(coord).filter((c) => this.array[c[0]][c[1]].living == true);
    }

    neighbors(coord) {
        const i = coord[0];
        const j = coord[1];
        const list = [];
        for (let s = -1; s <= 1; s++) {
            for (let t = -1; t <= 1; t++) {
                if (s !== 0 || t !== 0) {
                    const x = (i + s + cols) % cols;
                    const y = (j + t + rows) % rows;
                    list.push([x, y]);
                }
            }
        }
        return list;
    }

    // game loop

    gameloop() {
        if (this.running == true) {
            setTimeout(() => {
                this.next();
                requestAnimationFrame(this.gameloop.bind(this));
            }, this.wait);
        }
    }

    // log the living coordinates

    logLivingCoords(event) {
        if (event.key == "l") {
            let str = "[";
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (this.array[i][j].living) str += "[" + i + "," + j + "],";
                }
            }
            str = str.substring(0, str.length - 1);
            str += "]";
            console.log(str);
        }
    }
}

// PRESET CLASS

class Preset {
    constructor(name) {
        this.coords = [];
        this.pattern = "";
        this.name = name;
    }

    addTo(game) {
        game.presets.push(this);
        const opt = document.createElement("option");
        opt.appendChild(document.createTextNode(this.name));
        selectinput.appendChild(opt);
    }

    draw(game) {
        game.clear();
        this.coords.forEach(([i, j]) => {
            game.array[i][j].born();
            game.array[i][j].draw();
        });
    }

    setPattern(str) {
        this.coords = [];
        this.pattern = str;
        let x = 0;
        let y = 0;
        for (let k = 0; k < str.length; k++) {
            const char = str[k];
            switch (char) {
                case ".":
                    x++;
                    break;
                case "O":
                    this.coords.push([x, y]);
                    x++;
                    break;
                case "|":
                    x = 0;
                    y++;
            }
        }
    }

    center(game) {
        this.moveRight(game.xcenter);
        this.moveDown(game.ycenter);
    }

    moveRight(offset) {
        this.coords.forEach((coord) => {
            coord[0] += offset;
        });
    }

    moveDown(offset) {
        this.coords.forEach((coord) => {
            coord[1] += offset;
        });
    }
}

// MAKE THE GAME and PRESETS

// canvas.width = 840;
// canvas.height = 640;
let game = new Game([3], [2, 3]);
game.draw();

Acorn = new Preset("Acorn");
Acorn.setPattern(`
  .O.....|
  ...O...|
  OO..OOO|
`);
Acorn.center(game);

Methuselah = new Preset("Methuselah");
Methuselah.setPattern(`
......O.|
OO......|
.O...OOO|
`);
Methuselah.center(game);

RPentomino = new Preset("R-Pentomino");
RPentomino.setPattern(`
.OO|
OO.|
.O.|
`);
RPentomino.center(game);

Schick = new Preset("Schick ship");
Schick.setPattern(`
.O..O...............|
O...................|
O...O...............|
OOOO.........OO.....|
......OOO.....OO....|
......OO.OO......OOO|
......OOO.....OO....|
OOOO.........OO.....|
O...O...............|
O...................|
.O..O...............|
`);
Schick.center(game);

GosperGun = new Preset("Gosper Gun");
GosperGun.setPattern(`
........................O...........|
......................O.O...........|
............OO......OO............OO|
...........O...O....OO............OO|
OO........O.....O...OO..............|
OO........O...O.OO....O.O...........|
..........O.....O.......O...........|
...........O...O....................|
............OO......................|
`);
GosperGun.moveDown(20);
GosperGun.moveRight(20);

Hey = new Preset("Hey!");
Hey.setPattern(`
O..O..OOOO..O.....O..O|
O..O..O......O...O...O|
O..O..O.......O.O....O|
OOOO..OOOO.....O.....O|
O..O..O........O.....O|
O..O..O........O......|
O..O..OOOO.....O.....O|
`);
Hey.moveRight(40);
Hey.moveDown(37);

Lobster = new Preset("Lobster");
Lobster.setPattern(`
...........OOO............|
.............O............|
........OO..O.............|
........OO................|
............OO............|
...........OO.............|
..........O..O............|
..........................|
........O..O..............|
.......O...O..............|
......O.OOO...............|
.....O....................|
.....O.............O.O..OO|
......O.............OO.O.O|
.OO.............OO..O....O|
O..OO..OO......O...O......|
.....O..O......O......OO..|
.........OO....O.O....OO..|
..O...O...O.....O.........|
......OO....O..O..........|
.O.O.....O...OO...........|
OO........O...............|
.....O....O...............|
.......O...O..............|
....OO.....O..............|
....O.....O...............|
`);
Lobster.moveDown(35);
Lobster.moveRight(10);

sixbits = new Preset("6 bits");
sixbits.setPattern(`
.....................O..................|
.....................O..................|
....................O.O.................|
.....................O..................|
.....................O..................|
.....................O..................|
.....................O..................|
....................O.O.................|
.....................O..................|
.....................O..................|
........................................|
........................................|
........................................|
........................................|
..O..O....O..O..........................|
OOO..OOOOOO..OOO........................|
..O..O....O..O..........................|
......................OO................|
.....................OO.................|
.......................O................|
................................O....O..|
..............................OO.OOOO.OO|
................................O....O..|
`);
sixbits.moveDown(25);
sixbits.moveRight(35);

metamorphosis = new Preset("Metamorphosis II");
metamorphosis.setPattern(`
....................OO.........OO....................|
....................OO.........OO....................|
.....................................................|
.....................................................|
....................OOO.......OOO....................|
....................OOO.......OOO....................|
.....................................................|
.....................................................|
.....................................................|
..................OO...OO...OO...OO..................|
...................OOOOO.....OOOOO...................|
....................OOO.......OOO....................|
.....................O.........O.....................|
........O...................................O........|
.......O.O.................................O.O.......|
......O.OO.................................OO.O......|
OO...OO.OO.................................OO.OO...OO|
OO....O.OO.................................OO.O....OO|
.......O.O.................................O.O.......|
........O...................................O........|
.......................O.O...........................|
......................O..............................|
......................O..............................|
......................O..O...........................|
......................OOO............................|
.....................................................|
......................OOO............................|
......................O..O...........................|
......................O..............................|
......................O..............................|
.......................O.O...........................|
........O...................................O........|
.......O.O.................................O.O.......|
OO....O.OO.................................OO.O....OO|
OO...OO.OO.................................OO.OO...OO|
......O.OO.................................OO.O......|
.......O.O.................................O.O.......|
........O...................................O........|
.....................O.........O.....................|
....................OOO.......OOO....................|
...................OOOOO.....OOOOO...................|
..................OO...OO...OO...OO..................|
.....................................................|
.....................................................|
.....................................................|
....................OOO.......OOO....................|
....................OOO.......OOO....................|
.....................................................|
.....................................................|
....................OO.........OO....................|
....................OO.........OO....................|
`);
metamorphosis.moveDown(15);
metamorphosis.moveRight(25);

frothing = new Preset("Frothing Puffer");
frothing.setPattern(`
.......O.................O.......|
......OOO...............OOO......|
.....OO....OOO.....OOO....OO.....|
...OO.O..OOO..O...O..OOO..O.OO...|
....O.O..O.O...O.O...O.O..O.O....|
.OO.O.O.O.O....O.O....O.O.O.O.OO.|
.OO...O.O....O.....O....O.O...OO.|
.OOO.O...O....O.O.O....O...O.OOO.|
OO.........OO.O.O.O.OO.........OO|
............O.......O............|
.........OO.O.......O.OO.........|
..........O...........O..........|
.......OO.O...........O.OO.......|
.......OO...............OO.......|
.......O.O.O.OOO.OOO.O.O.O.......|
......OO...O...O.O...O...OO......|
......O..O...O.O.O.O...O..O......|
.........OO....O.O....OO.........|
.....OO....O...O.O...O....OO.....|
.........O.OO.O...O.OO.O.........|
..........O.O.O.O.O.O.O..........|
............O..O.O..O............|
...........O.O.....O.O...........|
`);
frothing.moveRight(36);
frothing.moveDown(25);

metamorphosis.addTo(game);
Schick.addTo(game);
Lobster.addTo(game);
frothing.addTo(game);
sixbits.addTo(game);
GosperGun.addTo(game);
Hey.addTo(game);
Acorn.addTo(game);
Methuselah.addTo(game);
RPentomino.addTo(game);
