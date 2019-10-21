import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://alligator.io/react/axios-react/
import axios from 'axios';

// https://d3js.org/
import _ from 'underscore';

import Vis from './Vis.jsx';

class Layout extends Component {
  constructor() {
    super();
    
    this.state = {
      data:false
    }
  }
  componentDidMount() {
    let self = this;
    let path_prefix;
    if (location.href.match('localhost')) {
      path_prefix = './';
    }
    else {
      path_prefix = 'https://lusi-dataviz.ylestatic.fi/2019_turvapaikanhakijatilanne/';
    }
    axios.get(path_prefix + 'data/data.json', {
    })
    .then(function (response) {
      self.setState((state, props) => ({
        data:response.data
      }));
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  render() {
    return (
      <div className={style.wrapper}>
        <Vis data={this.state.data} />
        <p className={style.p}>Source: <a href="http://flunewseurope.org/" className={style.a}>Flu News Europe</a></p>
      </div>
    );
  }
}
export default Layout;