import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IgApiClient } from 'instagram-private-api';
import { lowerFirst, sample } from 'lodash';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { IFollower } from './interface/Ifollower';
import { IncomingComment } from './interface/IncomingComment';
import { RequestDocument } from './request.schema';
import { UserDocument } from './user.schema';
const Instagram = require('instagram-web-api')
const { username, password } = process.env
import * as _ from "lodash"
import { MentionDocument } from './cleanedcomment.schema';

@Injectable()
export class AppService {

  constructor(
    @InjectModel('User')
    private userModel: Model<UserDocument>,
    @InjectModel('Request')
    private requestModel: Model<RequestDocument>,
    @InjectModel('Comment')
    private commentModel: Model<CommentDocument>,
    @InjectModel('AccountFollower')
    private followerModel: Model<CommentDocument>,
    @InjectModel('Mention')
    private mentionModel: Model<MentionDocument>
  ) { }

  async getFollowers(postShortCode: string = 'CRWNkkchs2x') {
    try {
      const username = 'hesamhesam0202'
      const password = "hesamh15352"
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

        console.log("object is: ", collectedFollower);



        for await (const follower of collectedFollower.followers) {
          let check = await this.followerModel.findOne({
            $and: [
              { username: follower.username, },
              { user_id: follower.user_id, },
              { full_name: follower.full_name, }
            ]
          })
          if (!check) {
            await this.followerModel.create({
              _id: new Types.ObjectId(),
              account_username: "azadi.gold",
              username: follower.username,
              user_id: follower.user_id,
              full_name: follower.full_name,
              profile_pic: follower.profile_pic
            })
          }
        }
        console.log(collectedFollower.followers.length, "follower imported")
        followersCount += collectedFollower.followers.length
        console.log("total added", followersCount)
        console.log("================ end of this iterration ==================");

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
      let reqList = await this.requestModel.find({ $and: [{ createdAt: -1 }, { type: "comment" }] })
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
            $and: [
              { user_profile: comment.owner_id },
              { comment: comment.comment_value },
              { date: comment.date }
            ]
          })
          console.log("is this comment imported?", check);

          if (!check) {
            console.log('adding to database...');

            let res = await this.commentModel.create({
              _id: new Types.ObjectId(),
              user_profile: comment.owner_id,
              comment: comment.comment_value,
              date: comment.date
            })
            console.log("imported comment", res);
          }
        }

        console.log("==================================");
        console.log("nextCursor:", cursor)
        console.log("has a next page", hasNextPage)



        console.log(collectedComments.comments.length, "comment imported")
        commentCount += collectedComments.comments.length
        console.log("total added", commentCount)
        console.log("================ end of this iterration ==================");

      }
      return { totalAdded: commentCount }
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
      await this.delay(_.random(20, 40))

      for (const comment of incomingComments.edges) {
        console.log(comment);

        comments.push({
          owner_id: comment.node.owner.username,
          comment_value: comment.node.text,
          date: comment.node.created_at
        })
        console.log(`${comment.node.text} is pushed.`)
      }

      console.log("incoming comment is : ", incomingComments);

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
      await this.delay(1000)


      for (const user of followers.data) {

        Infollowers.push({
          user_id: user.id,
          username: user.username,
          full_name: user.full_name,
          profile_pic: user.profile_pic_url

        })
        console.log(`${user.username} is pushed.`)
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


  async cleanUserComments() {
    let allComments = await this.commentModel.find()

    for await (const comment of allComments) {

      let rawComment = comment.comment
      let commentArray = rawComment.split(' ')
      for await (const commentNode of commentArray) {
        if (commentNode.includes('@')) {
          let foundMention = await this.mentionModel.findOne({
            $and: [
              {
                owner_username: comment.user_profile,
              },
              {
                mentioned_username: commentNode,
              }
            ]
          })
          if (!foundMention) {
            await this.mentionModel.create({
              _id: new Types.ObjectId(),
              owner_username: comment.user_profile,
              mentioned_username: commentNode,
              date: comment.date
            })
          }
        }
      }
    }

  }

}


// let foundUser = await this.userModel.findOne({ username: foundComment.user_profile })
//     if (!foundUser) {
//       let addUser = await this.userModel.create({
//         _id: new Types.ObjectId(),
//         username: foundComment.user_profile,
//         score: 0
//       })
//       user = addUser
//     }
//     else {
//       user = foundUser
//     }