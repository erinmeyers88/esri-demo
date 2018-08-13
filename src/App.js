import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {loadModules, loadCss} from 'esri-loader';

loadCss('https://js.arcgis.com/4.8/esri/css/main.css');

class App extends Component {

  constructor(props) {
    super(props);

    this.drawPolyline = this.drawPolyline.bind(this);
    this.clearGraphics = this.clearGraphics.bind(this);

    this.state = {
      measurement: ''
    }

  }

  componentDidMount() {
    loadModules(['esri/Map', 'esri/views/MapView']).then(([Map, MapView]) => {
      let map = new Map({
        basemap: 'streets'
      });

      let mapView = new MapView({
        container: 'mapDiv',
        map,
        zoom: 3
      });

      this.setState({
        map,
        mapView
      })

    });

    this.enableDrawing();
  }


  enableDrawing() {
    loadModules(['esri/views/2d/draw/Draw']).then(([Draw]) => {

      let draw = new Draw({view: this.state.mapView});
      let action = draw.create('polyline', {mode: 'hybrid'});

      action.on('vertex-add', this.drawPolyline);
      action.on('cursor-update', this.drawPolyline);
      action.on('draw-complete', this.drawPolyline);

    });
  }

  drawPolyline({vertices}) {

    this.state.mapView.graphics.removeAll();

    loadModules(['esri/geometry/Polyline', 'esri/Graphic']).then(([Polyline, Graphic]) => {

      let drawing = new Polyline({
        paths: vertices,
        spatialReference: this.state.mapView.spatialReference
      });

      let graphic = new Graphic({
        geometry: drawing,
        symbol: {
          type: 'simple-line',
          cap: 'round',
          join: 'round',
          color: 'red',
          style: 'dash',
          width: 2
        }
      });

      this.state.mapView.graphics.add(graphic);
      this.measure(drawing);
    });
  }

  measure(drawing, units) {
    loadModules(['esri/geometry/geometryEngine']).then(([geometryEngine]) => {
      let length = geometryEngine.geodesicLength(drawing, 'miles');
      this.setState({measurement: length});
    });
  }

  clearGraphics() {
    this.state.mapView.graphics.removeAll();
    this.enableDrawing();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div>Distance: {this.state.measurement} miles</div>
          <button onClick={this.clearGraphics}>Clear</button>
        </header>
        <div className="App-intro" id="mapDiv" style={{height: 700, width: '100%'}}>

        </div>
      </div>
    );
  }
}

export default App;
