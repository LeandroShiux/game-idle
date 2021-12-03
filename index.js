Decimal.prototype.tof = function(x) {
  if (this.exponent >= 5 || this.exponent <= -5) {
    return r100(this.mantissa) + "e" + this.exponent;
  } else {
    return +this.toFixed(x);
  }
};
Decimal.prototype.flor = function(x) {
  return this.add(0.5).floor();
};
Decimal.prototype.gte = function(x) {
  return this.greaterThanOrEqualTo(x);
};
Decimal.prototype.lte = function(x) {
  return this.lessThanOrEqualTo(x);
};
Decimal.prototype.gt = function(x) {
  return this.greaterThan(x);
};
Decimal.prototype.lt = function(x) {
  return this.lessThan(x);
};
Element.prototype.qs = function(x) {
  return this.querySelector(x);
};
Element.prototype.qsa = function(x) {
  return this.querySelectorAll(x);
};
const tim = () => new Date().getTime();
const ssend = (stat, numb) => {
  kongregate.stats.submit(stat, numb);
};

const rdbt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const r100 = (x) => Math.round(x * 100) / 100;
const r10 = (x) => Math.round(x * 10) / 10;

var cache = {};
var qs = function(query) {
  cache = cache || {};

  if (!cache[query]) {
    cache[query] = document.querySelector(query);
  }

  return cache[query];
};

const qsa = (x) => {
  return document.querySelectorAll(x);
};

var gdbase;
var baseHtml;
var firstrun;

$(() => {
  gdbase = _.cloneDeep(gd);
  baseHtml = qs(".nbody").innerHTML;

  createGame();
  firstrun = true;

  loadgm();

  if (firstrun) {
    showHelp();
  } else {
    $(".ui.modal.wback").modal("show");
  }

  $(".menu .item").tab({ context: "parent" });

  mainGame();
  savegm();
});

const showHelp = () => {
  $(".ui.modal.modfirst").modal("show");
  // $(".helpmenu").tab()
};

const hotkey = (ev) => {
  if (ev.code.includes("Digit") || ev.code.includes("Numpad")) {
    let tab = $(".sudokey:visible")[0].id;
    let mult = parseInt(ev.key);

    if (tab == "mstop" && gd.sel.row != null) {
      let old = gd.workersGrid[gd.sel.row][gd.sel.col];
      let oldalloc = gd.alloc;

      mult = Math.max(gd.cols, gd.rows);
      if (gd.sel.col != null && checkFix()) {
        let size =
          gd.workersGrid[gd.sel.row][gd.sel.col] - mult < 0
            ? gd.workersGrid[gd.sel.row][gd.sel.col]
            : mult;

        gd.alloc = gd.alloc.sub(size);
        gd.workersGrid[gd.sel.row][gd.sel.col] -= size;
      }

      mult = parseInt(ev.key);
      let size = mult;

      if (
        gd.sel.col != null &&
        mult <= Math.max(gd.cols, gd.rows) &&
        checkFix() &&
        gd.people.sub(gd.alloc).gte(mult)
      ) {
        gd.alloc = gd.alloc.add(mult);
        gd.workersGrid[gd.sel.row][gd.sel.col] = size;
      } else {
        gd.workersGrid[gd.sel.row][gd.sel.col] = old;
        gd.alloc = oldalloc;
      }
    } else if (tab != "mstop" && gd[tab].sel.row != null) {
      let ms = gd[tab];
      let lt = tab.replace("ms", "");
      let old = ms.result[ms.sel.row][ms.sel.col];

      ms.result[ms.sel.row][ms.sel.col] = null;
      mult = parseInt(ev.key);
      let size = mult;

      if (size <= ms.size && checkFix2(lt)) {
        ms.result[ms.sel.row][ms.sel.col] = size == 0 ? null : size;
      } else {
        ms.result[ms.sel.row][ms.sel.col] = old;
      }
    }
  } else {
    console.log(ev);
  }
};

const createGame = () => {
  document.querySelector("body").addEventListener("keypress", hotkey);

  var gb = qs("#game-board");
  
  var mss = qs("#mss-board");
  var msd = qs("#msd-board");
  // var msv = qs("#msv-board");
  
  var msf = qs("#msf-board");
  
  
  
  gb.innerHTML = createBoard();
  mss.innerHTML = createSudo("s");
  msd.innerHTML = createSudo("d");
  msf.innerHTML = createSudo("f");
  // msv.innerHTML = createSudo("v");
  generate("s");
  generate("d");
  generate("f");
  // generate("v");
  
  createFixeds();
};

const rd = () => rdbt(1, Math.min(gd.rows, gd.cols));
const rdc = () => rdbt(0, gd.cols - 1);
const rdr = () => rdbt(0, gd.rows - 1);

const createFixeds = () => {
  let prim = [rdr(), rdc(), rd()];
  let sec = [rdr(), rdc(), rd()];
  while (prim == sec || prim[1] == sec[1] || prim[2] == sec[2]) {
    sec = [rdr(), rdc(), rd()];
  }
  gd.fixeds[prim[0]][prim[1]] = prim[2];
  gd.fixeds[sec[0]][sec[1]] = sec[2];
  gd.workersGrid[prim[0]][prim[1]] = prim[2];
  gd.workersGrid[sec[0]][sec[1]] = sec[2];
};

const getrow = (n) => Math.floor(n / gd.cols);
const getcol = (n) => n % gd.cols;

const getrow2 = (n, sz) => Math.floor(n / sz);
const getcol2 = (n, sz) => n % sz;

const selebox = (el) => {
  // $(".cselected").removeClass("cselected");
  let box = parseInt(el.id.replace("A", ""));
  let c = getcol(box);
  let r = getrow(box);
  if (gd.sel.col != c || gd.sel.row != r) {
    // $(el).addClass("cselected");
    gd.sel = { col: c, row: r };
  } else {
    gd.sel = { col: null, row: null };
  }
};

const selesudo = (el, lt) => {
  // $(".cselected").removeClass("cselected");
  let box = parseInt(el.id.replace(lt, ""));
  let c = getcol2(box, gd["ms" + lt].size);
  let r = getrow2(box, gd["ms" + lt].size);
  if (gd["ms" + lt].sel.col != c || gd["ms" + lt].sel.row != r) {
    // $(el).addClass("cselected");
    gd["ms" + lt].sel = { col: c, row: r };
  } else {
    gd["ms" + lt].sel = { col: null, row: null };
  }
};

const getWorkers = (i, j) =>
  gd.workersGrid[i][j] == 0 ? "" : gd.workersGrid[i][j];

const getFixed = (i, j) => (gd.fixeds[i][j] == 0 ? "" : gd.fixeds[i][j]);

const checkSel = (i, j) =>
  gd.sel.row == i && gd.sel.row == j ? " cselected" : "";

const getId = (i, j) => j + i * gd.cols;

const getId2 = (i, j, sz) => j + i * sz;

const createBoard = () => {
  let hstr = "";
  for (let i = 0; i < gd.rows; i++) {
    for (let j = 0; j < gd.cols; j++) {
      let n = getId(i, j);
      hstr += /* HTML */ `
        <div class="box ${checkSel(i, j)}" id="A${n}" onclick="selebox(this)">
          ${getWorkers(i, j)}
        </div>
      `;
    }
  }
  return hstr;
};

const createSudo = (lt) => {
  let hstr = "";
  let sz = gd["ms" + lt].size;
  for (let i = 0; i < sz; i++) {
    for (let j = 0; j < sz; j++) {
      let n = getId2(i, j, sz);
      hstr += /* HTML */ `
        <div class="box" id="${lt + n}" onclick="selesudo(this,'${lt}')"></div>
      `;
    }
  }
  return hstr;
};

var gd = {
  version: 1.3,

  timelast: tim(),
  timenow: tim(),
  diff: 0,

  avgSales: new Decimal(0),
  avgGlass: new Decimal(0),
  avgSand: new Decimal(0),

  onpres: new Decimal(0),
  pps: new Decimal(0),

  lastMoneys: [],
  currentMoney: new Decimal(0),

  money: new Decimal(40),
  moneyps: new Decimal(0),

  bsandprice: new Decimal(1),
  bprice: new Decimal(1.1),

  sandprice: new Decimal(1),

  sand: new Decimal(0),
  sandcap: new Decimal(10),

  glass: new Decimal(0),
  glasscap: new Decimal(10),
  price: new Decimal(1.1),

  upgs: {
    gb: {
      current: new Decimal(1.1),
      next: new Decimal(1.2),
      inc: new Decimal(0.1),
      cost: new Decimal(300),
      cinc: 3,
    },
    buyers: {
      current: new Decimal(1),
      next: new Decimal(2),
      inc: new Decimal(1),
      cost: new Decimal(50),
      cinc: 1.8,
    },
    melters: {
      current: new Decimal(1),
      next: new Decimal(2),
      inc: new Decimal(1),
      cost: new Decimal(250),
      cinc: 1.8,
    },
    sellers: {
      current: new Decimal(1),
      next: new Decimal(2),
      inc: new Decimal(1),
      cost: new Decimal(750),
      cinc: 1.8,
    },
    scap: {
      current: new Decimal(10),
      next: new Decimal(20),
      inc: new Decimal(10),
      cost: new Decimal(150),
      cinc: 1.8,
    },
    gcap: {
      current: new Decimal(10),
      next: new Decimal(20),
      inc: new Decimal(10),
      cost: new Decimal(250),
      cinc: 1.8,
    },
    eps: {
      current: new Decimal(0),
      next: new Decimal(0.1),
      inc: new Decimal(0.1),
      cost: new Decimal(10),
      cinc: 15,
    },
  },

  ps: {
    none: new Decimal(0),
    sand: new Decimal(0),
    glass: new Decimal(0),
    sales: new Decimal(0),
  },

  mss: {
    size: 3,
    result: [],
    fixeds: [],
    mpw: new Decimal(5),
    mpcost: new Decimal(2),

    workers: new Decimal(0),

    eps: new Decimal(0),

    errors: [false, false, false],

    sel: {
      row: null,
      col: null,
    },
  },

  msd: {
    status: "available",
    size: 6,
    result: [],
    fixeds: [],

    timeleft: 3 * 60,
    timebase: 3 * 60,

    refill: 8,
    available: 10,

    tpw: 4,
    tpcost: new Decimal(500),

    errors: [false, false, false],

    sel: {
      row: null,
      col: null,
    },
  },

  msf: {
    status: "available",
    size: 9,
    result: [],
    fixeds: [],

    refill: 5,
    available: 5,
    timeleft: 1 * 60,
    timebase: 1 * 60,

    ppw: new Decimal(5),
    ppcost: new Decimal(1000),

    errors: [false, false, false],

    sel: {
      row: null,
      col: null,
    },
  },

  alloc: new Decimal(0),
  people: new Decimal(4),

  hireprice: new Decimal(50),
  rowprice: new Decimal(1250),
  colprice: new Decimal(2500),
  cbonus: new Decimal(1),

  rows: 3,
  cols: 3,

  sel: {
    row: null,
    col: null,
  },

  fixeds: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],

  workersGrid: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],

  actionGrid: [
    ["none", "none", "none"],
    ["none", "none", "none"],
    ["none", "none", "none"],
  ],
};

const gloop = () => {
  setTimeout(() => {
    updateGame();

    gloop();
    // }, gd.segtick.mul(1000).toNumber());
  }, 1000);
};

const domloop = () => {
  setTimeout(() => {
    updateDom();

    domloop();
  }, 35);
};

var autosave;
var sendstats;

const createSendStats1 = () => {
  let ob = {
    money: gd.money.tof(),
    mssEps: gd.mss.eps.tof(2),
    mssMpw: gd.mss.mpw.tof(2),
    msdTpw: gd.msd.tpw,
    msfPpw: gd.msf.ppw.tof(2),
    people: gd.people.tof(2),
    epsworkers: gd.mss.workers.tof(2),
    cols: gd.cols,
    rows: gd.rows,
  };

  // for(let up in gd.upgs) {
  //   for(let item in gd.upgs[up]) {
  //     ob[up+"_"+item] = item != "cinc" ? gd.upgs[up][item].tof(2) : gd.upgs[up][item];
  //   }
  // }

  let stat = {
    Statistics: [],
  };

  for (let item in ob) {
    stat.Statistics.push({
      StatisticsName: item,
      Version: 1,
      Value: parseFloat(ob[item]),
    });
  }

  // console.log(stat)
  return stat;
};

const createSendStats2 = () => {
  let ob = {
    msdTpcost: gd.msd.tpcost.tof(1),
    msfCost: gd.msf.ppcost.tof(1),
    avgMoney: gd.moneyps.tof(1),
    avgSand: gd.avgSand.tof(1),
    avgGlass: gd.avgGlass.tof(1),
    avgSales: gd.avgSales.tof(1),
    gprice: gd.price,
    bonus: gd.cbonus,
    prestiges: gd.pps.tof(),
    alloc: gd.alloc.tof(),
  };

  // for(let up in gd.upgs) {
  //   for(let item in gd.upgs[up]) {
  //     ob[up+"_"+item] = item != "cinc" ? gd.upgs[up][item].tof(2) : gd.upgs[up][item];
  //   }
  // }

  let stat = {
    Statistics: [],
  };

  for (let item in ob) {
    stat.Statistics.push({
      StatisticsName: item,
      Version: 1,
      Value: parseFloat(ob[item]),
    });
  }

  // console.log(stat)
  return stat;
};

const mainGame = () => {
  gloop();
  domloop();

  sendstats = setInterval(() => {
    PlayFabClientSDK.WritePlayerEvent(
      {
        EventName: "gameData",
        Body: {
          money: gd.money.tof(),
          gridWK: gd.workersGrid,
          gridAC: gd.actionGrid,
          msdEps: gd.mss.eps.tof(2),
          people: gd.people.tof(2),
          epsworkers: gd.mss.workers.tof(2),
          cols: gd.cols,
          rows: gd.rows,
          msdAvailable: gd.msd.available,
          msfAvailable: gd.msf.available,
          msdTpcost: gd.msd.tpcost.tof(1),
          msfCost: gd.msf.ppcost.tof(1),
          avgMoney: gd.moneyps.tof(1),
          avgSand: gd.avgSand.tof(1),
          avgGlass: gd.avgGlass.tof(1),
          avgSales: gd.avgSales.tof(1),
          gprice: gd.price,
          bonus: gd.cbonus,
          prestiges: gd.pps.tof(),
          alloc: gd.alloc.tof(),
        },
      },
      (res) => {}
    );

    PlayFabClientSDK.UpdateUserData(
      {
        Data: {
          money: gd.money.tof(),
          mssEps: gd.mss.eps.tof(2),
          mssMpw: gd.mss.mpw.tof(2),
          msdTpw: gd.msd.tpw,
          msfPpw: gd.msf.ppw.tof(2),
          people: gd.people.tof(2),
          epsworkers: gd.mss.workers.tof(2),
          rowxcols: gd.cols * gd.rows,
        },
        Permission: "Public",
      },
      (res) => {}
    );

    PlayFabClientSDK.UpdateUserData(
      {
        Data: {
          msdTpcost: gd.msd.tpcost.tof(1),
          msfCost: gd.msf.ppcost.tof(1),
          avgMoney: gd.moneyps.tof(1),
          avgSand: gd.avgSand.tof(1),
          avgGlass: gd.avgGlass.tof(1),
          avgSales: gd.avgSales.tof(1),
          gprice: gd.price.tof(2),
          bonus: gd.cbonus.tof(2),
          prestiges: gd.pps.tof(2),
          alloc: gd.alloc.tof(),
        },
        Permission: "Public",
      },
      (res) => {}
    );

    PlayFabClientSDK.WritePlayerEvent(
      {
        EventName: "msd",
        Body: JSON.parse(JSON.stringify(gd.msd)),
      },
      (res) => {}
    );
    PlayFabClientSDK.WritePlayerEvent(
      {
        EventName: "msf",
        Body: JSON.parse(JSON.stringify(gd.msf)),
      },
      (res) => {}
    );
    PlayFabClientSDK.WritePlayerEvent(
      {
        EventName: "mss",
        Body: JSON.parse(JSON.stringify(gd.mss)),
      },
      (res) => {}
    );

    PlayFabClientSDK.WritePlayerEvent(
      {
        EventName: "gameDataUpgrades",
        Body: {
          upgds: JSON.parse(JSON.stringify(gd.upgs)),
        },
      },
      (res) => {}
    );

    PlayFabClientSDK.UpdatePlayerStatistics(createSendStats1(), (res) => {});
    PlayFabClientSDK.UpdatePlayerStatistics(createSendStats2(), (res) => {});
  }, 30000);

  autosave = setInterval(() => {
    ssend("maxrows", gd.rows);
    ssend("maxcols", gd.cols);
    ssend("maxrowmulcols", gd.cols * gd.rows);

    savegm();
    qs(".imsg").textContent = "Autosaved";
    setTimeout(() => {
      qs(".imsg").textContent = "";
    }, 3500);
  }, 30000);
};

const getMult = () => parseInt(qs(".smult").value);

const getMult2 = (lt) => parseInt(qs(".ms" + lt + " .smult").value);

const setAct = (el) => {
  if (gd.sel.col != null) {
    gd.actionGrid[gd.sel.row][gd.sel.col] = el.value;
  }
};

const checkFix = () => gd.fixeds[gd.sel.row][gd.sel.col] == 0;

const checkFix2 = (lt) =>
  gd["ms" + lt].fixeds[gd["ms" + lt].sel.row][gd["ms" + lt].sel.col] == null;

const generate = (lt) => {
  let ms = gd["ms" + lt];

  ms.result = ssolver(gera1(ms.size))[1];
  // ms.fixeds = fxds;
  const max = ms.size;
  const maxCount =
    max == 3 ? Math.floor((2 * max * max) / 3) : Math.floor((max * max) / 2);
  // const maxCount =
  //   max == 3 ? Math.floor((2 * max * max) / 3) : 3
  let count = 0;
  while (count < maxCount) {
    let r = rdbt(0, max - 1);
    let c = rdbt(0, max - 1);
    if (ms.result[r][c] != null) {
      ms.result[r][c] = null;
      count++;
    }
  }

  ms.fixeds = _.cloneDeep(ms.result);
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const gera1 = (sz) => {
  let res = [];
  for (let i = 0; i < sz; i++) {
    let tes = [];
    if (i == 0) {
      for (let j = 0; j < sz; j++) {
        tes.push(j + 1);
      }
      tes = shuffle(tes);
    } else {
      for (let j = 0; j < sz; j++) {
        tes.push(null);
      }
    }
    res.push(tes);
  }

  // res[rdbt(0, sz - 1)][rdbt(0, sz - 1)] = rdbt(1, sz);

  return res;
};

const ssolver = (board) => {
  let nboard = _.cloneDeep(board);

  let i = 0;
  let j = 0;
  let fe = findEmpty(nboard);
  if (!fe[0]) {
    // console.log(nboard)
    return [true, nboard];
  }

  i = fe[1];
  j = fe[2];

  for (let k = 1; k <= board.length; k++) {
    // console.log(k)
    if (safe(nboard, i, j, k)) {
      // debugger;
      nboard[i][j] = k;
      let fboard = ssolver(nboard);
      if (fboard[0]) {
        return [true, fboard[1]];
      }

      nboard[i][j] = null;
    }
  }
  return [false, nboard];
};

const findEmpty = (board) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] == null) {
        return [true, i, j];
      }
    }
  }
  return [false, 0, 0];
};

const safe = (board, i, j, k) => {
  let sc = board.length == 6 ? 2 : 3;
  return (
    !usedRow(board, i, k) &&
    !usedCol(board, j, k) &&
    !usedBox(board, i - (i % sc), j - (j % 3), k)
  );
};

const usedRow = (board, i, k) => {
  for (let g = 0; g < board.length; g++) {
    if (board[i][g] == k) {
      // debugger;
      return true;
    }
  }
  return false;
};

const usedCol = (board, j, k) => {
  for (let g = 0; g < board.length; g++) {
    if (board[g][j] == k) {
      // debugger;
      return true;
    }
  }
  return false;
};

const usedBox = (board, i, j, k) => {
  if (board.length == 3) {
    return false;
  }
  let sc = board.length == 6 ? 2 : 3;
  for (let g = 0; g < sc; g++) {
    for (let h = 0; h < 3; h++) {
      if (board[g + i][h + j] == k) {
        return true;
      }
    }
  }
  return false;
};

function addToResult(row, column, val, lt) {
  gd["ms" + lt].result[row][column] = val;
  gd["ms" + lt].fixeds[row][column] = val;
  return;
}

function removeFromResult(row, column, lt) {
  gd["ms" + lt].result[row][column] = null;
  gd["ms" + lt].fixeds[row][column] = null;
  return;
}

function validate(lt) {
  const equalsColumn = equalsOnColumn(lt); // errors[0]
  const equalsRow = equalsOnRow(lt); // errors[1]
  const equalsArea = lt == "s" ? false : equalsOnArea(lt); // errors[2]

  // removeErrors();

  // if(equalsColumn) {
  //   addErrorOnItens(equalsColumn);
  // }

  // if(equalsRow) {
  //   addErrorOnItens(equalsRow);
  // }

  // if(equalsArea) {
  //   addErrorOnItens(equalsArea);
  // }
}

function equalsOnColumn(lt) {
  let equalRows = [];
  let result = gd["ms" + lt].result;
  result[0].forEach((r, i) => {
    verifyOnColumn(i, lt).forEach((k) => {
      if (!equalRows.includes(k)) {
        equalRows.push(k);
      }
    });
  });

  if (equalRows.length > 1) {
    gd["ms" + lt].errors[0] = equalRows;
  } else {
    gd["ms" + lt].errors[0] = false;
  }

  return gd["ms" + lt].errors[0];
}

function verifyOnColumn(column, lt) {
  let rows = [];
  let result = gd["ms" + lt].result;
  result.forEach((r, i) => {
    result.forEach((r2, j) => {
      const equals = r[column] === r2[column];
      const diffIndexes = i !== j;
      const notNull = r[column] != null && r2[column] != null;

      if (equals && diffIndexes && notNull) {
        rows.push(`${i}${column}`);
      }
    });
  });

  return rows;
}

function equalsOnRow(lt) {
  let equalColumns = [];
  let result = gd["ms" + lt].result;
  result.forEach((r, i) => {
    verifyRow(i, lt).forEach((j) => {
      if (!equalColumns.includes(j)) {
        equalColumns.push(j);
      }
    });
  });

  if (equalColumns.length > 1) {
    gd["ms" + lt].errors[1] = equalColumns;
  } else {
    gd["ms" + lt].errors[1] = false;
  }

  return gd["ms" + lt].errors[1];
}

function verifyRow(row, lt) {
  let columns = [];
  let result = gd["ms" + lt].result;
  result[row].forEach((c, i) => {
    result[row].forEach((c2, j) => {
      const equals = c === c2;
      const diffIndexes = i !== j;
      const notNull = c != null && c2 != null;

      if (equals && diffIndexes && notNull) {
        columns.push(`${row}${i}`);
      }
    });
  });

  return columns;
}

function equalsOnArea(lt) {
  let equalsArea = [];
  let result = gd["ms" + lt].result;
  result.forEach((r, i) => {
    r.forEach((c, j) => {
      verifyOnArea(i, j, lt).forEach((k) => {
        if (!equalsArea.includes(k)) {
          equalsArea.push(k);
        }
      });
    });
  });

  if (equalsArea.length > 1) {
    gd["ms" + lt].errors[2] = equalsArea;
  } else {
    gd["ms" + lt].errors[2] = false;
  }

  return gd["ms" + lt].errors[2];
}

function verifyOnArea(row, column, lt) {
  const QUADRANT = 3;
  const dQUADRANT = lt == "d" ? 2 : 3;
  const qRow = parseInt(row / dQUADRANT);
  const qColumn = parseInt(column / QUADRANT);
  let equals = [];
  let result = gd["ms" + lt].result;
  for (let i = 0; i < dQUADRANT; i++) {
    for (let j = 0; j < QUADRANT; j++) {
      const resRow = qRow * dQUADRANT;
      const resCol = qColumn * QUADRANT;
      const n1 = result[resRow + i][resCol + j] != null;
      const n2 = result[row][column] != null;

      if (result[resRow + i][resCol + j] === result[row][column] && n1 && n2) {
        equals.push(`${resRow + i}${resCol + j}`);
      }
    }
  }

  return equals.length > 1 ? equals : [];
}

const msinc = (lt) => {
  let ms = gd["ms" + lt];
  let mult = getMult2(lt);
  let size = ms.result[ms.sel.row][ms.sel.col] + mult;
  if (ms.sel.col != null && size <= ms.size && checkFix2(lt)) {
    ms.result[ms.sel.row][ms.sel.col] = size == 0 ? null : size;
  }
};

