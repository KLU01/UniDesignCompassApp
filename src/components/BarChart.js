import React, { Component } from "react";
import Vega from 'react-vega';
import sizeMe from 'react-sizeme'
import { Handler } from 'vega-tooltip';

class BarChart extends Component {      
    render() {
      const spec = this.props.spec
        ? this.props.spec
        : this.defaultSpec;
      spec.width = this.props.width
        ? this.props.width
        : this.defaultSpec.width;
      spec.height = this.props.height
        ? this. props.height
        : this.defaultSize.height
      return <Vega spec={spec} width={spec.width} height={spec.height} data={this.props.data} />
    }

    defaultSize = {
        width: 100,
        height: 100
    }

    defaultSpec = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        
        "padding": "10",
        "width": this.defaultSize.width,
        "height": this.defaultSize.height,
        "autosize": {
            "type": "fit",
            "contains": "padding",
            "resize": false
        },
      
        "data": [{ "name": "table" }],
      
        "signals": [
          {
            "name": "tooltip",
            "value": {},
            "on": [
              {"events": "rect:mouseover", "update": "datum"},
              {"events": "rect:mouseout",  "update": "{}"}
            ]
          },
        ],
      
        "scales": [
          {
            "name": "xscale",
            "type": "band",
            "domain": {"data": "table", "field": "category"},
            "range": "width",
            "padding": 0.05,
            "round": true
          },
          {
            "name": "yscale",
            "domain": {"data": "table", "field": "amount"},
            "nice": true,
            "range": "height"
          }
        ],
      
        "axes": [
          { 
            "orient": "bottom",
            "scale": "xscale",
            "title": "Phase",
            "titleFontSize": 18
          },
          { 
            "orient": "left",
            "scale": "yscale",
            "title": "Duration (hours)",
            "titleFontSize": 18
         }
        ],

        "encoding": {
          "x": {"field": "a", "type": "ordinal"},
          "y": {"field": "b", "type": "quantitative"}
        },
      
        "marks": [
          {
            "type": "rect",
            "from": {"data":"table"},
            "encode": {
              "enter": {
                "x": {"scale": "xscale", "field": "category"},
                "width": {"scale": "xscale", "band": 1},
                "y": {"scale": "yscale", "field": "amount"},
                "y2": {"scale": "yscale", "value": 0}
              },
              "update": {
                "fill": {"value": "steelblue"}
              },
              "hover": {
                "fill": {"value": "#dc3545"}
              }
            }
          },
          {
            "type": "text",
            "encode": {
              "enter": {
                "align": {"value": "center"},
                "baseline": {"value": "bottom"},
                "fill": {"value": "#333"}
              },
              "update": {
                "x": {"scale": "xscale", "signal": "tooltip.category", "band": 0.5},
                "y": {"scale": "yscale", "signal": "tooltip.amount", "offset": -2},
                "text": {"signal": "tooltip.amount"},
                // "fillOpacity": [
                //   {"test": "datum === tooltip", "value": 0},
                //   {"value": 1}
                // ]
              }
            }
          }
        ]
    }
}

export default sizeMe()(BarChart);