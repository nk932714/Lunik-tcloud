import React from 'react'
import $ from 'jquery'
import Notify from '../notification'
import classNames from 'classname'

import Loading from '../loading'
import Logo from '../image/logo'
import Color from '../../color'
import { GhostIcon, ExitIcon } from '../image/svg'
import SearchBar from './search'

export default class Bar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false
    }

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {})
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  logout () {
    this.setState({
      loading: true
    })

    $.ajax({
      url: '/auth/logout',
      method: 'POST',
      success: (response) => {
        this.setState({
          loading: false
        })

        Notify({
          type: 'info',
          title: 'Success to disconnect'
        })

        window.location.pathname = 'login.html'
        window.location.hash = ''
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      this.setState({
        loading: false
      })

      Notify({
        type: 'error',
        title: 'Failed to disconnect',
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  render () {
    return (
      <div ref='userBar' id="user"
        style={style.div}
        className={classNames('nav', this.state.fixed ? 'fixed' : '')}>
        <Loading hidden={!this.state.loading}/>
        <Logo style={style.logo} />
        <h1 style={style.title}>TCloud</h1>
        <ExitIcon style={style.exitIcon} onClick={(e) => this.logout()}/>
        <SearchBar style={style.search}/>
        {/* <GhostIcon style={style.profilePicture} /> */}
      </div>
    )
  }
}

const style = {
  div: {
    // height: '60px',
    minWidth: '370px',
    backgroundColor: Color.darkGrey
  },
  logo: {
    height: '50px',
    margin: '5px 10px',
    cursor: 'pointer'
  },
  title: {
    display: 'inline-block',
    verticalAlign: 'top',
    margin: '13px 10px'
  },
  profilePicture: {
    margin: '5px',
    float: 'right'
  },
  search: {
    display: 'inline-block',
    float: 'right',
    height: '60px'
  },
  exitIcon: {
    float: 'right',
    margin: '20px 10px',
    cursor: 'pointer'
  }
}
