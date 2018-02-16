/*!
 * Jste Loader For Jste Demos On CodePen
 * https://project-jste.github.io/
 *
 * Copyright 2018 Jste Team
 * Released under the GNU AGPLv3 license
 * https://project-jste.github.io/license
 *
 * Date: 2018-02-16
 */
/**
 * please-wait
 * Display a nice loading screen while your app loads
 * @author Pathgather <tech@pathgather.com>
 * @copyright Pathgather 2015
 * @license MIT <http://opensource.org/licenses/mit-license.php>
 * @link https://github.com/Pathgather/please-wait
 * @module please-wait
 * @version 0.0.5
 */
(function (root, factory) {
    if (typeof exports === "object") {
        factory(exports);
    } else if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else {
        factory(root);
    }
})(this, function (exports) {
    var PleaseWait, addClass, animationEvent, animationSupport, domPrefixes, elm, key, pfx, pleaseWait, removeClass, transEndEventNames, transitionEvent, transitionSupport, val, _i, _len;
    elm = document.createElement('fakeelement');
    animationSupport = false;
    transitionSupport = false;
    animationEvent = 'animationend';
    transitionEvent = null;
    domPrefixes = 'Webkit Moz O ms'.split(' ');
    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    };
    for (key in transEndEventNames) {
        val = transEndEventNames[key];
        if (elm.style[key] != null) {
            transitionEvent = val;
            transitionSupport = true;
            break;
        }
    }
    if (elm.style.animationName != null) {
        animationSupport = true;
    }
    if (!animationSupport) {
        for (_i = 0, _len = domPrefixes.length; _i < _len; _i++) {
            pfx = domPrefixes[_i];
            if (elm.style["" + pfx + "AnimationName"] != null) {
                switch (pfx) {
                    case 'Webkit':
                        animationEvent = 'webkitAnimationEnd';
                        break;
                    case 'Moz':
                        animationEvent = 'animationend';
                        break;
                    case 'O':
                        animationEvent = 'oanimationend';
                        break;
                    case 'ms':
                        animationEvent = 'MSAnimationEnd';
                }
                animationSupport = true;
                break;
            }
        }
    }
    addClass = function (classname, elem) {
        if (elem.classList) {
            return elem.classList.add(classname);
        } else {
            return elem.className += " " + classname;
        }
    };
    removeClass = function (classname, elem) {
        if (elem.classList) {
            return elem.classList.remove(classname);
        } else {
            return elem.className = elem.className.replace(classname, "").trim();
        }
    };
    PleaseWait = (function () {
        PleaseWait._defaultOptions = {
            backgroundColor: null,
            logo: null,
            loadingHtml: null,
            template: "<div class='pg-loading-inner'>\n  <div class='pg-loading-center-outer'>\n    <div class='pg-loading-center-middle'>\n      <h1 class='pg-loading-logo-header'>\n        <img class='pg-loading-logo'></img>\n      </h1>\n      <div class='pg-loading-html'>\n      </div>\n    </div>\n  </div>\n</div>",
            onLoadedCallback: null
        };

        function PleaseWait(options) {
            var defaultOptions, k, listener, v;
            defaultOptions = this.constructor._defaultOptions;
            this.options = {};
            this.loaded = false;
            this.finishing = false;
            for (k in defaultOptions) {
                v = defaultOptions[k];
                this.options[k] = options[k] != null ? options[k] : v;
            }
            this._loadingElem = document.createElement("div");
            this._loadingHtmlToDisplay = [];
            this._loadingElem.className = "pg-loading-screen";
            if (this.options.backgroundColor != null) {
                this._loadingElem.style.backgroundColor = this.options.backgroundColor;
            }
            this._loadingElem.innerHTML = this.options.template;
            this._loadingHtmlElem = this._loadingElem.getElementsByClassName("pg-loading-html")[0];
            if (this._loadingHtmlElem != null) {
                this._loadingHtmlElem.innerHTML = this.options.loadingHtml;
            }
            this._readyToShowLoadingHtml = false;
            this._logoElem = this._loadingElem.getElementsByClassName("pg-loading-logo")[0];
            if (this._logoElem != null) {
                this._logoElem.src = this.options.logo;
                this._logoElem.width = 180;
                this._logoElem.height = 180;
            }
            removeClass("pg-loaded", document.body);
            addClass("pg-loading", document.body);
            document.body.appendChild(this._loadingElem);
            addClass("pg-loading", this._loadingElem);
            this._onLoadedCallback = this.options.onLoadedCallback;
            listener = (function (_this) {
                return function (evt) {
                    _this.loaded = true;
                    _this._readyToShowLoadingHtml = true;
                    addClass("pg-loaded", _this._loadingHtmlElem);
                    if (animationSupport) {
                        _this._loadingHtmlElem.removeEventListener(animationEvent, listener);
                    }
                    if (_this._loadingHtmlToDisplay.length > 0) {
                        _this._changeLoadingHtml();
                    }
                    if (_this.finishing) {
                        if (evt != null) {
                            evt.stopPropagation();
                        }
                        return _this._finish();
                    }
                };
            })(this);
            if (this._loadingHtmlElem != null) {
                if (animationSupport) {
                    this._loadingHtmlElem.addEventListener(animationEvent, listener);
                } else {
                    listener();
                }
                this._loadingHtmlListener = (function (_this) {
                    return function () {
                        _this._readyToShowLoadingHtml = true;
                        removeClass("pg-loading", _this._loadingHtmlElem);
                        if (transitionSupport) {
                            _this._loadingHtmlElem.removeEventListener(transitionEvent, _this._loadingHtmlListener);
                        }
                        if (_this._loadingHtmlToDisplay.length > 0) {
                            return _this._changeLoadingHtml();
                        }
                    };
                })(this);
                this._removingHtmlListener = (function (_this) {
                    return function () {
                        _this._loadingHtmlElem.innerHTML = _this._loadingHtmlToDisplay.shift();
                        removeClass("pg-removing", _this._loadingHtmlElem);
                        addClass("pg-loading", _this._loadingHtmlElem);
                        if (transitionSupport) {
                            _this._loadingHtmlElem.removeEventListener(transitionEvent, _this._removingHtmlListener);
                            return _this._loadingHtmlElem.addEventListener(transitionEvent, _this._loadingHtmlListener);
                        } else {
                            return _this._loadingHtmlListener();
                        }
                    };
                })(this);
            }
        }
        PleaseWait.prototype.finish = function (immediately, onLoadedCallback) {
            if (immediately == null) {
                immediately = false;
            }
            if (window.document.hidden) {
                immediately = true;
            }
            this.finishing = true;
            if (onLoadedCallback != null) {
                this.updateOption('onLoadedCallback', onLoadedCallback);
            }
            if (this.loaded || immediately) {
                return this._finish(immediately);
            }
        };
        PleaseWait.prototype.updateOption = function (option, value) {
            switch (option) {
                case 'backgroundColor':
                    return this._loadingElem.style.backgroundColor = value;
                case 'logo':
                    return this._logoElem.src = value;
                case 'loadingHtml':
                    return this.updateLoadingHtml(value);
                case 'onLoadedCallback':
                    return this._onLoadedCallback = value;
                default:
                    throw new Error("Unknown option '" + option + "'");
            }
        };
        PleaseWait.prototype.updateOptions = function (options) {
            var k, v, _results;
            if (options == null) {
                options = {};
            }
            _results = [];
            for (k in options) {
                v = options[k];
                _results.push(this.updateOption(k, v));
            }
            return _results;
        };
        PleaseWait.prototype.updateLoadingHtml = function (loadingHtml, immediately) {
            if (immediately == null) {
                immediately = false;
            }
            if (this._loadingHtmlElem == null) {
                throw new Error("The loading template does not have an element of class 'pg-loading-html'");
            }
            if (immediately) {
                this._loadingHtmlToDisplay = [loadingHtml];
                this._readyToShowLoadingHtml = true;
            } else {
                this._loadingHtmlToDisplay.push(loadingHtml);
            }
            if (this._readyToShowLoadingHtml) {
                return this._changeLoadingHtml();
            }
        };
        PleaseWait.prototype._changeLoadingHtml = function () {
            this._readyToShowLoadingHtml = false;
            this._loadingHtmlElem.removeEventListener(transitionEvent, this._loadingHtmlListener);
            this._loadingHtmlElem.removeEventListener(transitionEvent, this._removingHtmlListener);
            removeClass("pg-loading", this._loadingHtmlElem);
            removeClass("pg-removing", this._loadingHtmlElem);
            if (transitionSupport) {
                addClass("pg-removing", this._loadingHtmlElem);
                return this._loadingHtmlElem.addEventListener(transitionEvent, this._removingHtmlListener);
            } else {
                return this._removingHtmlListener();
            }
        };
        PleaseWait.prototype._finish = function (immediately) {
            var listener;
            if (immediately == null) {
                immediately = false;
            }
            if (this._loadingElem == null) {
                return;
            }
            addClass("pg-loaded", document.body);
            if (typeof this._onLoadedCallback === "function") {
                this._onLoadedCallback.apply(this);
            }
            listener = (function (_this) {
                return function () {
                    document.body.removeChild(_this._loadingElem);
                    removeClass("pg-loading", document.body);
                    if (animationSupport) {
                        _this._loadingElem.removeEventListener(animationEvent, listener);
                    }
                    return _this._loadingElem = null;
                };
            })(this);
            if (!immediately && animationSupport) {
                addClass("pg-loaded", this._loadingElem);
                return this._loadingElem.addEventListener(animationEvent, listener);
            } else {
                return listener();
            }
        };
        return PleaseWait;
    })();
    pleaseWait = function (options) {
        if (options == null) {
            options = {};
        }
        return new PleaseWait(options);
    };
    exports.pleaseWait = pleaseWait;
    return pleaseWait;
});

