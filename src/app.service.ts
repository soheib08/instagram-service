import {
  HttpException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from './comment.schema';
import { IFollower } from './interface/Ifollower';
import { IncomingComment } from './interface/IncomingComment';
import { RequestDocument } from './request.schema';

const Instagram = require('instagram-web-api');
const { username, password } = process.env;
import * as _ from 'lodash';
import FollowerPrivateData from './followers_data';
import { CleanedComments, MentionDocument } from './interface/IcleandComment';
import { AccountFollowersDocument } from './account.followers';
import { CommentStatus, UserAllMention } from './interface/UserAllMentions';
import { ResultDocument } from './result.schema';
import { LottoryResultDocument } from './LottoryResult.schema';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  client: any;

  constructor(
    @InjectModel('Request')
    private requestModel: Model<RequestDocument>,
    @InjectModel('Comment')
    private commentModel: Model<CommentDocument>,
    @InjectModel('AccountFollower')
    private followerModel: Model<AccountFollowersDocument>,
    @InjectModel('Result')
    private resultModel: Model<ResultDocument>,
    @InjectModel('LottoryResult')
    private lotoryResultModel: Model<LottoryResultDocument>,
  ) {
  }

  async onApplicationBootstrap() {
    this.client = await this.login('shahriarvelayat', 'shve8864@@');
    // this.client = null
  }

  private async login(username, password) {
    try {
      const client = new Instagram({ username, password });
      await client.login();
      console.log(`user logged in. details :\n
      username: ${username},
      password: ${password},
      `);

      return client;
    } catch (err) {
      console.log(err);
    }
  }

  async getFollowers(account_username = 'azadi.gold') {
    try {
      let hasNextPage = true;
      let requestCount = 0;
      let followersCount = 0;
      let cursor = '';
      const reqList = await this.requestModel
        .find({ $and: [{ type: 'follower' }, { account_username }] })
        .sort({ createdAt: -1 });

      console.log('Request History:', reqList.length);

      if (reqList.length != 0) {
        // let nextCursor = await this.getFollowersNextCursor(client, reqList[0].cursor)
        cursor = reqList[0].cursor;
      }

      while (hasNextPage) {
        console.log('seted cursor', cursor);
        console.log('sending request....');
        const collectedFollower = await this.sendFollowerRequest(
          this.client,
          account_username,
          '',
        );
        console.log('request sended.  request count:', requestCount);
        requestCount++;

        cursor = collectedFollower.cursor;
        await this.requestModel.create({
          _id: new Types.ObjectId(),
          cursor: cursor,
          type: 'follower',
          account_username,
        });
        hasNextPage = collectedFollower.hasNextPage;

        for await (const follower of collectedFollower.followers) {
          const check = await this.followerModel.findOne({
            $and: [
              { bussines_username: account_username },
              { username: follower.username },
              { user_id: follower.user_id },
            ],
          });
          if (!check) {
            await this.followerModel.create({
              _id: new Types.ObjectId(),
              username: follower.username,
              user_id: follower.user_id,
              full_name: follower.full_name,
              bussines_username: account_username,
              follower_object: follower.follower_obejct,
              follow_date: this.getFollowerDateOfFollow(follower.username),
            });
            followersCount += 1;
          } else {
            return 'already updated';
          }
        }
        console.log('================next request info==================');
        console.log('nextCursor:', cursor);
        console.log('has a next page', hasNextPage);
        console.log(followersCount, 'followers imported from pervios requests');
        console.log(
          '================ end of this Request Proccess ==================',
        );
      }

      return {
        status: 'successfull',
        totalAdded: followersCount,
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, 500);
    }
  }

  async getComments(postShortCode = 'CRWNkkchs2x') {
    try {
      let hasNextPage = true;
      let requestCount = 0;
      let commentCount = 0;
      let cursor = '';
      // let reqList = await this.requestModel.find({ $and: [{ type: "comment" }, { post_short_code: postShortCode }] }).sort({ createdAt: -1 })

      // console.log("Request History:", reqList.length)

      // if (reqList.length != 0) {
      //let nextCursor = await this.getCommentsNextCursor(client, reqList[0].cursor, postShortCode)
      //console.log("=======nextCursor=======", nextCursor);
      // cursor = reqList[0].cursor
      // }

      while (hasNextPage) {
        // console.log("seted cursor", cursor)
        console.log('sending request....');
        const collectedComments = await this.sendCommentRequest(
          this.client,
          postShortCode,
          '',
        );
        console.log('request sended.  request count:', requestCount);
        requestCount++;

        cursor = collectedComments.cursor;
        await this.requestModel.create({
          _id: new Types.ObjectId(),
          cursor: cursor,
          type: 'comment',
          post_short_code: postShortCode,
        });
        hasNextPage = collectedComments.hasNextPage;

        for await (const comment of collectedComments.comments) {
          const check = await this.commentModel.findOne({
            comment_id: comment.comment_id,
          });
          if (!check) {
            await this.commentModel.create({
              _id: new Types.ObjectId(),
              comment_id: comment.comment_id,
              owner_username: comment.owner_username,
              owner_id: comment.owner_id,
              text: comment.text,
              comment_object: comment.commnet_object,
              date: comment.date,
            });
            commentCount += 1;
          } else {
            return 'already updated';
          }
        }

        console.log('================nex request info==================');
        console.log('nextCursor:', cursor);
        console.log('has a next page', hasNextPage);
        console.log(commentCount, 'comment imported from pervios requests');
        console.log(
          '================ End of this Request Proccess ==================',
        );
      }
      return {
        status: 'successfull',
        totalAdded: commentCount,
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, 500);
    }
  }

  async getCommentsNextCursor(client, cursor: string, postShortCode: string) {
    console.log(
      `----------------------parameters------------------------------------------\n`,
      cursor,
      postShortCode,
    );
    const incomingComments = await client.getMediaComments({
      shortcode: postShortCode,
      first: '49',
      after: cursor,
    });
    console.log(
      `----------------------incomingComments------------------------------------------\n`,
      incomingComments,
    );

    return incomingComments.page_info.end_cursor;
  }

  async getFollowersNextCursor(client, cursor: string) {
    const azadiGoldUser = await client.getUserByUsername({
      username: 'azadi.gold',
    });
    const followers = await client.getFollowers({
      userId: azadiGoldUser.id,
      after: cursor,
    });
    return followers.page_info.end_cursor;
  }

  async sendCommentRequest(client, postShortCode, cursor) {
    try {
      const comments: IncomingComment[] = new Array<IncomingComment>();

      const incomingComments = await client.getMediaComments({
        shortcode: postShortCode,
        first: '49',
        after: '',
      });

      console.log(
        '=============incoming comments=============',
        incomingComments,
      );

      for (const comment of incomingComments.edges) {
        console.log('============data Object===============:', comment);
        comments.push({
          comment_id: comment.node.id,
          text: comment.node.text,
          date: comment.node.created_at,
          owner_id: comment.node.owner.id,
          owner_username: comment.node.owner.username,
          commnet_object: comment.node,
        });
      }

      let pointer = incomingComments.page_info.end_cursor;
      // this will try to convert array to json stringify
      try {
        pointer = JSON.parse(pointer);
        pointer = JSON.stringify(pointer);
      } catch (e) {
        console.log(`Pointer is not array!, dont need to be converted!`);
      }
      await this.delay(_.random(2000, 10000));

      return {
        comments,
        cursor: '',
        hasNextPage: incomingComments.page_info.has_next_page,
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, 500);
    }
  }

  async sendFollowerRequest(client, username, cursor) {
    try {
      const Infollowers: IFollower[] = new Array<IFollower>();
      await this.delay(_.random(2000, 10000));
      const azadiGoldUser = await client.getUserByUsername({ username });
      const followers = await client.getFollowers({
        userId: azadiGoldUser.id,
        after: cursor,
      });

      console.log('=============incoming followers=============', followers);

      for (const user of followers.data) {
        Infollowers.push({
          user_id: user.id,
          username: user.username,
          full_name: user.full_name,
          follower_obejct: user,
        });
      }
      let pointer = followers.page_info.end_cursor;
      // this will try to convert array to json stringify
      try {
        pointer = JSON.parse(pointer);
        pointer = JSON.stringify(pointer);
      } catch (e) {
        console.log(`Pointer is not array!, dont need to be converted!`);
      }
      return {
        followers: Infollowers,
        cursor: '',
        hasNextPage: followers.page_info.has_next_page,
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, 500);
    }
  }

  async delay(ms) {
    // return await for better async stack trace support in case of errors.
    console.log('delay time:', ms);

    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async calculateUserScore(owner_username: string) {
    const foundUserComments = await this.commentModel
      .find({ owner_username })
      .sort({ createdAt: -1 });
    const isUserFollowPage = await this.checkUserFollowingStatus(
      owner_username,
    );
    let ownerUserFollowStatus: boolean;

    if (isUserFollowPage) {
      ownerUserFollowStatus = true;
    } else {
      ownerUserFollowStatus = false;
    }

    const UseCleanComment = new CleanedComments();
    UseCleanComment.mentions = new Array<MentionDocument>();
    UseCleanComment.owner_username = owner_username;

    foundUserComments.forEach((comment) => {
      const rawComment = comment.text;
      const commentTextArray = rawComment.split(' ');
      commentTextArray.forEach((commentSubStr) => {
        let check = false;
        if (commentSubStr.includes('@')) {
          if (UseCleanComment.mentions.length != 0) {
            UseCleanComment.mentions.forEach((mention) => {
              if (
                commentSubStr == mention.mentioned_username ||
                commentSubStr == owner_username
              ) {
                check = true;
              }
            });
          } else {
            if (commentSubStr == owner_username) {
              check = true;
            }
          }
          if (check == false) {
            UseCleanComment.mentions.push({
              mentioned_username: commentSubStr,
              date: comment.date,
            });
          }
        }
      });
    });

    const allUserMentions = new Array<UserAllMention>();
    for await (const mentionedUser of UseCleanComment.mentions) {
      const newMentionData = new UserAllMention();
      newMentionData.comment_status = new Array<CommentStatus>();

      const foundAccount = await this.checkUserFollowingStatus(
        mentionedUser.mentioned_username.split('@')[1],
      );
      if (!foundAccount) {
        (newMentionData.mentioned_username = mentionedUser.mentioned_username),
          (newMentionData.page_follow_date = null),
          (newMentionData.comment_date = mentionedUser.date),
          newMentionData.comment_status.push(CommentStatus.notFollower);

        allUserMentions.push(newMentionData);
      } else {
        newMentionData.mentioned_username = foundAccount.username;
        newMentionData.mentioned_user_id = foundAccount.user_id;
        newMentionData.page_follow_date = foundAccount.follow_date;
        newMentionData.comment_date = mentionedUser.date;

        const checkUserFollowedPageBefore =
          await this.checkUserFollowedPageBefore(
            newMentionData.comment_date,
            newMentionData.page_follow_date,
          );
        if (checkUserFollowedPageBefore == true) {
          newMentionData.comment_status.push(CommentStatus.isAFollowerBefore);
        }

        const checkUserMentionedBefore = await this.checkUserMentionedBefore(
          newMentionData.mentioned_username,
          newMentionData.comment_date,
        );
        if (checkUserMentionedBefore == true) {
          newMentionData.comment_status.push(CommentStatus.isMentionedBefore);
        }

        if (
          checkUserFollowedPageBefore == false &&
          checkUserMentionedBefore == false
        ) {
          newMentionData.comment_status.push(CommentStatus.isValid);
        }

        allUserMentions.push(newMentionData);
      }
    }
    return {
      mentions: allUserMentions,
    };
  }

  async getResults() {
    const foundUsernames = await this.commentModel.distinct('owner_username');
    console.log('total users for ranking:', foundUsernames.length);

    for await (const username of foundUsernames) {
      const mentions = await this.calculateUserScore(username);
      let valid_mentions = 0;
      let invalid_mentions = 0;
      let pending_mentions = 0;
      const valid_users = new Array<string>();
      const inValid_users = new Array<string>();
      const pending_users = new Array<string>();

      mentions.mentions.forEach((mention) => {
        if (mention.comment_status.includes(CommentStatus.isValid)) {
          valid_mentions++;
          valid_users.push(mention.mentioned_username);
        } else if (
          mention.comment_status.includes(CommentStatus.isMentionedBefore) ||
          mention.comment_status.includes(CommentStatus.isAFollowerBefore)
        ) {
          invalid_mentions++;
          inValid_users.push(mention.mentioned_username);
        } else if (mention.comment_status.includes(CommentStatus.notFollower)) {
          pending_mentions++;
          pending_users.push(mention.mentioned_username);
        }
      });

      await this.delay(_.random(500, 1000));
      const foundUser = await this.resultModel.findOne({ username: username });
      if (!foundUser) {
        await this.resultModel.create({
          username: username,
          valid_mentions,
          invalid_mentions,
          pending_mentions,
          score: valid_mentions + 1,
          valid_users: valid_users,
          inValid_users: inValid_users,
          pending_users: pending_users,
        });
      } else {
        await this.resultModel.updateOne(
          { _id: foundUser._id },
          {
            username: username,
            valid_mentions,
            invalid_mentions,
            pending_mentions,
            score: valid_mentions + 1,
            valid_users: valid_users,
            inValid_users: inValid_users,
            pending_users: pending_users,
          },
        );
      }
    }
    return 'records updated successfully';
  }

  async checkUserMentionedBefore(username, comment_date) {
    const foundCommentsWithThisMention = await this.commentModel.find({
      text: new RegExp(`@${username}`),
    });
    let isValid = false;
    if (foundCommentsWithThisMention.length != 0) {
      foundCommentsWithThisMention.forEach((comment) => {
        if (comment_date > comment.date) {
          isValid = true;
        }
      });
    }
    return isValid;
  }

  async checkUserFollowingStatus(username: string) {
    const res = await this.followerModel.findOne({ username: username });
    return res;
  }

  async checkUserFollowedPageBefore(
    comment_date: number,
    followed_date: number,
  ) {
    if (comment_date < followed_date) {
      return false;
    } else {
      return true;
    }
  }

  getFollowerDateOfFollow(username: string) {
    let follower_objectResult: number;
    FollowerPrivateData.relationships_followers.forEach((follower_object) => {
      if (
        follower_object.string_list_data[0]['value'].toString() ===
        username.toString()
      )
        follower_objectResult =
          follower_object.string_list_data[0]['timestamp'];
      else {
        follower_objectResult = Date.now();
      }
    });

    return follower_objectResult;
  }

  async getFinalResults() {
    const results = await this.resultModel.find().sort({ score: -1 });
    const last_update = await this.resultModel.find().sort({ updatedAt: -1 });
    const last_create = await this.resultModel.find().sort({ createdAt: -1 });
    let date: number;
    console.log(last_update[0]['updatedAt']);
    console.log(last_create[0]['createdAt']);
    if (last_update[0]['updatedAt'] >= last_create[0]['createdAt']) {
      date = last_update[0]['updatedAt'];
    } else {
      date = last_create[0]['createdAt'];
    }
    const finalResult = new Array<ResultResponse>();

    for await (const userRes of results) {
      const response: ResultResponse = new ResultResponse();
      response.users = new Array<any>();
      userRes.pending_users.forEach((user) => {
        response.users.push({
          userId: user,
          status: CommentStatus.notFollower,
        });
      });
      userRes.inValid_users.forEach((user) => {
        response.users.push({ userId: user, status: CommentStatus.inValid });
      });
      userRes.valid_users.forEach((user) => {
        response.users.push({ userId: user, status: CommentStatus.isValid });
      });

      (response.username = userRes.username),
        (response.valid_mentions = userRes.valid_mentions),
        (response.invalid_mentions = userRes.invalid_mentions),
        (response.pending_mentions = userRes.pending_mentions),
        (response.score = userRes.score);

      finalResult.push(response);
    }
    return {
      finalResult,
      last_update: date,
    };
  }

  async getUserResult(username: string) {
    username = username.toLowerCase();
    const userRes = await this.resultModel.findOne({ username });
    const userIndexs = await this.lotoryResultModel.find({ username });
    if (!userRes) return 'User not found';
    const response: ResultResponse = new ResultResponse();
    response.users = new Array<any>();
    response.lottory_chances_codes = new Array<string>();
    userRes.pending_users.forEach((user) => {
      response.users.push({ userId: user, status: CommentStatus.notFollower });
    });
    userRes.inValid_users.forEach((user) => {
      response.users.push({ userId: user, status: CommentStatus.inValid });
    });
    userRes.valid_users.forEach((user) => {
      response.users.push({ userId: user, status: CommentStatus.isValid });
    });

    (response.username = userRes.username),
      (response.valid_mentions = userRes.valid_mentions),
      (response.invalid_mentions = userRes.invalid_mentions),
      (response.pending_mentions = userRes.pending_mentions),
      (response.score = userRes.score);
    userIndexs.forEach((index) => {
      response.lottory_chances_codes.push(index.index.toString());
    });
    return {
      response,
    };
  }

  shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  async getShuffleData() {
    const comptitionArray = new Array<string>();
    const foundUsernames = await this.resultModel.find();
    console.log(foundUsernames);
    let score = 0;
    for await (const user of foundUsernames) {
      score += user.score;
      for (let index = 0; index < user.score; index++) {
        comptitionArray.push(user.username);
      }
    }
    const res = this.shuffle(comptitionArray);
    console.log('score is', score);

    return res;
  }

  async addResultsToDB() {
    await this.lotoryResultModel.deleteMany();
    const comptitionArray = new Array<any>();
    const foundUsernames = await this.resultModel.find().sort({ score: -1 });
    console.log(foundUsernames);
    let index = 1;
    for await (const user of foundUsernames) {
      for (let u = 0; u < user.score; u++) {
        comptitionArray.push({ username: user.username, index });
        index++;
      }
    }
    await this.lotoryResultModel.insertMany(comptitionArray);
    return 'successfull';
  }

  async getResultDb() {
    return await this.lotoryResultModel
      .find()
      .select({ username: 1, index: 1 });
  }
}

export class ResultResponse {
  username: string;
  valid_mentions: number;
  invalid_mentions: number;
  pending_mentions: number;
  score: number;
  users?: Array<any>;
  lottory_chances_codes: Array<string>;
}
