import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { IFollower } from './interface/Ifollower';
import { IncomingComment } from './interface/IncomingComment';
import { RequestDocument } from './request.schema';
const Instagram = require('instagram-web-api')
const { username, password } = process.env
import * as _ from "lodash"
import FollowerPrivateData from './followers_data';
import { CleanedComments, MentionDocument } from './interface/IcleandComment';
import { AccountFollowers, AccountFollowersDocument } from './account.followers';
import { CommentStatus, UserAllMention } from './interface/UserAllMentions';

@Injectable()
export class AppService {

  constructor(
    @InjectModel('Request')
    private requestModel: Model<RequestDocument>,
    @InjectModel('Comment')
    private commentModel: Model<CommentDocument>,
    @InjectModel('AccountFollower')
    private followerModel: Model<AccountFollowersDocument>
  ) { }

  async getFollowers(postShortCode: string = 'CRWNkkchs2x') {
    try {
      const username = 'jangomangoss'
      const password = "kaka7701"
      const client = new Instagram({ username, password })
      await client.login()
      console.log('user logged in...');

      let hasNextPage: boolean = true
      let requestCount = 0
      let followersCount = 0
      let cursor: string = ''
      let reqList = await this.requestModel.find({ $and: [{ createdAt: -1 }, { type: "follower" }] })
      console.log("Request History:", reqList.length)

      if (reqList.length != 0) {
        let nextCursor = await this.getFollowersNextCursor(client, reqList[0].cursor)
        cursor = nextCursor
      }

      while (hasNextPage) {
        console.log("seted cursor", cursor)
        console.log("sending request....")
        let collectedFollower = await this.sendFollowerRequest(client, cursor)
        console.log("request sended.  request count:", requestCount);
        requestCount++

        await this.requestModel.create({ _id: new Types.ObjectId(), cursor: cursor, type: "follower" })
        cursor = collectedFollower.cursor
        hasNextPage = collectedFollower.hasNextPage

        console.log("==================================");
        console.log("nextCursor:", cursor)
        console.log("has a next page", hasNextPage)

        for await (const follower of collectedFollower.followers) {
          let check = await this.followerModel.findOne({
            $and: [
              { username: follower.username, },
              { user_id: follower.user_id, },
            ]
          })
          if (!check) {
            await this.followerModel.create({
              _id: new Types.ObjectId(),
              username: follower.username,
              user_id: follower.user_id,
              full_name: follower.full_name,
              bussines_username: "azadi.gold",
              follower_object: follower.follower_obejct,
              follow_date: this.getFollowerDateOfFollow(follower.username)
            })
            followersCount += 1
          }
        }
        console.log(followersCount, "follower imported")
        console.log("================ end of this Request Proccess ==================");

      }
      return { totalAdded: followersCount }
    }
    catch (err) {
      console.log(err)
    }
  }

  async getComments(postShortCode: string = 'CRWNkkchs2x') {
    try {
      const username = 'jangomangoss'
      const password = "kaka7701"
      const client = new Instagram({ username, password })
      await client.login()
      console.log('user logged in...');

      let hasNextPage: boolean = true
      let requestCount = 0
      let commentCount = 0
      let cursor: string = ''
      let reqList = await this.requestModel.find({  type: "comment"  }).sort({ createdAt: -1 })
      console.log("Request History:", reqList.length)

      if (reqList.length != 0) {
        let nextCursor = await this.getCommentsNextCursor(client, postShortCode, reqList[0].cursor)
        cursor = nextCursor
      }


      while (hasNextPage) {
        console.log("seted cursor", cursor)
        console.log("sending request....")
        let collectedComments = await this.sendCommentRequest(client, postShortCode, cursor)
        console.log("request sended.  request count:", requestCount);
        requestCount++

        await this.requestModel.create({ _id: new Types.ObjectId(), cursor: cursor, type: "comment" })
        cursor = collectedComments.cursor
        hasNextPage = collectedComments.hasNextPage

        for await (const comment of collectedComments.comments) {
          let check = await this.commentModel.findOne({
            comment_id: comment.comment_id
          })
          if (!check) {
            await this.commentModel.create({
              _id: new Types.ObjectId(),
              comment_id: comment.comment_id,
              owner_username: comment.owner_id,
              owner_id: comment.owner_username,
              text: comment.text,
              comment_object: comment.commnet_object,
              date: comment.date
            })
            commentCount += 1
          }
        }

        console.log("================nex request info==================");
        console.log("nextCursor:", cursor)
        console.log("has a next page", hasNextPage)
        console.log(commentCount, "comment imported from pervios requests")
        console.log("================ End of this Request Proccess ==================");
      }
      return {
        status: "successfull",
        totalAdded: commentCount
      }
    }
    catch (err) {
      console.log(err)
      throw new HttpException(err.message, 500)
    }
  }

  async getCommentsNextCursor(client, cursor: string, postShortCode: string) {
    let incomingComments = await client.getMediaComments({ shortcode: postShortCode, first: "49", after: cursor })
    return incomingComments.page_info.end_cursor
  }

  async getFollowersNextCursor(client, cursor: string) {
    const azadiGoldUser = await client.getUserByUsername({ username: 'azadi.gold' })
    const followers = await client.getFollowers({ userId: azadiGoldUser.id, after: cursor })
    return followers.page_info.end_cursor
  }

