//储存器
import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15
const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    if (index === 0) {
      //如果添加的元素是第一个，就不操作
      return
    }
    if (index > 0) {
      //如果不是第一个，就删除
      arr.splice(index, 1)
    }
    //往数组开头加入
    arr.unshift(val)
    if (maxLen && arr.length > maxLen) {
      //如果超过最大的数组长度，就把最后一个删掉
      arr.pop()
    }
}

function deleteFromArray(arr, compare){
  const index = arr.findIndex(compare)
  if(index > -1){
    arr.splice(index, 1)
  }
}

export function saveSearch(query){
    let searches = storage.get(SEARCH_KEY, [])
    insertArray(searches, query, (item) => {
      return item === query
    }, SEARCH_MAX_LEN)
    storage.set(SEARCH_KEY, searches)
    return searches
}

export function loadSearch() {
    return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query){
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => item === query)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch(){
  storage.remove(SEARCH_KEY)
  return []
}

export function saveFavorite(song){
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
