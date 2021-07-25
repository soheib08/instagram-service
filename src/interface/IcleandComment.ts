export class CleanedComments{ 
    owner_username: string
    mentions : Array<MentionDocument>

}

export class MentionDocument{
    mentioned_username: string
    date: number
}