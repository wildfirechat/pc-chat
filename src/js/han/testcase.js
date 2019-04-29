var han = require('./han')

console.log('original：中文\n' + han.letter('中文'), '\n')
console.log('original：要实现 Speaker Deck 那种中文转拼音的\n' + han.letter('要实现 Speaker Deck 那种中文转拼音的', '-'), '\n')

han.letter('中aaaaa中¢∞§¶•誩aa文喳aa', function(err, result){
	if(err) throw err;
	console.log('original：中aaaaa中¢∞§¶•誩aa文喳aa')
	console.log('callback：' + result, '\n')
})

han.letter('中EnglishWords¢∞§¶•ªº文', '-', function(err, result){
	console.log('original：中EnglishWords¢∞§¶•ªº文')
	console.log('callback：' + result, '\n')
})

// 空
han.letter('中文', ' ');
han.letter('中文', '');


console.log('original: My Chinese name is 小鱼(sofish)')
console.log(han.pinyin('My Chinese name is 小鱼(sofish)'))
console.log('');

console.log('original: #$%^&*中23¢∞§¶•ª52849文@#$%^&*(意思，还有英文：english')
console.log(han.pinyin('#$%^&*中23¢∞§¶•ª52849文@#$%^&*(意思，还有英文：english'))

console.log('');
console.log('what about empty string? ' + han.pinyin(''));
console.log(han.pinyin('words like 1234567890 only'))
console.log(han.pinyin('English words and ∞§¶•ª will always return itself'))
