'use strict';

let wp = {};

// Mock room from: https://donjon.bin.sh/d20/dungeon/
{
  var MOCK_ROOM_STR = `																																		
							F	F	F	F	F				F	F	F	F	F	F	F	F	F	F	F									
							F	F	F	F	F				F		F	F	F	F	F	F	F	F	F									
							F	F	F	F	F				F	F	F	F	F	F	F	F	F	F	F									
							F				F						F	F	F	F	F	F	F	F	F									
			F	F	F	F	F		F	F	F						F	F	F	F	F	F	F	F	F									
			F	F	F	F	F		F	F	F								F	F	F	F	F											
	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	
	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F				F				F								F	
	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F				F	F	F	F	F		F	F	F				F	
	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F				F	F	F	F	F		F	F	F				F	
	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F				F	F	F	F	F	F	F	F	F	F	F		F	
	F	F	F	F	F	F	F		F	F	F	F	F	F	F						F	F	F	F	F	F	F	F	F	F	F		F	
	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F						F	F	F	F	F	F	F	F	F	F	F	F	F	
	F		F	F	F	F	F				F	F	F								F		F	F	F	F	F	F	F	F	F		F	
	F		F	F	F	F	F				F	F	F		F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F		F	
	F				F										F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F		F	
	F		F	F	F	F	F		F	F	F	F	F		F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F		F	
	F		F	F	F	F	F		F	F	F	F	F		F	F	F	F	F						F								F	
	F		F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F	F		F	F	F	F	F				F	
	F		F	F	F	F	F	F	F						F	F	F	F	F	F	F	F	F		F	F	F	F	F				F	
	F		F	F	F	F	F	F	F	F	F				F	F	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F	
	F		F		F	F	F	F	F	F	F				F	F	F	F	F	F	F	F	F		F	F	F	F	F					
	F	F	F		F	F	F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F		F	F	F	F	F					
	F	F	F		F	F	F	F	F	F	F	F	F		F	F	F				F				F									
	F	F	F		F	F	F	F	F	F	F	F	F		F	F	F		F	F	F	F	F		F	F	F	F	F	F	F	F	F	
	F	F	F				F		F	F	F	F	F						F	F	F	F	F										F	
	F	F	F	F	F	F	F		F	F	F	F	F	F	F		F	F	F	F	F	F	F	F	F								F	
					F	F	F								F		F	F	F	F	F	F	F	F	F								F	
			F	F	F	F	F	F	F	F	F	F	F		F		F	F	F	F	F	F	F	F	F								F	
			F	F	F	F	F	F	F	F	F	F	F		F				F	F	F	F	F	F	F								F	
			F	F	F	F	F	F	F	F	F	F	F		F				F	F	F	F	F	F	F								F	
					F	F	F				F				F						F	F	F	F	F								F	
					F	F	F				F	F	F	F	F						F	F	F	F	F	F	F	F	F	F	F	F	F	
																																		`;
}

const tiles = { FLOOR: 'FLOOR', BRICK: 'BRICK' };

class Attacker {
  constructor() {
    this.attacking = {
      weapon: new Weapon("None"),
      health: 10
    };
  }
  setWeapon(weapon) {
    this.attacking.weapon = weapon;
  }
  setHealth(health) {
    this.attacking.health = health;
  }
  incrementHealth(healthD) {
    this.attacking.health += healthD;
  }
  receiveAttack(attack) {
    this.incrementHealth(-attack);
  }
  generateAttack() {
    return this.attacking.weapon.generateAttack(this.getLevel());
  }
  attack1(defender) {
    defender.receiveAttack(this.generateAttack());
  }
  isAlive() {
    return this.attacking.health > 0;
  }
  takeWeapon(weapon) {
    this.attacking.weapon = weapon;
  }
};

function playerAttackFactory(player, singleAttack, isAlive, gameOver) {
  return defender => {
    singleAttack(player, defender);
    if (isAlive(defender)) {
      singleAttack(defender, player);
      if (!isAlive(player)) gameOver();
    }
  };
}

class Map {
  constructor(tiles) {
    this.tiles = tiles;
  }
  isInRoom(x, y) {
    return this.tileType(x, y) === tiles.FLOOR;
  }
  static isInRoom(x, y) {
    return wp.map.isInRoom(x, y);
  }
  tileType(x, y) {
    if (x instanceof Location) return this.tileType(x.x, x.y);
    return this.tiles[y][x];
  }
}

const util = {
  stringToRoom: function stringToRoom(str) {
    const lookup = {};
    lookup[''] = tiles.BRICK;
    lookup['F'] = tiles.FLOOR;
    return str.split("\n").map(line => line.split("\t").map(char => lookup[char]));
  },
  newId: (() => {
    let id = 0;

    return () => id++;
  })(),
  rangeCall: (from, to, callback) => {
    for (let i = from; i < to; i++) {
      callback(i);
    }
  },
  rangeCollect: (from, to, callback) => {
    let result = [];
    util.rangeCall(from, to, i => result.push(callback(i)));

    return result;
  }
};
function cellDistanceFromPlayer(x, y) {
  let dx = wp.player.location.x - x,
      dy = wp.player.location.y - y;
  return Math.sqrt(dx * dx + dy * dy);
}

