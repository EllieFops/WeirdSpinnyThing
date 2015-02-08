(function ()
{
  var config = {

    // General Configuration
    colorSpeed: 1,
    rotationSpeed: 8,
    movementSpeed: 6,

    spinners: {
      size: 20,
      count: 3,
      border: {
        size: 10,
        style: 'dotted'
      }
    },

    tx: window.innerWidth,
    ty: window.innerHeight,
    vX: window.scrollX,
    vY: window.scrollY
  };

  var Keyboard = {
    KEY_ESC: 27,
    KEY_0:   48,
    KEY_1:   49,
    KEY_2:   50,
    KEY_3:   51,
    KEY_4:   52,
    KEY_5:   53,
    KEY_6:   54,
    KEY_7:   55,
    KEY_8:   56,
    KEY_9:   57,
    KEY_A:   65,
    KEY_D:   68,
    KEY_S:   83,
    KEY_W:   87,

    KEY_ARROW_LEFT:  37,
    KEY_ARROW_RIGHT: 39,
    KEY_ARROW_UP:    38,
    KEY_ARROW_DOWN:  40,
    KEY_SPACE:       32
  };
  var currentKeys = {};

  var isRunning = false;

  var groups = {};

  var intervalProcess;

  var body;

  /**
   * Color Block
   *
   * @param r {int} Red Value (0-255)
   * @param g {int} Green Value (0-255)
   * @param b {int} Blue Value (0-255)
   * @constructor
   */
  var ColorBlock = function(r, g, b)
  {
    var self = this;
    var rValue = r;
    var gValue = g;
    var bValue = b;
    self.getColorRValue = function() {return rValue};
    self.getColorGValue = function() {return gValue};
    self.getColorBValue = function() {return bValue};
    self.getRGBString = function () {return 'rgb(' + rValue + ', ' + gValue + ', ' + bValue + ')';};
    self.setColor = function(r, g, b) {rValue = r;gValue = g;bValue = b;};
  };

  var Container = function(e, c)
  {
    var self = this;
    var element = e;
    this.colorValue = c;

    e.style.setProperty('background-image', 'none', null);

    self.addSpinner = function(s)
    {
      if (!s instanceof SpinElement) {return false;}
      e.appendChild(s.getElement());
      return true;
    };
    self.getElement = function ()
    {
      return element;
    };
  };

  /**
   * Spinner
   *
   * @constructor
   *
   * @param n  {string}     Name or Title of this spinner.
   * @param x  {number}     Starting X position.
   * @param y  {number}     Starting Y position.
   * @param c  {ColorBlock} Color tracker.
   * @param xi {boolean}    Is X Movement inverted.
   * @param yi {boolean}    Is Y Movement inverted.
   */
  var Spinner = function Spinner(n, x, y, c, xi, yi)
  {
    var self = this;
    var name = n;
    var xInverted = xi == true;
    var yInverted = yi == true;
    var xPos = x;
    var yPos = y;
    var rotation = 0;
    var elements = [];

    this.colorValue = (c instanceof ColorBlock) ? c : null;

    self.move = function (x, y)
    {
      x = (xInverted) ? -x : x;
      y = (yInverted) ? -y : y;
      xPos += x * config.movementSpeed;
      yPos += y * config.movementSpeed;
    };

    self.getName = function () {return name;};
    self.setName = function (s) {name = s;};
    self.getXPos = function () {return xPos};
    self.getYPos = function () {return yPos};
    self.setXPos = function (x) {xPos=x};
    self.setYPos = function (y) {yPos=y};
    self.getRotation = function () {return rotation};
    self.setRotation = function (r) {rotation = r};
    self.rotate = function (n, r) {
      var a, c, i;
      a = n * config.rotationSpeed;
      rotation = (r) ? rotation-a : rotation+a;
      if (rotation > 360) {rotation-=360} else if (rotation < 0) {rotation+=360}
      c = elements.length;
      for (i = 0; i < c; i++) {
        elements[i].rotate(r);
      }
    };
    self.isXInverted = function () {return xInverted;};
    self.setXInverted = function (b) {xInverted = b == true;};
    self.isYInverted = function () {return yInverted;};
    self.setYInverted = function (b) {yInverted = b == true;};
    self.addElement = function (e)
    {
      if (!e instanceof SpinElement) {return false;}
      elements.push(e);
      e.setParent(this);
      return true;
    };
    self.getElementAt = function (i)
    {
      if (!elements[i]) {return null;}
      return elements[i]
    };
    self.indexOf = function (e)
    {
      if (!e instanceof HTMLElement) {return -1;}
      return elements.indexOf(e)
    };
    self.getElementCount = function () {return elements.length};
    self.removeElement = function (e)
    {
      var a;
      if (!e instanceof HTMLElement) {
        a = parseInt(e) || elements.length;
        if (!elements[a]) {
          return false;
        } else {
          elements.splice(a, 1);
          return true;
        }
      }
      a = elements.indexOf(e);
      if (a == -1) {
        return false;
      } else {
        elements.splice(a, 1);
      }
    }
  };

  /**
   * Spin Element
   *
   * @param e {HTMLElement} Backing DOM element.
   * @param p {number}      Rotation position modifier.
   * @param s {number}      Rotation speed modifier
   *
   * @constructor
   */
  var SpinElement = function (e, p, s)
  {
    var self = this;
    var element = e;
    var degreeMod = p;
    var speedMod = s;
    var cStyle = null;
    var rotation = 0;
    var parent;

    self.getCalcStyle = function () {if(!cStyle){cStyle = window.getComputedStyle(element)} return cStyle};
    self.getElement = function () {return element};
    self.getRotationDegreeModifier = function () {return degreeMod};
    self.getRotationSpeedModifier = function () {return speedMod};
    self.getRotation = function () {return rotation;};
    self.getParent = function () {return parent};
    self.setParent = function (p) {parent = p;};
    self.rotate = function (r)
    {
      var a = (parent.getRotation() * speedMod) + degreeMod;
      rotation = (r) ? -a : a;
      if (rotation > 360) {rotation -= 360} else if (rotation < 0) {rotation+=360}
    }
  };

  function init()
  {
    body = new Container(document.getElementsByTagName('body')[0], new ColorBlock(0,0,0));
    body.getElement().addEventListener(
      'keydown', function (event)
      {
        currentKeys[event.keyCode] = true;
        start();
        clearKeyPress(event)
      }
    );
    body.getElement().addEventListener('keyup', function (event) {currentKeys[event.keyCode] = false;});
    body.getElement().addEventListener('scroll', function () {config.vX = window.scrollX; config.vY=window.scrollY});


    var hX, hY;
    hX = Math.floor(config.tx / 2);
    hY = Math.floor(config.ty / 2);

    groups[1] = new Spinner('mouse', hX, hY, new ColorBlock(255, 255, 255), false, false);
    groups[2] = new Spinner('invx', hX, hY, new ColorBlock(255, 255, 255), true, false);
    groups[3] = new Spinner('invy', hX, hY, new ColorBlock(255, 255, 255), false, true);
    groups[4] = new Spinner('invb', hX, hY, new ColorBlock(255, 255, 255), true, true);

    spawn(groups[1], config.spinners.count);
    spawn(groups[2], config.spinners.count);
    spawn(groups[3], config.spinners.count);
    spawn(groups[4], config.spinners.count);
  }

  function spawn(s, num)
  {
    var a, d, i, t, rm, rp, rt, m;
    if (!s instanceof Spinner) {return false;}
    rp = Math.floor(90 / num);
    rm = 1 / num * 1.5;

    d = document.createElement('div');
    m = -Math.floor((config.spinners.size + (config.spinners.border.size * 2))/2);
    d.style.setProperty('width',        config.spinners.size + 'px',               null);
    d.style.setProperty('height',       config.spinners.size + 'px',               null);
    d.style.setProperty('border-style', config.spinners.border.style,              null);
    d.style.setProperty('border-width', config.spinners.border.size + 'px',        null);
    d.style.setProperty('position',     'fixed',                                   null);
    d.style.setProperty('top',          Math.floor(config.ty/2) + 'px',            null);
    d.style.setProperty('left',         Math.floor(config.tx/2) + 'px',            null);
    d.style.setProperty('margin-left',  m + 'px', null);
    d.style.setProperty('margin-top',   m + 'px', null);

    for (i = 0; i < num; i++) {
      rt = s.getName() + '_' + i;

      t = d.cloneNode(false);
      t.setAttribute('id', rt);
      t.style.setProperty('display', 'block', null);
      addRotateTransform(t, (rp * i));

      a = new SpinElement(t, rp*(i+1), rm*(i+1));
      s.addElement(a);
      if (!body.addSpinner(a)) {console.log("Did not add spinner to container.", a, body);}
    }
    return true;
  }

  function start()
  {
    if (!isRunning && isControlKeyPressed()) {
      isRunning = true;
      intervalProcess = setInterval(loop, 16);
    }
  }

  /**
   * Primary Game Loop
   */
  function loop()
  {
    if (currentKeys[Keyboard.KEY_ESC]) {
      isRunning = false;
    }
    update();
    render();
    if (!isRunning) {
      clearInterval(intervalProcess);
    }
  }

  function update()
  {
    var c, g, i, x, y;
    for (g in groups) {

      if (!groups.hasOwnProperty(g)) {
        continue;
      }

      g = groups[g];

      if (isControlKeyPressed()) {
        if (currentKeys[Keyboard.KEY_W] || currentKeys[Keyboard.KEY_ARROW_UP]) {
          g.move(0, 1);
        }
        if (currentKeys[Keyboard.KEY_S] || currentKeys[Keyboard.KEY_ARROW_DOWN]) {
          g.move(0, -1);
        }
        if (currentKeys[Keyboard.KEY_A] || currentKeys[Keyboard.KEY_ARROW_LEFT]) {
          g.move(-1, 0);
        }
        if (currentKeys[Keyboard.KEY_D] || currentKeys[Keyboard.KEY_ARROW_RIGHT]) {
          g.move(1, 0);
        }

        // Reset ("bounce" effect)
        x = g.getXPos();
        y = g.getYPos();
        if (x > config.tx) {
          g.setXPos(x-config.tx);
        } else if (x < 0) {
          g.setXPos(x+config.tx);
        }
        if (y > config.ty) {
          g.setYPos(y-config.ty);
        } else if (y < 0) {
          g.setYPos(y+config.ty);
        }
      }

      g.rotate(1);
    }

    colorShift();
  }

  function render()
  {
    var a, e, g, i, c, x, y;
    for (g in groups) {
      if (!groups.hasOwnProperty(g) || !groups[g] instanceof Spinner) {continue;}
      g = groups[g];
      e = g.getElementCount();
      c = g.colorValue;
      for (i = 0; i < e; i++) {
        a = g.getElementAt(i);
        if (!a instanceof SpinElement) {continue;}
        x = g.getXPos();
        y = g.getYPos();
        addRotateTransform(a.getElement(), a.getRotation());
        a.getElement().style.setProperty('top', g.getYPos() + 'px', null);
        a.getElement().style.setProperty('left', g.getXPos() + 'px', null);
        a.getElement().style.setProperty('border-color', c.getRGBString(), null);
      }
    }
    body.getElement().style.setProperty('background-color', body.colorValue.getRGBString(), null);
  }

  /**
   * Crappy Check to see if the keyboard controls are pushing up or to the right.
   *
   * Going clockwise N -> SE are "Forward" and S -> NW are going "Backward"
   *
   * @returns {boolean}
   */
  function isMovingForward()
  {
    var
      n = currentKeys[Keyboard.KEY_W],
      s = currentKeys[Keyboard.KEY_S],
      e = currentKeys[Keyboard.KEY_D],
      w = currentKeys[Keyboard.KEY_A],
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
  function isControlKeyPressed()
  {
    var a, b, wsad, arrows;
    a = currentKeys;
    b = Keyboard;
    wsad = (a[b.KEY_W] || a[b.KEY_A] || a[b.KEY_S] || a[b.KEY_D]);
    arrows = (a[b.KEY_ARROW_UP] || a[b.KEY_ARROW_DOWN] || a[b.KEY_ARROW_LEFT] || a[b.KEY_ARROW_RIGHT]);
    return (wsad || arrows);
  }

  function clearKeyPress(event)
  {
    var a = currentKeys, b = Keyboard;
    if (a[b.KEY_ESC] || a[b.KEY_W] || a[b.KEY_A] || a[b.KEY_S] || a[b.KEY_D]) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  function colorShift()
  {
    var a, g, x, y, z;
    for (g in groups) {
      if (!groups.hasOwnProperty(g) || !groups[g] instanceof Spinner) {continue}
      g = groups[g].colorValue;
      if (!a) {
        x = g.getColorRValue();
        y = g.getColorGValue();
        z = g.getColorBValue();
        if (z < 255 && config.colorSpeed > 0 || z > 0 && config.colorSpeed < 0) {
          z += config.colorSpeed;
          z = (z < 0) ? 0 : z;
          z = (z > 255) ? 255 : z;
        } else if (y < 255 && config.colorSpeed > 0 || y > 0 && config.colorSpeed < 0) {
          y += config.colorSpeed;
          y = (y < 0) ? 0 : y;
          y = (y > 255) ? 255 : y;
        } else if (x < 255 && config.colorSpeed > 0 || x > 0 && config.colorSpeed < 0) {
          x += config.colorSpeed;
          x = (x < 0) ? 0 : x;
          x = (x > 255) ? 255 : x;
        } else {
          config.colorSpeed = -config.colorSpeed;
        }
        a = true;
      }
      g.setColor(x, y, z);
    }
    x = Math.abs(x - 255);
    y = Math.abs(y - 255);
    z = Math.abs(z - 255);
    body.colorValue.setColor(x, y, z)
  }

  /**
   * Add CSS transforms for rotation.
   *
   * @param e {HTMLElement} Element to be rotated.
   * @param n {number}      Rotation value.
   */
  function addRotateTransform(e, n)
  {
    if (!e instanceof HTMLElement) {return;}
    var b = Math.round(n * 10) / 10;
    var a = 'rotate(' + b + 'deg)';
    e.style.setProperty('-ms-transform', a, null);
    e.style.setProperty('-webkit-transform', a, null);
    e.style.setProperty('transform', a, null);
  }

  init();
})();

