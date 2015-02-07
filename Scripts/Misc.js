EFEditor.Utils.Misc = (function(){
  var self;
  function Misc()
  {
    self = this;
    self.currentBrowser = -1;

    function init()
    {
      if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
        self.currentBrowser = self.Browsers.OPERA;
      } else if (typeof InstallTrigger !== 'undefined') {
        self.currentBrowser = self.Browsers.FIREFOX;
      } else if(Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        self.currentBrowser = self.Browsers.SAFARI;
      } else if(!!window.chrome) {
        self.currentBrowser = self.Browsers.CHROME;
      } else if (/*@cc_on!@*/false || !!document.documentMode) {
        self.currentBrowser = self.Browsers.IE;
      }
    }

    init();
  }

  Misc.prototype.Browsers = {
    IE: 0,
    SAFARI: 1,
    OPERA: 2,
    CHROME: 3,
    FIREFOX: 4
  };

  return Misc;
})();
