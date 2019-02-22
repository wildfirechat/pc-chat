export default class Base{
    base;

    encode(){
        console.log('base', this.base);
    };


    decode(contentStr){
        this.base = " base encode";
    }
}