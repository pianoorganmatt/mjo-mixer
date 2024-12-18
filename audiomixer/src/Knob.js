import React from 'react';

class Knob extends React.Component {
  constructor(props) {
    super(props);
    this.fullAngle = props.degrees;
    this.startAngle = (360 - props.degrees) / 2;
    this.endAngle = this.startAngle + props.degrees;
    this.margin = props.size * 0.15;
    this.currentDeg = Math.floor(
      this.convertRange(
        props.min,
        props.max,
        this.startAngle,
        this.endAngle,
        props.value
      )
    );
    this.state = { deg: this.currentDeg };
    this.prevDeg = this.currentDeg; // To track the previous degree for direction checking
  }

  startDrag = (e) => {
    e.preventDefault();
    const knob = e.target.getBoundingClientRect();
    const pts = {
      x: knob.left + knob.width / 2,
      y: knob.top + knob.height / 2,
    };

    const moveHandler = (e) => {
      this.currentDeg = this.getDeg(e.clientX, e.clientY, pts);
      // Prevent knob from jumping out of bounds
      if (this.currentDeg > this.endAngle || this.currentDeg < this.startAngle) {
        return;
      }
    
      // Calculate the value in the range [-1, 1] based on the knob's position
      let newValue = this.convertRange(
        this.startAngle,
        this.endAngle,
        -1, // Min value for left (fully counterclockwise)
        1,  // Max value for right (fully clockwise)
        this.currentDeg
      );
    
      // Ensure the value is within the bounds of -1 and 1 (just for safety)
      newValue = Math.max(-1, Math.min(1, newValue));
    
      // Update state and pass the new value to the parent component
      this.setState({ deg: this.currentDeg });
      this.props.onChange(newValue); // Send the continuous value between -1 and 1
      this.prevDeg = this.currentDeg;
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', moveHandler);
    });
  };

  getDeg = (cX, cY, pts) => {
    const x = cX - pts.x;
    const y = cY - pts.y;
    let deg = (Math.atan(y / x) * 180) / Math.PI;
    if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
      deg += 90;
    } else {
      deg += 270;
    }
    let finalDeg = Math.min(Math.max(this.startAngle, deg), this.endAngle);
    return finalDeg;
  };

  convertRange = (oldMin, oldMax, newMin, newMax, oldValue) => {
    return (
      ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
    );
  };

  renderTicks = () => {
    let ticks = [];
    const incr = this.fullAngle / this.props.numTicks;
    const size = this.margin + this.props.size / 2;
    for (let deg = this.startAngle; deg <= this.endAngle; deg += incr) {
      const tick = {
        deg: deg,
        tickStyle: {
          height: size + 10,
          left: size - 1,
          top: size + 2,
          transform: 'rotate(' + deg + 'deg)',
          transformOrigin: 'top',
        },
      };
      ticks.push(tick);
    }
    return ticks;
  };

  dcpy = (o) => {
    return JSON.parse(JSON.stringify(o));
  };

  render() {
    let kStyle = {
      width: this.props.size,
      height: this.props.size,
    };
    let iStyle = this.dcpy(kStyle);
    let oStyle = this.dcpy(kStyle);

    if (this.props.color) {
      oStyle.backgroundImage =
        'radial-gradient(100% 70%,hsl(210, ' +
        this.currentDeg +
        '%, ' +
        this.currentDeg / 5 +
        '%),hsl(' +
        Math.random() * 100 +
        ',20%,' +
        this.currentDeg / 36 +
        '%))';
    }
    iStyle.transform = 'rotate(' + this.state.deg + 'deg)';

    return (
      <div className="knob" style={kStyle}>
        <div className="ticks">
          {this.props.numTicks
            ? this.renderTicks().map((tick, i) => (
                <div
                  key={i}
                  className={
                    'tick' + (tick.deg <= this.currentDeg ? ' active' : '')
                  }
                  style={tick.tickStyle}
                />
              ))
            : null}
        </div>
        <div className="knob outer" style={oStyle} onMouseDown={this.startDrag}>
          <div className="knob inner" style={iStyle}>
            <div className="grip" />
          </div>
        </div>
      </div>
    );
  }
}

Knob.defaultProps = {
  size: 150,
  min: 10,
  max: 30,
  numTicks: 0,
  degrees: 270,
  value: 0,
};

export default Knob;