function cellType(x, y) {
  if (wp.player.location.isAt(x, y)) return 'PLAYER';
  if (cellDistanceFromPlayer(x, y) >= 2 + wp.player.getLevel()) return 'BLACK';
  const lists = [{ list: wp.items, result: 'ITEMS' }, { list: wp.baddies, result: 'BADDIES' }];

  let coincident = wp.locatables.itemsAt(x, y);

  let result = null;
  const map = [[Item, 'ITEMS'], [Baddie, 'BADDIES'], [Food, 'FOOD']];
  coincident.forEach(i => {
    map.forEach(j => {
      if (i.item instanceof j[0]) result = j[1];
    });
  });
  return result || wp.map.tiles[y][x];
}

class Location {
  constructor(x, y) {
    this.set(x || 0, y || 0);
  }
  isAt(x, y) {
    return this.x === x && this.y === y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
  offsetBy(x, y) {
    return new Location(this.x + x, this.y + y);
  }
}

class LocatableList {
  constructor() {
    this.locatables = {};
  }
  addItem(item, location) {
    const newId = util.newId();
    if (location === undefined) location = new Location();
    this.locatables[newId] = { item: item, location: location };

    return newId;
  }
  removeItem(id) {
    delete this.locatables[id];
  }
  getItem(id) {
    return this.locatables[id];
  }
  forEach(f) {
    for (let key in this.locatables) {
      f(this.locatables[key], key);
    }
  }
  filter(f) {
    let result = new LocatableList();
    this.forEach((item, key) => {
      if (f(item, key)) result.locatables[key] = item;
    });

    return result;
  }
  toArray() {
    let result = [];
    this.forEach((item, key) => result.push([item, key]));
    return result;
  }
  itemsAt(x, y) {
    if (x instanceof Location) return this.itemsAt(x.x, x.y);

    return this.filter(i => i.location.isAt(x, y));
  }
}

class Player extends Attacker {
  constructor() {
    super();
    this.location = new Location();
    this.xp = 0;
  }
  getLevel() {
    return Math.floor(Math.sqrt(this.xp));
  }
}

class Baddie extends Attacker {
  getLevel() {
    return 1;
  }

  collideWith(removeFromMap) {
    playerAttack(this);
    if (!this.isAlive()) {
      removeFromMap();
      wp.player.xp += this.xp;
    }

    return true;
  }
}

class Item {
  constructor(name) {
    this.name = name;
  }

  collideWith(removeFromMap) {
    pickupItem(this);
    removeFromMap();
  }
}

class Food extends Item {
  constructor(name, healthBonus) {
    super(name);
    this.healthBonus = healthBonus;
  }

  pickupItem() {
    wp.player.incrementHealth(this.healthBonus);
  }
}

class Weapon extends Item {
  constructor(name, attackStrength) {
    super(name);
    this.attackStrength = attackStrength || { min: 0, max: 0 };
  }
  generateAttack(xp) {
    xp = xp || 1;
    const min = this.attackStrength.min,
          max = this.attackStrength.max;
    return Math.floor(Math.random() * (max - min) * xp + min);
  }

