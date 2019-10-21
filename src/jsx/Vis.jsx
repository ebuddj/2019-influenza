import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';

// https://www.npmjs.com/package/rc-slider
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import './../styles/rc-slider-override.css';

// https://d3js.org/
import _ from 'underscore';

// https://d3js.org/
import * as d3 from 'd3';

let timeout_var;
let g, path;

const country_names = {
  'AL':'Albania','AM':'Armenia','AT':'Austria','AZ':'Azerbaijan','BA':'Bosnia and Herzegovina','BE':'Belgium','BG':'Bulgaria','BY':'Belarus','CH':'Switzerland','CY':'Cyprus','CZ':'Czech Republic','DE':'Germany','DK':'Denmark','EE':'Estonia','EL':'Greece','ES':'Spain','FI':'Finland','FR':'France','GE':'Georgia','HR':'Croatia','HU':'Hungary','IE':'Ireland','IL':'Israel','IS':'Iceland','IT':'Italy','KG':'Kyrgyzstan','KZ':'Kazakhstan','LT':'Lithuania','LU':'Luxembourg','LV':'Latvia','MD':'Moldova','ME':'Montenegro','MK':'North Macedonia','MT':'Malta','NL':'Netherlands','NO':'Norway','PL':'Poland','PT':'Portugal','RO':'Romania','RS':'Serbia','RU':'Russia','SE':'Sweden','SI':'Slovenia','SK':'Slovakia','TJ':'Tajikistan','TM':'Turkmenistan','TR':'Turkey','UA':'Ukraine','UKG13182':'England','UK':'United Kingdom','UKL':'Wales','UKM':'Scotland','UKN':'Northern Ireland','UZ':'Uzbekistan','XK':'Kosovo'
};
const month_names = {
  '2018 Week 40':'October',
  '2018 Week 41':'October',
  '2018 Week 42':'October',
  '2018 Week 43':'October',
  '2018 Week 44':'October/November',
  '2018 Week 45':'November',
  '2018 Week 46':'November',
  '2018 Week 47':'November',
  '2018 Week 48':'November',
  '2018 Week 49':'December',
  '2018 Week 50':'December',
  '2018 Week 51':'December',
  '2018 Week 52':'December',
  '2019 Week 01':'January',
  '2019 Week 02':'January',
  '2019 Week 03':'January',
  '2019 Week 04':'January',
  '2019 Week 05':'January',
  '2019 Week 06':'February',
  '2019 Week 07':'Fextxtbruary',
  '2019 Week 08':'February',
  '2019 Week 09':'February',
  '2019 Week 10':'March',
  '2019 Week 11':'March',
  '2019 Week 12':'March',
  '2019 Week 13':'March',
  '2019 Week 14':'April',
  '2019 Week 15':'April',
  '2019 Week 16':'April',
  '2019 Week 17':'April',
  '2019 Week 18':'May',
  '2019 Week 19':'May',
  '2019 Week 20':'May',
  '2019 Week 21':'May',
  '2019 Week 22':'May',
  '2019 Week 23':'June',
  '2019 Week 24':'June',
  '2019 Week 25':'June',
  '2019 Week 26':'June',
  '2019 Week 27':'July',
  '2019 Week 28':'July',
  '2019 Week 29':'July',
  '2019 Week 30':'July',
  '2019 Week 31':'July/August',
  '2019 Week 32':'August',
  '2019 Week 33':'August',
  '2019 Week 34':'August',
  '2019 Week 35':'August',
  '2019 Week 36':'September',
  '2019 Week 37':'September',
  '2019 Week 38':'September',
  '2019 Week 39':'September',
  '2019 Week 40':'October'
}