  async sendCommentRequest(client, postShortCode, cursor) {
    try {
      let comments: IncomingComment[] = new Array<IncomingComment>()
      let incomingComments = await client.getMediaComments({ shortcode: postShortCode, first: "49", after: cursor })
      await this.delay(_.random(2000, 10000))
      console.log("=============incoming comments=============", incomingComments);

      for (const comment of incomingComments.edges) {
        console.log("============data Object===============:", comment);
        comments.push({
          comment_id: comment.node.id,
          text: comment.node.text,
          date: comment.node.created_at,
          owner_id: comment.node.owner.id,
          owner_username: comment.node.owner.username,
          commnet_object: comment.node
        })
      }
      return {
        comments,
        cursor: incomingComments.page_info.end_cursor,
        hasNextPage: incomingComments.page_info.has_next_page
      }
    }
    catch (err) {
      console.log(err)
      throw new HttpException(err.message, 500)
    }
  }
  async sendFollowerRequest(client, cursor) {
    try {
      let Infollowers: IFollower[] = new Array<IFollower>()
      const azadiGoldUser = await client.getUserByUsername({ username: 'azadi.gold' })
      const followers = await client.getFollowers({ userId: azadiGoldUser.id, after: cursor })
      await this.delay(_.random(20000, 40000))

      console.log("=============incoming followers=============", followers);

      for (const user of followers.data) {

        Infollowers.push({
          user_id: user.id,
          username: user.username,
          full_name: user.full_name,
          follower_obejct: user
        })
      }
      return {
        followers: Infollowers,
        cursor: followers.page_info.end_cursor,
        hasNextPage: followers.page_info.has_next_page
      }
    }
    catch (err) {
      console.log(err)
      throw new HttpException(err.message, 500)
    }
  }
  async delay(ms) {
    // return await for better async stack trace support in case of errors.
    console.log('delay time:', ms);

    return await new Promise(resolve => setTimeout(resolve, ms));
  }


  async calculateUserScore(owner_username: string) {
    let foundUserComments = await this.commentModel.find({ owner_id: owner_username }).sort({createdAt: -1})
    let isUserFollowPage = await this.checkUserFollowingStatus(owner_username)
    let ownerUserFollowStatus: boolean

    if (isUserFollowPage) {
      ownerUserFollowStatus = true
    }
    else {
      ownerUserFollowStatus = false
    }

    let UseCleanComment = new CleanedComments()
    UseCleanComment.mentions = new Array<MentionDocument>()
    UseCleanComment.owner_username = owner_username
    
    foundUserComments.forEach(comment => {
      let rawComment = comment.text
      let commentTextArray = rawComment.split(' ')
      commentTextArray.forEach(commentSubStr => {
        let check = false
        if (commentSubStr.includes('@')) {
          if (UseCleanComment.mentions.length !=0 ) {
            UseCleanComment.mentions.forEach(mention => {
              if (commentSubStr == mention.mentioned_username  || commentSubStr == owner_username) {
                check = true
              }
            })
          }
          else {
            if (commentSubStr == owner_username) { 
              check = true
            }
          }
          if(check==false){
            UseCleanComment.mentions.push({ mentioned_username: commentSubStr, date: comment.date })
          }
        }
      })
    })


    let allUserMentions = new Array<UserAllMention>()
    for await (const mentionedUser of UseCleanComment.mentions) {
     
      let newMentionData = new UserAllMention()
      newMentionData.comment_status = new Array<CommentStatus>()

      let foundAccount = await this.checkUserFollowingStatus(mentionedUser.mentioned_username.split('@')[1])
      if (!foundAccount) {
        newMentionData.mentioned_username = mentionedUser.mentioned_username,
          newMentionData.page_follow_date = null,
          newMentionData.comment_date = mentionedUser.date,
          newMentionData.comment_status.push(CommentStatus.notFollower)


        allUserMentions.push(newMentionData)
      }
      else {
        newMentionData.mentioned_username = foundAccount.username
        newMentionData.mentioned_user_id = foundAccount.user_id
        newMentionData.page_follow_date = foundAccount.follow_date
        newMentionData.comment_date = mentionedUser.date


        let checkUserFollowedPageBefore = await this.checkUserFollowedPageBefore(
          newMentionData.comment_date, newMentionData.page_follow_date)
        if (checkUserFollowedPageBefore == true) {
          newMentionData.comment_status.push(CommentStatus.isAFollowerBefore)
        }


        let checkUserMentionedBefore = await this.checkUserMentionedBefore(
          newMentionData.mentioned_username, newMentionData.comment_date)
        if (checkUserMentionedBefore == true) {
          newMentionData.comment_status.push(CommentStatus.isMentionedBefore)
        }

        if (checkUserFollowedPageBefore == false && checkUserMentionedBefore == false) {
          newMentionData.comment_status.push(CommentStatus.isValid)
        }

        allUserMentions.push(newMentionData)
      }

    }
    return {
      mentions: allUserMentions
    }
  }

  async checkUserMentionedBefore(username, comment_date) {
    let foundCommentsWithThisMention = await this.commentModel.find({
      text: new RegExp(`@${username}`)
    })
    let isValid = false
    if (foundCommentsWithThisMention.length != 0) {
      foundCommentsWithThisMention.forEach(comment => {
        if (comment_date > comment.date) {
          isValid = true
        }
      })
    }
    return isValid
  }

  async checkUserFollowingStatus(username: string) {
    let res = await this.followerModel.findOne({ username:username})
    return res
  }

  async checkUserFollowedPageBefore(comment_date: number, followed_date: number) {
    if (comment_date < followed_date) {
      return false
    }
    else {
      return true
    }
  }

  getFollowerDateOfFollow(username: string) {
    let follower_objectResult: number
    FollowerPrivateData.relationships_followers.forEach((follower_object) => {
      if (follower_object.string_list_data[0]['value'].toString() === username.toString())
        follower_objectResult = follower_object.string_list_data[0]['timestamp']
    })
    return follower_objectResult
  }
}


