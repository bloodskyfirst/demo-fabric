<template>
  <div class="home">
	<!-- <h2 @click="drawMap()">测试fabric</h2> -->
    <!-- <img alt="Vue logo" src="../assets/logo.png" @click="draw" > -->
	<div class="canvas-box">
		<div class="control">
			<span @click.stop="scale(1)">+</span>
			<span @click.stop="scale(-1)">-</span>
		</div>
		<canvas id="canvas" width="800px" height="800px" border="1px solid yellow" ></canvas>
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
	
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
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
		pressOrigin:{
			x:'',
			y:''
		},
		scalePercent:{
			left:0,
			top:0,
			x:'',
			y:'',
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
		  angle: 30,
		  // opacity: 0.85
		});
		this.drawArea.add(imgInstance)
		// let rect = new fabric.Rect({
		// 	left:100,
		// 	top:100,
		// 	fill:'blue',
		// 	width:30,
		// 	height:30
		// })
		// this.drawArea.add(rect)
		// console.log(this.drawArea)
		// this.drawList.push(rect)
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
			// scaleX:obj.x || (this.drawArea.width / this.mapOrigin.width),
			// scaleY:obj.y || (this.drawArea.height / this.mapOrigin.height),
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
  },
  mounted() {
	// console.log(fabric.Canvas,'原型')
  	this.drawArea = new fabric.Canvas('canvas',{selection:null})
	// console.log(this.drawArea);
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
		const { x,y} = e.pointer
		this.pressOrigin.x = x
		this.pressOrigin.y = y
		this.drawArea.on('mouse:move', (move)=>{
			// console.log('移动中的',move)
			// if(move.pointer.x<0 || move.pointer.y<0){
			// 	console.log('移动不能超出画布')
			// 	return
			// }
			let moveX = move.pointer.x - this.pressOrigin.x
			let moveY = move.pointer.y - this.pressOrigin.y
			// if(this.scalePercent.left-moveX<0 || this.scalePercent.y-moveY<0){
			// 	return
			// }
			this.scalePercent.left -= moveX
			this.scalePercent.top -= moveY
			this.drawMap({
				left:this.scalePercent.left,
				top:this.scalePercent.top
			})
			
		})
		
	})
	this.drawArea.on('mouse:up', (e)=>{
		this.drawArea.__eventListeners["mouse:move"] = []
		this.pressOrigin.x = ''
		this.pressOrigin.y = ''
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
		overflow: scroll;
		position: relative;
		/* display: flex; */
		width: 100%;
		/* justify-content: center; */
	}
	.function-box{
		display: flex;
		justify-content: space-around;
	}
	.function-box > ul{
		list-style: none;
	}
	.control{
		position: absolute;
		z-index: 3;
		/* margin: 0 auto; */
		left:400px;
		width: 100px;
		display: flex;
		justify-content: space-around;
	}
	.control>span{
		font-size: 30px;
	}
</style>
