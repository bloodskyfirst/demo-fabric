<template>
  <div class="home">
	<h2 @click="drawMap">测试fabric</h2>
    <!-- <img alt="Vue logo" src="../assets/logo.png" @click="draw"> -->
	<div class="canvas-box">
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
		mapOrigin:{},
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
	drawMap(){
		// const map = document.createElement('img')
		// map.setAttribute('src','../assets/map.jpg')
		// this.mapOrigin = new fabric.Image(map, {
		//   left:0,
		//   top: 0,
		// });
		this.drawArea.setBackgroundImage(bottomMap, this.drawArea.renderAll.bind(this.drawArea), {
		    opacity: 1,
		    angle: 0,
		    left: -4500,
		    top: -300,
		    originX: 'left',
		    originY: 'top'
		});
		// fabric.Image.fromURL(map, (img)=>{
		//         // add background image
		        
		// });
	},
	del(index){
		this.drawArea.remove(this.drawList[index])
		this.drawList.splice(index,1)
	}
  },
  mounted() {
  	this.drawArea = new fabric.Canvas('canvas')
  }
}
</script>

<style>
	#canvas{
		border:1px solid beige;
		margin: 0 auto;
		
	}
	.canvas-box{
		display: flex;
		width: 100%;
		justify-content: center;
	}
	.function-box{
		display: flex;
		justify-content: space-around;
	}
	.function-box > ul{
		list-style: none;
	}
</style>
