(function (win) {
  'use strict'

  var CoBrowsing = function CoBrowsing () {
    this.html = null
    this.lastfullhtml = Date.now()
    this.shadow = null
    this.timeout = null
    var Ddom = win.diffDOM
    this.dd = new Ddom()
    this.slave = (win.document.currentScript.dataset['type'] === 'slave') || false
    this.addOnload()
  }

  CoBrowsing.prototype.initialize = function () {
    if (this.slave) {
      console.log('I\'M THE SLAVE. I WILL DO WHAT YOU WANT, MASTER')
      this.configureSlave()
      this.listenEvents()
    } else {
      this.addMutationObserver()
      this.getHTML()
      // this.listenMouseEvents()
      this.sendHtml()
    }
  }

  CoBrowsing.prototype.configureSlave = function () {
    var origContent = document.querySelector('main')
    // Create the first shadow root
    this.shadow = origContent// .createShadowRoot()
  }

  CoBrowsing.prototype.listenEvents = function () {
    var _this = this
    win.socket.on('full', function (full) {
      _this.shadow.innerHTML = full
    })
    win.socket.on('diff', function (diff) {
      console.log(JSON.parse(diff))
      _this.dd.apply(_this.shadow, JSON.parse(diff))
    })
  }

  CoBrowsing.prototype.sendHtml = function () {
    console.log('CoBrowsing::sendHtml')
    var txt = this.html.outerHTML
    win.socket.emit('full', txt)
  }

  CoBrowsing.prototype.sendPatch = function (diff) {
    console.log('CoBrowsing::sendPatch', diff)
    var d = JSON.stringify(diff)
    win.socket.emit('diff', d)
  }

  CoBrowsing.prototype.addOnload = function () {
    console.log('CoBrowsing::addOnload')
    if (win.readyState === 'complete') {
      this.initialize()
    } else {
      var _this = this
      win.addEventListener('load', function () {
        _this.initialize()
      })
    }
  }

  CoBrowsing.prototype.getHTML = function () {
    console.log('CoBrowsing::getHTML')
    this.html = win.document.documentElement.cloneNode(true)
    return this.html
  }

  CoBrowsing.prototype.addMutationObserver = function () {
    console.log('CoBrowsing::addMutationObserver')
    var _this = this
    var observer = new win.MutationObserver(function (mutations) {
      if (_this.timeout) {
        return
      }
      _this.timeout = setTimeout(function () {
        _this._updated()
        clearTimeout(_this.timeout)
        _this.timeout = null
      }, 1000)
    })

    observer.observe(win.document, {
      subtree: true,
      childList: true,
      attributes: true,
      // attributeOldValue: true,
      characterData: true
      // characterDataOldValue: true
    })
  }

  CoBrowsing.prototype._updated = function () {
    console.log('CoBrowsing::_updated')
    var timediff = 10000
    if ((timediff = Date.now() - this.lastfullhtml) > 5000) {
      this.lastfullhtml = Date.now()
      console.log('send full', timediff)
      this.getHTML()
      this.sendHtml()
      return
    }

    var oldHtml = this.html
    var newHtml = this.getHTML()
    var diff = this.dd.diff(oldHtml, newHtml)
    if (diff.length) {
      this.sendPatch(diff)
    }
  }

  CoBrowsing.prototype.listenMouseEvents = function () {
    win.addEventListener('mousemove', function (e) {
      console.log(`X=${e.clientX}, Y=${e.clientY}, target=${e.target}`)
      console.log(e)
    })
  }

  CoBrowsing.prototype.sendMouse = function () {

  }

  CoBrowsing.prototype.sendKey = function () {

  }

  win.CoBrowsing = new CoBrowsing()
})(window)
