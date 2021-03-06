/**
 * Created by lunik on 12/07/2017.
 */

import Peer from './peer'
import Config from './config'
import Folder from '../model/folder'
import fs from 'fs-extra'
import { spawn } from 'child_process'
import Delogger from 'delogger'

const config = new Config({sync: true})

export default class Torrent {
  constructor (props) {
    props = props || {}
    this.baseFolder = props.baseFolder || new Folder(`/${__dirname}/${config.files.path}`, '')
    this.peers = {}
    this.log = new Delogger('Torrent')
  }

  download (magnet) {
    var peer = new Peer({
      magnet: magnet
    })

    this.peers[peer.uid] = peer

    this.peers[peer.uid].on('done', (peer) => this.handlePeerDone(peer))
    this.peers[peer.uid].on('stop', (peer) => this.handlePeerStop(peer))
    return this.peers[peer.uid]
  }

  handlePeerStop (peer) {
    this.cleanup(peer)
  }

  handlePeerDone (peer) {
    var oldPath = peer.metadata.fullPath
    // var newPath = `${__dirname}/${config.files.path}/${peer.metadata.name}`
    var newPath = `${__dirname}/${config.files.path}`

    var childs = fs.readdirSync(newPath)

    if (childs.indexOf(peer.metadata.name) === -1) {
      const mv = spawn('mv', [oldPath, newPath])
      mv.stderr.on('data', (data) => {
        this.log.error(data)
      })

      mv.on('close', (code) => {
        this.log.info(`Copied ${oldPath} to ${newPath} successfully`)
        this.cleanup(peer)
      })
    }
  }

  cleanup (peer) {
    if (peer.metadata.path) {
      fs.removeSync(peer.metadata.path)
    }
    delete this.peers[peer.uid]
  }
}
