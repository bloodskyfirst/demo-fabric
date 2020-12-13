<template>
  <div class="home">
	<img src="../assets/logo.png" alt="" @click="drawTypeChange('wall')" >
  <!-- drawTypeChange('wall') -->
	<!-- drawPolygon() -->
	<div class="canvas-box">
		<div class="control">
			<span @click.stop="scale(1)">+</span>
			<span @click.stop="scale(-1)">-</span>
		</div>
		<canvas id="canvas" :width="canvasW" :height="canvasH" border="1px solid yellow" @mousewheel="tes($event)"></canvas>
	</div>
	<div class="function-box">
		<ul>
			<li v-for="(item,index) in drawModule" :key="index">
				<img :src="handleDrawModulePic(item.path)" alt="" @click="draw(item.path)" :ref="item.path">
			</li>
		</ul>
		<ul>
			<li v-for="(item,index) in drawList" :key="index">
				
				<button @click="del(index)">X</button>
			</li>
		</ul>
	</div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
const bottomMap =  require('@/assets/map.jpg')
import {fabric} from 'fabric'

export default {
  name: 'Home',
  data() {
  	return {
		// rect: [],
		// showMenu: false,
		// x: "",
		// y: "",
		// mouseFrom: {}, // 已经被变量替换大部分
		mouseTo: {},
		drawType: null,  //当前绘制图像的种类
		canvasObjectIndex: 0,
		textbox: null,
		rectangleLabel: "warning",
		drawWidth: 2, //笔触宽度
		color: "#E34F51", //画笔颜色
		drawingObject: null, //当前绘制对象
		// moveCount: 1, //绘制移动计数器
		doDrawing: false, // 绘制状态
		//polygon 相关参数
		polygonMode: false,
		pointArray: [], // 多边形的点 数组
		lineArray: [], // 多边形的线 数组
		activeShape: false,
		activeLine: "",
		line: {}, // 自己写的wall类型用参数
		delectKlass: {}, // 无用参数
		imgFile: {}, // 上传用参数
		imgSrc: "", // 上传用参数
		
		
		pressing:false, // 是否处于按压状态
		canvasW:'800px',
		canvasH:'800px',
		selectChild:false,
		pressOrigin:{
			x:'',
			y:''
		},
		scalePercent:{
			left:0,
			top:0,
			x:'', // 原始的width的比例
			y:'', // 原始的height的比例
			now:0,
		},
		mapOrigin:{
			width:'',
			height:'',
		},
  		drawArea: '',
		drawList:[],
		drawModule:[
			{
				path:'leaveLift'
			},
			{
				path:'liftWait'
			},
			{
				path:'map-in'
			},
			{
				path:'map-out'
			},
			{
				path:'rideLift'
			},
			{
				path:'transit'
			},
			{
				path:'wallEnd'
			},
			{
				path:'wallStart'
			},
			{
				path:'workCharge'
			},
			{
				path:'workStart'
			},
			{
				path:'workStation'
			},
			{
				path:'workWait'
			}
		]
  	}
  },
  methods:{
	handleDrawModulePic(path){
		return require('@/assets/functionIcon/'+path+'.png')
	},
	inputCoordinateConvert(point){
		// 判断 该坐标是否在当前尺寸内
		const {x,y} = point
		// 获取当前尺寸
		const width = this.mapOrigin.width * this.scalePercent.x*(1+this.scalePercent.now)
		const height = this.mapOrigin.height * this.scalePercent.y*(1+this.scalePercent.now)
		if(y>height || x<0 || y<0){
			console.log('该坐标不在当前尺寸内')
			return false
		}
		const newPoint ={
			x,
			y:height-y
		}
		return newPoint
	},
	drawTypeChange(e) { // 改变绘画类型
	  this.drawType = e;
	  this.drawArea.skipTargetFind = !!e
	  if (e == "pen") {
	    // isDrawingMode为true 才可以自由绘画
	    this.drawArea.isDrawingMode = true;
	  } else {
	    this.drawArea.isDrawingMode = false;
	  }
	},
	mouseDown(e){
		// 原代码
		// var xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY);
		// this.mouseFrom.x = xy.x; // 需要修改的变量
		// this.mouseFrom.y = xy.y; // 需要修改的变量
		this.doDrawing = true;
		// 暂时用不到的代码
		// if (this.drawType == "text") {
		//   this.drawing();
		// }
		// if (this.textbox) {
		//   this.textbox.enterEditing();
		//   this.textbox.hiddenTextarea.focus();
		// }
		this.pressing = true
		// 原代码结束
		this.selectChild = false
		const { x,y} = e.pointer
		this.pressOrigin.x = x // this.mouseFrom.x
		this.pressOrigin.y = y // this.mouseFrom.y
		if(this.drawType){ // 执行对应drawType的任务
			this.drawOther(e)
			return
		}
	},
	mouseMove(move){
		// 原代码
		// if (this.moveCount % 2 && !this.doDrawing) {
		//   //减少绘制频率
		//   return;
		// }
		// this.moveCount++;
		// var xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY);
		// this.mouseTo.x = xy.x;
		// this.mouseTo.y = xy.y;
		// // 多边形与文字框	特殊处理
		// if (this.drawType != "text" || this.drawType != "polygon") { // 暂时没用到的代码
		//   this.drawing(e);
		// }
		// if (this.drawType == "polygon") {
		//   if (this.activeLine && this.activeLine.class == "line") {
		//     var pointer = this.canvas.getPointer(e.e);
		//     this.activeLine.set({ x2: pointer.x, y2: pointer.y });
		//     var points = this.activeShape.get("points");
		//     points[this.pointArray.length] = {
		//       x: pointer.x,
		//       y: pointer.y,
		//       zIndex: 1
		//     };
		//     this.activeShape.set({
		//       points: points
		//     });
		//     this.canvas.renderAll();
		//   }
		//   this.canvas.renderAll();
		// }
		// 原代码结束
		
		let canvasWidth = Number(this.canvasW.split('px')[0])
		let canvasHeight = Number(this.canvasH.split('px')[0])
		let moveX = move.pointer.x - this.pressOrigin.x // this.mouseTo.x = move.pointer.x
		let moveY = move.pointer.y - this.pressOrigin.y // this.mouseTo.y = move.pointer.y
		if(this.drawType){ // 选中有绘画类型时不允许移动
			// 多边形与文字框特殊处理
			if (this.drawType != "text" || this.drawType != "polygon") {
				this.drawing(move);
			}
			if (this.drawType == "polygon") {
				if (this.activeLine && this.activeLine.class == "line") {
					let pointer = this.drawArea.getPointer(move.e);
					this.activeLine.set({ x2: pointer.x, y2: pointer.y });
					let points = this.activeShape.get("points");
					points[this.pointArray.length] = {
						x: pointer.x,
						y: pointer.y,
						zIndex: 1
					};
					this.activeShape.set({
						points: points
					});
					this.drawArea.renderAll();
				}
				this.drawArea.renderAll();
			}
			return
		}
		// 移动操作
		if(this.selectChild){ // 选中子集时不能移动
			return;
		}
		if(!this.pressing){ // 如果不是按着拖动，不移动背景图
			return
		}
		// 边界处理
		console.log(moveX,moveY)
		if(moveX >0 && this.scalePercent.left- moveX<0){
			return
		}
		// 大于0的时候不会走进去
		if(moveX <0 && Math.abs(this.scalePercent.left- moveX)* (1+this.scalePercent.now) > ((this.scalePercent.x* (1+this.scalePercent.now) * this.mapOrigin.width)- canvasWidth )  ){
			return
		}
		if(moveY >0 && this.scalePercent.top- moveY<0){
			return
		}
		if(moveY <0 && Math.abs(this.scalePercent.top- moveY)* (1+this.scalePercent.now) > ((this.scalePercent.y* (1+this.scalePercent.now) * this.mapOrigin.height)- canvasHeight )  ){
			return
		}
		console.log('拖动前的位置',-this.scalePercent.left,-this.scalePercent.top)
		this.scalePercent.left -= moveX
		this.scalePercent.top -=moveY
		console.log('拖动后的位置',-this.scalePercent.left,-this.scalePercent.top)
		this.drawMap({
			left:(0-this.scalePercent.left) * (1+this.scalePercent.now),
			top:(0-this.scalePercent.top) * (1+this.scalePercent.now),
			x: this.scalePercent.x * (1+this.scalePercent.now),
			y: this.scalePercent.y * (1+this.scalePercent.now)
		})
		this.pressOrigin.x = move.pointer.x
		this.pressOrigin.y = move.pointer.y
	},
	mouseUp(e){
		// 原代码
		// var xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY);
		// this.mouseTo.x = xy.x;
		// this.mouseTo.y = xy.y;
		this.drawingObject = null;
		if (this.drawType != "polygon") {
		  this.doDrawing = false;
		}
		// 原代码结束
		this.pressing = false
		// this.drawArea.__eventListeners["mouse:move"] = []
		// if(!this.drawType){ // 只有当绘制结束,清除原点
			this.pressOrigin.x = ''
			this.pressOrigin.y = ''
		// }
	},
	draw(el,type='svg'){
		let imgInstance = new fabric.Image(this.$refs[el][0], {
		  left: 100,
		  top: 100,
		  // angle: 30,
		  lockScalingX:true,
		  lockScalingY:true,
		  lockMovementY:true,
		  lockMovementX:true,
		  lockRotation:true,
		  // opacity: 0.85
		});
		imgInstance.on('mousedown',e=>{
			this.selectChild = true
			console.log(e,'子集被点击了')
		})
		imgInstance.on('mouseup',e=>{
			this.selectChild = false
			console.log(e,'子集取消点击')
		})
		this.drawArea.add(imgInstance)
		this.drawList.push(imgInstance)
	},
	drawMap(obj={}){
		// const map = document.createElement('img')
		// map.setAttribute('src','../assets/map.jpg')
		// this.mapOrigin = new fabric.Image(map, {
		//   left:0,
		//   top: 0,
		// });
		if(!this.mapOrigin.width || !this.mapOrigin.height){
			console.log('暂未获取到原图尺寸')
			return
		}
		console.log(obj,'此时比例',this.scalePercent.now)
		this.drawArea.setBackgroundImage(bottomMap, this.drawArea.renderAll.bind(this.drawArea), {
		    // opacity: 1,
		    // angle: 0,
		    // left: -4500,
		    // top: -300,
			left:obj.left!=='' ? obj.left :  this.scalePercent.left,
			top:obj.top!=='' ? obj.top : this.scalePercent.top,
			scaleX:obj.x || (this.drawArea.width / this.mapOrigin.width),
			scaleY:obj.y || (this.drawArea.height / this.mapOrigin.height),
		    // originY: 'top'
		    // originX: 'left',
		});
		// fabric.Image.fromURL(map, (img)=>{
		//         // add background image
		        
		// });
	},
	del(index){
		this.drawArea.remove(this.drawList[index])
		this.drawList.splice(index,1)
	},
	scale(num){
		let handleLeft,handleTop;
		if(num>0){ // 放大
			if(this.scalePercent.x*(1+this.scalePercent.now)>1){
				console.log('不能再放大了')
			}
			this.scalePercent.now +=1
		}else{ // 缩小
			if(!this.scalePercent.now ){
				console.log('不能再缩小了')
				return
			}
			let canvasWidth = Number(this.canvasW.split('px')[0])
			let canvasHeight = Number(this.canvasH.split('px')[0])
			// 缩小边界处理
			if( Math.abs(this.scalePercent.left*this.scalePercent.now)>(this.scalePercent.x* this.scalePercent.now * this.mapOrigin.width)-canvasWidth ){
			    console.log(this.scalePercent.left)
			     this.scalePercent.left = (this.scalePercent.x* this.scalePercent.now * this.mapOrigin.width) - canvasWidth
			     handleLeft = true
			     console.log(this.scalePercent.left,1)
			}
			if( Math.abs(this.scalePercent.top*this.scalePercent.now)>(this.scalePercent.y* this.scalePercent.now * this.mapOrigin.height)-canvasHeight ){
			     this.scalePercent.top = (this.scalePercent.y* this.scalePercent.now * this.mapOrigin.height) - canvasHeight
			     console.log(this.scalePercent.top,2)
			     handleTop = true
			}
			this.scalePercent.now -=1
		}
		console.log('缩/放的比例',this.scalePercent.now)
		this.drawMap({
			left:handleLeft ? (0-this.scalePercent.left) : (0-this.scalePercent.left) * (1+this.scalePercent.now),
			top:handleTop ? (0-this.scalePercent.top) :  (0-this.scalePercent.top) * (1+this.scalePercent.now),
			x: this.scalePercent.x * (1+this.scalePercent.now),// 换算百分比
			y: this.scalePercent.y * (1+this.scalePercent.now) // 换算百分比
		})
	},
	drawPolygon() {
	  this.drawType = "polygon";
	  this.polygonMode = true;
	  //这里画的多边形，由顶点与线组成
	  this.pointArray = new Array();  // 顶点集合  mark
	  this.lineArray = new Array();  //线集合	mark
	  this.drawArea.isDrawingMode = false;
	},
	drawOther(e){
		if(this.drawType == 'wall'){
			let circle = new fabric.Circle({
			  radius: 5,
			  fill: "red",
			  stroke: "#333333",
			  strokeWidth: 1.5,
			  left: (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
			  top: (e.pointer.y || e.e.layerY) / this.drawArea.getZoom(),
			  selectable: false,
			  hasBorders: false,
			  hasControls: false,
			  originX: "center",
			  originY: "center",
			  objectCaching: false
			});
			let points = [
			  (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
			  (e.pointer.y || e.e.layerY) / this.drawArea.getZoom(),
			  (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
			  (e.pointer.y || e.e.layerY) / this.drawArea.getZoom()
			]
			// let line = new fabric.Line(points, {
			//   strokeWidth: 2,
			//   fill: "black",
			//   stroke: "#999999",
			//   class: "line",
			//   originX: "center",
			//   originY: "center",
			//   selectable: false,
			//   hasBorders: false,
			//   hasControls: false,
			//   evented: false,
			//   objectCaching: false
			// });
			this.drawArea.add(circle);
			// this.drawArea.add(line);
			
		}
		// 绘制多边形
		if (this.drawType == "polygon") {
			this.drawArea.skipTargetFind = false;
			// 此段为判断是否闭合多边形，点击红点时闭合多边形
			if (this.pointArray.length > 1) {
			// e.target.id == this.pointArray[0].id 表示点击了初始红点
				if (e.target && e.target.id == this.pointArray[0].id) {
					this.generatePolygon(); // 闭合
				}
			}
			//未点击红点则继续作画
			if (this.polygonMode) {
				this.addPoint(e);
			}
		}
	},
	addPoint(e) {
	    let random = Math.floor(Math.random() * 10000);
	    let id = new Date().getTime() + random;
	    let circle = new fabric.Circle({
	      radius: 5,
	      fill: "#ffffff",
	      stroke: "#333333",
	      strokeWidth: 0.5,
	      left: (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
	      top: (e.pointer.y || e.e.layerY) / this.drawArea.getZoom(),
	      selectable: false,
	      hasBorders: false,
	      hasControls: false,
	      originX: "center",
	      originY: "center",
	      id: id,
	      objectCaching: false
	    });
	    if (this.pointArray.length == 0) {
	      circle.set({
	        fill: "red"
	      });
	    }
	    var points = [
	      (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
	      (e.pointer.y || e.e.layerY) / this.drawArea.getZoom(),
	      (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
	      (e.pointer.y || e.e.layerY) / this.drawArea.getZoom()
	    ];
	    this.line = new fabric.Line(points, {
	      strokeWidth: 2,
	      fill: "#999999",
	      stroke: "#999999",
	      class: "line",
	      originX: "center",
	      originY: "center",
	      selectable: false,
	      hasBorders: false,
	      hasControls: false,
	      evented: false,
	      objectCaching: false
	    });
	    if (this.activeShape) {
	      var pos = this.drawArea.getPointer(e.e);
	      var points = this.activeShape.get("points");
	      points.push({
	        x: pos.x,
	        y: pos.y
	      });
	      var polygon = new fabric.Polygon(points, {
	        stroke: "#333333",
	        strokeWidth: 1,
	        fill: "#cccccc",
	        opacity: 0.3,
	        selectable: false,
	        hasBorders: false,
	        hasControls: false,
	        evented: false,
	        objectCaching: false
	      });
	      this.drawArea.remove(this.activeShape);
	      this.drawArea.add(polygon);
	      this.activeShape = polygon;
	      this.drawArea.renderAll();
	    } else {
	      var polyPoint = [
	        {
	          x: (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
	          y: (e.pointer.y || e.e.layerY) / this.drawArea.getZoom()
	        }
	      ];
	      var polygon = new fabric.Polygon(polyPoint, {
	        stroke: "#333333",
	        strokeWidth: 1,
	        fill: "#cccccc",
	        opacity: 0.3,
	        selectable: false,
	        hasBorders: false,
	        hasControls: false,
	        evented: false,
	        objectCaching: false
	      });
	      this.activeShape = polygon;
	      this.drawArea.add(polygon);
	    }
	    this.activeLine = this.line;
	    this.pointArray.push(circle);
	    this.lineArray.push(this.line);
	    this.drawArea.add(this.line);
	    this.drawArea.add(circle);
	},
	generatePolygon() {
		// 原代码
	    let points = new Array();
	    this.pointArray.map((point, index) => {
	      points.push({
	        x: point.left,
	        y: point.top
	      });
	      this.drawArea.remove(point);
	    });
	    this.lineArray.map((line, index) => {
	      this.drawArea.remove(line);
	    });
	    this.drawArea.remove(this.activeShape).remove(this.activeLine);
	    let polygon = new fabric.Polygon(points, {
	      stroke: this.color,
	      strokeWidth: this.drawWidth,
	      fill: "rgba(255, 255, 255, 0)",
	      opacity: 1,
	      hasBorders: true,
	      hasControls: false
	    });
	    this.drawArea.add(polygon);
	    this.activeLine = null;
	    this.activeShape = null;
	    this.polygonMode = false;
	    this.doDrawing = false;
	    this.drawType = null;
		// 原代码结束
		
		this.drawList.push(polygon)
	},
	drawing(e) { // 通用其他绘制
		if (this.drawingObject) {
			this.drawArea.remove(this.drawingObject);
		}
		let	canvasObject = null,
			left = this.pressOrigin.x,
			top = this.pressOrigin.y,
			mouseTo = e.pointer;
		if(this.drawType==='arrow'){ //箭头
			let x1 = left,
				y1 = top,
				x2 = mouseTo.x,
				y2 = mouseTo.y;
			let w = x2 - x1,
				h = y2 - y1,
				sh = Math.cos(Math.PI / 4) * 16;
			let sin = h / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
			let cos = w / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
			let w1 = (16 * sin) / 4,
			  h1 = (16 * cos) / 4,
			  centerx = sh * cos,
			  centery = sh * sin;
			/**
			 * centerx,centery 表示起始点，终点连线与箭头尖端等边三角形交点相对x，y
			 * w1 ，h1用于确定四个点
			 */
			let path = " M " + x1 + " " + y1;
			path += " L " + (x2 - centerx + w1) + " " + (y2 - centery - h1);
			path += " L " + (x2 - centerx + w1 * 2) + " " + (y2 - centery - h1 * 2);
			path += " L " + x2 + " " + y2;
			path += " L " + (x2 - centerx - w1 * 2) + " " + (y2 - centery + h1 * 2);
			path += " L " + (x2 - centerx - w1) + " " + (y2 - centery + h1);
			path += " Z";
			canvasObject = new fabric.Path(path, {
				stroke: this.color,
				fill: this.color,
				strokeWidth: this.drawWidth,
			});
		}
		if(this.drawType==="pentagram"){ //五角星
			let x1 = left,
				y1 = top,
				x2 = mouseTo.x,
				y2 = mouseTo.y;
			/**
			* 实现思路  (x1,y1)表示鼠标起始的位置 (x2,y2)表示鼠标抬起的位置
			* r 表示五边形外圈圆的半径，这里建议自己画个图理解
			* 正五边形夹角为36度。计算出cos18°，sin18°备用
			*/
			let w = Math.abs(x2 - x1),
				h = Math.abs(y2 - y1),
				r = Math.sqrt(w * w + h * h)
			let cos18 = Math.cos(18 * Math.PI / 180)
			let sin18 = Math.sin(18 * Math.PI / 180)
			/**
			* 算出对应五个点的坐标转化为路径
			*/
			let point1 = [x1, y1 + r]
			let point2 = [x1 + 2 * r * (sin18), y1 + r - 2 * r * (cos18)]
			let point3 = [x1 - r * (cos18), y1 + r * (sin18)]
			let point4 = [x1 + r * (cos18), y1 + r * (sin18)]
			let point5 = [x1 - 2 * r * (sin18), y1 + r - 2 * r * (cos18)]
			let path = " M " + point1[0] + " " + point1[1]
			path += " L " + point2[0] + " " + point2[1]
			path += " L " + point3[0] + " " + point3[1]
			path += " L " + point4[0] + " " + point4[1]
			path += " L " + point5[0] + " " + point5[1]
			path += " Z";
			canvasObject = new fabric.Path(path, {
				stroke: this.color,
				fill: this.color,
				strokeWidth: this.drawWidth,
				// angle:180,  //设置旋转角度
			});
		}
		if(this.drawType==="ellipse"){  //椭圆
			// 按shift时画正圆，只有在鼠标移动时才执行这个，所以按了shift但是没有拖动鼠标将不会画圆
			if (e.e.shiftKey) {
				mouseTo.x - left > mouseTo.y - top ? mouseTo.y = top + mouseTo.x - left : mouseTo.x = left + mouseTo.y - top
			}
			let radius =
				Math.sqrt(
				(mouseTo.x - left) * (mouseTo.x - left) +
				(mouseTo.y - top) * (mouseTo.y - top)
				) / 2;
			canvasObject = new fabric.Ellipse({
				left: (mouseTo.x - left) / 2 + left,
				top: (mouseTo.y - top) / 2 + top,
				stroke: this.color,
				fill: "rgba(255, 255, 255, 0)",
				originX: "center",
				originY: "center",
				rx: Math.abs(left - mouseTo.x) / 2,
				ry: Math.abs(top - mouseTo.y) / 2,
				strokeWidth: this.drawWidth
			});
		}
		if(this.drawType==="rectangle"){//长方形
			if(left=='' || top==''){
				return
			}
			// 按shift时画正方型
			if (e.e.shiftKey) {
			  mouseTo.x - left > mouseTo.y - top ? mouseTo.y = top + mouseTo.x - left : mouseTo.x = left + mouseTo.y - top
			}
			let path =
			  "M " +
				left+
			  " " +
			  top +
			  " L " +
			  mouseTo.x +
			  " " +
			  top +
			  " L " +
			  mouseTo.x +
			  " " +
			  mouseTo.y +
			  " L " +
			  left +
			  " " +
			  mouseTo.y +
			  " L " +
			  left +
			  " " +
			  top +
			  " z";
			canvasObject = new fabric.Path(path, {
			  left: left,
			  top: top,
			  stroke: this.color,
			  strokeWidth: this.drawWidth,
			  fill: "rgba(255, 255, 255, 0)",
			  hasControls: false
			});
			//也可以使用fabric.Rect
		}
		if(this.drawType==='text'){ //文本框
			this.textbox = new fabric.Textbox("", {
			  left: left,
			  top: top - 10,
			  // width: 150,
			  fontSize: 16,
			  borderColor: this.color,
			  fill: this.color,
			  hasControls: false
			});
			this.drawArea.add(this.textbox);
			this.textbox.enterEditing();
			this.textbox.hiddenTextarea.focus();
		}
		if(this.drawType==='wall'){
			canvasObject = new fabric.Line(points, {
				strokeWidth: 2,
				fill: "#999999",
				stroke: "#999999",
				class: "line",
				originX: "center",
				originY: "center",
				selectable: false,
				hasBorders: false,
				hasControls: false,
				evented: false,
				objectCaching: false
			})
		}
		if (canvasObject) {
			// canvasObject.index = getCanvasObjectIndex();\
			this.drawArea.add(canvasObject); //.setActiveObject(canvasObject)
			this.drawingObject = canvasObject;
		}
	}
  },
  mounted() {
	this.drawArea = new fabric.Canvas('canvas',{selection:null})
	const map = new Image();
	map.src = bottomMap
	map.onload = ()=>{
		this.mapOrigin.width = map.width
		this.mapOrigin.height = map.height
		this.scalePercent.x = this.drawArea.width / this.mapOrigin.width
		this.scalePercent.y = this.drawArea.height /this.mapOrigin.height
		this.drawMap({
			left:0,
			top:0,
		})
	}
	this.drawArea.on('mouse:down', this.mouseDown)
	this.drawArea.on('mouse:move', this.mouseMove )
	this.drawArea.on('mouse:up', this.mouseUp )
	this.drawArea.on('mouse:wheel', (event)=>{
		const {pointer,e } = event
		if(this.drawType){ // 选中绘制图形时不允许放大缩小
			return
		}
		this.scale(-e.deltaY)
		// if(e.deltaY>0){
		//     // console.log('下滚缩小')
		// }
		// //上滚
		// if(e.deltaY<0){
		//     // console.log('上滚放大')
		// }
	})
	document.onkeydown = e => {
	  // // 键盘 delect删除所选元素
	  // if (e.keyCode == 46) {
	  //   this.deleteObj();
	  // }
	  // ctrl+z 删除最近添加的元素
	  if (e.keyCode == 90 && e.ctrlKey) {
	    this.drawArea.remove(
	      this.drawArea.getObjects()[this.drawArea.getObjects().length - 1]
	    );
	  }
	};
	// this.drawArea.on('object:moving', (e)=>{ // 用来监听子集移动
	// 	console.log(e)
	//     // var obj = e.target;
	//     //  // if object is too big ignore
	//     // if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
	//     //     return;
	//     // }        
	//     // obj.setCoords();        
	//     // // top-left  corner
	//     // if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
	//     //     obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
	//     //     obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
	//     // }
	//     // // bot-right corner
	//     // if(obj.getBoundingRect().top obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left obj.getBoundingRect().width  > obj.canvas.width){
	//     //     obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height obj.top-obj.getBoundingRect().top);
	//     //     obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width obj.left-obj.getBoundingRect().left);
	//     // }
	// });
  }
}
</script>

<style>
	#canvas{
		border:1px solid beige;
		margin: 0 auto;
	}
	.canvas-box{
		/* overflow: scroll; */
		position: relative;
		display: flex;
		width: 100%;
		justify-content: center;
	}
	.function-box{
		display: flex;
		justify-content: space-around;
	}
	.function-box > ul{
		width: 300px;
		list-style: none;
	}
	.function-box > ul >li{
		display: flex;
		justify-content: space-around;
	}
	.control{
		position: absolute;
		z-index: 3;
		margin: 0 auto;
		left:400px;
		width: 100px;
		display: flex;
		justify-content: space-around;
	}
	.control>span{
		font-size: 30px;
	}
</style>
