import React, { Component } from "react";
//import logo from './logo.svg';
//import {CirclePicker} from "react-color"
import background from "./thumbnail/background.png"
import undoButton from "./thumbnail/undo.png"
import redoButton from "./thumbnail/redo.png"
import penButton from "./thumbnail/pen.png"
import eraserButton from "./thumbnail/eraser.png"
import clearButton from "./thumbnail/clear.png"
import masterCSS from "./App.css";


const style = {
  canvas: {
    style: {
      left: '0px',
      top: '0px'
    },
    border: 'solid 1px',
    backgroundImage: "url(" + background + ")",
    transform: 'translateY(13%)',
    //position: 'absolute',
    //top: '50%',
    //left: '50%'
  }
}


export default class App extends Component {

  componentDidMount() {
    this.canvas = document.getElementById("canvasArea")
    this.ctx = this.canvas.getContext('2d')
    //this.ctx.lineWidth = this.state.radius * 2

  }


  getMousePosition(e) {
    const { top, left } = this.canvas.getBoundingClientRect();
    return [ e.clientX - left, e.clientY - top ]
  }

  sketch(x, y) {
    this.ctx.lineWidth = this.state.radius * 2
    this.ctx.fillStyle = this.state.color
    this.ctx.strokeStyle = this.state.color
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.arc(x, y, this.state.radius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  }

  state = {
    color: "",
    colorActive: false,
    dragging: false,
    radius: 5,
    point_record: {},
    historyAsObject: {"undoStack":[], "redoStack":[]}
  }

  clear = (event) => {
    if (window.confirm("Are you sure you want to clear this WhiteBoard?")) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      var record = {
                        info: {
                          mode: "clear"

                        }
      }
      this.state.historyAsObject.undoStack.push(record)
      console.log(this.state)
    }
  }

  decrad = (event) => {
    if (this.state.radius > 5) {
      this.setState({radius: this.state.radius - 5})
      console.log(this.state.radius)
    }
  }

  incrad = (event) => {
    if (this.state.radius <= 25) {
      this.setState({radius: this.state.radius + 5})
      console.log(this.state.radius)
    }
  }

  pen = (event) => {
    console.log("pen function")
    this.canvas.onmousedown = (e) => {
      this.setState({dragging: true})
      this.ctx.beginPath()
      const [x, y] = this.getMousePosition(e)
      var point = [{mouseX: x, mouseY: y}]
      var point_record = {
                      info: {
                              mode: "pen",
                              lineWidth: this.ctx.lineWidth,
                              lineColor: this.ctx.fillStyle,
                              point: point
                             }
                      }
      this.setState({point_record: point_record})
      console.log("[pen] mouse down")
    }

    this.canvas.onmousemove = (e) => {
      if (this.state.dragging === true) {
        console.log("[pen] mouse move")
        this.ctx.globalCompositeOperation="source-over"
        const [x, y] = this.getMousePosition(e)
        this.sketch(x, y)
        this.state.point_record.info.point.push({x, y})
      }
    }

    this.canvas.onmouseup = (e) => {
      this.setState({dragging: false})
      this.state.historyAsObject.undoStack.push(this.state.point_record)
      console.log("[pen] mouse up")
    }
  }

  eraser = (event) => {
    console.log("eraser function")
    console.log(this.state.dragging)
    this.canvas.onmousedown = (e) => {
      this.setState({dragging: true})
      this.ctx.save()
      this.ctx.beginPath()
      const [x, y] = this.getMousePosition(e)
      var point = [{mouseX: x, mouseY: y}]
      var point_record = {
                      info: {
                              mode: "eraser",
                              lineWidth: this.ctx.lineWidth,
                              lineColor: this.ctx.fillStyle,
                              point: point
                             }
                      }
      this.setState({point_record: point_record})
      console.log("[eraser] mouse down")
    }

    this.canvas.onmousemove = (e) => {
      if (this.state.dragging === true) {
        console.log("[eraser] mouse move")
        this.ctx.globalCompositeOperation="destination-out"
        const [x, y] = this.getMousePosition(e)
        this.sketch(x, y)
      }
    }

    this.canvas.onmouseup = (e) => {
      this.setState({dragging: false})
      this.ctx.restore()
      this.state.historyAsObject.undoStack.push(this.state.point_record)
      console.log("[eraser] mouse up")
      console.log(this.state)
    }
  }

  selectColor = (color) => {
    console.log("change color to " + color)
    this.setState({color: color})
    //this.classList.add("active")
  }


  render() {
    return (
      <div ref= "canvas">
        <div id="toolbar">
          <div id="title">
            <b>WhiteBoard</b>
          </div>

          <div id="rad">
            Radius: <b><span ref="radval">{this.state.radius}</span></b>
            <span ref="decrad" className="radcontrol" onClick={this.decrad}>-</span>
            <span ref="incrad" className="radcontrol" onClick={this.incrad}>+</span>
          </div>

          <span id="clear" ref="clear">
            <img onClick={this.clear} alt="btn-clear" id="btn-clear" src={clearButton} width="40px" height="40px" />
          </span>

          <span id="undo" ref="undo">
              <img alt="btn-undo" id="btn-undo" src={undoButton} width="40px" height="40px" margin-top="-5px"/>
          </span>

          <span id="redo" ref="redo">
              <img alt="btn-redo" id="btn-redo" src={redoButton} width="40px" height="40px" />
          </span>

          <span id="pen" ref="pen">
              <img onClick={this.pen} alt="btn-pen" id="btn-pen" src={penButton} width="40px" height="40px" />
          </span>

          <span id="eraser" ref="eraser">
              <img onClick={this.eraser} alt="btn-eraser" id="btn-eraser" src={eraserButton} width="40px" height="40px"/>
          </span>

          <span id="colors">
              <span className={this.state.color === "black" ? "swatch active" : "swatch"}
                    style={{background: "black"}} onClick={() => this.selectColor("black")}>
              </span>

              <span className={this.state.color === "white" ? "swatch active" : "swatch"}
                    style={{background: "white"}} onClick={() => this.selectColor("white")}>
              </span>

              <span className={this.state.color === "grey" ? "swatch active" : "swatch"}
                    style={{background: "grey"}} onClick={() => this.selectColor("grey")}>
              </span>

              <span className={this.state.color === "red" ? "swatch active" : "swatch"}
                    style={{background: "red"}} onClick={() => this.selectColor("red")}>
              </span>

              <span className={this.state.color === "orange" ? "swatch active" : "swatch"}
                    style={{background: "orange"}} onClick={() => this.selectColor("orange")}>
              </span>

              <span className={this.state.color === "yellow" ? "swatch active" : "swatch"}
                    style={{background: "yellow"}} onClick={() => this.selectColor("yellow")}>
              </span>

              <span className={this.state.color === "green" ? "swatch active" : "swatch"}
                    style={{background: "green"}} onClick={() => this.selectColor("green")}>
              </span>

              <span className={this.state.color === "blue" ? "swatch active" : "swatch"}
                    style={{background: "blue"}} onClick={() => this.selectColor("blue")}>
              </span>

              <span className={this.state.color === "indigo" ? "swatch active" : "swatch"}
                    style={{background: "indigo"}} onClick={() => this.selectColor("indigo")}>
              </span>

              <span className={this.state.color === "violet" ? "swatch active" : "swatch"}
                    style={{background: "violet"}} onClick={() => this.selectColor("violet")}>
              </span>
          </span>

        </div>
        <canvas
          className = "canvasArea"
          id = "canvasArea"
          height = "600"
          width = "800"
          style = {style.canvas}

        >
        </canvas>
      </div>
    );
  }
}
