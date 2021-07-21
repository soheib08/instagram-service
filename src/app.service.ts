import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IgApiClient } from 'instagram-private-api';
import { sample } from 'lodash';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { IFollower } from './interface/Ifollower';
import { IncomingComment } from './interface/IncomingComment';
import { RequestDocument } from './request.schema';
import { UserDocument } from './user.schema';
const Instagram = require('instagram-web-api')
const { username, password } = process.env

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
    private followerModel: Model<CommentDocument>
  ) { }

  async getFollowers(postShortCode: string = 'CRWNkkchs2x') {
    try {
      const username = 'sohe.ibs'
      const password = "kaka1374"
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
        let nextCursor = await this.getNextCursor(client, postShortCode, reqList[0].cursor)
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
              profile_pic: follower.full_name
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
      const username = 'sohe.ibs'
      const password = "kaka1374"
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
        let nextCursor = await this.getNextCursor(client, postShortCode, reqList[0].cursor)
        cursor = nextCursor
      }


      while (hasNextPage) {
        console.log("seted cursor", cursor)
        console.log("sending request....")
        let collectedComments = await this.sendRequest(client, postShortCode, cursor)
        console.log("request sended.  request count:", requestCount);
        requestCount++

        await this.requestModel.create({ _id: new Types.ObjectId(), cursor: cursor, type: "comment" })
        cursor = collectedComments.cursor
        hasNextPage = collectedComments.hasNextPage

        console.log("==================================");
        console.log("nextCursor:", cursor)
        console.log("has a next page", hasNextPage)

        for await (const comment of collectedComments.comments) {
          let check = await this.commentModel.findOne({
            $and: [
              { user_profile: comment.owner_id },
              { comment: comment.comment_value },
              { date: comment.date }
            ]
          })
          if (check) {
            await this.commentModel.create({
              _id: new Types.ObjectId(),
              user_profile: comment.owner_id,
              comment: comment.comment_value,
              date: comment.date
            })
          }
        }
        console.log(collectedComments.comments.length, "comment imported")
        commentCount += collectedComments.comments.length
        console.log("total added", commentCount)
        console.log("================ end of this iterration ==================");

      }
      return { totalAdded: commentCount }
    }
    catch (err) {
      console.log(err)
    }
  }

  async getNextCursor(client, cursor: string, postShortCode: string) {
    let incomingComments = await client.getMediaComments({ shortcode: postShortCode, first: "49", after: cursor })
    return incomingComments.page_info.end_cursor
  }

  async sendRequest(client, postShortCode, cursor) {
    try {
      let comments: IncomingComment[] = new Array<IncomingComment>()
      let incomingComments = await client.getMediaComments({ shortcode: postShortCode, after: cursor })
      await this.delay(30000)

      for (const comment of incomingComments.edges) {
        console.log(comment);

        comments.push({
          owner_id: comment.node.owner.username,
          comment_value: comment.node.text,
          date: comment.node.created_at
        })
        console.log(`${comment.node.text} is pushed.`)
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
      await this.delay(30000)

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
        followers,
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
    return await new Promise(resolve => setTimeout(resolve, ms));
  }

}



  //   const ig = new IgApiClient();
  //   ig.state.generateDevice('sohe.ibs');
  //   await ig.simulate.preLoginFlow();
  //   const loggedInUser = await ig.account.login('sohe.ibs', "kaka1374");
  //   process.nextTick(async () => await ig.simulate.postLoginFlow());
  //  let azadiGold =  await ig.search.users("azadi.gold")
  //  console.log(azadiGold);


    // const userFeed = ig.feed.user(loggedInUser.pk);
    // const myPostsFirstPage = await userFeed.items()





  // const followersFeed = ig.feed.accountFollowers(loggedInUser.pk);
  // const wholeResponse = await followersFeed.request();
  // console.log("=>",wholeResponse); // You can reach any properties in instagram response
  // const items = await followersFeed.items();
  // console.log("=>2",items); // Here you can reach items. It's array.
  // const thirdPageItems = await followersFeed.items();
  // console.log("=>3",thirdPageItems);
  // const feedState = followersFeed.serialize(); // You can serialize feed state to have an ability to continue get next pages.
  // console.log("=>4",feedState);
  // followersFeed.deserialize(feedState);
  // const fourthPageItems = await followersFeed.items();
  // console.log("=>5",fourthPageItems);

  // followersFeed.items$.subscribe(
  //   followers => console.log("=>6",followers),
  //   error => console.error(error),
  //   () => console.log('Complete!'),
  // );