class Vis extends Component {
  constructor() {
    super();
    this.state = {
      date_index:0,
      height:0,
      width:0
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  componentDidMount() {
    let self = this;
    let left, height, projection, scale, width;
    if (window.innerWidth > 800) {
      height = 640;
      left = 100;
      scale = 900;
      width = 800;
      projection = d3.geoAzimuthalEquidistant().center([22,57]).scale(scale);
    }
    else {
      height = 420;
      left = 10;
      scale = 550;
      width = 320;
      projection = d3.geoAzimuthalEquidistant().center([52,44]).scale(scale);
    }
    let svg = d3.select('.' + style.map_container).style('width', width).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    let tooltip = d3.select('.' + style.map_container)
      .append('div')
      .attr('class', style.hidden + ' ' + style.tooltip);
    function showTooltip (d) {
      let offsetL = document.getElementsByClassName(style.map_container)[0].offsetLeft + 10;
      let offsetT = document.getElementsByClassName(style.map_container)[0].offsetTop + 10;
      let country_code = d.id;
      let max = {
        date:'',
        value:0
      };
      _.each(self.props.data[country_code], (value, date) => {
        if (value > max.value) {
          max.value = value,
          max.date = date;
        }
      });
      let mouse = d3.mouse(svg.node()).map(function(d) {
        return parseInt(d);
      });
      // y
      if (mouse[1] > 250) {
        offsetT = offsetT - 180;
      }
      // x
      if (mouse[0] > 200) {
        offsetL = offsetL - 200;
      }
      else if (mouse[0] > 150) {
        offsetL = offsetL - 100
      }
      if (self.props.data[country_code]) {
        tooltip.classed(style.hidden, false)
          .attr('style', 'left: ' + (mouse[0] + offsetL) +  'px; top:' + (mouse[1] + offsetT) + 'px;')
          .html('<h5 class=' + style.h5 + '>' + country_names[country_code] + '</h5>');
      }
    }
    function selectCountry (d) {
      if (self.props.data[d.id]) {
        if (!d3.select(this).classed(style.selected)) {
          self.setState((state, props) => ({
            selected_country: d.id
          }));
          d3.select('.' + style.selected_country).classed(style.hidden, false);
          d3.select('.' + style.selected).classed(style.selected, false);
          d3.select(this.parentNode.appendChild(this)).classed(style.selected, true);
        }
        else {
          d3.select('.' + style.selected_country).classed(style.hidden, true);
          d3.select('.' + style.selected).classed(style.selected, false);
        }
      }
    }
    let path_prefix;
    if (location.href.match('localhost')) {
      path_prefix = './';
    }
    else {
      path_prefix = '';
    }
    d3.json(path_prefix + 'data/europe.topojson').then(function(topology) {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .on('mousemove', showTooltip)
        .on('mouseout', function (d,i) {
          tooltip.classed(style.hidden, true);
         })
        .on('click', selectCountry)
        .attr('class', style.path)
        .attr('fill', function(d, i) {
          return self.getCountryColor(d.id);
        }).attr('stroke', function(d, i) {
          if (self.getCountryColor(d.id) !== '#fff') {
            this.parentNode.appendChild(this)
            return '#ccc'
          }
          else {
            return '#ccc';
          }
        });
      let date = self.dates[self.state.date_index];
      self.text1 = svg.append('text')
        .attr('alignment-baseline', 'left')
        .attr('dy', '.35em')
        .attr('class', style.text)
        .attr('text-anchor', 'left')
        .attr('x', left + 'px')
        .attr('y', '50px')
        .html(date);
      self.text2 = svg.append('text')
        .attr('alignment-baseline', 'left')
        .attr('dy', '.35em')
        .attr('class', style.text)
        .attr('text-anchor', 'left')
        .attr('x', left + 'px')
        .attr('y', '95px')
        .html(month_names[date]);
    });
    setTimeout(() => {
      this.createInterval();
    }, 3000);

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  componentWillUnMount() {
    clearInterval(interval);
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  updateWindowDimensions() {
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth
    });
  }
  createInterval() {
    let counter = 600;
    let self = this;
    let myFunction = function() {
      if (self.state.date_index >= (self.dates.length - 1)) {
        clearTimeout(timeout_var);
        setTimeout(() => {
          self.setState((state, props) => ({
            date_index:0
          }), self.createInterval);
        }, 2000);
      }
      else {
        self.setState((state, props) => ({
          date_index:self.state.date_index + 1
        }), self.changeCountryColor);
        timeout_var = setTimeout(myFunction, counter);
      }
    }
    timeout_var = setTimeout(myFunction, counter);
  }
  getCountryColor(country) {
    if (this.props.data[country] !== undefined) {
      if (this.props.data[country][this.dates[this.state.date_index]] > 0) {
        if (this.props.data[country][this.dates[this.state.date_index]] === 1) {
          return 'rgba(27, 64, 152, 0.1)';
        }
        else if (this.props.data[country][this.dates[this.state.date_index]] === 2) {
          return 'rgba(27, 64, 152, 0.4)';
        }
        else if (this.props.data[country][this.dates[this.state.date_index]] === 3) {
          return 'rgba(27, 64, 152, 0.7)';
        }
        else if (this.props.data[country][this.dates[this.state.date_index]] === 4) {
          return 'rgba(27, 64, 152, 1)';
        }
      }
      else {
        return '#fff';
      }
    }
    else {
      return '#fff';
    }
  }
  changeCountryColor(type) {
    let self = this;
    g.selectAll('path').attr('d', path)
      .attr('fill', function(d, i) {
        return self.getCountryColor(d.id);
      }).attr('stroke', function(d, i) {
        if (self.getCountryColor(d.id) !== '#fff') {
          this.parentNode.appendChild(this)
          return '#ccc'
        }
        else {
          return '#ccc';
        }
      });
  }
  onBeforeSliderChange(value) {
    if (timeout_var) {
      clearTimeout(timeout_var);
    }
  }
  onSliderChange(value) {
    this.setState((state, props) => ({
      date_index:value
    }), this.changeCountryColor);
  }
  onAfterSliderChange(value) {
  }
  render() {
    this.dates = _.keys(this.props.data['FI']);
    if (this.text1) {
      this.text1.html(this.dates[this.state.date_index]);
      this.text2.html(month_names[this.dates[this.state.date_index]]);
    }
    return (
      <div>
        <div className={style.slider_wrapper}>
          <Slider
            className={style.slider_container}
            dots={false}
            max={this.dates.length - 1}
            onAfterChange={this.onAfterSliderChange.bind(this)}
            onBeforeChange={this.onBeforeSliderChange}
            onChange={this.onSliderChange.bind(this)}
            value={this.state.date_index}
          />
        </div>
        <div className={style.map_wrapper}>
          <div className={style.map_container}></div>
        </div>
      </div>
    );
  }
}
export default Vis;