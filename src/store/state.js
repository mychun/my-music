import { playMode } from '@/common/js/config'
import { loadSearch, loadFavorite } from '@/common/js/cache'

const state = {
    singer: {}, //歌手列表
    
    playing: false, //是否自动播放
    fullScreen: false, //是否放大
    playlist: [], //播放列表
    sequenceList: [], //用于存放正常的歌曲列表
    mode: playMode.sequence, //播放的模式
    currentIndex: -1, //当前播放哪首的标识
    disc: {}, //推荐歌单
    topList: {}, //排行榜歌曲列表
    searchHistory: loadSearch(),
    playHistory: [],
    favoriteList: loadFavorite(),
}
export default state