import React, { Component } from "react";
//import logo from './logo.svg';
//import {CirclePicker} from "react-color"
import { findDOMNode } from 'react-dom'
import background from "./thumbnail/background.png"
import undoButton from "./thumbnail/undo.png"
import redoButton from "./thumbnail/redo.png"
import downloadButton from "./thumbnail/download.png"
import uploadButton from "./thumbnail/upload.png"
import penButton from "./thumbnail/pen.png"
import eraserButton from "./thumbnail/eraser.png"
import clearButton from "./thumbnail/clear.png"
import masterCSS from "./App.css";

const style = {
  canvas: {
    border: 'solid 1px',
    backgroundImage: "url(" + background + ")"
  }
}

export default class Whiteboard extends React.Component {

  state = {
    color: "",
    dragging: false,
    radius: 5,
    point_record: {},
    historyAsObject: {"undoStack":[], "redoStack":[]}
  }

  componentDidMount() {
    this.canvas = findDOMNode(this.canvasRef)
    this.ctx = this.canvas.getContext('2d')
  }

  getMousePosition(e) {
    const { top, left } = this.canvas.getBoundingClientRect();
    return [ e.clientX - left, e.clientY - top ]
  }

  sketch(x, y, color, radius) {
    this.ctx.lineWidth = radius * 2
    this.ctx.fillStyle = color
    this.ctx.strokeStyle = color
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  }

  redrawAll() {
    console.log(this.state)
    for (var i=0; i<this.state.historyAsObject.undoStack.length; i++) {
    var point_info = this.state.historyAsObject.undoStack[i].info
    var radius = point_info.lineWidth
    var color = point_info.lineColor

    this.ctx.beginPath()

    if (this.state.historyAsObject.undoStack[i].info.mode === "draw") {
      this.ctx.save()
      this.ctx.globalCompositeOperation = "source-over"
      for (var j=0; j<this.state.historyAsObject.undoStack[i].info.point.length; j++) {
        var mouseX = this.state.historyAsObject.undoStack[i].info.point[j].mouseX
        var mouseY = this.state.historyAsObject.undoStack[i].info.point[j].mouseY

        this.ctx.globalCompositeOperation="source-over"
        this.sketch(mouseX, mouseY, color, radius)
        this.setState({radius: radius})
        this.setState({color: color})
      }
        this.ctx.restore()
    }

    if (this.state.historyAsObject.undoStack[i].info.mode === "eraser") {
      this.ctx.save()
      for (var j=0; j<this.state.historyAsObject.undoStack[i].info.point.length - 1; j++) {
        var mouseX = this.state.historyAsObject.undoStack[i].info.point[j].mouseX
        var mouseY = this.state.historyAsObject.undoStack[i].info.point[j].mouseY

        this.ctx.globalCompositeOperation="destination-out"
        this.sketch(mouseX, mouseY, color, radius)
        this.setState({radius: radius})
        this.setState({color: color})
      }
      this.ctx.restore()
    }

    if(this.state.historyAsObject.undoStack[i].info.mode === "clear") {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    if(this.state.historyAsObject.undoStack[i].info.mode === "loadImg") {
      var canvas = document.getElementById("canvasArea")
      var ctx = canvas.getContext("2d")
      ctx.save()
      ctx.globalCompositeOperation="destination-over"
      var img = new Image()
      img.src = this.state.historyAsObject.undoStack[i].info.image
          ctx.drawImage(img, canvas.width/2 - img.width/2,
                       canvas.height/2 - img.height/2)
      ctx.restore()
    }
  }
}

  undo = (event) => {
    if (this.state.historyAsObject.undoStack.length >= 1) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.state.historyAsObject.redoStack.unshift(this.state.historyAsObject.undoStack.pop())
      this.redrawAll()
    }
  }


  redo = (event) => {
    if (this.state.historyAsObject.redoStack.length > 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.state.historyAsObject.undoStack.push(this.state.historyAsObject.redoStack.shift())
      this.redrawAll()
    }
  }

  download = (event) => {
    var image = this.canvas.toDataURL("image/png", 1.0)
    var link = document.createElement("a")
    link.download = "whiteboard-image.png"
    link.href = image
    link.click()
  }