function JSScriptsExec(node) {
    if (node.tagName === 'SCRIPT') {
        setTimeout(function () {
            window.eval(node.innerHTML);
        }, 100);
    } else {
        var i = 0;
        var children = node.childNodes;
        while (i < children.length) {
            JSScriptsExec(children[i++]);
        }
    }
}
window.onload = function () {
    var temp = location.host.split('.').reverse();
    var root_domain = temp[1] + '.' + temp[0];
    if (root_domain == 'codepen.io') {
        document.jsteCode = document.getElementsByTagName("BODY")[0].innerHTML;
        document.code = '<jste style="display: none;">\n' + document.jsteCode + '\n</jste>';
        document.getElementsByTagName("BODY")[0].innerHTML = '';
        var css = 'body.pg-loading{overflow:hidden}.pg-loading-screen{position:fixed;bottom:0;left:0;right:0;top:0;z-index:1000000;opacity:1;background-color:#FFF;-webkit-transition:background-color .4s ease-in-out 0s;-moz-transition:background-color .4s ease-in-out 0s;-ms-transition:background-color .4s ease-in-out 0s;-o-transition:background-color .4s ease-in-out 0s;transition:background-color .4s ease-in-out 0s}.pg-loading-screen.pg-loaded{opacity:0;-webkit-animation:pgAnimLoaded .5s cubic-bezier(.7,0,.3,1) both;-moz-animation:pgAnimLoaded .5s cubic-bezier(.7,0,.3,1) both;-ms-animation:pgAnimLoaded .5s cubic-bezier(.7,0,.3,1) both;-o-animation:pgAnimLoaded .5s cubic-bezier(.7,0,.3,1) both;animation:pgAnimLoaded .5s cubic-bezier(.7,0,.3,1) both}.pg-loading-screen.pg-loading .pg-loading-html,.pg-loading-screen.pg-loading .pg-loading-logo-header{opacity:1}.pg-loading-screen.pg-loading .pg-loading-html:not(.pg-loaded),.pg-loading-screen.pg-loading .pg-loading-logo-header{-webkit-animation:pgAnimLoading 1s cubic-bezier(.7,0,.3,1) both;-moz-animation:pgAnimLoading 1s cubic-bezier(.7,0,.3,1) both;-ms-animation:pgAnimLoading 1s cubic-bezier(.7,0,.3,1) both;-o-animation:pgAnimLoading 1s cubic-bezier(.7,0,.3,1) both;animation:pgAnimLoading 1s cubic-bezier(.7,0,.3,1) both}.pg-loading-screen.pg-loading .pg-loading-html:not(.pg-loaded){-webkit-animation-delay:.3s;-moz-animation-delay:.3s;-ms-animation-delay:.3s;-o-animation-delay:.3s;animation-delay:.3s}.pg-loading-screen .pg-loading-inner{height:100%;width:100%;margin:0;padding:0;position:static}.pg-loading-screen .pg-loading-center-outer{width:100%;padding:0;display:table!important;height:100%;position:absolute;top:0;left:0;margin:0}.pg-loading-screen .pg-loading-center-middle{padding:0;vertical-align:middle;display:table-cell!important;margin:0;text-align:center}.pg-loading-screen .pg-loading-html,.pg-loading-screen .pg-loading-logo-header{width:100%;opacity:0}.pg-loading-screen .pg-loading-logo-header{text-align:center}.pg-loading-screen .pg-loading-logo-header img{display:inline-block!important}.pg-loading-screen .pg-loading-html{margin-top:90px}.pg-loading-screen .pg-loading-html.pg-loaded{-webkit-transition:opacity .5s cubic-bezier(.7,0,.3,1);-moz-transition:opacity .5s cubic-bezier(.7,0,.3,1);-ms-transition:opacity .5s cubic-bezier(.7,0,.3,1);-o-transition:opacity .5s cubic-bezier(.7,0,.3,1);transition:opacity .5s cubic-bezier(.7,0,.3,1)}.pg-loading-screen .pg-loading-html.pg-loaded.pg-removing{opacity:0}.pg-loading-screen .pg-loading-html.pg-loaded.pg-loading{opacity:1}@-webkit-keyframes pgAnimLoading{from{opacity:0}}@-moz-keyframes pgAnimLoading{from{opacity:0}}@-o-keyframes pgAnimLoading{from{opacity:0}}@-ms-keyframes pgAnimLoading{from{opacity:0}}@keyframes pgAnimLoading{from{opacity:0}}@-webkit-keyframes pgAnimLoaded{from{opacity:1}}@-moz-keyframes pgAnimLoaded{from{opacity:1}}@-o-keyframes pgAnimLoaded{from{opacity:1}}@-ms-keyframes pgAnimLoaded{from{opacity:1}}@keyframes pgAnimLoaded{from{opacity:1}}.spinner{color:#FFFFFF;margin:100px auto;width:40px;height:40px;position:relative;text-align:center;-webkit-animation:sk-rotate 2s infinite linear;animation:sk-rotate 2s infinite linear}.dot1,.dot2{color:#FFFFFF;width:60%;height:60%;display:inline-block;position:absolute;top:0;background-color:#FFFFFF;border-radius:100%;-webkit-animation:sk-bounce 2s infinite ease-in-out;animation:sk-bounce 2s infinite ease-in-out}.dot2{top:auto;bottom:0;-webkit-animation-delay:-1s;animation-delay:-1s}@-webkit-keyframes sk-rotate{100%{-webkit-transform:rotate(360deg)}}@keyframes sk-rotate{100%{transform:rotate(360deg);-webkit-transform:rotate(360deg)}}@-webkit-keyframes sk-bounce{0%,100%{-webkit-transform:scale(0)}50%{-webkit-transform:scale(1)}}@keyframes sk-bounce{0%,100%{transform:scale(0);-webkit-transform:scale(0)}50%{transform:scale(1);-webkit-transform:scale(1)}}',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
        var logoURL;
        if (/^its logo is .*?$/gmi.test(document.jsteCode)) {
            logoURL = document.jsteCode.split("its logo is ").pop().split(",").shift();
        } else if (/^son logo est .*?$/gmi.test(document.jsteCode)) {
            logoURL = document.jsteCode.split("son logo est ").pop().split(",").shift();
        } else if (/^الشعار الخاص به .*?$/gmi.test(document.jsteCode)) {
            logoURL = document.jsteCode.split("الشعار الخاص به ").pop().split(",").shift();
        } else if (/^اللوجو بتاعه .*?$/gmi.test(document.jsteCode)) {
            logoURL = document.jsteCode.split("اللوجو بتاعه ").pop().split(",").shift();
        } else if (/^ロゴ: .*?$/gmi.test(document.jsteCode)) {
            logoURL = document.jsteCode.split("ロゴ: ").pop().split(",").shift();
        }
        window.loading_screen = pleaseWait({
            logo: logoURL,
            backgroundColor: '#f46d3b',
            loadingHtml: '<div id="liveVersionLoader"><progress id="liveVersionLoadingProgress"></progress></div>'
        });
        var getFramworkLiveVersionFileInfo = new XMLHttpRequest();
        getFramworkLiveVersionFileInfo.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var fileInfo = JSON.parse(this.responseText);
                window.genuineFileSize = fileInfo.size;
                var progressBar = document.getElementById('liveVersionLoadingProgress');
                var request = new XMLHttpRequest();
                request.onprogress = function (e) {
                    progressBar.max = window.genuineFileSize;
                    progressBar.value = e.loaded;
                };
                request.onloadstart = function (e) {
                    progressBar.value = 0;
                };
                request.onloadend = function (e) {
                    progressBar.value = e.loaded;
                };
                request.open('GET', 'https://jste-manager.herokuapp.com/framework-LiveVersion.min.html', true);

                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        document.getElementById('liveVersionLoader').innerHTML = '<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>';
                        document.getElementsByTagName("BODY")[0].innerHTML = document.code;
                        var pageLoadingChecker = setInterval(function () {
                            if (document.getElementsByTagName("CONTENTS").length > 0) {
                                window.loading_screen.finish();
                                clearInterval(pageLoadingChecker);
                            }
                        }, 1);
                        setTimeout(function () {
                            document.getElementsByTagName("HEAD")[0].innerHTML += request.responseText;
                            JSScriptsExec(document.getElementsByTagName("HEAD")[0]);
                        }, 1000);
                    }
                };
                request.send();
            };
        };

        getFramworkLiveVersionFileInfo.open("GET", "https://rawgit.com/project-jste/framework/master/build/compressed/framework-LiveVersion.info.json");
        getFramworkLiveVersionFileInfo.send();
    }
}