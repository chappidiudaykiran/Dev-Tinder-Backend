const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        status: {
            required: true,
            type: String,
            enum: {
                            values:  ['ignored','interested', 'accepted', 'rejected'],
              message: 'Status must be either ignored, interested, accepted, or rejected'
            }
        }
    },{
        timestamps: true
   });
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });


connectionRequestSchema.pre('save', function() {
    const connectionRequest = this;
    //check fromUserId and toUserId are not the same
    if(connectionRequest.fromUserId.toString() === connectionRequest.toUserId.toString()){
        throw new Error("fromUserId and toUserId cannot be the same");
    }
});
const ConnectionRequestModel = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequestModel;