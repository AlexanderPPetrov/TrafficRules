var Map, hideLevel, showLevel;
Map = (function() {
  function Map(width, height, depth) {
    var carved, cell, cells, dir, index, nx, ny, nz, x, y, z, _i, _len, _ref;
    this.width = width;
    this.height = height;
    if(!depth) depth = 1;
    this.depth = depth;
    this.grid = (function() {
      var _ref, _results;
      _results = [];
      for (z = 1, _ref = this.depth; 1 <= _ref ? z <= _ref : z >= _ref; 1 <= _ref ? z++ : z--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (y = 1, _ref2 = this.height; 1 <= _ref2 ? y <= _ref2 : y >= _ref2; 1 <= _ref2 ? y++ : y--) {
            _results2.push((function() {
              var _ref3, _results3;
              _results3 = [];
              for (x = 1, _ref3 = this.width; 1 <= _ref3 ? x <= _ref3 : x >= _ref3; 1 <= _ref3 ? x++ : x--) {
                _results3.push(0);
              }
              return _results3;
            }).call(this));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    }).call(this);
    cells = [
      {
        x: this.rand(this.width),
        y: this.rand(this.height),
        z: this.rand(this.depth)
      }
    ];
    while (cells.length > 0) {
      index = this.rand(2) === 0 ? this.rand(cells.length) : cells.length - 1;
      cell = cells[index];
      carved = false;
      _ref = this.randomDirections();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dir = _ref[_i];
        nx = cell.x + Map.dx[dir];
        ny = cell.y + Map.dy[dir];
        nz = cell.z + Map.dz[dir];
        if (nx >= 0 && ny >= 0 && nz >= 0 && nx < this.width && ny < this.height && nz < this.depth && this.grid[nz][ny][nx] === 0) {
          this.grid[cell.z][cell.y][cell.x] |= dir;
          this.grid[nz][ny][nx] |= Map.opposite[dir];
          cells.push({
            x: nx,
            y: ny,
            z: nz
          });
          carved = true;
          break;
        }
      }
      if (!carved) {
        cells.splice(index, 1);
      }
    }
    this.grid[0][0][0] |= Map.W;
    this.grid[this.depth - 1][this.height - 1][this.width - 1] |= Map.E;
  }
  Map.prototype.isNorth = function(x, y, z) {
    return (this.grid[z][y][x] & Map.N) === Map.N;
  };
  Map.prototype.isSouth = function(x, y, z) {
    return (this.grid[z][y][x] & Map.S) === Map.S;
  };
  Map.prototype.isEast = function(x, y, z) {
    return (this.grid[z][y][x] & Map.E) === Map.E;
  };
  Map.prototype.isWest = function(x, y, z) {
    return (this.grid[z][y][x] & Map.W) === Map.W;
  };
  Map.prototype.isUp = function(x, y, z) {
    return (this.grid[z][y][x] & Map.U) === Map.U;
  };
  Map.prototype.isDown = function(x, y, z) {
    return (this.grid[z][y][x] & Map.D) === Map.D;
  };
  Map.prototype.rand = function(n) {
    return Math.floor(Math.random() * n);
  };
  Map.prototype.randomDirections = function() {
    var i, j, list, _ref;
    list = Map.List.slice(0);
    i = list.length - 1;
    while (i > 0) {
      j = this.rand(i + 1);
      _ref = [list[j], list[i]], list[i] = _ref[0], list[j] = _ref[1];
      i--;
    }
    return list;
  };
  Map.prototype.generateMap = function( ) {


      var cell, className, eastClass, html, row1, row2, southClass, x, y, z, _ref, _ref2, _ref3, _ref4;

      for (z = 0, _ref = this.depth; 0 <= _ref ? z < _ref : z > _ref; 0 <= _ref ? z++ : z--) {


          for (x = 0, _ref2 = this.width * 2 + 1; 0 <= _ref2 ? x < _ref2 : x > _ref2; 0 <= _ref2 ? x++ : x--) {
            //  createBox(x,0);
          }

          for (y = 0, _ref3 = this.height; 0 <= _ref3 ? y < _ref3 : y > _ref3; 0 <= _ref3 ? y++ : y--) {
              className = this.isWest(0, y, z) ? "road" : "block";

              row1 = "<div class='r'><div class='" + className + "'></div>";

              row2 = "<div class='r'><div class='block'></div>";

              for (x = 0, _ref4 = this.width; 0 <= _ref4 ? x < _ref4 : x > _ref4; 0 <= _ref4 ? x++ : x--) {
                  eastClass = this.isEast(x, y, z) ? "road" : "block";
                  southClass = this.isSouth(x, y, z) ? "road" : "block";
                  cell = "<div class='road'>";
                  cell += "<div class='" + (this.isUp(x, y, z) ? 'u' : 'h') + "'></div>";
                  cell += "<div class='" + (this.isDown(x, y, z) ? 'd' : 'h') + "'></div>";
                  cell += "</div>";
                  row1 += "" + cell + "<div class='" + eastClass + "'></div>";
                  row2 += "<div class='" + southClass + "'></div><div class='block'></div>";
              }
              html += row1 + "</div>\n" + row2 + "</div>\n";
          }
          html += "\n</div>\n";
      }
      return html;


  };


    Map.prototype.toHTML = function() {
        var cell, className, eastClass, html, row1, row2, southClass, x, y, z, _ref, _ref2, _ref3, _ref4;
        html = "";
        for (z = 0, _ref = this.depth; 0 <= _ref ? z < _ref : z > _ref; 0 <= _ref ? z++ : z--) {
            html += "<div class='blockMap' id='level_" + z + "'";
            if (z > 0) {
                html += " style='display: none;'";
            }

            html += "</div>\n<div class='r'>";
            for (x = 0, _ref2 = this.width * 2 + 1; 0 <= _ref2 ? x < _ref2 : x > _ref2; 0 <= _ref2 ? x++ : x--) {
                html += "<div class='block'></div>";
            }
            html += "</div>\n";
            for (y = 0, _ref3 = this.height; 0 <= _ref3 ? y < _ref3 : y > _ref3; 0 <= _ref3 ? y++ : y--) {
                className = this.isWest(0, y, z) ? "road" : "block";
                row1 = "<div class='r'><div class='" + className + "'></div>";
                row2 = "<div class='r'><div class='block'></div>";
                for (x = 0, _ref4 = this.width; 0 <= _ref4 ? x < _ref4 : x > _ref4; 0 <= _ref4 ? x++ : x--) {
                    eastClass = this.isEast(x, y, z) ? "road" : "block";
                    southClass = this.isSouth(x, y, z) ? "road" : "block";
                    cell = "<div class='road'>";
                    cell += "<div class='" + (this.isUp(x, y, z) ? 'u' : 'h') + "'></div>";
                    cell += "<div class='" + (this.isDown(x, y, z) ? 'd' : 'h') + "'></div>";
                    cell += "</div>";
                    row1 += "" + cell + "<div class='" + eastClass + "'></div>";
                    row2 += "<div class='" + southClass + "'></div><div class='block'></div>";
                }
                html += row1 + "</div>\n" + row2 + "</div>\n";
            }
            html += "\n</div>\n";
        }
        return html;
    };

  return Map;
})();
Map.N = 1;
Map.S = 2;
Map.E = 4;
Map.W = 8;
Map.U = 16;
Map.D = 32;
Map.List = [1, 2, 4, 8, 16, 32];
Map.dx = {
  1: 0,
  2: 0,
  4: 1,
  8: -1,
  16: 0,
  32: 0
};
Map.dy = {
  1: -1,
  2: 1,
  4: 0,
  8: 0,
  16: 0,
  32: 0
};
Map.dz = {
  1: 0,
  2: 0,
  4: 0,
  8: 0,
  16: 1,
  32: -1
};
Map.opposite = {
  1: 2,
  2: 1,
  4: 8,
  8: 4,
  16: 32,
  32: 16
};
Map.generate = function(id, width, height, depth) {
  var element;
  element = document.getElementById(id);
  element.innerHTML = new Map(width, height, depth).toHTML();


  return element;
};

Map.getMapMatrix = function(rowCount, colCount){

    var map = new Map((colCount-1)*0.5, (rowCount-1)*0.5).toHTML();
    var mapMatrix = [];

    var $tiles = $(map).find('.road, .block');
    var tilesIndex = 0;
    for (var i = 0; i < rowCount; i++) {
        mapMatrix[i] = [];
        for (var j = 0; j < colCount; j++) {
            if ($($tiles[tilesIndex]).hasClass('block')) {
                mapMatrix[i][j] = 0;
            } else mapMatrix[i][j] = 1;

            tilesIndex++;
        }
    }

    return mapMatrix;
}


showLevel = function(z) {
  var element;
  element = document.getElementById("level_" + z);
  return element.style.display = "inline";
};
hideLevel = function(z) {
  var element;
  element = document.getElementById("level_" + z);
  return element.style.display = "none";
};