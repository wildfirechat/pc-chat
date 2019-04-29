var notation = {
    1: "āēīōū"
  , 2: "áéíóú"
  , 3: "ǎěǐǒǔ"
  , 4: "àèìòù"
  , 5: "aeiou"
}

// phoneticizing yay,yay,yay!
module.exports = exports = function(words) {

  var tmp = []

  words.forEach(function(word){
    var hasNote = /[1-5]$/.test(word)
      , note = hasNote ? word.slice(-1) : 5
      , char = hasNote ? word.slice(0, -1) : word
      , result

    if(note === 5) return tmp.push(char.toLowerCase());

    result = char.toLowerCase().replace(/([aeiou])/, function(i, match){
      var at = notation[5].indexOf(match)
      return notation[note].charAt(at);
    })

    tmp.push(result);
  })

  return tmp;
}