const msdec = (lt) => {
  let ms = gd["ms" + lt];
  let mult = getMult2(lt);
  if (ms.sel.col != null && checkFix2(lt)) {
    let size =
      ms.result[ms.sel.row][ms.sel.col] - mult < 0
        ? ms.result[ms.sel.row][ms.sel.col]
        : mult;

    ms.result[ms.sel.row][ms.sel.col] -= size;
    ms.result[ms.sel.row][ms.sel.col] =
      ms.result[ms.sel.row][ms.sel.col] == 0
        ? null
        : ms.result[ms.sel.row][ms.sel.col];
  }
};

const tinc = () => {
  let mult = getMult();
  let size = gd.workersGrid[gd.sel.row][gd.sel.col] + mult;
  if (
    gd.sel.col != null &&
    size <= Math.max(gd.cols, gd.rows) &&
    checkFix() &&
    gd.people.sub(gd.alloc).gte(mult)
  ) {
    gd.alloc = gd.alloc.add(mult);
    gd.workersGrid[gd.sel.row][gd.sel.col] = size;
  }
};

const tdec = () => {
  let mult = getMult();
  if (gd.sel.col != null && checkFix()) {
    let size =
      gd.workersGrid[gd.sel.row][gd.sel.col] - mult < 0
        ? gd.workersGrid[gd.sel.row][gd.sel.col]
        : mult;

    gd.alloc = gd.alloc.sub(size);
    gd.workersGrid[gd.sel.row][gd.sel.col] -= size;
  }
};

const winc = () => {
  let mult = parseInt(qs(".epsmult").value);
  let size = gd.mss.workers.add(mult);
  if (gd.people.sub(gd.alloc).gte(mult)) {
    gd.alloc = gd.alloc.add(mult);
    gd.mss.workers = size;
  }
};

const wdec = () => {
  let mult = parseInt(qs(".epsmult").value);
  let size = gd.mss.workers.sub(mult).lt(0) ? gd.mss.workers : mult;

  gd.alloc = gd.alloc.sub(size);
  gd.mss.workers = gd.mss.workers.sub(size);
};

const updateEps = () => {
  gd.mss.eps = gd.upgs.eps.current
    .mul(gd.mss.workers.div(5).add(1))
    .mul(gd.pps.mul(0.2).add(1));
  gd.mss.mpw = gd.mss.mpw.add(gd.mss.eps);
};

const updateGame = () => {
  gd.timenow = tim();
  gd.diff = gd.timenow - gd.timelast;

  updateEps();
  updatePs();
  checkRules();
  updateNumbs();

  updateMs();

  updateLimits();

  gd.onpres = gd.money
    .div(1e7)
    .sqrt()
    .mul(50)
    .round();

  gd.onpres = gd.onpres.greaterThanOrEqualTo(5) ? gd.onpres : new Decimal(0);

  gd.timelast = gd.timenow;
  // console.log(gd.sand.tof());
};

const clearFact = () => {
  let total = 0;

  for (let i = 0; i < gd.workersGrid.length; i++) {
    for (let j = 0; j < gd.workersGrid[i].length; j++) {
      if (gd.fixeds[i][j] == 0) {
        total += gd.workersGrid[i][j];
        gd.workersGrid[i][j] = 0;
      }
      gd.actionGrid[i][j] = "none";
    }
  }
  gd.alloc = gd.alloc.sub(total);
};

const updateLimits = () => {
  gd.msd.timeleft -= gd.diff / (1000 * 60);
  let msdRefill = gd.msd.timeleft <= 0;
  gd.msd.available = msdRefill ? gd.msd.refill : gd.msd.available;
  gd.msd.timeleft = msdRefill ? gd.msd.timebase : gd.msd.timeleft;

  gd.msf.timeleft -= gd.diff / (1000 * 60);
  let msfRefill = gd.msf.timeleft <= 0;
  gd.msf.available = msfRefill ? gd.msf.refill : gd.msf.available;
  gd.msf.timeleft = msfRefill ? gd.msf.timebase : gd.msf.timeleft;

  if (gd.msd.status == "waiting" && gd.msd.available > 0) {
    generate("d");
    gd.msd.status = "available";
  }

  if (gd.msf.status == "waiting" && gd.msf.available > 0) {
    generate("f");
    gd.msf.status = "available";
  }
};

const checkErr = (lt) => {
  let ms = gd["ms" + lt];
  return ms.errors[0] || ms.errors[1] || ms.errors[2];
};

const updateMs = () => {
  // let bds = ["s", "d", "f", "v"];
  let bds = ["s", "d", "f"];
  for (let i = 0; i < bds.length; i++) {
    let lt = bds[i];
    validate(lt);
    if (checkErr(lt)) {
      qs(".ms" + lt + " .error").classList.remove("not");
    } else {
      qs(".ms" + lt + " .error").classList.add("not");

      if (checkFull(lt)) {
        fss[lt]();
      }
    }
  }
};

const fss = {
  s() {
    addmoney(gd.mss.mpw);
    generate("s");
  },
  d() {
    if (gd.msd.status == "available") {
      gd.msd.available--;
      if (gd.msd.available <= 0) {
        gd.msd.status = "waiting";
      } else {
        generate("d");
      }
      timeTravel(gd.msd.tpw);
    }
  },
  f() {
    if (gd.msf.status == "available") {
      gd.people = gd.people.add(gd.msf.ppw);
      gd.msf.available--;
      if (gd.msf.available <= 0) {
        gd.msf.status = "waiting";
      } else {
        generate("f");
      }
    }
  },
  v() {},
};

const timeTravel = (time) => {
  let segs = time * 60;

  for (let i = 0; i < segs; i++) {
    updateGame();
  }
};

const checkFull = (lt) => {
  let ms = gd["ms" + lt];
  let check = true;

  loopcheck: for (let i = 0; i < ms.size; i++) {
    for (let j = 0; j < ms.size; j++) {
      if (ms.result[i][j] == null) {
        check = false;
        break loopcheck;
      }
    }
  }

  return check;
};

const updateNumbs = () => {
  gd.currentMoney = gd.money;

  updateSales();
  updateGlass();
  updateSand();

  gd.currentMoney = gd.money.sub(gd.currentMoney);

  gd.lastMoneys.push(gd.currentMoney);
  if (gd.lastMoneys.length > 5) {
    gd.lastMoneys.shift();
  }
  gd.moneyps = davg(gd.lastMoneys);
};

