import * as types from './mutation-types'
import { playMode } from '@/common/js/config'
import { shuffle } from '@/common/js/util'
import { saveSearch, deleteSearch, clearSearch, saveFavorite, deleteFavorite,savePlay } from '@/common/js/cache'

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

//点击歌曲播放
export const selectPlay = function ({ commit, state }, { list, index }) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        //如果是随机播放全部
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        index = findIndex(randomList, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }

    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

//随机播放全部
export const randomPlay = function ({ commit }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

//在当前播放歌曲后面插入歌曲
export const insertSong = function ({ commit, state }, song) {
    //不可以直接等于，因为state.playlist是引用类型，修改playlist也会修改state的值
    //在state的值只能用mutations来修改
    //let playlist = state.playlist
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    // 记录当前歌曲
    let currentSong = playlist[currentIndex]
    // 查找当前列表中是否有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playlist, song)
    // 因为是插入歌曲，所以索引+1
    currentIndex++
    // 插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song)
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
        // 如果当前插入的序号大于列表中的序号
        if (currentIndex > fpIndex) {
            playlist.splice(fpIndex, 1)
            currentIndex--
        } else {
            playlist.splice(fpIndex + 1, 1)
        }
    }

    let currentSIndex = findIndex(sequenceList, currentSong) + 1

    let fsIndex = findIndex(sequenceList, song)

    sequenceList.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            sequenceList.splice(fsIndex + 1, 1)
        }
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

//删除播放歌曲
export const deleteSong = function ({ commit, state }, song) {
    let playlist = state.playlist.slice(0)
    let sequenceList = state.sequenceList.slice(0)
    let currentIndex = state.currentIndex
    let index = findIndex(playlist, song)
    if (index >= currentIndex) {
        playlist.splice(index, 1)
    } else {
        playlist.splice(index, 1)
        currentIndex--
    }

    sequenceList.splice(findIndex(sequenceList, song), 1)

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)

    if (!playlist.length) {
        commit(types.SET_CURRENT_INDEX, -1)
        commit(types.SET_PLAYING_STATE, false)
    } else {
        commit(types.SET_CURRENT_INDEX, currentIndex)
    }
}

//清空播放列表
export const deleteSongList = function ({ commit }) {
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}

export const saveSearchHistory = function ({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({ commit }, item) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(item))
}

export const clearSearchHistory = function ({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, clearSearch(query))
}

export const saveFavoriteList = function ({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}

export const savePlayHistory = function ({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}