/**
 * Referrences
 * 
 * [Proposal origin]
 * https://gist.github.com/2864711/946225eb3822c203e8d6218095d888aac5e1748e
 * 
 * [Enhanced]
 * http://qiita.com/sounisi5011/items/a8fc80e075e4f767b79a
 * 
 * [Enhanced extra]
 * https://github.com/nbouvrette/eventListenerPolyfill
 * 
 * [...then now...]
 * You can call me, Odi, that is my English name.
 * I made it because I'm drunken now.
 * No one cares legacy browsers but infrastructure of Korea...
 * That is why I made it.
 * I don't want to inherit that license rule.
 */
; "use strict";
// 개인적으로 오류 발생 때문에 수정한 것입니다!
// I faced some errors occured so I modified it!
!function (window) {
    if (!window ||
        typeof window === 'undefined'
    ) throw new Error('event-listener-polyfill.js needs "window" object from web browser');
    var ADD = 'addEventListener';
    var _ADD = 'attachEvent';
    var REMOVE = 'removeEventListener';
    var _REMOVE = 'detachEvent';
    var document = window.document;
    if (window[ADD] &&
        window[REMOVE])
        return window;
    if (!window[_ADD] ||
        !window[_REMOVE])
        return window;

    var listenerPropertyName = 'x-ms-event-listeners';
    var DOM_READY = 'DOMContentLoaded';
    var _DOM_READY = 'onreadystatechange';
    function getEventType(typeString) {
        if (typeof typeString !== 'string')
            throw new TypeError('Event type required as string type');
        return (
            (typeString === DOM_READY) ?
                _DOM_READY :
                ('on' + typeString)
        );
    }
    function isCallableFunction(value) {
        if (!value)
            return false;
        return (typeof (value) === 'function' &&
            typeof (value['call']) === 'function');
    }
    function getListener(self, listener) {
        var listeners = listener[listenerPropertyName];
        if (!listener)
            throw new TypeError('listener required as a second parameter');
        if (!listeners)
            throw new TypeError('there is no matched listener');
        for (var i = 0, m = listeners.length; i < m; i++) {
            if (listeners[i][0] !== self) {
                continue;
            }
            return listeners[i][1];
        }
    }
    function setListener(self, listener, callback) {
        var listeners = listener[listenerPropertyName] || (listener[listenerPropertyName] = []);
        return getListener(self, listener) ||
            (listeners[listeners.length] = [self, callback], callback);
    }
    function setDocumentInjection(methodName) {
        var old = document[methodName];
        document[methodName] = function (value) {
            return addEventListener(old(value));
        };
    }
    function addEvent(typeString, listener, useCapture) {
        if (!isCallableFunction(listener))
            throw new TypeError('listener required as a function while add an event listener');
        var self = this;
        return self[_ADD](
            getEventType(typeString),
            setListener(self, listener, function (eventObject) {
                eventObject = eventObject || window['event'];
                eventObject['preventDefault'] = eventObject['preventDefault'] || function () { eventObject['returnValue'] = false };
                eventObject['stopPropagation'] = eventObject['stopPropagation'] || function () { eventObject['cancelBubble'] = true };
                eventObject['target'] = eventObject['target'] || eventObject['srcElement'] || document.documentElement;
                eventObject['currentTarget'] = eventObject['currentTarget'] || self;
                eventObject['timeStamp'] = eventObject['timeStamp'] || (new Date()).getTime();
                listener['call'](self, eventObject);
            })
        );
    }
    function removeEvent(typeString, listener, useCapture) {
        if (!isCallableFunction(listener))
            throw new TypeError('listener required as a function while remove an event listener');
        var self = this;
        var extractedLisener = getListener(self, listener);
        if (!extractedLisener)
            return false;
        return self[_REMOVE](getEventType(type), extractedLisener);
    }
    function addListen(obj) {
        var i = obj.length;
        if (!i) {
            obj[ADD] = addEvent;
            obj[REMOVE] = removeEvent;
            return obj;
        }
        while (i--) {
            obj[i][ADD] = addEvent;
            obj[i][REMOVE] = removeEvent;
        }
        return obj;
    }
    addListen([document, window]);
    var ELEMENT_STRING = 'Element';
    var PROTOTYPE = 'prototype';
    if (ELEMENT_STRING in window) {
        var element = window[ELEMENT_STRING];
        element[PROTOTYPE][ADD] = addEvent;
        element[PROTOTYPE][REMOVE] = removeEvent;
        return window;
    }
    document[_ADD](_DOM_READY, function () {
        addListen(document.all);
    });
    setDocumentInjection('getElementsByTagName');
    setDocumentInjection('getElementsById');
    setDocumentInjection('createElement');
    addListen(document.all);
    return window;
}(window);