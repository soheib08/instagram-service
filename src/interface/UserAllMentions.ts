export class UserAllMention {
  mentioned_username: string;
  mentioned_user_id: string;
  page_follow_date: number;
  comment_date: number;
  comment_status?: CommentStatus[];
}
export enum CommentStatus {
  isMentionedBefore = 'isMentionedBefore', //"this username was mentioned already before your comment",
  isAFollowerBefore = 'isAFollowerBefore', //"this username was followed page before your comment",
  notFollower = 'notFollower', //"this username didnt follow page yet",
  isValid = 'isValid', //"your comment is valid"
  inValid = 'inValid (mentioned before or followed before)',
}
