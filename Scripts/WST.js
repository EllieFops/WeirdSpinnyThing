/**
 * Good god, don't look here, this was not actually meant to be a game when i started it and has devolved into a silly
 * mess of horrifying garbage.
 */

(function () {

  var colorSpeed = 2;
  var rotationSpeed = 10;
  var movementSpeed = 8;

  var squares = {
    size: 10,
    border: 10,
    count: 6
  };

  var currentKeys = {};
  var bx = 0, by = 0, tx, ty;
  var rot = 0;
  var Keys = EFEditor.Utils.Keyboard;
  var running;
  var intervalProc;
  var d = document.getElementById('report');

  var groups = {
    1: {invertX: false, invertY: false},
    2: {invertX: true, invertY: false},
    3: {invertX: false, invertY: true},
    4: {invertX: true, invertY: true}
  };

  var body = document.getElementsByTagName('body')[0];

  body.addEventListener('keydown', function(event) {currentKeys[event.keyCode]=true;start();});
  body.addEventListener('keyup', function(event) {currentKeys[event.keyCode] = false;});

  tx = window.innerWidth;
  ty = window.innerHeight;

  function init() {
    groups[1].elements = spawn(squares.count);
    groups[2].elements = spawn(squares.count);
    groups[3].elements = spawn(squares.count);
    groups[4].elements = spawn(squares.count);
  }

  init();

  function spawn(num) {
    var i, t, rm, rp, rt;
    rt = [];
    rp = Math.floor(90 / num);
    rm = 1 / (num * 1.5);
    for (i = 0; i < num; i++) {
      t = d.cloneNode(false);
      body.appendChild(t);
      t.style.setProperty('display', 'block');
      t.style.setProperty('transform', 'rotate(' + (rp * i) + 'deg)');
      rt.push(
        {
          el: t,
          rp: rp * (i + 1),
          rm: rm * (i + 1),
          cs: window.getComputedStyle(t)
        }
      );
    }
    return rt
  }

  /**
   * Crappy Check to see if the keyboard controls are pushing up or to the right.
   *
   * Going clockwise N -> SE are "Forward" and S -> NW are going "Backward"
   *
   * @returns {boolean}
   */
  function isMovingForward() {
    var
      n = currentKeys[Keys.KEY_W],
      s = currentKeys[Keys.KEY_S],
      e = currentKeys[Keys.KEY_D],
      w = currentKeys[Keys.KEY_A],
      se = (s && e && !w),
      ne = (n && e && !s && !w);
    n = (n && !e && !s && !w);
    e = (e && !n && !s && !w);
    return ((n || ne || e || se));
  }

  /**
   * Are any of the direction control keys pressed
   *
   * @returns {boolean}
   */
  function isWASD() {
    return (currentKeys[Keys.KEY_W] || currentKeys[Keys.KEY_A] || currentKeys[Keys.KEY_S] || currentKeys[Keys.KEY_D]);
  }

  /**
   * Loop! It's a Loop!
   *
   * Yes I know this is a horrible excuse for a game loop, but this was never meant to be a 'game' and I will fix it
   * eventually... probably.
   */
  function loop() {
    if (currentKeys[Keys.KEY_ESC]) {
      running = false;
    }
    rotateBlocks();
    colorShift();
    move();
    if (!running) {
      clearInterval(intervalProc);
    }
  }

  function start() {
    if (!running && isWASD()) {
      running = true;
      intervalProc = setInterval(loop, 16);
    }
  }

  function colorShift() {
    var a, b, c, rgb, w, x, y, z;
    a = groups['1'].elements[0].cs.borderColor;
    w = a.match(/^rgb\((\d+), (\d+), (\d+)\)/) || a.match(/^#(\d{6}|\d{3})/);
    if (!w) {return;}
    if (w[0].indexOf('rgb') != -1) {
      x = parseInt(w[1]);
      y = parseInt(w[2]);
      z = parseInt(w[3]);
    } else if (w[0].indexOf('#') != -1) {
      b = w[0].length == 4 ? 1 : 2;
      x = parseInt('0x' + w[0].substr(1,b));
      y = parseInt('0x' + w[0].substr(1+b,b));
      z = parseInt('0x' + w[0].substr(1+b+b,b));
    } else {
      return;
    }
    if (z < 255 && colorSpeed > 0 || z > 0 && colorSpeed < 0) {
      z += colorSpeed;
      z = (z < 0) ? 0 : z;
      z = (z > 255) ? 255 : z;
    } else if (y < 255 && colorSpeed > 0 || y > 0 && colorSpeed < 0) {
      y += colorSpeed;
      y = (y < 0) ? 0 : y;
      y = (y > 255) ? 255 : y;
    } else if (x < 255 && colorSpeed > 0 || x > 0 && colorSpeed < 0) {
      x += colorSpeed;
      x = (x < 0) ? 0 : x;
      x = (x > 255) ? 255 : x;
    } else {
      colorSpeed = -colorSpeed;
    }
    rgb = 'rgb(' + x + ', ' + y + ', ' + z + ')';
    for (var g in groups) {
      if (!groups.hasOwnProperty(g)) {
        continue;
      }
      g = groups[g].elements;
      c = g.length;
      for (var i = 0; i < c; i++) {
        g[i].el.style.setProperty('border-color', rgb);
      }
    }
    x = Math.abs(x - 255);
    y = Math.abs(y - 255);
    z = Math.abs(z - 255);
    body.style.backgroundColor = 'rgb(' + x + ', ' + y + ', ' + z + ')';
  }

  function rotateBlocks() {
    var a, b, i, c;
    rot += (isMovingForward()) ? rotationSpeed : -rotationSpeed;
    if (rot > 360) {
      rot -= 360;
    } else if (rot < -360) {
      rot += 360;
    }
    for (var g in groups) {
      if (!groups.hasOwnProperty(g)) {
        continue;
      }
      g = groups[g].elements;
      c = g.length;
      for (i = 0; i < c; i++) {
        a = rot * g[i].rm + g[i].rp;
        g[i].el.style.setProperty('transform', 'rotate(' + (Math.round(a*10) / 10) + 'deg)');
      }
    }
  }

  function move() {
    var m, e, u, d, r, l, i, c, ix, iy, q, t, s, x;
    u = currentKeys[Keys.KEY_W];
    d = currentKeys[Keys.KEY_S];
    r = currentKeys[Keys.KEY_D];
    l = currentKeys[Keys.KEY_A];
    m = movementSpeed;
    for (var g in groups) {

      if (!groups.hasOwnProperty(g)) {continue;}

      g = groups[g];
      e = g.elements;
      c = e.length;
      s = window.getComputedStyle(e[0].el);
      t = (s.top  == '50%') ? ty / 2 : parseInt(s.top);
      q = (s.left == '50%') ? tx / 2 : parseInt(s.left);
      ix = g.invertX;
      iy = g.invertY;

      if (u || d) {
        if (u && !iy || d && iy) {
          x = t - m;
          if (x < by) {
            x = ty;
          }
        } else if (d && !iy || u && iy) {
          x = t + m;
          if (x > ty) {
            x = by;
          }
        }

        x = x.toString() + 'px';
        for (i = 0; i < c; i++) {
          e[i].el.style.setProperty('top', x);
        }
      }

      if (r || l) {
        if (l && !ix || r && ix) {
          x = q - m;
          if (x < bx) {
            x = tx;
          }
        } else if (r && !ix || l && ix) {
          x = q + m;
          if (x > tx) {
            x = bx;
          }
        }
        c = g.elements.length;
        x = x.toString() + 'px';
        for (i = 0; i < c; i++) {
          e[i].el.style.setProperty('left', x);
        }
      }
    }
  }
})();