  upload = (event) => {
    //var loadImg = document.getElementById("files")
    this.loadImg = findDOMNode(this.uploadRef)
        var files = event.target.files // FileList object
        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f = 0; f = files[i]; i++) {
          var reader = new FileReader()
          // Closure to capture the file information.
          reader.onload = ((theFile) => {
              //Render the image to canvas.
              return (e)=> {

                var img = new Image()
                img.src = e.target.result
                console.log(this.state)
                var img_record = {
                                info: {
                                        mode: "loadImg",
                                        image: e.target.result
                                      }
                                }
                this.state.historyAsObject.undoStack.push(img_record)

                img.addEventListener("load", () => {
                  //this.canvas = document.getElementsByClassName("canvasArea")[0]
                  this.ctx = this.canvas.getContext("2d")
                  this.ctx.drawImage(img, this.canvas.width/2 -img.width/2,
                                     this.canvas.height/2 - img.height/2)
                }, false)

              }
          })(f)
          // Read in the image file as a data URL.
          reader.readAsDataURL(f)

        }
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
    if (this.state.color === "") {
      this.setState({color: "black"})
    }

    this.canvas.onmousedown = (e) => {
      this.setState({dragging: true})
      this.ctx.beginPath()
      const [x, y] = this.getMousePosition(e)
      var point = [{mouseX: x, mouseY: y}]
      var point_record = {
                      info: {
                              mode: "draw",
                              lineWidth: this.state.radius,
                              lineColor: this.state.color,
                              point: point
                             }
                      }
      this.setState({point_record: point_record})

      console.log("[pen] mouse down")
    }

    this.canvas.onmousemove = (e) => {
      if (this.state.dragging === true) {
        console.log("[pen] mouse move")
        this.ctx.save()
        this.ctx.globalCompositeOperation="source-over"
        const [x, y] = this.getMousePosition(e)
        var color = this.state.color
        var radius = this.state.radius
        this.sketch(x, y, color, radius)
        this.state.point_record.info.point.push({mouseX:x, mouseY:y})
        this.ctx.restore()
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
      this.ctx.fillStyle = ""
      this.ctx.strokeStyle = ""
      var point_record = {
                      info: {
                              mode: "eraser",
                              lineWidth: this.state.radius,
                              lineColor: "",
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
        var radius = this.state.radius
        this.sketch(x, y, "", radius)
        this.state.point_record.info.point.push({mouseX:x, mouseY:y})
      }
    }

    this.canvas.onmouseup = (e) => {
      this.setState({dragging: false})
      this.ctx.restore()
      this.state.historyAsObject.undoStack.push(this.state.point_record)
      console.log("[eraser] mouse up")
    }
  }

  selectColor = (color) => {
    console.log("change color to " + color)
    this.setState({color: color})
  }

  render() {
    return (
      <div id="container" className="container">
        <div id="toolbar">

          <div className="row">
            <span id="title">
              <b>WhiteBoard</b>
            </span>

            <span id="undo" ref="undo">
                <img alt="btn-undo" onClick={this.undo} className="btn-undo" src={undoButton} />
            </span>

            <span id="redo" ref="redo">
                <img alt="btn-redo" onClick={this.redo} className="btn-redo" src={redoButton} />
            </span>

            <span id="download" ref="download">
                <img alt="btn-download" id="btn-download" onClick={this.download} className="btn-download" src={downloadButton} />
            </span>

            <span id="upload" ref="upload">
                Drag / Import an image: <input type="file" id="files" name="files[]" ref={(upload) => { this.uploadRef = upload }} onChange={this.upload}/>
            </span>

          </div>

          <div className="row">
            <div id="rad">
              Radius: <b><span ref="radval">{this.state.radius}</span></b>
              <span ref="decrad" className="radcontrol" onClick={this.decrad}>-</span>
              <span ref="incrad" className="radcontrol" onClick={this.incrad}>+</span>
            </div>

            <span id="clear" ref="clear">
              <img onClick={this.clear} alt="btn-clear" id="btn-clear" src={clearButton} width="40px" height="40px" />
            </span>

            <span id="pen" ref="pen">
                <img onClick={this.pen} alt="btn-pen" id="btn-pen" src={penButton} width="40px" height="40px" />
            </span>

            <span id="eraser" ref="eraser">
                <img onClick={() => this.eraser()} alt="btn-eraser" id="btn-eraser" src={eraserButton} width="40px" height="40px"/>
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
        </div>
        <canvas
          className = "canvasArea"
          id = "canvasArea"
          ref = {(canvas) => { this.canvasRef = canvas }}
          height = "600%"
          width = "800%"
          style = {style.canvas}
        >
        </canvas>

      </div>
    );
  }
}
