(function (win) {
  'use strict'

  var CoBrowsing = function CoBrowsing () {
    console.log(win.document.currentScript)
    this.html = null
    this.shadow = null
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
    this.shadow = origContent.createShadowRoot()
  }

  CoBrowsing.prototype.listenEvents = function () {
    var _this = this
    win.socket.on('full', function (full) {
      console.log(full)
      _this.shadow.innerHTML = full
    })
    win.socket.on('diff', function (diff) {
      console.log(diff)
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
      console.log('document loaded')
      this.initialize()
    } else {
      var _this = this
      win.addEventListener('load', function () {
        console.log('document loaded')
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
      _this._updated()
    })

    observer.observe(win.document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    })
  }

  CoBrowsing.prototype._updated = function () {
    console.log('CoBrowsing::_updated')
    this.getHTML() // BAD!!
    this.sendHtml()
    //
    // var oldHtml = this.html
    // var newHtml = this.getHTML()
    // var diff = this.dd.diff(oldHtml, newHtml)
    // this.sendPatch(diff)
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
