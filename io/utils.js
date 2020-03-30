const { ObjectID } = require("mongodb");
const User     = require("../models/user");
const Message   = require("../models/message");
const Channel   = require("../models/channel");
const Thread   = require("../models/thread");
const TextParser = require("../handlers/text-parser");
const utils     = {};

utils.saveMessage = function saveMessage(io, data){
    User.findById(ObjectID(data.userID)).then((rUser)=>{
        const msg = {
            text: TextParser(data.message),
            author: rUser,
        };
        Message.create(msg).then((rMsg)=>{
            Channel.findByIdAndUpdate(ObjectID(data.channelID)).then((rChannel)=>{
                Thread.find({ thread_name: data.currentThreadName }).then((rThread) => {
                    for(var i=0;i<rThread.length;i++) {
                      if(rChannel.threads.includes(rThread[i]._id)) {
                         var newMsg = new Message(msg);
                         newMsg.save((err, rMsg) => {
			   rThread[i].messages.push(rMsg._id);
                           rThread[i].save();
                         })
                         io.to(data.channelID).emit("newMessage", msg);
                         break;
                      }
                    }
                })
            }).catch((e)=>{
                console.log(e);
            });
        }).catch((e)=>{
            console.log(e);
        });
    }).catch((e)=>{
        console.log(e);
    });
};

module.exports = utils;
