import React from 'react'
import { Provider, connect } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import AdminWrapper from 'AdminWrapper'
import {
  adminChangeRoute,
  getUserData,
  setAuthToken,
} from 'actions'

const genRoutes = (adminRoutes) => {
  const routes = [
    {
      path: '/login',
      getComponents: (a, cb) => require.ensure([], () => cb(null, require('Login').default)),
      onEnter: adminRoutes.redirectIfLoggedIn.bind(adminRoutes),
    },
    {
      path: '/join',
      getComponents: (a, cb) => require.ensure([], require => { cb(null, require('Register').default) }),
    },
    {
      path: '/admin',
      component: AdminWrapper,
      indexRoute: {
        getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminDashboard').default)),
      },
      onEnter: adminRoutes.requireAuth.bind(adminRoutes),
      childRoutes: [
        {
          path: 'seasons',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminSeasons').default)),
        },
        {
          path: 'rounds',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminRounds').default)),
        },
        {
          path: 'days',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminDays').default)),
        },
        {
          path: 'teams',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminTeamsList').default)),
        },
        {
          path: 'team/create',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminTeamCreate').default)),
        },
        {
          path: 'team/:id',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminTeam').default)),
        },
        {
          path: 'matches',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminMatches').default)),
        },
        {
          path: 'match/create',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminMatchCreate').default)),
        },
        {
          path: 'posts',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminPostsList').default)),
        },
        {
          path: 'post/create',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminPostCreate').default)),
        },
        {
          path: 'post/:id',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminPostSingle').default)),
        },
        {
          path: 'match/:id',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminSingleMatch').default)),
        },
        {
          path: 'users',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminUsersList').default)),
        },
        {
          path: 'me',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminUserPage').default)),
        },
        {
          path: 'settings',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('Settings').default)),
        },
        {
          path: '*',
          getComponents: (a, cb) => require.ensure([], () => cb(null, require('AdminNotFound').default)),
        },
      ],
    },
  ]
  return routes
}

export class AdminRoutes extends React.Component {
  requireAuth(nextState, replace, next) {
    const { dispatch } = this.props
    const { store } = this.props
    //  CHECK TOKEN AND INVALIDATE IF NEEDED
    return dispatch(getUserData()).then((res) => {
      if (res.status !== 200 || !res.data.user || !res.data.success) {
        store.dispatch(setAuthToken(''))
      }
      return res
    })
    .then(() => {
      const state = store.getState()
      const { account } = state
      if (account.authToken) {
        next()
      } else {
        browserHistory.push('/login')
      }
    })
  }
  redirectIfLoggedIn(nextState, replace, next) {
    const state = this.props.store.getState();
    const { account } = state;
    if (account.authToken) {
      browserHistory.push('/admin')
    } else {
      next();
    }
  }

  render() {
    const { dispatch } = this.props
    browserHistory.listen((e) => {
      dispatch(adminChangeRoute(e.pathname))
    })
    return (
      <Provider store={this.props.store}>
        <Router history={browserHistory} routes={genRoutes(this)} />
      </Provider>
    )
  }
}

AdminRoutes.propTypes = {
  dispatch: React.PropTypes.func,
  store: React.PropTypes.object,
};

export default connect()(AdminRoutes);
