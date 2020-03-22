export default class SearchType {
    //模糊搜索displayName，精确搜索name或电话号码
    static General = 0;

    //精确搜索name或电话号码
    static NameOrMobile = 1;

    //精确搜索name
    static Name = 2;

    //精确搜索电话号码
    static Mobile = 3;
}
