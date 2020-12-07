<template>
  <div class="home">
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
		canvasW:'800px',
		canvasH:'800px',
		drawType:'',
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
		this.drawArea.setBackgroundImage(bottomMap, this.drawArea.renderAll.bind(this.drawArea), {
		    // opacity: 1,
		    // angle: 0,
		    // left: -4500,
		    // top: -300,
			left:obj.left || this.scalePercent.left,
			top:obj.top || this.scalePercent.top,
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
		if(num>0){ // 放大
			if(this.scalePercent.now>=100){
				console.log('不能再放大了')
				return
			}
			// this.scalePercent.now +=25
			this.scalePercent.now +=10
		}else{ // 缩小
			if(!this.scalePercent.now ){
				console.log('不能再缩小了')
				return
			}
			// this.scalePercent.now -=25
			this.scalePercent.now -=10
		}
		// this.drawMap({
		// 	x:this.scalePercent.x * (1+this.scalePercent.now /100) ,// 换算百分比
		// 	y:this.scalePercent.y * (1+this.scalePercent.now /100) // 换算百分比
		// })
		this.drawMap({
			x: this.scalePercent.x * (1+this.scalePercent.now /100) ,// 换算百分比
			y: this.scalePercent.y * (1+this.scalePercent.now /100) // 换算百分比
		})
	},
	
	drawOther(type,e){
		// 绘制多边形
		if (this.drawType == "polygon") {
			this.canvas.skipTargetFind = false;
			// 此段为判断是否闭合多边形，点击红点时闭合多边形
			if (this.pointArray.length > 1) {
			// e.target.id == this.pointArray[0].id 表示点击了初始红点
			if (e.target && e.target.id == this.pointArray[0].id) {
				this.generatePolygon();
			}
			}
			//未点击红点则继续作画
			if (this.polygonMode) {
				this.addPoint(e);
			}
		}
	},
	addPoint(e) {
	    var random = Math.floor(Math.random() * 10000);
	    var id = new Date().getTime() + random;
	    var circle = new fabric.Circle({
	      radius: 5,
	      fill: "#ffffff",
	      stroke: "#333333",
	      strokeWidth: 0.5,
	      left: (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
	      top: (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
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
	      (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
	      (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
	      (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
	      (e.pointer.y || e.e.layerY) / this.canvas.getZoom()
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
	      var pos = this.canvas.getPointer(e.e);
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
	      this.canvas.remove(this.activeShape);
	      this.canvas.add(polygon);
	      this.activeShape = polygon;
	      this.canvas.renderAll();
	    } else {
	      var polyPoint = [
	        {
	          x: (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
	          y: (e.pointer.y || e.e.layerY) / this.canvas.getZoom()
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
	      this.canvas.add(polygon);
	    }
	    this.activeLine = this.line;
	    this.pointArray.push(circle);
	    this.lineArray.push(this.line);
	    this.canvas.add(this.line);
	    this.canvas.add(circle);
	},
	generatePolygon() {
	    var points = new Array();
	    this.pointArray.map((point, index) => {
	      points.push({
	        x: point.left,
	        y: point.top
	      });
	      this.canvas.remove(point);
	    });
	    this.lineArray.map((line, index) => {
	      this.canvas.remove(line);
	    });
	    this.canvas.remove(this.activeShape).remove(this.activeLine);
	    var polygon = new fabric.Polygon(points, {
	      stroke: this.color,
	      strokeWidth: this.drawWidth,
	      fill: "rgba(255, 255, 255, 0)",
	      opacity: 1,
	      hasBorders: true,
	      hasControls: false
	    });
	    this.canvas.add(polygon);
	    this.activeLine = null;
	    this.activeShape = null;
	    this.polygonMode = false;
	    this.doDrawing = false;
	    this.drawType = null;
	},
	drawing(e) { // 通用其他绘制
	  if (this.drawingObject) {
	    this.canvas.remove(this.drawingObject);
	  }
	  var canvasObject = null;
	  var left = this.mouseFrom.x,
	    top = this.mouseFrom.y,
	    mouseFrom = this.mouseFrom,
	    mouseTo = this.mouseTo;
	  switch (this.drawType) {
	    case "arrow": //箭头
	      var x1 = mouseFrom.x,
	        x2 = mouseTo.x,
	        y1 = mouseFrom.y,
	        y2 = mouseTo.y;
	      var w = x2 - x1,
	        h = y2 - y1,
	        sh = Math.cos(Math.PI / 4) * 16;
	      var sin = h / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
	      var cos = w / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
	      var w1 = (16 * sin) / 4,
	        h1 = (16 * cos) / 4,
	        centerx = sh * cos,
	        centery = sh * sin;
	      /**
	       * centerx,centery 表示起始点，终点连线与箭头尖端等边三角形交点相对x，y
	       * w1 ，h1用于确定四个点
	       */
	
	      var path = " M " + x1 + " " + y1;
	      path += " L " + (x2 - centerx + w1) + " " + (y2 - centery - h1);
	      path +=
	        " L " + (x2 - centerx + w1 * 2) + " " + (y2 - centery - h1 * 2);
	      path += " L " + x2 + " " + y2;
	      path +=
	        " L " + (x2 - centerx - w1 * 2) + " " + (y2 - centery + h1 * 2);
	      path += " L " + (x2 - centerx - w1) + " " + (y2 - centery + h1);
	      path += " Z";
	      canvasObject = new fabric.Path(path, {
	        stroke: this.color,
	        fill: this.color,
	        strokeWidth: this.drawWidth
	      });
	      break;
	    case "pentagram": //五角星
	      var x1 = mouseFrom.x,
	        x2 = mouseTo.x,
	        y1 = mouseFrom.y,
	        y2 = mouseTo.y;
	      /**
	       * 实现思路  (x1,y1)表示鼠标起始的位置 (x2,y2)表示鼠标抬起的位置
	       * r 表示五边形外圈圆的半径，这里建议自己画个图理解
	       * 正五边形夹角为36度。计算出cos18°，sin18°备用
	       */
	      var w = Math.abs(x2 - x1),
	        h = Math.abs(y2 - y1),
	        r = Math.sqrt(w * w + h * h)
	      var cos18 = Math.cos(18 * Math.PI / 180)
	      var sin18 = Math.sin(18 * Math.PI / 180)
	
	      /**
	       * 算出对应五个点的坐标转化为路径
	       */
	      var point1 = [x1, y1 + r]
	      var point2 = [x1 + 2 * r * (sin18), y1 + r - 2 * r * (cos18)]
	      var point3 = [x1 - r * (cos18), y1 + r * (sin18)]
	      var point4 = [x1 + r * (cos18), y1 + r * (sin18)]
	      var point5 = [x1 - 2 * r * (sin18), y1 + r - 2 * r * (cos18)]
	
	      var path = " M " + point1[0] + " " + point1[1]
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
	      break;
	    case "ellipse": //椭圆
	      // 按shift时画正圆，只有在鼠标移动时才执行这个，所以按了shift但是没有拖动鼠标将不会画圆
	      if (e.e.shiftKey) {
	        mouseTo.x - left > mouseTo.y - top ? mouseTo.y = top + mouseTo.x - left : mouseTo.x = left + mouseTo.y - top
	      }
	      var radius =
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
	      break;
	    case "rectangle": //长方形
	      // 按shift时画正方型
	      if (e.e.shiftKey) {
	        mouseTo.x - left > mouseTo.y - top ? mouseTo.y = top + mouseTo.x - left : mouseTo.x = left + mouseTo.y - top
	      }
	      var path =
	        "M " +
	        mouseFrom.x +
	        " " +
	        mouseFrom.y +
	        " L " +
	        mouseTo.x +
	        " " +
	        mouseFrom.y +
	        " L " +
	        mouseTo.x +
	        " " +
	        mouseTo.y +
	        " L " +
	        mouseFrom.x +
	        " " +
	        mouseTo.y +
	        " L " +
	        mouseFrom.x +
	        " " +
	        mouseFrom.y +
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
	      break;
	    case "text": //文本框
	      this.textbox = new fabric.Textbox("", {
	        left: mouseFrom.x,
	        top: mouseFrom.y - 10,
	        // width: 150,
	        fontSize: 16,
	        borderColor: this.color,
	        fill: this.color,
	        hasControls: false
	      });
	      this.canvas.add(this.textbox);
	      this.textbox.enterEditing();
	      this.textbox.hiddenTextarea.focus();
	      break;
	
	    default:
	      break;
	  }
	
	  if (canvasObject) {
	    // canvasObject.index = getCanvasObjectIndex();\
	    this.canvas.add(canvasObject); //.setActiveObject(canvasObject)
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
		this.drawMap()
	}
	this.drawArea.on('mouse:down', (e)=>{
		// console.log(e,'原点')
		// if(!this.scalePercent.now){
		// 	console.log('请放大后移动')
		// 	return
		// }
		this.selectChild = false
		const { x,y} = e.pointer
		this.pressOrigin.x = x
		this.pressOrigin.y = y
		if(this.drawType){ // 执行对应drawType的任务
			this.drawOther(this.drawType,e)
			return
		}
		this.drawArea.on('mouse:move', (move)=>{
			if(this.selectChild){ // 选中子集时不能移动
				return;
			}
			let canvasWidth = Number(this.canvasW.split('px')[0])
			let canvasHeight = Number(this.canvasW.split('px')[0])
			let moveX = move.pointer.x - this.pressOrigin.x
			let moveY = move.pointer.y - this.pressOrigin.y
			// 边界处理
			if(moveX >0 && this.scalePercent.left- moveX<0){
				return
			}
			if(moveX <0 && Math.abs(this.scalePercent.left- moveX) > ((this.scalePercent.x* (1+this.scalePercent.now /100) * this.mapOrigin.width)- canvasWidth )  ){
				return
			}
			if(moveY >0 && this.scalePercent.top- moveY<0){
				return
			}
			if(moveY <0 && Math.abs(this.scalePercent.top- moveY) > ((this.scalePercent.y* (1+this.scalePercent.now /100) * this.mapOrigin.height)- canvasHeight )  ){
				return
			}
			this.scalePercent.left -= moveX
			this.scalePercent.top -=moveY
			this.drawMap({
				left:-this.scalePercent.left,
				top:-this.scalePercent.top,
				x: this.scalePercent.x * (1+this.scalePercent.now /100),
				y: this.scalePercent.y * (1+this.scalePercent.now /100)
			})
			this.pressOrigin.x = move.pointer.x
			this.pressOrigin.y = move.pointer.y
		})
	})
	this.drawArea.on('mouse:up', (e)=>{
		this.drawArea.__eventListeners["mouse:move"] = []
		this.pressOrigin.x = ''
		this.pressOrigin.y = ''
	})
	this.drawArea.on('mouse:wheel', (event)=>{
		const {pointer,e } = event
		this.scale(e.deltaY)
		// if(e.deltaY>0){
		//     // console.log('下滚缩小')
		// }
		// //上滚
		// if(e.deltaY<0){
		//     // console.log('上滚放大')
		// }
	})
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
