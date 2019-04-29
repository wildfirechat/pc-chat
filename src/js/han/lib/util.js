module.exports = exports = {

  // detect a chinese word
  isChinese: function(word) {
    // TODO: is it a better way to dectect with `%u`?
    return /[\u4E00-\uFA29]+|[\uE7C7-\uE7F3]+/.test(word)
  },

  // detect javascript type
  jsType: function(obj) {
    var str = Object.prototype.toString.call(obj);
    return str.replace(/^\[object (\w+)\]$/, '$1');
  },

  // split Chinese words into an array
  toLetter: function(words, data){
    var that = this

    words = escape(words).split('%u'), words.shift(), words;
    words.forEach(function(item, i) {
      // rember to translate non-Chinese words to it's own unicode
      words[i] = data[item] ? data[item].split(/\s+/)[0].replace(/[1-5]/,'') : item.replace(/[%@*]+/g,'');
    })

    return words;
  },

  // build string to array
  toArray: function(words){
    var len = words.length
      , i = 0, arr = []
    for(;i<len;i++) {
      arr.push(words[i]);
    }
    return arr;
  },

  // flatten the 2-d array
  flatten: function(arr){
    var tmp = [];
    arr.forEach(function(item){
      tmp.concat ? (tmp = tmp.concat(item)) : tmp.push(item);
    })
    return tmp;
  }
}