const updateSand = () => {
  let size = canbuy(gd.sandprice.mul(gd.ps.sand))
    ? gd.ps.sand
    : gd.money.div(gd.sandprice).floor();

  size = gd.sand.add(size).lte(gd.sandcap) ? size : gd.sandcap.sub(gd.sand);
  // console.log(size.tof())
  // if (gd.sand.add(size).lte(gd.sandcap)) {
  // }
  gd.avgSand = size;
  submoney(size.mul(gd.sandprice));
  gd.sand = gd.sand.add(size);
};

const updateGlass = () => {
  let size = gd.sand.gte(gd.ps.glass) ? gd.ps.glass : gd.sand;
  size = gd.glass.add(size).lte(gd.glasscap) ? size : gd.glasscap.sub(gd.glass);

  // if (gd.glass.add(size).lte(gd.glasscap)) {
  // }
  gd.sand = gd.sand.sub(size);
  gd.glass = gd.glass.add(size);
  gd.avgGlass = size;
};

const aavg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const davg = (arr) =>
  arr.reduce((a, b) => a.add(b), new Decimal(0)).div(arr.length);

const updateSales = () => {
  let size = gd.glass.gte(gd.ps.sales) ? gd.ps.sales : gd.glass;

  gd.glass = gd.glass.sub(size);
  gd.avgSales = size;
  addmoney(size.mul(gd.price));
};

const canbuy = (cost) => {
  return gd.money.greaterThanOrEqualTo(cost);
};

const addmoney = (qtd) => {
  gd.money = gd.money.add(qtd);
};

const submoney = (qtd) => {
  gd.money = gd.money.sub(qtd);
};

const updatePs = () => {
  let ps = {
    none: new Decimal(0),
    sand: new Decimal(0),
    glass: new Decimal(0),
    sales: new Decimal(0),
  };

  for (let i = 0; i < gd.workersGrid.length; i++) {
    for (let j = 0; j < gd.workersGrid[i].length; j++) {
      let act = gd.actionGrid[i][j];

      ps[act] = ps[act].add(gd.workersGrid[i][j]);
    }
  }

  ps.sand = ps.sand.mul(gd.upgs.buyers.current);
  ps.glass = ps.glass.mul(gd.upgs.melters.current);
  ps.sales = ps.sales.mul(gd.upgs.sellers.current);

  gd.ps = ps;
};

const checkRules = () => {
  //aplica o bonus direto no preço do sand e do glass
  let acts = gd.actionGrid;
  let wk = gd.workersGrid;
  let chbool = true;
  let cpoints = 0;
  let dpoints = 0;

  gd.cbonus = new Decimal(1);

  //check rows
  for (let i = 0; i < acts.length; i++) {
    if (acts[i][0] != "none" && wk[i][0] != 0) {
      chbool = true;
      let j = 1;
      while (chbool && j < acts[i].length) {
        if (acts[i][j] != acts[i][0] || wk[i][j] == 0) {
          // console.log(i,j,acts[i][j],acts[i][0],wk[i][j])

          chbool = false;
        }
        j++;
      }
      if (chbool) {
        cpoints++;
      }
    }
  }

  // console.log("cp",cpoints)
  //check cols
  for (let i = 0; i < acts[0].length; i++) {
    if (acts[0][i] != "none" && wk[0][i] != 0) {
      chbool = true;
      let j = 1;
      while (chbool && j < acts.length) {
        if (acts[j][i] != acts[0][i] || wk[j][i] == 0) {
          // console.log(i,j,acts[i][j],acts[i][0],wk[j][i])
          chbool = false;
        }
        j++;
      }
      if (chbool) {
        cpoints++;
      }
    }
  }

  // console.log("cp",cpoints)

  for (let i = 0; i < wk.length; i++) {
    if (!dupl(wk[i])) {
      dpoints++;
    }
  }

  // console.log("dp",dpoints)

  wk = _.zip(...wk);
  for (let i = 0; i < wk.length; i++) {
    if (!dupl(wk[i])) {
      dpoints++;
    }
  }
  // console.log("dp",dpoints)

  cpoints = new Decimal(1.2).pow(cpoints);
  dpoints = new Decimal(1.3).pow(dpoints);
  gd.cbonus = gd.cbonus.mul(cpoints).mul(dpoints);

  gd.cbonus = gd.cbonus.mul(gd.pps.add(1));
  // gd.cbonus = new Decimal(cpoints + dpoints);

  // gd.sandprice = gd.bsandprice.mul(gd.cbonus);
  gd.price = gd.bprice
    .sub(gd.sandprice)
    .mul(gd.cbonus)
    .add(1);
};

