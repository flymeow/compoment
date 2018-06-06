<template>
    <div >
       <ul class="upload-list">
           <li v-for="(file , index) in upList" :key="index" > 
                <span class="upload-list-filename" :title="file.name">
                    {{file.name}}
                </span>
                <iCircle v-show="showCircle" :trailWidth="trailWidth" :strokeWidth="strokeWidth" :percent="parsePercentage(file.percentage)" :size="size" :strokeColor="parsePercentage(file.percentage)==100 ? '#16c51d' : '#2db7f5' ">
                    <span v-if="parsePercentage(file.percentage)<100" class="circle-inner-txt">{{parsePercentage(file.percentage)}}</span> 
                    <i v-else >
                        <svg class="icon" :style="{'width': (size-8)+'px', 'height': (size-8)+'px', 'fill': 'currentColor', 'overflow': 'hidden'}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1613"><path d="M1005.446947 149.266605c-18.677385-18.697851-49.00818-18.697851-67.729567 0l-571.143005 618.312304c-0.804319-0.931209-1.63422-1.848091-2.518357-2.732228L89.029174 489.840304c-19.535939-19.577894-51.319829-19.577894-70.856791 0-19.61985 19.575848-19.61985 51.319829 0 70.897723l274.985912 275.005354c6.987135 6.987135 15.525602 11.467169 24.505114 13.467733 1.738597 9.090029 6.120394 17.772782 13.151531 24.810059 18.71934 18.699897 49.007157 18.699897 67.728544 0L1005.446947 216.995149C1024.124332 198.297298 1024.124332 167.967526 1005.446947 149.266605z" fill="#08be14" p-id="1614"></path></svg>
                    </i>
                </iCircle>
                <span  @click="remove(file)" class="upload-cancel">×</span>
           </li>
       </ul>
    </div>
</template>
<script>
import iCircle from './circle.vue';
export default {
    name:'uploadList',
    components:{
        iCircle,
    },
    props:{
        files: {
            type:Array,
            default: []
        }
    },
    watch: {
        files(val) {
            this.upList = val;
        },
        upList(val) {
            this.$emit("on-fileList-change",val, this.removeFile)
        }
    },
    data(){
        return {
            showCircle:true,
            size: 20,
            trailWidth:7,
            strokeWidth:8,
            progress:0,
            upList: this.files,
            removeFile:''
        }
    },
    methods:{
        parsePercentage (val) {
            return parseInt(val, 10);
        },
        remove(file) {
            this.upList = this.upList.filter( ele => ele.uid !=file.uid);
            this.removeFile = file;
        } 
    }
}
</script>
