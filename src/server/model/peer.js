/**
 * Created by lunik on 12/07/2017.
 */
import ChildProcess from 'child_process'
import EventEmitter from 'events'
import Crypto from 'crypto-js'
import Rand from 'crypto-rand'
import fs from 'fs'
import os from 'os'

const maxMem = Math.floor((os.totalmem() / (1024 ^ 2)) * 3 / 4) // MB

export default class Peer extends EventEmitter {
  constructor (props) {
    super()
    props = props || {}
    this.uid = this.generateUid()
    this.magnet = props.magnet || props.link
    this.metadata = {}

    if (this.magnet) {
      this.child = ChildProcess.fork(`${__dirname}/module/torrentWorker`, [this.magnet], {execArgv: ['--max_old_space_size=' + maxMem]})

      this.child.on('message', (message) => this.handleMessage(JSON.parse(message)))
    } else {
      this.emit('err', {
        code: 404,
        message: 'No magnet or link provided.'
      })
    }
  }

  stop () {
    if (this.child) {
      this.child.send(JSON.stringify({
        type: 'stop'
      }))
    }
  }

  handleMessage (message) {
    this.metadata = message.metadata
    switch (message.type) {
      case 'metadata':
        this.emit('metadata', this)
        break
      case 'download':
        this.emit('download', this)
        break
      case 'done':
        this.emit('done', this)
        break
      case 'stop':
        this.emit('stop', this)
        break
      case 'noPeers':
        this.emit('noPeers', this)
        break
      case 'error':
        this.emit('error', this)
        break
      default:
        break
    }
  }

  generateUid () {
    let seed = `${Rand.rand().toString()}`
    let longUid = Crypto.SHA256(seed).toString()
    return longUid.substr(0, 10)
  }

  toJSON () {
    var metadata = Object.assign({}, this.metadata)
    delete metadata.path
    delete metadata.fullPath

    return {
      magnet: this.magnet,
      metadata: metadata,
      uid: this.uid,
      url: `/peer/${this.uid}`
    }
  }

  cleanup () {
    try {
      fs.unlinkSync(this.magnet)
    } catch (err) {}
  }
}
