import Post from "../models/Post";
import Comment from "../models/Comment";
import { sequelize} from '../db/sequelize';

export default class PostController {
  public static async list(req: any, res: any) {
    const data: { [key: string]: any } = {};
    data["title"] = "Posts";
    data["description"] = "List of posts";
    data["posts"] = await Post.findAll();
    if(req.session.error){
      data["messageError"] = req.session.error;
      req.session.error = null;
    }
    res.render("post/list", {data: data});
  }

  public static async show(req: any, res: any) {
    const data: { [key: string]: any } = {};
    const post = await Post.findByPk(req.params.postId, 
      {
        include: [Post.associations.comments]
      }
    );
    if(post != null){
      data["title"] = post.getTitle();
      data["description"] = post.getDescription();
      data["post"] = post;
      if(req.session.error){
        data["messageError"] = req.session.error;
        req.session.error = null;
      }
      res.render("post/show", { data: data });
    }else{
      res.redirect('/posts');
    }
  }

  public static async save(req: any, res: any) {
    try {
      var date = new Date();
      const formatDate = (current_datetime: Date)=>{
          let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
          return formatted_date;
      }
      let createdAt = formatDate(date);
      let updatedAt = createdAt;

      let sql = `INSERT INTO posts (createdAt, updatedAt, title, description) VALUES ('${createdAt}','${updatedAt}','${req.body.title}','${req.body.description}')`;
      sequelize.query(sql);
      res.redirect('/posts');
    }
    catch (e) {
      req.session.error = e.errors[0].message;
      res.redirect('/posts');
    }
  }

  public static async saveComment(req: any, res: any) {
    try {
      await Comment.create({ message: req.body.message, post_id: req.body.post_id});
      res.redirect('/posts/'+req.body.post_id);
    }
    catch (e) {
      req.session.error = e.errors[0].message;
      res.redirect('/posts/'+req.body.post_id);
    }
  }

  public static async deleteComment(req: any, res: any) {
    await Comment.destroy({ where: { id: req.params.commentId } });
    res.redirect('/posts/'+req.body.post_id);
  }
}