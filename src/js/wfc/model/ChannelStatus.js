export default class ChannelStatus {
    //member can add quit change group name and portrait, owner can do all the operations
    static Public = 0;
    //every member can add quit change group name and portrait, no one can kickoff others
    static Private = 1;
    //member can only quit, owner can do all the operations
    static Destoryed = 2;
}