const upgradeGlass = () => {
  let up = gd.upgs.gb;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    gd.bprice = new Decimal(up.next);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

const upgradeGlassCap = () => {
  let up = gd.upgs.gcap;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    gd.glasscap = new Decimal(up.next);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

const upgradeSandCap = () => {
  let up = gd.upgs.scap;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    gd.sandcap = new Decimal(up.next);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

const upgradeBuyers = () => {
  let up = gd.upgs.buyers;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

const upgradeEpsec = () => {
  let up = gd.upgs.eps;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

const upgradeMelters = () => {
  let up = gd.upgs.melters;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

const upgradeSellers = () => {
  let up = gd.upgs.sellers;
  if (canbuy(up.cost)) {
    submoney(up.cost);
    up.current = new Decimal(up.next);
    up.cost = up.cost.mul(up.cinc);
    up.next = up.next.add(up.inc);
  }
};

function dupl(array) {
  let st = new Set(array);
  return st.size !== array.length || st.has(0);
}

const clearGrid = (lt) => {
  let ms = gd["ms" + lt];
  ms.result = _.cloneDeep(ms.fixeds);
};

const upgradeEarn = () => {
  if (canbuy(gd.mss.mpcost)) {
    submoney(gd.mss.mpcost);
    gd.mss.mpw = gd.mss.mpw.mul(1.1);
    gd.mss.mpcost = gd.mss.mpcost.mul(3);
  }
};

const upgradeDtime = () => {
  if (canbuy(gd.msd.tpcost)) {
    submoney(gd.msd.tpcost);
    gd.msd.tpw += 0.5;
    gd.msd.tpcost = gd.msd.tpcost.mul(10);
  }
};

const upgradeNine = () => {
  if (canbuy(gd.msf.ppcost)) {
    submoney(gd.msf.ppcost);
    gd.msf.ppw = gd.msf.ppw.add(1);
    gd.msf.ppcost = gd.msf.ppcost.mul(7);
  }
};

const gethms = (timeleft) => {
  let hour =
    Math.floor(timeleft / 60) < 10
      ? "0" + Math.floor(timeleft / 60)
      : Math.floor(timeleft / 60);
  let minute =
    Math.floor(timeleft % 60) < 10
      ? "0" + Math.floor(timeleft % 60)
      : Math.floor(timeleft % 60);
  let seconds =
    Math.floor(((timeleft % 60) - Math.floor(timeleft % 60)) * 60) < 10
      ? "0" + Math.floor(((timeleft % 60) - Math.floor(timeleft % 60)) * 60)
      : Math.floor(((timeleft % 60) - Math.floor(timeleft % 60)) * 60);

  return `${hour}:${minute}:${seconds}`;
};

const updateDom = () => {
  qs(".imon").textContent = gd.money.tof(2);

  let sele = gd.sel.col != null;

  qs(".workers").textContent = sele
    ? gd.workersGrid[gd.sel.row][gd.sel.col]
    : 0;

  qs(".iworkers").textContent = gd.alloc.tof() + "/" + gd.people.tof();
  qs(".saction").value = sele ? gd.actionGrid[gd.sel.row][gd.sel.col] : "none";

  for (let i = 0; i < gd.rows; i++) {
    for (let j = 0; j < gd.cols; j++) {
      let csel = gd.sel.row == i && gd.sel.col == j ? " cselected " : "";
      let fixed = gd.fixeds[i][j] != 0;
      let fsel = fixed ? " bfixed" : "";
      qs("#A" + getId(i, j)).textContent = fixed
        ? getFixed(i, j)
        : getWorkers(i, j);
      qs("#A" + getId(i, j)).className =
        "box bg" + gd.actionGrid[i][j] + csel + fsel;
    }
  }
  let ms = gd.mss;
  qs(".mss .numb").textContent =
    ms.sel.col != null ? ms.result[ms.sel.row][ms.sel.col] : "";
  qs(".mss .earnings").textContent = ms.mpw.tof(1);
  qs(".mss .iearncost").textContent = ms.mpcost.tof(1);
  for (let i = 0; i < ms.size; i++) {
    for (let j = 0; j < ms.size; j++) {
      let csel = ms.sel.row == i && ms.sel.col == j ? " cselected " : "";
      let fixed = ms.fixeds[i][j] != null;
      let fsel = fixed ? " zfixed" : "";
      qs("#s" + getId2(i, j, ms.size)).textContent =
        ms.result[i][j] != null ? ms.result[i][j] : "";
      qs("#s" + getId2(i, j, ms.size)).className = "box " + csel + fsel;
    }
  }
  ms = gd.msd;
  qs(".msd .numb").textContent =
    ms.sel.col != null ? ms.result[ms.sel.row][ms.sel.col] : "";
  qs(".msd .itime").textContent = r100(ms.tpw);
  qs(".msd .itpcost").textContent = ms.tpcost.tof(1);
  for (let i = 0; i < ms.size; i++) {
    for (let j = 0; j < ms.size; j++) {
      let csel = ms.sel.row == i && ms.sel.col == j ? " cselected " : "";
      let fixed = ms.fixeds[i][j] != null;
      let fsel = fixed ? " zfixed" : "";
      qs("#d" + getId2(i, j, ms.size)).textContent =
        ms.result[i][j] != null ? ms.result[i][j] : "";
      qs("#d" + getId2(i, j, ms.size)).className = "box " + csel + fsel;
    }
  }
  qs(".davailable").textContent = ms.available + "/" + ms.refill;
  qs(".dtimeleft").textContent = gethms(ms.timeleft);

  ms = gd.msf;
  qs(".msf .numb").textContent =
    ms.sel.col != null ? ms.result[ms.sel.row][ms.sel.col] : "";
  qs(".msf .ippw").textContent = ms.ppw.tof();
  qs(".msf .ippcost").textContent = ms.ppcost.tof();
  for (let i = 0; i < ms.size; i++) {
    for (let j = 0; j < ms.size; j++) {
      let csel = ms.sel.row == i && ms.sel.col == j ? " cselected " : "";
      let fixed = ms.fixeds[i][j] != null;
      let fsel = fixed ? " zfixed" : "";
      qs("#f" + getId2(i, j, ms.size)).textContent =
        ms.result[i][j] != null ? ms.result[i][j] : "";
      qs("#f" + getId2(i, j, ms.size)).className = "box " + csel + fsel;
    }
  }
  qs(".favailable").textContent = ms.available + "/" + ms.refill;
  qs(".ftimeleft").textContent = gethms(ms.timeleft);

  // ms = gd.msv;
  // qs(".msv .numb").textContent = ms.sel.col != null ? ms.result[ms.sel.row][ms.sel.col]: "";
  // for (let i = 0; i < ms.size; i++) {
  //   for (let j = 0; j < ms.size; j++) {
  //     let csel = ms.sel.row == i && ms.sel.col == j ? " cselected " : "";
  //     let fixed = ms.fixeds[i][j] != null;
  //     let fsel = fixed ? " bfixed" : "";
  //     qs("#v" + getId2(i, j, ms.size)).textContent =
  //       ms.result[i][j] != null ? ms.result[i][j] : "";
  //     qs("#v" + getId2(i, j, ms.size)).className = "box " + csel + fsel;
  //   }
  // }

  qs(".ihireprice").textContent = gd.hireprice.tof(1);
  qs(".irowprice").textContent = gd.rowprice.tof(1);
  qs(".icolprice").textContent = gd.colprice.tof(1);

  qs(".ibonus").textContent = gd.cbonus.tof(1);

  qs(".imonps").textContent =
    gd.moneyps.tof(2) + ` (${gd.avgSales.tof()} sales/sec)`;
  qs(".iprice").textContent = gd.price.tof(2);
  qs(".isandprice").textContent = gd.sandprice.tof(2);
  // qs(".iglassps").textContent = gd.ps.glass.tof();
  // qs(".isandps").textContent = gd.ps.sand.tof();
  // qs(".isalesps").textContent = gd.ps.sales.tof();
  qs(".isand").textContent =
    gd.sand.tof() + "/" + gd.sandcap.tof() + ` (${gd.avgSand.tof()} p/sec)`;
  qs(".iglass").textContent =
    gd.glass.tof() + "/" + gd.glasscap.tof() + ` (${gd.avgGlass.tof()} p/sec)`;

  qs(".gbprice").textContent = gd.upgs.gb.current.tof(1);
  qs(".gbuprice").textContent = gd.upgs.gb.cost.tof(1);
  qs(".gbup").textContent = gd.upgs.gb.next.tof(1);

  qs(".brate").textContent = gd.upgs.buyers.current.tof(1);
  qs(".bratenext").textContent = gd.upgs.buyers.next.tof(1);
  qs(".brateprice").textContent = gd.upgs.buyers.cost.tof(1);

  qs(".iscap").textContent = gd.upgs.scap.current.tof(1);
  qs(".iscapnext").textContent = gd.upgs.scap.next.tof(1);
  qs(".iscapprice").textContent = gd.upgs.scap.cost.tof(1);

  qs(".igcap").textContent = gd.upgs.gcap.current.tof(1);
  qs(".igcapnext").textContent = gd.upgs.gcap.next.tof(1);
  qs(".igcapprice").textContent = gd.upgs.gcap.cost.tof(1);

  qs(".mrate").textContent = gd.upgs.melters.current.tof(1);
  qs(".mratenext").textContent = gd.upgs.melters.next.tof(1);
  qs(".mrateprice").textContent = gd.upgs.melters.cost.tof(1);

  qs(".srate").textContent = gd.upgs.sellers.current.tof(1);
  qs(".sratenext").textContent = gd.upgs.sellers.next.tof(1);
  qs(".srateprice").textContent = gd.upgs.sellers.cost.tof(1);

  qs(".epsec").textContent = gd.upgs.eps.current.tof(1);
  qs(".epsecnext").textContent = gd.upgs.eps.next.tof(1);
  qs(".epsecprice").textContent = gd.upgs.eps.cost.tof(1);

  qs(".mseps").textContent = gd.mss.eps.gt(0)
    ? gd.mss.eps.tof(2)
    : "0 (go to upgrades tab,last item)";
  qs(".epsworkers").textContent = gd.mss.workers.tof();

  qs(".value.pp").textContent = gd.onpres.tof();
  qs(".value.cpp").textContent = gd.pps.tof();
};

const buyRow = () => {
  if (canbuy(gd.rowprice)) {
    submoney(gd.rowprice);
    gd.rowprice = gd.rowprice.mul(12);
    gd.rows++;
    let wrow = [];
    let frow = [];
    let arow = [];
    qs("#game-board").style.gridTemplateRows = "repeat(" + gd.rows + ",50px)";

    for (let i = 0; i < gd.cols; i++) {
      wrow.push(0);
      frow.push(0);
      arow.push("none");
    }

    gd.workersGrid.push(wrow);

    gd.fixeds.push(frow);
    gd.actionGrid.push(arow);

    qs("#game-board").innerHTML = createBoard(gd.rows * gd.cols);
    cache = {};
  }
};

const buyCol = () => {
  if (canbuy(gd.colprice)) {
    submoney(gd.colprice);
    gd.colprice = gd.colprice.mul(12);
    gd.cols++;
    qs("#game-board").style.gridTemplateColumns =
      "repeat(" + gd.cols + ",50px)";

    for (let i = 0; i < gd.rows; i++) {
      gd.workersGrid[i].push(0);
      gd.fixeds[i].push(0);
      gd.actionGrid[i].push("none");
    }

    qs("#game-board").innerHTML = createBoard(gd.rows * gd.cols);
    cache = {};
  }
};

const hireWorker = () => {
  if (canbuy(gd.hireprice)) {
    submoney(gd.hireprice);
    var rest = true;
    var hireinc = new Decimal(1);
    var ct = 3;
    while (rest) {
      var it = ((ct * (ct + 1)) / 2) * ct;

      rest = gd.people.gte(it);

      ct++;
    }
    ct--;
    var it1 = ((ct * (ct + 1)) / 2) * ct;
    ct--;
    var it2 = ((ct * (ct + 1)) / 2) * ct;
    var tey = it1 - it2 + 2;
    ct--;

    var waste = gd.rowprice
      .add(gd.colprice)
      .mul(12 ** ct)
      .div(gd.rowprice.add(gd.colprice).mul(12 ** (ct - 1)));

    hireinc = waste.pow(1 / tey);

    gd.hireprice = gd.hireprice.mul(hireinc);
    gd.people = gd.people.add(1);
  }
};

const savegm = () => {
  var job = JSON.stringify(gd);
  job = LZString.compressToUTF16(job);
  localStorage.setItem("isf1", job);
};

const loadgm = () => {
  let svstr = "isf1";
  if (localStorage.getItem(svstr) != null) {
    var job = LZString.decompressFromUTF16(localStorage.getItem(svstr));
    job = JSON.parse(job);
    job = toDec(job, gdbase);
    job.lastMoneys = [];

    job.avgSales = new Decimal(0);
    job.avgGlass = new Decimal(0);
    job.avgSand = new Decimal(0);

    gd = job;

    qs("#game-board").style.gridTemplateRows = "repeat(" + gd.rows + ",50px)";
    qs("#game-board").style.gridTemplateColumns =
      "repeat(" + gd.cols + ",50px)";
    qs("#game-board").innerHTML = createBoard(gd.rows * gd.cols);
    cache = {};

    let mbefore = new Decimal(gd.money);

    gd.timenow = tim();
    let diff = gd.timenow - gd.timelast;

    if (diff / (1000 * 60) < 5) {
      timeTravel(diff / (1000 * 60));
    } else {
      timeTravel(5);
      addmoney(gd.moneyps.mul(diff / 1000 - 5 * 60));
    }

    let mafter = gd.money;
    var extra = mafter.sub(mbefore);

    $(".offearn").text("You earned $ " + extra.tof(2) + " when offline.");

    gd.timelast = gd.timenow;

    firstrun = false;
  }
};

const prestige = () => {
  if (confirm("Are you sure you want to prestige?")) {
    let pps = gd.pps;
    let onpres = gd.onpres;
    gd = _.cloneDeep(gdbase);
    qs(".nbody").innerHTML = baseHtml;
    gd.pps = pps.add(onpres);

    cache = {};

    createGame();

    $(".menu .item").tab({ context: "parent" });
  }
};

const toDec = (job, ob) => {
  for (k in ob) {
    if (ob[k] instanceof Decimal) {
      // console.log(ob);
      job[k] = new Decimal(job[k]);
    } else if (typeof ob[k] == "object") {
      job[k] = toDec(job[k], ob[k]);
    }
  }

  return job;
};
