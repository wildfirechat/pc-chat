var translate = {}
  , util = require('./util')
  , code = require('./Mandarin.json')

/* translate Chinese word into English letter
 * @param `chinese` {String} Chinese words or whatever
 * @param [optional] `separator` {String} separator for the letters
 * @param [optional] `callback(err, result)` {Function} if a callback is specified,
 *   the program will use an async way to do the translation
 * @return `result` or `undefined [if a callback is specified]`
 * @example
 *   var han = require('han');
 *   han.letter('中文') // zhong wen
 *   han.letter('中文', '-') // zhong-wen
 *   han.letter('中文', function(err, result){
 *     console.log(result) // zhong wen
 *   })
 */
translate.letter = function(){
  var args = [].slice.call(arguments)
    , originalArgs = args.slice()
    , chinese = args.shift()
    , last = args.pop()
    , separator, make

  if(!originalArgs.length) return '';

  var callback = last && util.jsType(last) === 'Function' ? last : null;

  // consider the '0' in javascript and etc.
  separator = args.length ? args[0] : callback !== last && last ?  last : '';

  make = require('./make')
  return callback ? callback.call(this, null, make(chinese, code, separator)) :
    make(chinese, code, separator);
}

/* translate Chinese into Pinyin(letters with notation)
 * @param `chinese` {String} Chinese words or wahtever
 */
translate.pinyin = function(chinese){
  if(!chinese) return [];
  if(!util.isChinese(chinese)) return [chinese];

  var words = util.toArray(chinese)
    , phoneticize = require('./phoneticize')
    , hanzi, result

  // find out chinese words
  hanzi = words.filter(function(word){
    return util.isChinese(word);
  })

  // phoneticize notation
  hanzi.forEach(function(word){
    var key = escape(word).slice(2)
      , pinyin = code[key].split(/\s+/)
      words[words.indexOf(word)] = phoneticize(pinyin);
  })

  // concat non-chinese words
  words.reduce(function(prev, cur, i){
    if(util.jsType(prev) !== 'Array' && util.jsType(cur) !=='Array') {
      prev = prev || '';

      // remember the numbers
      words[i] = prev + '' + cur;
      util.jsType(words[--i]) !== 'Array'  && (words[i] = '');

      return prev + '' + cur;
    }
  })

  // generate return value
  result = words.filter(function(item){
    return item.length;
  })

  return result;
}

module.exports = exports = translate;
