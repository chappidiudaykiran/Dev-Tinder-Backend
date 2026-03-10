const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionrequest');
const UserModel = require('../models/user');

//get all the pending connection requests for the logged in user
userRouter.get(['/user/requests/recieved', '/user/requests/received'], userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const connectionRequests = await ConnectionRequestModel.find({ toUserId: loggedInUserId, status: 'interested' }).populate('fromUserId', 'firstName lastName emailId photoUrl about skills');
        res.json({ message: "Connection requests fetched successfully", connectionRequests });
    }catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const connections = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUserId, status: 'accepted' },
                { toUserId: loggedInUserId, status: 'accepted' }
            ]
        }).populate('fromUserId toUserId', 'firstName lastName emailId photoUrl about skills');
        res.json({ message: "Connections fetched successfully", connections }); 
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const skip = (page - 1) * limit;

        //user see all the cards expect
        //0. their own card
        //1. the cards of users they have sent request to (regardless of status)
        //2. the cards of users they have received request from (regardless of status)
        //3. the cards of users they are already connected with (status accepted)
        //4. the cards of users they have rejected (status rejected)
        const loggedInUserId = req.user._id;
        const excludedUserIds = [loggedInUserId];
        const sentRequests = await ConnectionRequestModel.find({ fromUserId: loggedInUserId }).select('toUserId');
        const receivedRequests = await ConnectionRequestModel.find({ toUserId: loggedInUserId }).select('fromUserId');
        sentRequests.forEach(request => excludedUserIds.push(request.toUserId));
        receivedRequests.forEach(request => excludedUserIds.push(request.fromUserId));
        const connections = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUserId, status: 'accepted' },
                { toUserId: loggedInUserId, status: 'accepted' }
            ]
        }).select('fromUserId toUserId');
        connections.forEach(connection => {
            if (connection.fromUserId.toString() === loggedInUserId.toString()) {
                excludedUserIds.push(connection.toUserId);
            } else {
                excludedUserIds.push(connection.fromUserId);
            }
        });
        const rejectedRequests = await ConnectionRequestModel.find({ fromUserId: loggedInUserId, status: 'rejected' }).select('toUserId');
        rejectedRequests.forEach(request => excludedUserIds.push(request.toUserId));

        const uniqueExcludedUserIds = [...new Set(excludedUserIds.map(id => id.toString()))];
        const feedQuery = {
            _id: { $nin: uniqueExcludedUserIds }
        };

        const [feedUsers, totalCount] = await Promise.all([
            UserModel.find(feedQuery)
                .select('firstName lastName age gender photoUrl about skills')
                .skip(skip)
                .limit(limit),
            UserModel.countDocuments(feedQuery),
        ]);

        res.json({
            message: 'Feed fetched successfully',
            users: feedUsers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: skip + feedUsers.length < totalCount,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = userRouter;