  pickupItem() {
    wp.player.takeWeapon(this);
  }
}

function pickupItem(item) {
  return item.pickupItem();
}
function collideWith(item, removeFromMap) {
  return item.collideWith(removeFromMap);
}

const movePlayerBy = (dx, dy) => movePlayerTo(wp.player.location.offsetBy(dx, dy));
function movePlayerTo(x, y) {
  if (x instanceof Location) return movePlayerTo(x.x, x.y);
  if (!Map.isInRoom(x, y)) return;

  let playerBlocked = false;
  wp.locatables.itemsAt(x, y).forEach((item, key) => {
    playerBlocked |= collideWith(item.item, () => wp.locatables.removeItem(key));
  });

  if (!playerBlocked) wp.player.location.set(x, y);

  if (wp.locatables.filter(x => x.item instanceof Baddie).toArray().length === 0) alert("You win!");

  if (Math.random() * wp.player.attacking.health < 5) {
    let newId = wp.locatables.addItem(new Food('Mannah', 20));
    placeRandomly(wp.locatables.getItem(newId));
  }
}

/**************/
/* Init world */

class WorldProperties {
  constructor() {
    this.player = new Player();

    this.map = new Map(util.stringToRoom(MOCK_ROOM_STR));
    this.locatables = new LocatableList();
  }
}

wp = new WorldProperties();

const playerAttack = playerAttackFactory(wp.player, (a, d) => a.attack1(d), d => d.isAlive(), () => alert("Game over"));

function placeRandomly(locatable) {
  while (wp.map.tileType(locatable.location) !== tiles.FLOOR) {
    let newY = Math.floor(Math.random() * wp.map.tiles.length),
        newRow = wp.map.tiles[newY],
        newX = Math.floor(Math.random() * newRow.length);
    locatable.location.set(newX, newY);
  }
}

function initWorld() {
  let items = util.rangeCollect(0, 30, i => new Weapon('dagger ' + i, { min: Math.floor(Math.pow(2, i / 3)),
    max: Math.floor(Math.pow(2, (i + 2) / 3)) }));
  items = [new Weapon('Dagger', { min: 2, max: 10 }), new Weapon('Sword', { min: 5, max: 20 }), new Weapon('Nunchucks', { min: 0, max: 15 })];
  let food = util.rangeCollect(0, 0, i => new Food('Cupcake', 10));
  let baddies = util.rangeCollect(0, 10, i => {
    let baddie = new Baddie();
    baddie.xp = i;
    baddie.attacking.health = 10 + Math.floor(Math.pow(2, i / 2 + 1));
    return baddie;
  });
  baddies.forEach(b => b.setWeapon(new Weapon('Knife of evil', { min: 2, max: 30 })));

  [[wp.player], items, baddies, food].forEach(list => {
    list.forEach(item => {
      wp.locatables.addItem(item, item.location);
    });
  });

  wp.locatables.forEach(placeRandomly);

  wp.player.attacking.health = 100;
}
initWorld();

/**************/
/* React draw */

class WorldView extends React.Component {
  componentWillMount() {
    this.props.updateFunc(this.forceUpdate.bind(this));
  }
  render() {
    return React.createElement(
      'div',
      { className: 'gameView' },
      React.createElement(DungeonView, { world: this.props.world }),
      React.createElement(GameStatus, { world: this.props.world }),
      React.createElement(
        'div',
        { className: 'status' },
        React.createElement(
          'div',
          null,
          'Player: ',
          JSON.stringify(this.props.world.player),
          ', level: ',
          this.props.world.player.getLevel()
        ),
        React.createElement(
          'div',
          null,
          'Baddies: ',
          this.props.world.locatables.filter(i => i.item instanceof Baddie).toArray().map(b => b[0].item.attacking.health + ", ").toString()
        )
      )
    );
  }
}

function PlayerStat(props) {
  return React.createElement(
    'div',
    { className: 'playerStat' },
    React.createElement(
      'div',
      { className: 'statTitle' },
      props.title
    ),
    React.createElement(
      'div',
      { className: 'statValue' },
      props.value
    )
  );
}

function GameStatus(props) {
  const w = props.world,
        weapon = w.player.attacking.weapon;
  return React.createElement(
    'div',
    { className: 'gameStatus' },
    React.createElement(PlayerStat, { title: 'Player health', value: w.player.attacking.health }),
    React.createElement(PlayerStat, { title: 'Weapon', value: `${weapon.name} ${weapon.attackStrength.min}–${weapon.attackStrength.max}` }),
    React.createElement(PlayerStat, { title: 'XP', value: w.player.xp }),
    React.createElement(PlayerStat, { title: 'Level', value: w.player.getLevel() })
  );
}

const HEIGHT = 300,
      WIDTH = HEIGHT,
      cellHeight = () => HEIGHT / wp.map.tiles.length,
      cellWidth = () => WIDTH / wp.map.tiles[0].length;
const x = xin => Math.floor(xin * cellWidth()),
      y = yin => Math.floor(yin * cellHeight());
function DungeonViewSVG(props) {
  return React.createElement(
    'svg',
    { width: WIDTH, height: HEIGHT },
    React.createElement('circle', null),
    props.world.map.tiles.map((line, ycell) => React.createElement(
      'g',
      null,
      line.map((cell, xcell) => React.createElement('rect', {
        x: x(xcell),
        y: y(ycell),
        width: x(xcell + 1) - x(xcell),
        height: y(ycell + 1) - y(ycell),
        className: cellType(xcell, ycell) }))
    ))
  );
}

function DungeonView(props) {
  return React.createElement(
    'div',
    { className: 'squareWrapper' },
    React.createElement('div', { className: 'squareSpacer' }),
    React.createElement(
      'div',
      { className: 'dungeonView' },
      props.world.map.tiles.map((line, index) => React.createElement(DungeonLine, { key: index, line: line, index: index }))
    )
  );
}

function DungeonLine(props) {
  return React.createElement(
    'div',
    { className: 'dungeonLine' },
    props.line.map((_, i) => React.createElement('div', { key: i, className: 'TILE ' + cellType(i, props.index), style: { opacity: 1 - 0 * cellDistanceFromPlayer(i, props.index) / (10 + wp.player.getLevel()) } }))
  );
}

let reactUpdate;
ReactDOM.render(React.createElement(WorldView, { world: wp, updateFunc: f => reactUpdate = f }), document.getElementById('reactRoot'));

/*********************/
/* Movement controls */

const LEFT = 37,
      UP = 38,
      RIGHT = 39,
      DOWN = 40;
document.addEventListener('keydown', event => {
  event.preventDefault();
  switch (event.keyCode) {
    case LEFT:
      movePlayerBy(-1, 0);break;
    case UP:
      movePlayerBy(0, -1);break;
    case RIGHT:
      movePlayerBy(1, 0);break;
    case DOWN:
      movePlayerBy(0, 1);break;
  }

  reactUpdate();
});