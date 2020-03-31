const   express     = require("express");
const   { ObjectID } = require("mongodb");
const   moment      = require("moment");
const   multer      = require("multer");
const   mime        = require("mime-types");
const   path        = require("path");
const   crypto      = require("crypto");
const   User        = require("../models/user");
const   middleware  = require("../middleware/index");
const   Channel     = require("../models/channel");
const   Thread     = require("../models/thread");

const       router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, "../public/files/image"),
        filename: (req, file, cb)=>{
            crypto.pseudoRandomBytes(4, (err, raw)=>{
                const mimeType = mime.lookup(file.originalname);
                // throw away any extension if provided
                const nameSplit = file.originalname.split(".").slice(0, -1);
                // nameSplit.pop();

                // replace all white spaces with - for safe file name on different filesystem
                const name = nameSplit.join(".").replace(/\s/g, "-");
                cb(null, raw.toString("hex") + name + "." + mime.extension(mimeType));
            });
        },
    }),
});

router.post("/new", middleware.isLogedIn, upload.single("channel_picture"), (req, res)=>{
    if(!ObjectID.isValid(req.user._id)){
        return res.redirect("/");
    }

    const channel = {
        creator: req.user._id,
        channel_name: req.body.channel_name,
    };

    if(req.file){
        const file = {
            path: "/files/image/" + req.file.filename,
        };

        channel.channel_picture = file.path;
    }

    User.findById(req.user._id).then((rUser)=>{
        if(!rUser){
            return res.redirect("/");
        }
        Thread.create({
          thread_name: "general"
        }).then((rThread) => {
		      Channel.create(channel).then((rChannel)=>{
		          rUser.channels.push(rChannel._id);
		          rUser.save();
		          rChannel.threads.push(rThread._id)
		          rChannel.participant.push(rUser._id);
		          // rChannel.online
		          rChannel.save();
		          res.redirect(`/channel/${rChannel._id}`);
		      }).catch((e)=>{
		          console.log(e);
		          res.redirect("back");
		      });
        })
    });
});

router.get("/join", (req, res) => {
    if(!ObjectID.isValid(req.query.id)){
        return res.redirect("/");
    }
    Channel.findById(ObjectID(req.query.id)).populate("participant").then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }

        res.render("join", { channel: rChannel, title: "join" });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });

});
router.get("/join/:id", (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).populate("participant").then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }

        res.render("join", { channel: rChannel, title: "join" });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});

router.post("/join/:id", middleware.isLogedIn, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }
        const numberUser = rChannel.participant.length;
        for(let i = 0; i < numberUser; i++){
            if(rChannel.participant[i].equals(ObjectID(req.user._id))){
                return res.redirect(`/channel/${rChannel._id}`);
            }
        }
        User.findById(req.user._id).then((rUser)=>{
            rUser.channels.push(rChannel._id);
            rUser.save();

            rChannel.participant.push(req.user._id);
            rChannel.save();
            return res.redirect(`/channel/${rChannel._id}`);
        });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});
router.post("/:id/create", middleware.isLogedIn, middleware.isChannelParticipant, (req, res) => {
  if(!ObjectID.isValid(req.params.id)) { return res.redirect("/") }
  var thread_name = req.body.thread_name;
  if(!thread_name) { return res.redirect(`/channel/${req.params.id}/general`) }
  Channel.findById(ObjectID(req.params.id)).populate("threads").then((rChannel) => {
    if(!rChannel){
    	return res.redirect("/");
    }
    for(var i=0;i<rChannel.threads.length;i++) {
     if(rChannel.threads[i].thread_name == thread_name) {
	return res.redirect(`/channel/${req.params.id}/general`)
        break;
     } 
    }
    var new_thread = new Thread({ thread_name: thread_name });
    new_thread.save((err, rThread) => {
      Channel.findById(ObjectID(req.params.id)).then((rChannelTwo) => {
        rChannelTwo.threads.push(rThread._id);
        rChannelTwo.save();  
	res.redirect(`/channel/${req.params.id}/${thread_name}`)
      })
    })
  })
})
router.get("/:id/", middleware.isLogedIn, middleware.isChannelParticipant, (req, res) => {
  return res.redirect(`/channel/${req.params.id}/general`)
});
router.get("/:id/:thread", middleware.isLogedIn, middleware.isChannelParticipant, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).populate({ path: "threads", populate: { path: "messages", populate: { path:"author" } } }).populate("participant").populate("creator").limit(10).sort({date:-1}).then((rChannel)=>{
        if(!rChannel){
            return res.redirect("/");
        }
        User.findById(req.user._id).populate("channels").then((rUser)=>{
             var isThreadValid = true;
             for(var i=0;i<rChannel.threads.length;i++) {
                if(rChannel.threads[i].thread_name == req.params.thread) {
                    return res.render("chat", { channel: rChannel, channels: rUser.channels, title: rChannel.channel_name, admin: rChannel.creator.equals(ObjectID(req.user._id)),  moment, currentThread: rChannel.threads[i], threads: rChannel.threads});
                     break; // highly important
                  }
              }
              if(!isThreadValid) return res.redirect(`/channel/${req.params.id}/general`)
              }); 
    })
    .catch((e)=>{
        res.redirect("/");
        console.log(e);
    });
});


module.exports = router;
