<template>
    <transition name="slide">
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>
<script>
import {mapGetters} from 'vuex'
import {getSingerDetail} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import {createSong, isValidMusic, processSongsUrl} from '@/common/js/song'
import MusicList from '@/components/music-list'

export default {
    name: 'singerDetail',
    computed: {
        //计算state.singer，来生成this.singer
        ...mapGetters([
            'singer'
        ])
    },
    created(){
        this._getSingerDetail()
    },
    data(){
        return {
            songs: []
        }
    },
    computed: {
        //计算属性返回的数据比较准确
        title(){
            return this.singer.name
        },
        bgImage(){
            return this.singer.avatar
        },
        ...mapGetters([
            'singer'
        ])
    },
    components: {
        MusicList
    },
    methods: {
        _getSingerDetail(){
            if(!this.singer.id){
                this.$router.push('/singer')
                return
            }
            getSingerDetail(this.singer.id).then((res) => {
                if(res.code === ERR_OK){
                    processSongsUrl(this._normalSongList(res.data.list)).then((songs)=>{
                        this.songs = songs
                        
                    })
                }
            })
        },
        //对res.data.list进行处理，变成每个歌都是一个Song对象
        _normalSongList(list){
            let ret = [];
            list.forEach((item) => {
                let {musicData} = item;
                if(isValidMusic(musicData)){
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    }
}
</script>
<style lang="stylus" scoped>
.slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>


