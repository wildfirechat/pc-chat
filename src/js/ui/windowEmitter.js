const kHandler = Symbol('handler')
const kListeners = Symbol('listeners')
const kOrigin = Symbol('origin')
const kOther = Symbol('other')

class PostMessageEventEmitter {
    constructor(other, origin) {
        if (typeof other.postMessage !== 'function') {
            throw new TypeError('Expected other.postMessage to be a function')
        }

        if (typeof origin !== 'string') {
            throw new TypeError('Expected origin to be a string')
        }

        this[kListeners] = {}
        this[kOrigin] = origin
        this[kOther] = other

        this[kHandler] = (ev) => {
            // Check origin of message
            if (ev.origin !== this[kOrigin]) return
            if (ev.source !== this[kOther]) return

            // Check message data
            if (ev.data === null) return
            if (typeof ev.data !== 'object') return
            if (typeof ev.data.name !== 'string') return

            // Emit event
            if (this[kListeners][ev.data.name]) {
                for (const fn of this[kListeners][ev.data.name]) {
                    Promise.resolve().then(() => fn(ev.data.name, ev.data.data))
                }
            }
        }

        window.addEventListener('message', this[kHandler])
    }

    on(name, fn) {
        if (typeof name !== 'string') throw new TypeError('Expected name to be a string')
        if (typeof fn !== 'function') throw new TypeError('Expected fn to be a function')

        if (this[kListeners][name]) {
            this[kListeners][name].push(fn)
        } else {
            this[kListeners][name] = [fn]
        }
    }

    emit(name, data) {
        if (typeof name !== 'string') throw new TypeError('Expected name to be a string')

        this[kOther].postMessage({ name, data }, this[kOrigin])
    }

    stop() {
        window.removeEventListener('message', this[kHandler])
    }
}

module.exports = PostMessageEventEmitter